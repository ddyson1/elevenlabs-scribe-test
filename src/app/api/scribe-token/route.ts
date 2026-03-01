import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const response = await fetch(
    "https://api.elevenlabs.io/v1/speech-to-text/get-realtime-token",
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: "scribe_v2_realtime",
        ttl_secs: 300,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: `ElevenLabs API error: ${errorText}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
