# Pretrained NLP Model — Insider Threat Detection

The ML layer has been upgraded from TF-IDF + Logistic Regression to a pretrained **DistilBERT MNLI** model used for zero-shot classification.

## Model

- Hugging Face model: `typeform/distilbert-base-uncased-mnli`
- Architecture: DistilBERT
- Pretraining/fine-tuning: Multi-Genre Natural Language Inference (MNLI)
- Project use: zero-shot threat-category classification
- Project categories:
  - `normal`
  - `policy_violation`
  - `security_risk`
  - `data_exfiltration`
  - `malicious_intent`

The model is a general pretrained NLI model, not a model originally trained specifically on insider-threat communications. The project supplies natural-language threat hypotheses and uses the NLI model to rank them.

## Why this version is different

The old implementation used TF-IDF word/phrase frequencies and Logistic Regression. The new implementation uses semantic representations from DistilBERT, so combinations such as:

> Don't tell anyone. I will transfer the files tonight.

can be evaluated in the context of concealment and data transfer instead of relying only on individual keywords.

## Installation on Windows

From the `backend` folder, activate the existing virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the new dependencies:

```powershell
python -m pip install --upgrade pip
python -m pip install "transformers>=5.0.0" "safetensors>=0.5.0"
python -m pip install "torch>=2.10,<2.13"
```

For a CPU-only PyTorch build, if the normal PyPI install is unsuitable for your machine, use the official CPU wheel command:

```powershell
python -m pip install torch==2.12.1 --index-url https://download.pytorch.org/whl/cpu
```

## Download the model once

Run:

```powershell
python -m app.ml.train_model
```

This downloads the pretrained model and tokenizer into:

```text
backend/app/ml/model/pretrained_distilbert_mnli/
```

After that, the predictor uses the local model files and does not need to download the model again.

## Run FastAPI

```powershell
uvicorn app.main:app --reload
```

Open:

```text
http://127.0.0.1:8000/docs
```

Then test:

```text
POST /api/threat/analyze/6
```

and:

```text
POST /api/threat/analyze-all
```

## Important

The ZIP contains the **pretrained-model integration and setup code**, but not the approximately 268 MB Hugging Face model weights. The weights are downloaded once by `python -m app.ml.train_model` because the model repository is hosted externally.

Official model reference:
https://huggingface.co/typeform/distilbert-base-uncased-mnli
