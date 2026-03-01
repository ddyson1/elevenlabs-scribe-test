"use client";

import { useCallback, useRef, useState } from "react";
import {
  Scribe,
  RealtimeConnection,
  RealtimeEvents,
  CommitStrategy,
} from "@elevenlabs/client";

type Status = "idle" | "connecting" | "recording" | "error";

export default function SpeechToText() {
  const [status, setStatus] = useState<Status>("idle");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [committedTranscripts, setCommittedTranscripts] = useState<string[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<RealtimeConnection | null>(null);

  const fetchToken = async (): Promise<string> => {
    const res = await fetch("/api/scribe-token", { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to get token");
    }
    const data = await res.json();
    return data.token;
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      const token = await fetchToken();

      const connection = Scribe.connect({
        token,
        modelId: "scribe_v2_realtime",
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      connection.on(RealtimeEvents.OPEN, () => {
        setStatus("recording");
      });

      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data) => {
        if (data) {
          setPartialTranscript(data.text);
        }
      });

      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
        if (data && data.text.trim()) {
          setCommittedTranscripts((prev) => [...prev, data.text]);
          setPartialTranscript("");
        }
      });

      connection.on(RealtimeEvents.ERROR, (data) => {
        console.error("Scribe error:", data);
        setError(data?.error || "Transcription error");
      });

      connection.on(RealtimeEvents.AUTH_ERROR, (data) => {
        console.error("Auth error:", data);
        setError("Authentication failed. Check your API key.");
        setStatus("error");
      });

      connection.on(RealtimeEvents.CLOSE, () => {
        setStatus("idle");
        setPartialTranscript("");
      });

      connectionRef.current = connection;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setStatus("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    setStatus("idle");
    setPartialTranscript("");
  }, []);

  const clearTranscript = useCallback(() => {
    setCommittedTranscripts([]);
    setPartialTranscript("");
  }, []);

  const fullTranscript = committedTranscripts.join(" ");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3">
        {status === "idle" || status === "error" ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <MicIcon />
            Start Recording
          </button>
        ) : status === "connecting" ? (
          <button
            disabled
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-400 text-white rounded-lg"
          >
            <Spinner />
            Connecting...
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <StopIcon />
            Stop Recording
          </button>
        )}

        {committedTranscripts.length > 0 && (
          <button
            onClick={clearTranscript}
            className="px-4 py-2.5 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status indicator */}
      {status === "recording" && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          Listening...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Transcript */}
      <div className="min-h-[200px] p-4 bg-gray-900 border border-gray-800 rounded-lg">
        {fullTranscript || partialTranscript ? (
          <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
            {fullTranscript}
            {fullTranscript && partialTranscript ? " " : ""}
            {partialTranscript && (
              <span className="text-gray-400">{partialTranscript}</span>
            )}
          </p>
        ) : (
          <p className="text-gray-600 italic">
            {status === "recording"
              ? "Speak into your microphone..."
              : "Click \"Start Recording\" to begin transcription."}
          </p>
        )}
      </div>

      {/* Word count */}
      {fullTranscript && (
        <div className="text-xs text-gray-500">
          {fullTranscript.split(/\s+/).filter(Boolean).length} words
        </div>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
