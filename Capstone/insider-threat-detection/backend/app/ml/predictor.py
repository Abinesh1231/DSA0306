"""Pretrained NLP predictor for insider-threat detection.

Uses typeform/distilbert-base-uncased-mnli, a pretrained DistilBERT model
fine-tuned on MNLI, for zero-shot classification against the five threat
categories used by this project.
"""

from pathlib import Path
from typing import Dict, List
import re

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model" / "pretrained_distilbert_mnli"
PRETRAINED_MODEL_ID = "typeform/distilbert-base-uncased-mnli"

RISK_MAPPING = {
    "normal": "LOW",
    "policy_violation": "MEDIUM",
    "security_risk": "HIGH",
    "data_exfiltration": "HIGH",
    "malicious_intent": "CRITICAL",
}

CANDIDATE_LABELS = {
    "normal": "normal business communication with no security concern",
    "policy_violation": "a violation of company policy or security procedures",
    "security_risk": "a security risk involving credentials, passwords, tokens, access or security controls",
    "data_exfiltration": "data exfiltration or unauthorized copying, downloading, exporting or transferring company data",
    "malicious_intent": "malicious intent, concealment, deliberate wrongdoing, sabotage or bypassing security",
}

HYPOTHESIS_TEMPLATE = "This enterprise message indicates {}."

INDICATORS = {
    "confidential": "Confidential information reference",
    "sensitive": "Sensitive information reference",
    "copy": "Possible unauthorized copying",
    "transfer": "Possible data transfer",
    "download": "Possible data download",
    "export": "Possible data export",
    "password": "Credential-related language",
    "credential": "Credential-related language",
    "credentials": "Credential-related language",
    "token": "Authentication token reference",
    "api key": "API key reference",
    "secret": "Secrecy indicator",
    "bypass": "Security-control bypass indicator",
    "without permission": "Unauthorized access indicator",
    "don't tell": "Concealment indicator",
    "do not tell": "Concealment indicator",
    "hide": "Concealment indicator",
    "personal drive": "Personal/external storage indicator",
    "personal email": "Personal email transfer indicator",
    "external device": "External device indicator",
}

INDICATOR_WEIGHTS = {
    "Confidential information reference": 5,
    "Sensitive information reference": 5,
    "Possible unauthorized copying": 8,
    "Possible data transfer": 10,
    "Possible data download": 8,
    "Possible data export": 10,
    "Credential-related language": 8,
    "Authentication token reference": 8,
    "API key reference": 8,
    "Secrecy indicator": 7,
    "Security-control bypass indicator": 12,
    "Unauthorized access indicator": 12,
    "Concealment indicator": 15,
    "Personal/external storage indicator": 10,
    "Personal email transfer indicator": 10,
    "External device indicator": 10,
}

_tokenizer = None
_model = None
_entailment_index = None


def _clean_text(text: str) -> str:
    """Normalize whitespace while preserving natural-language semantics."""
    if not text:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


def _find_entailment_index(model) -> int:
    """Find the MNLI entailment logit without assuming a fixed class order."""
    label2id = getattr(model.config, "label2id", {}) or {}

    for label, index in label2id.items():
        if "entail" in str(label).lower():
            return int(index)

    id2label = getattr(model.config, "id2label", {}) or {}
    for index, label in id2label.items():
        if "entail" in str(label).lower():
            return int(index)

    # typeform/distilbert-base-uncased-mnli uses entailment index 0.
    return 0


def _load_model():
    global _tokenizer, _model, _entailment_index

    if _tokenizer is not None and _model is not None:
        return _tokenizer, _model, _entailment_index

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    local_available = (MODEL_DIR / "config.json").exists()
    source = str(MODEL_DIR) if local_available else PRETRAINED_MODEL_ID

    _tokenizer = AutoTokenizer.from_pretrained(
        source,
        local_files_only=local_available,
    )
    _model = AutoModelForSequenceClassification.from_pretrained(
        source,
        local_files_only=local_available,
    )
    _model.eval()
    _entailment_index = _find_entailment_index(_model)

    if not local_available:
        _tokenizer.save_pretrained(MODEL_DIR)
        _model.save_pretrained(MODEL_DIR, safe_serialization=True)

    return _tokenizer, _model, _entailment_index


def get_indicators(text: str) -> List[str]:
    text_lower = text.lower()
    detected = []

    for keyword, description in INDICATORS.items():
        if keyword in text_lower:
            detected.append(description)

    return list(dict.fromkeys(detected))


def _evidence_score(indicators: List[str]) -> float:
    return min(100.0, sum(INDICATOR_WEIGHTS.get(item, 0) for item in indicators))


def calculate_threat_score(
    probability: float,
    category: str,
    indicators: List[str],
) -> float:
    """Combine model confidence with bounded explicit evidence."""
    model_score = probability * 100.0
    evidence = _evidence_score(indicators)
    score = (model_score * 0.75) + (evidence * 0.25)

    minimums = {
        "normal": 0,
        "policy_violation": 35,
        "security_risk": 60,
        "data_exfiltration": 70,
        "malicious_intent": 80,
    }

    score = max(minimums.get(category, 0), score)
    return round(min(100.0, score), 2)


def _zero_shot_classify(text: str):
    """Score the five categories using MNLI entailment probabilities."""
    tokenizer, model, entailment_index = _load_model()

    labels = list(CANDIDATE_LABELS.values())
    hypotheses = [
        HYPOTHESIS_TEMPLATE.format(label)
        for label in labels
    ]

    # The enterprise message is the premise and each candidate description
    # is evaluated as a hypothesis. Softmax over entailment logits gives a
    # normalized confidence distribution across the project's categories.
    inputs = tokenizer(
        [text] * len(hypotheses),
        hypotheses,
        padding=True,
        truncation=True,
        max_length=256,
        return_tensors="pt",
    )

    with torch.inference_mode():
        logits = model(**inputs).logits[:, entailment_index]
        probabilities = torch.softmax(logits, dim=0).cpu().tolist()

    best_index = max(range(len(probabilities)), key=probabilities.__getitem__)
    return labels[best_index], float(probabilities[best_index]), probabilities


def predict_threat(text: str) -> Dict:
    """Predict the threat category using pretrained DistilBERT MNLI."""
    cleaned_text = _clean_text(text)

    if not cleaned_text:
        return {
            "threat_score": 0.0,
            "risk_level": "LOW",
            "threat_category": "normal",
            "model_prediction": "normal",
            "confidence": 0.0,
            "indicators": [],
            "model_name": PRETRAINED_MODEL_ID,
            "model_type": "pretrained_zero_shot_nli",
        }

    best_label, probability, _ = _zero_shot_classify(cleaned_text)

    label_to_category = {
        label: category
        for category, label in CANDIDATE_LABELS.items()
    }
    category = label_to_category[best_label]
    indicators = get_indicators(cleaned_text)
    score = calculate_threat_score(probability, category, indicators)

    return {
        "threat_score": score,
        "risk_level": RISK_MAPPING[category],
        "threat_category": category,
        "model_prediction": category,
        "confidence": round(probability * 100, 2),
        "indicators": indicators,
        "model_name": PRETRAINED_MODEL_ID,
        "model_type": "pretrained_zero_shot_nli",
    }
