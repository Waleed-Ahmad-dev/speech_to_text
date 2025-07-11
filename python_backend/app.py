from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import uvicorn
import tempfile
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

model_size = "base"
model = WhisperModel(model_size, device="cpu", compute_type="int8")

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...), language: str = Form(default='auto')):
    # Create temp file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        temp_path = tmp.name

    try:
        # Use language if provided, otherwise auto-detect
        use_language = language if language and language.lower() != 'auto' else None
        
        # Transcribe with selected language
        segments, info = model.transcribe(temp_path, beam_size=1, language=use_language)
        full_text = " ".join([segment.text for segment in segments])
        detected_lang = info.language

        return {
            "transcript": full_text.strip(),
            "language": detected_lang,
            "requested_language": language
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
