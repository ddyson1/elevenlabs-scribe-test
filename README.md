# ElevenLabs Speech to Text MVP

Real-time speech-to-text transcription powered by [ElevenLabs Scribe v2 Realtime](https://elevenlabs.io/realtime-speech-to-text), built with Django.

## Features

- Real-time microphone transcription via WebSocket
- Partial (in-progress) and committed (finalized) transcript display
- Voice Activity Detection (VAD) for automatic speech segmentation
- No frontend build step — pure HTML + vanilla JS

## Setup

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Add your ElevenLabs API key to `.env`:

```
ELEVENLABS_API_KEY=your_api_key_here
```

Get your API key from [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys).

4. Start the development server:

```bash
python manage.py runserver
```

5. Open [http://localhost:8000](http://localhost:8000) and click "Start Recording".

## How It Works

1. **Token generation** — The Django view at `/api/scribe-token` securely calls the ElevenLabs API with your server-side API key and returns a short-lived single-use token to the browser.
2. **WebSocket connection** — The browser opens a WebSocket to `wss://api.elevenlabs.io/v1/speech-to-text/realtime` using that token.
3. **Audio streaming** — The browser captures microphone audio via the Web Audio API, converts it to 16-bit PCM, base64-encodes it, and streams it as `input_audio_chunk` messages.
4. **Transcription** — ElevenLabs Scribe v2 returns `partial_transcript` events in real-time (~150ms latency) and `committed_transcript` events when speech pauses are detected via VAD.

## Project Structure

```
├── config/
│   ├── settings.py     # Django settings (reads from .env)
│   ├── urls.py         # Root URL config
│   └── wsgi.py
├── transcribe/
│   ├── views.py        # index + /api/scribe-token endpoint
│   ├── urls.py
│   └── templates/
│       └── transcribe/
│           └── index.html   # All UI + WebSocket logic
├── manage.py
├── requirements.txt
└── .env.example
```
