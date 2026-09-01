$ErrorActionPreference = "Stop"

Write-Host "==============================================="
Write-Host "Insider Threat - Pretrained NLP Model Setup"
Write-Host "==============================================="

if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Host "Backend virtual environment was not found." -ForegroundColor Yellow
    Write-Host "Create/activate the backend venv first."
    exit 1
}

$python = ".\venv\Scripts\python.exe"

& $python -m pip install --upgrade pip
& $python -m pip install "transformers>=5.0.0" "safetensors>=0.5.0"
& $python -m pip install "torch>=2.10,<2.13"
& $python -m app.ml.train_model

Write-Host ""
Write-Host "Pretrained model setup completed." -ForegroundColor Green
