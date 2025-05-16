# app.py
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import uvicorn
import json
import tempfile
import os

app = FastAPI()

# Allow CORS if needed (adjust origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

model_size = "small"
model = WhisperModel(model_size, device="cpu", compute_type="int8")

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...), language: str = Form(default=None)):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        temp_path = tmp.name

    try:
        # Step 1: initial transcription with forced language if provided
        forced_language = language if language and language.lower() != 'auto' else None
        segments, info = model.transcribe(temp_path, beam_size=1, language=forced_language)
        detected_lang = info.language

        # Override Hindi → Urdu metadata
        if detected_lang == "hi":
            detected_lang = "ur"

        full_text = " ".join([segment.text for segment in segments])

        # Step 2: If detected language is not English, re-run forcing Urdu transcription
        if forced_language is None and detected_lang != "en":
            segments, info = model.transcribe(temp_path, beam_size=1, language="ur")
            full_text = " ".join([segment.text for segment in segments])
            detected_lang = "ur"

        return {"transcript": full_text.strip(), "language": detected_lang}

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
    # Save uploaded file to temp file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        temp_path = tmp.name

    try:
        # Step 1: Transcribe with forced language if caller provided, else auto
        forced_language = language if language and language.lower() != 'auto' else None
        segments, info = model.transcribe(temp_path, beam_size=1, language=forced_language)
        detected_lang = info.language

        # Override Hindi to Urdu metadata
        if detected_lang == "hi":
            detected_lang = "ur"

        # Step 2: If language is not English and not forced explicitly, re-transcribe forcing Urdu
        if forced_language is None and detected_lang != 'en':
            segments, info = model.transcribe(temp_path, beam_size=1, language='ur')
            detected_lang = 'ur'

        full_text = " ".join([segment.text for segment in segments])

        return {"transcript": full_text.strip(), "language": detected_lang}

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
    # Create temp file without keeping it open
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        temp_path = tmp.name  # Save path before closing

    try:
        forced_language = language if language and language.lower() != 'auto' else None
        segments, info = model.transcribe(temp_path, beam_size=1, language=forced_language)
        full_text = " ".join([segment.text for segment in segments])
        detected_lang = info.language

        # Override Hindi to Urdu (metadata)
        if detected_lang == "hi":
            detected_lang = "ur"

        return {"transcript": full_text.strip(), "language": detected_lang}

    finally:
        # Delete temp file manually after transcription
        if os.path.exists(temp_path):
            os.remove(temp_path)
    # Save uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp.flush()

        # Transcribe with forced language if provided
        forced_language = language if language and language.lower() != 'auto' else None
        segments, info = model.transcribe(tmp.name, beam_size=1, language=forced_language)
        full_text = " ".join([segment.text for segment in segments])

        detected_lang = info.language

        # Override Hindi to Urdu (metadata)
        if detected_lang == "hi":
            detected_lang = "ur"

        return {"transcript": full_text.strip(), "language": detected_lang}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
