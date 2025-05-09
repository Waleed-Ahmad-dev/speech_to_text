# 🧠 Whisper Speech-to-Text API (Node.js + Python Integration)

This project delivers a **high-quality, local, privacy-first speech-to-text API** powered by:
- 🟦 **Node.js / Express** for the server
- 🐍 **Python Whisper (OpenAI)** for transcription
- 🔉 **FFmpeg** for audio processing
- 🧠 **OpenAI Whisper CLI** for offline accuracy

> ⚠️ Runs **fully offline**, needs **no API keys**, and is perfect for secure, local setups.

---

## 📁 Project Structure

```
speech_to_text/
├── src/
│   ├── routes/
│   │   └── uploadRoute.ts
│   ├── services/
│   │   └── uploadService.ts
│   ├── prisma/
│   │   ├── client.ts
│   │   └── schema.prisma
│   └── app.ts
├── uploads/          # temp audio files (gitignored)
├── models/           # whisper model (.bin) files (gitignored)
├── whisper-env/      # Python virtualenv (gitignored)
├── .env
├── package.json
└── README.md
```

---

## 🚀 Getting Started (Windows Instructions)

### ✅ 1. Install Prerequisites

#### 🐍 Python (3.10+)
- Download from: [python.org/downloads/](https://www.python.org/downloads/)
- Check **"Add Python to PATH"** during installation
- Verify:
  ```bash
  python --version
  pip --version
  ```

#### 🎙 FFmpeg
- Get it from: [ffmpeg.org/download.html](https://ffmpeg.org/download.html) (or gyan.dev builds)
- Extract and add `/bin` to your Windows PATH
- Verify:
  ```bash
  ffmpeg -version
  ```

### ✅ 2. Create Python Virtual Environment
```bash
# From project root
python -m venv whisper-env

# Activate it
whisper-env\Scripts\activate
```

### ✅ 3. Install Whisper & Dependencies
```bash
pip install --upgrade pip setuptools wheel
pip install git+https://github.com/openai/whisper.git
```

### ✅ 4. Download Whisper Model File
Model files are too large for GitHub. Download manually:

📥 **Recommended Model (English only):** `small.en`

Save to:
```bash
/models/ggml-small.en.bin
```

Explore more models: [full model index](https://github.com/ggerganov/whisper.cpp/tree/master/models)

---

## 🧠 How It Works
1. Send an audio file to `/api/upload` (any format)
2. The server:
   - Converts it to `.wav` (16 kHz mono) using FFmpeg
   - Transcribes it with Whisper CLI
   - Cleans up and stores the text in the database

---

## ⚙️ Environment Setup (Node.js)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
3. Configure your `.env` (see sample below):
   ```ini
   DATABASE_URL="mysql://your-user:your-password@localhost:3306/your-db"
   ```

---

## ▶️ Run the Server
Activate the Python environment first, then start the API:
```bash
whisper-env\Scripts\activate
npm run dev
```

---

## 🔁 Example Usage (API)
**POST** `/api/upload`
- Form-data key: `audio`
- Value: Your `.mp3`, `.wav`, `.m4a`, etc.

**Response:**
```json
{
  "message": "Transcription successful",
  "transcription": "Hello, how are you?",
  "id": "uuid"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "audio=@path/to/your/audiofile.mp3"
```

---

## 🛑 Files Not Pushed to GitHub
These are excluded via `.gitignore`:

| Path            | Reason                           |
|-----------------|----------------------------------|
| `/models/*`     | Large Whisper model files        |
| `/uploads/*`    | Temporary audio uploads          |
| `/whisper-env/` | Local Python virtual environment |

### ✅ To Reproduce Locally
1. Clone the repo
2. Set up Python + virtualenv
3. Install dependencies
4. Download the Whisper model
5. Launch the API

---

## 🧪 Troubleshooting
- **'whisper' is not recognized**
  ➡ Try:
  ```bash
  python -m whisper ...
  ```
- **ffmpeg not found**
  ➡ Ensure `ffmpeg.exe` is in your PATH
- **Transcript not found**
  ➡ Whisper may save output elsewhere. Set `--output_dir` in the command.

---

## 📃 License
MIT — free to use, modify, and distribute.

🙋 **Need Help?** Open an issue or reach out to the maintainer.

---

## 📋 Sample `.env.example`
Copy this into `.env` and update the values:
```ini
# Database connection (e.g., MySQL)
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
```

---

> ✨ **Pro Tip:** Test the API with `curl` or tools like Postman for quick results!