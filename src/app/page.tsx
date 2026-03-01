import SpeechToText from "@/components/SpeechToText";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Speech to Text</h1>
          <p className="text-gray-400">
            Real-time transcription powered by ElevenLabs Scribe v2
          </p>
        </div>
        <SpeechToText />
      </div>
    </main>
  );
}
