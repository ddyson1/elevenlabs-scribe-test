# ElevenLabs Speech to Text MVP

Real-time speech-to-text transcription powered by [ElevenLabs Scribe v2 Realtime](https://elevenlabs.io/realtime-speech-to-text).

## Features

- Real-time microphone transcription via WebSocket
- Partial (in-progress) and committed (finalized) transcript display
- Voice Activity Detection (VAD) for automatic speech segmentation
- Noise suppression, echo cancellation, and auto gain control

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.local.example .env.local
```

3. Add your ElevenLabs API key to `.env.local`:

```
ELEVENLABS_API_KEY=your_api_key_here
```

Get your API key from [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys).

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) and click "Start Recording".

## How It Works

1. **Token generation** — The Next.js API route (`/api/scribe-token`) securely generates a single-use Scribe token using your API key. This keeps your key server-side only.
2. **WebSocket connection** — The client uses `@elevenlabs/client` to open a WebSocket connection with the token, streaming microphone audio to ElevenLabs.
3. **Transcription** — Scribe v2 Realtime returns partial transcripts in real-time (~150ms latency) and committed transcripts when speech segments complete.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [ElevenLabs Client SDK](https://www.npmjs.com/package/@elevenlabs/client)
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript
