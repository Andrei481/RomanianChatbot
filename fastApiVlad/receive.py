from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess
from faster_whisper import WhisperModel
import torch
from TTS.api import TTS

print(torch.__version__)
print(torch.cuda.is_available())
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

model = WhisperModel("model_vlad", device="cuda", compute_type="float16")
tts = TTS("tts_models/ro/cv/vits", gpu=True)

app = FastAPI()

# Allowing CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def convert_to_wav(input_file, output_file):
    try:
        subprocess.run(['ffmpeg', '-y', '-i', input_file, '-ar', '16000', '-ac', '1', output_file], check=True)
    except subprocess.CalledProcessError:
        pass

def transcribe(audio_file_path):
    segments, _ = model.transcribe(audio_file_path, beam_size=5, language="ro", condition_on_previous_text=False)

    text=""

    for segment in segments:
        print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))
        text+=segment.text+" "
    print(text)
    tts.tts_to_file(text=text)

    return text

@app.post('/upload')
async def upload(audio: UploadFile = File(...)):
    filename = os.path.join(os.path.dirname(__file__), 'audio.wav')
    with open(filename, "wb") as audio_file:
        audio_content = await audio.read()
        audio_file.write(audio_content)
    
    converted_file_path = os.path.join(os.path.dirname(__file__), 'converted_audio.wav')
    convert_to_wav(filename, converted_file_path)

    text = transcribe("converted_audio.wav")

    print("This is the trnascription: ", text)

    return text

@app.get('/get_audio')
async def get_audio():
    print("am ajuns aici")
    audio_file_path = os.path.join(os.path.dirname(__file__), 'output.wav')
    if os.path.exists(audio_file_path):
        return FileResponse(audio_file_path, media_type="audio/wav")
    else:
        raise HTTPException(status_code=404, detail="Audio file not found")
