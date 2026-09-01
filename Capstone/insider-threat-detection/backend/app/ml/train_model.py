"""Download and validate the pretrained NLP model used by the project.

This replaces the old TF-IDF/Logistic Regression training script. The new
model is a pretrained DistilBERT MNLI model used for zero-shot threat
classification. No custom labeled training set is required for inference.
"""

from pathlib import Path

from transformers import AutoModelForSequenceClassification, AutoTokenizer

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model" / "pretrained_distilbert_mnli"
MODEL_ID = "typeform/distilbert-base-uncased-mnli"


def main():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("PRETRAINED INSIDER THREAT NLP MODEL SETUP")
    print("=" * 70)
    print(f"Model : {MODEL_ID}")
    print("Task  : Zero-shot classification")
    print("Target directory:", MODEL_DIR)
    print("Downloading/loading pretrained weights...\n")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_ID)

    tokenizer.save_pretrained(MODEL_DIR)
    model.save_pretrained(MODEL_DIR, safe_serialization=True)

    print("\nModel setup completed successfully.")
    print("The model is now stored locally and can run offline.")
    print("=" * 70)


if __name__ == "__main__":
    main()
