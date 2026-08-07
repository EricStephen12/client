'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import VoiceAgentVisualizer from './VoiceAgentVisualizer';

interface Props {
  textToSpeak?: string;
  onSpeakEnd?: () => void;
  messages?: Array<{ role: string; content: string; type?: string }>;
  isThinking?: boolean;
  onSendMessage?: (text: string) => void;
  isSending?: boolean;
  onForgeBrief?: () => void;
}

type VoiceError = 'auth' | 'unavailable' | 'blocked-autoplay' | 'mic-unsupported' | null;

function micUnsupportedReason(): string {
  if (typeof window === 'undefined') return 'Voice input unavailable.';
  if (!window.isSecureContext) {
    return 'Mic needs HTTPS or localhost — open via localhost:3000, not a LAN IP.';
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'This browser cannot access the microphone.';
  }
  return 'Microphone unavailable.';
}

function pickRecorderMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

/** Per-request TTS limit (mirrors server / proxy / engine). Longer replies are spoken in sequence. */
const TTS_CHUNK_CHARS = 4800;

function stripMarkdownForSpeech(raw: string): string {
  return raw
    .replace(/\*\*?/g, '')
    .replace(/__?/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-•]\s+/gm, '')
    .replace(/`+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split long speakable text on sentence boundaries so every word can be read aloud. */
function chunkForSpeech(cleaned: string, maxChars: number): string[] {
  if (!cleaned) return [];
  if (cleaned.length <= maxChars) return [cleaned];
  const chunks: string[] = [];
  let rest = cleaned;
  while (rest.length > maxChars) {
    const slice = rest.slice(0, maxChars);
    const lastSentence = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
    );
    const cut =
      lastSentence > maxChars * 0.4
        ? lastSentence + 1
        : Math.max(slice.lastIndexOf(' '), maxChars);
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

/**
 * Turn assistant markdown into speakable text.
 * Initial analysis dumps get a short score summary; normal chat replies are spoken in full.
 */
function prepareSpeakText(raw: string): string {
  const isInitialReport =
    /Performance Scores|Product Intelligence Report|Ask me anything — why the hook works/i.test(raw);

  if (isInitialReport) {
    const hook = raw.match(/Hook Power:\s*\*?\*?(\d+)/i)?.[1];
    const retention = raw.match(/Retention Logic:\s*\*?\*?(\d+)/i)?.[1];
    const conversion = raw.match(/Conversion Trigger:\s*\*?\*?(\d+)/i)?.[1];
    if (hook && retention && conversion) {
      return `I've finished analyzing this video. Hook power ${hook} out of 10, retention ${retention}, conversion ${conversion}. Ask me anything about the hook, retention, or scripts.`;
    }
    return (
      stripMarkdownForSpeech(raw).slice(0, 220) ||
      "I've finished analyzing this video. Ask me anything about the hook, retention, or scripts."
    );
  }

  // Full reply — no artificial short-sentence cut
  return stripMarkdownForSpeech(raw);
}

export default function VoiceLounge({
  textToSpeak,
  onSpeakEnd,
  messages = [],
  isThinking = false,
  onSendMessage,
  isSending = false,
  onForgeBrief,
}: Props) {
  const { getToken } = useAuth();
  const [isSpeaking, setIsSpeaking]         = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [isListening, setIsListening]       = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [chatInput, setChatInput]           = useState('');
  const [lastSpoken, setLastSpoken]         = useState<string | undefined>(undefined);
  const [glowScale, setGlowScale]           = useState(1);
  const [voiceError, setVoiceError]         = useState<VoiceError>(null);
  const [micHint, setMicHint]               = useState<string | null>(null);

  const audioRef          = useRef<HTMLAudioElement | null>(null);
  const audioContextRef   = useRef<AudioContext | null>(null);
  const analyserRef       = useRef<AnalyserNode | null>(null);
  const transcriptRef     = useRef<HTMLDivElement | null>(null);
  const audioIntensityRef = useRef<number>(0.8);
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const mediaChunksRef    = useRef<Blob[]>([]);
  const mediaStreamRef    = useRef<MediaStream | null>(null);
  const recordMaxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPlayRef    = useRef(false);
  const lastTextRef       = useRef<string | null>(null);
  const ttsAbortRef       = useRef<AbortController | null>(null);
  const streamSourcesRef  = useRef<AudioBufferSourceNode[]>([]);
  const streamEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaWiredRef     = useRef(false);
  /** Only auto-speak replies after the user has sent something (mic or type). */
  const userSentRef       = useRef(false);
  /** True while the user is holding the mic (handles getUserMedia race). */
  const wantRecordRef     = useRef(false);
  const insecureContext   = typeof window !== 'undefined' && !window.isSecureContext;

  const stopStreamSources = useCallback(() => {
    if (streamEndTimerRef.current) {
      clearTimeout(streamEndTimerRef.current);
      streamEndTimerRef.current = null;
    }
    for (const src of streamSourcesRef.current) {
      try { src.stop(); } catch { /* already stopped */ }
    }
    streamSourcesRef.current = [];
  }, []);

  const initAudio = useCallback(() => {
    const existing = audioContextRef.current;
    if (existing && existing.state !== 'closed') return;

    audioContextRef.current = null;
    analyserRef.current = null;
    mediaWiredRef.current = false;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.80;
    analyserRef.current = analyser;
    analyser.connect(ctx.destination);

    // Optional <audio> graph for WAV fallback / blocked-autoplay resume
    if (audioRef.current && !mediaWiredRef.current) {
      try {
        const src = ctx.createMediaElementSource(audioRef.current);
        src.connect(analyser);
        mediaWiredRef.current = true;
      } catch {
        mediaWiredRef.current = false;
      }
    }
  }, []);

  const resumeAudioContext = useCallback(async () => {
    initAudio();
    const live = audioContextRef.current;
    if (live && live.state === 'suspended') {
      await live.resume();
    }
  }, [initAudio]);

  useEffect(() => {
    if (showTranscript && transcriptRef.current)
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages, showTranscript, isThinking]);

  useEffect(() => {
    if (!window.isSecureContext) {
      setMicHint('Open http://localhost:3000 (not the 192.168… IP) so the mic works.');
    }
  }, []);

  useEffect(() => () => {
    if (recordMaxTimerRef.current) clearTimeout(recordMaxTimerRef.current);
    try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => {
    if (!textToSpeak || textToSpeak === lastSpoken) return;
    setLastSpoken(textToSpeak);
    lastTextRef.current = textToSpeak;
    // Do NOT auto-speak the opening analysis dump — it blocks the mic and feels broken.
    // Only speak after the user has sent a question (voice or typed).
    if (userSentRef.current) {
      speakText(textToSpeak);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textToSpeak]);

  useEffect(() => () => {
    ttsAbortRef.current?.abort();
    stopStreamSources();
    const ctx = audioContextRef.current;
    audioContextRef.current = null;
    analyserRef.current = null;
    ctx?.close().catch(() => {});
    if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);
  }, [stopStreamSources]);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (analyserRef.current && (isSpeaking || isLoading || isThinking)) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const limit = Math.floor(data.length * 0.5);
        let sum = 0;
        for (let i = 0; i < limit; i++) sum += data[i];
        const avg = sum / limit;
        audioIntensityRef.current += (1 + (avg / 255) * 4 - audioIntensityRef.current) * 0.15;
        setGlowScale(p => p + (1 + (avg / 255) * 0.14 - p) * 0.15);
      } else if (isListening || isTranscribing) {
        const pulse = 1 + 0.06 * Math.sin(Date.now() / 200);
        audioIntensityRef.current += (pulse - audioIntensityRef.current) * 0.12;
        setGlowScale(p => p + (pulse - p) * 0.12);
      } else {
        audioIntensityRef.current += (0.8 - audioIntensityRef.current) * 0.06;
        setGlowScale(p => p + (1 - p) * 0.06);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isSpeaking, isLoading, isThinking, isListening, isTranscribing]);

  const speakText = async (text: string) => {
    if (!text.trim()) return;
    const speakable = prepareSpeakText(text);
    if (!speakable) return;
    const textChunks = chunkForSpeech(speakable, TTS_CHUNK_CHARS);
    if (textChunks.length === 0) return;

    ttsAbortRef.current?.abort();
    stopStreamSources();
    const abort = new AbortController();
    ttsAbortRef.current = abort;

    lastTextRef.current = text;
    pendingPlayRef.current = false;
    setVoiceError(null);
    setIsLoading(true);
    setIsSpeaking(false);

    try {
      await resumeAudioContext();
      const ctx = audioContextRef.current;
      const analyser = analyserRef.current;
      if (!ctx || !analyser || abort.signal.aborted) return;

      let sampleRate = 24000;
      let nextStart = 0;
      let startedPlayback = false;

      const schedulePcm = (b64: string, pauseAfterMs: number) => {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

        const buffer = ctx.createBuffer(1, float32.length, sampleRate);
        buffer.copyToChannel(float32, 0);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        const startAt = Math.max(ctx.currentTime + 0.02, nextStart);
        source.start(startAt);
        nextStart = startAt + buffer.duration + Math.max(0, pauseAfterMs) / 1000;
        streamSourcesRef.current.push(source);

        if (!startedPlayback) {
          startedPlayback = true;
          setIsLoading(false);
          setIsSpeaking(true);
        }
      };

      // Stream every chunk in order so long AI replies are read completely
      for (let i = 0; i < textChunks.length; i++) {
        if (abort.signal.aborted) return;

        const res = await fetch('/api/tts/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textChunks[i],
            voice: 'af_heart',
            lang: 'en-us',
            emotion: 'neutral',
            speed: 1.12,
          }),
          signal: abort.signal,
        });
        if (abort.signal.aborted) return;

        const contentType = res.headers.get('Content-Type') || '';
        if (contentType.includes('audio/')) {
          const blob = await res.blob();
          if (!audioRef.current) return;
          const url = URL.createObjectURL(blob);
          if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = url;
          audioRef.current.onended = () => { setIsSpeaking(false); onSpeakEnd?.(); };
          await audioRef.current.play();
          setIsSpeaking(true);
          setIsLoading(false);
          return;
        }

        if (!res.ok || !res.body) {
          console.error(`[VoiceLounge] Kokoro stream failed with status ${res.status}`);
          setVoiceError(res.status === 401 ? 'auth' : 'unavailable');
          onSpeakEnd?.();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let lineBuf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (abort.signal.aborted) {
            await reader.cancel();
            break;
          }
          lineBuf += decoder.decode(value, { stream: true });
          const lines = lineBuf.split('\n');
          lineBuf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.trim()) continue;
            let ev: { type: string; sample_rate?: number; data?: string; pause_after_ms?: number; message?: string };
            try {
              ev = JSON.parse(line) as typeof ev;
            } catch {
              continue;
            }
            if (ev.type === 'start' && typeof ev.sample_rate === 'number') {
              sampleRate = ev.sample_rate;
            } else if (ev.type === 'audio_chunk' && typeof ev.data === 'string') {
              schedulePcm(ev.data, ev.pause_after_ms ?? 0);
            } else if (ev.type === 'error') {
              throw new Error(ev.message || 'TTS stream error');
            }
          }
        }
      }

      if (abort.signal.aborted) return;
      if (!startedPlayback) {
        setVoiceError('unavailable');
        onSpeakEnd?.();
        return;
      }

      const remainingMs = Math.max(0, (nextStart - ctx.currentTime) * 1000) + 80;
      streamEndTimerRef.current = setTimeout(() => {
        setIsSpeaking(false);
        onSpeakEnd?.();
      }, remainingMs);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('[VoiceLounge] Kokoro TTS failed:', err);
      stopStreamSources();
      setVoiceError('unavailable');
      setIsSpeaking(false);
      onSpeakEnd?.();
    } finally {
      if (ttsAbortRef.current === abort) {
        setIsLoading(false);
      }
    }
  };

  /** Handles orb taps while in an error state. Returns true if the tap was consumed. */
  const resumeOrRetryVoice = (): boolean => {
    if (pendingPlayRef.current && audioRef.current?.src) {
      pendingPlayRef.current = false;
      setVoiceError(null);
      resumeAudioContext().catch(() => {});
      audioRef.current.play()
        .then(() => setIsSpeaking(true))
        .catch((err: unknown) => {
          console.error('[VoiceLounge] resume playback failed:', err);
          setVoiceError('unavailable');
        });
      return true;
    }
    if (voiceError === 'unavailable' && lastTextRef.current) {
      speakText(lastTextRef.current);
      return true;
    }
    return false;
  };

  const stopSpeaking = () => {
    ttsAbortRef.current?.abort();
    stopStreamSources();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsSpeaking(false);
    setIsLoading(false);
    onSpeakEnd?.();
  };

  const stopMediaTracks = () => {
    if (recordMaxTimerRef.current) {
      clearTimeout(recordMaxTimerRef.current);
      recordMaxTimerRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  };

  const transcribeAndSend = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setMicHint('Sending to Groq Whisper…');
    try {
      const token = await getToken();
      if (!token) {
        setVoiceError('auth');
        setMicHint('Sign in to use voice.');
        return;
      }
      const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
      const form = new FormData();
      form.append('audio', blob, `voice.${ext}`);

      const res = await fetch('/api/main/api/transcribe', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; detail?: string };
        throw new Error(body.error || body.detail || `Transcribe failed (${res.status})`);
      }
      const data = await res.json() as { text?: string };
      const text = (data.text || '').trim();
      if (!text) {
        setMicHint('No speech detected — hold the mic, speak clearly, then release.');
        return;
      }
      setMicHint(`Heard: “${text.slice(0, 80)}${text.length > 80 ? '…' : ''}”`);
      userSentRef.current = true;
      setChatInput('');
      onSendMessage?.(text);
    } catch (err: unknown) {
      console.error('[VoiceLounge] Whisper STT failed:', err);
      setMicHint(err instanceof Error ? err.message : 'Could not transcribe audio. Type below.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopListening = useCallback(() => {
    wantRecordRef.current = false;
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === 'recording') {
      try { rec.requestData(); } catch { /* ignore */ }
      try { rec.stop(); } catch { /* ignore */ }
    } else {
      setIsListening(false);
      stopMediaTracks();
    }
  }, []);

  const startListening = async () => {
    if (!window.isSecureContext) {
      setMicHint('Mic blocked: open http://localhost:3000 — not http://192.168.x.x');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicHint(micUnsupportedReason());
      return;
    }

    // Already recording → stop & transcribe (orb tap toggle)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      stopListening();
      return;
    }

    wantRecordRef.current = true;
    // Interrupt TTS so the mic is never blocked by speaking/loading
    stopSpeaking();
    await resumeAudioContext().catch(() => {});
    if (!wantRecordRef.current) return;

    setVoiceError(null);
    setMicHint('Listening… release mic when done.');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });
      if (!wantRecordRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      mediaStreamRef.current = stream;
      mediaChunksRef.current = [];

      const mimeType = pickRecorderMime();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) mediaChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        setIsListening(false);
        wantRecordRef.current = false;
        if (recordMaxTimerRef.current) {
          clearTimeout(recordMaxTimerRef.current);
          recordMaxTimerRef.current = null;
        }
        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(mediaChunksRef.current, { type });
        stopMediaTracks();
        if (blob.size < 200) {
          setMicHint('Too short — hold the red mic button, speak, then release.');
          return;
        }
        void transcribeAndSend(blob, type);
      };

      recorder.onerror = () => {
        setIsListening(false);
        wantRecordRef.current = false;
        stopMediaTracks();
        setMicHint('Recorder error — try again or type below.');
      };

      recorder.start(250);
      setIsListening(true);

      recordMaxTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
        }
      }, 12000);
    } catch (err: unknown) {
      console.error('[VoiceLounge] getUserMedia failed:', err);
      wantRecordRef.current = false;
      stopMediaTracks();
      setIsListening(false);
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicHint('Click the lock/mic icon in the address bar → Allow microphone for localhost:3000');
      } else {
        setMicHint('Could not open the mic. Use http://localhost:3000 and allow mic permission.');
      }
    }
  };

  const handleSend = () => {
    if (!chatInput.trim() || isSending) return;
    if (isSpeaking) stopSpeaking();
    userSentRef.current = true;
    onSendMessage?.(chatInput.trim());
    setChatInput('');
  };

  const isActive = isSpeaking || isLoading || isThinking || isListening || isTranscribing;
  const AGENT_SIZE = 340;

  const handleAgentTap = () => {
    if (isListening) {
      stopListening();
      return;
    }
    if (isSpeaking || isLoading) {
      stopSpeaking();
      void startListening();
      return;
    }
    if (resumeOrRetryVoice()) return;
    if (!isTranscribing) void startListening();
  };

  return (
    <>
      <style>{`
        @keyframes vl-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes vl-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .vl-msg { animation: vl-fadein 0.2s ease both }
        .vl-scroll::-webkit-scrollbar { width: 3px }
        .vl-scroll::-webkit-scrollbar-track { background: transparent }
        .vl-scroll::-webkit-scrollbar-thumb { background: rgba(163,230,53,0.35); border-radius: 99px }
      `}</style>

      <div
        className="w-full flex flex-col items-center text-stone-100"
        style={{
          height: '100svh',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse 80% 55% at 50% 35%, #1a2118 0%, #0c0f0d 45%, #070908 100%)',
        }}
      >
        <div className="pt-6 pb-4 flex-shrink-0">
          <div className="inline-flex p-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
            {(['Voice', 'Transcript'] as const).map(tab => {
              const active = tab === 'Voice' ? !showTranscript : showTranscript;
              return (
                <button
                  key={tab}
                  onClick={() => setShowTranscript(tab === 'Transcript')}
                  className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-200 ${
                    active ? 'bg-lime-400 text-slate-950 shadow-sm' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 w-full flex items-center justify-center px-4 overflow-y-auto min-h-0">

          {!showTranscript ? (
            <div
              className="relative flex flex-col items-center justify-center"
              style={{ width: AGENT_SIZE, height: AGENT_SIZE, maxWidth: '88vw', maxHeight: '46vh' }}
            >
              <div
                className="absolute inset-0"
                style={{ transform: `scale(${isActive ? Math.min(glowScale, 1.12) : 1})`, transition: 'transform 0.2s ease' }}
              >
                <VoiceAgentVisualizer
                  audioIntensityRef={audioIntensityRef}
                  isActive={isActive}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isThinking={isThinking || isLoading}
                  onActivate={handleAgentTap}
                />
              </div>

              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                {isListening && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.35em] text-red-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inset-0 rounded-full bg-red-400 opacity-75" />
                      <span className="rounded-full bg-red-500 w-1.5 h-1.5" />
                    </span>
                    Listening — tap again to send
                  </span>
                )}
                {isTranscribing && !isListening && (
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-stone-400 animate-pulse">
                    Transcribing…
                  </span>
                )}
                {isLoading && !isListening && !isTranscribing && (
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-stone-400 animate-pulse">
                    Connecting voice…
                  </span>
                )}
                {isSpeaking && !isLoading && !isListening && !isTranscribing && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.35em] text-lime-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inset-0 rounded-full bg-lime-400 opacity-75" />
                      <span className="rounded-full bg-lime-500 w-1.5 h-1.5" />
                    </span>
                    Speaking — tap to interrupt
                  </span>
                )}
                {isThinking && !isSpeaking && !isLoading && !isListening && !isTranscribing && (
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-lime-400/80 animate-pulse">Thinking…</span>
                )}
                {!isActive && voiceError === 'auth' && (
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-400">Sign in to use voice</span>
                )}
                {!isActive && voiceError === 'unavailable' && (
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-400">Voice unavailable — tap to retry</span>
                )}
                {!isActive && voiceError === 'blocked-autoplay' && (
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-lime-400 animate-pulse">Tap to hear the reply</span>
                )}
                {!isActive && insecureContext && (
                  <span className="max-w-xs text-center text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 leading-relaxed">
                    Open localhost:3000 for mic
                  </span>
                )}
                {!isActive && !voiceError && !insecureContext && (
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-stone-500">
                    Hold mic or tap · speak · tap again
                  </span>
                )}
              </div>
            </div>

          ) : (
            /* Transcript */
            <div className="w-full max-w-lg">
              <div
                ref={transcriptRef}
                className="vl-scroll overflow-y-auto"
                style={{ maxHeight: 'calc(100svh - 280px)', width: '100%' }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <p className="text-stone-500 text-xs font-medium tracking-wide">Your conversation will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-5 py-3">
                    {messages.map((msg, i) => (
                      <div key={i} className={`vl-msg flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black mt-0.5 ${
                          msg.role === 'user' ? 'bg-stone-700 text-stone-100' : 'bg-lime-400 text-slate-950'
                        }`}>
                          {msg.role === 'user' ? 'U' : 'E'}
                        </div>
                        <div className={`max-w-[80%] px-4 py-3.5 ${
                          msg.role === 'user'
                            ? 'bg-stone-800/80 text-stone-100 rounded-2xl rounded-tr-sm'
                            : 'bg-white/[0.04] border border-white/10 text-stone-200 rounded-2xl rounded-tl-sm'
                        }`} style={{ wordBreak: 'break-word' }}>
                          <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 ${
                            msg.role === 'user' ? 'text-stone-500' : 'text-lime-400'
                          }`}>
                            {msg.role === 'user' ? 'You' : 'Eixora'}
                          </p>
                          <p className="text-[13.5px] leading-[1.75] font-normal text-inherit" style={{
                            fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif",
                            letterSpacing: '0.01em',
                          }}>
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isThinking && (
                      <div className="vl-msg flex gap-2.5">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-lime-400 flex items-center justify-center text-[9px] font-black text-slate-950 mt-0.5">E</div>
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                          {[0, 140, 280].map(d => (
                            <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#a3e635', animation: `vl-bounce 1.1s ${d}ms ease-in-out infinite` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-lg px-4 pb-8 pt-2 space-y-2 flex-shrink-0">
          {insecureContext && (
            <p className="text-[12px] text-red-400 text-center font-semibold leading-snug px-2">
              Mic will not work on this URL. Open{' '}
              <a className="underline" href="http://localhost:3000/dashboard/analyze">
                http://localhost:3000
              </a>
            </p>
          )}
          {micHint && (
            <p className="text-[11px] text-amber-400/90 text-center leading-snug px-2">
              {micHint}
            </p>
          )}
          {(lastTextRef.current || lastSpoken) && !isLoading && !isSpeaking && (
            <button
              type="button"
              onClick={() => {
                const toPlay = lastTextRef.current || lastSpoken;
                if (toPlay) speakText(toPlay);
              }}
              className="w-full py-2 rounded-xl border border-white/10 bg-white/[0.04] text-stone-300 text-[10px] font-black uppercase tracking-[0.2em] hover:border-lime-400/40 hover:text-lime-300 transition-all"
            >
              ▶ Play latest reply aloud
            </button>
          )}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-3 transition-all focus-within:border-lime-400/40 focus-within:ring-1 focus-within:ring-lime-400/20">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                if (isTranscribing || isSending) return;
                void startListening();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                if (isListening) stopListening();
              }}
              onPointerLeave={() => {
                if (isListening) stopListening();
              }}
              onClick={(e) => {
                if (e.detail === 0) return;
              }}
              disabled={isTranscribing}
              title="Hold to talk · release to send"
              className={`flex-shrink-0 p-2 rounded-lg transition-all duration-150 touch-none select-none ${
                isListening
                  ? 'bg-red-500 text-white scale-110 shadow-md'
                  : 'text-stone-400 hover:text-lime-300 hover:bg-white/5'
              } disabled:opacity-30`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder={
                isListening
                  ? 'Listening… release mic to send'
                  : isTranscribing
                    ? 'Transcribing…'
                    : 'Hold mic to talk, or type…'
              }
              disabled={isSending || isListening || isTranscribing}
              className="flex-1 bg-transparent border-none outline-none text-sm text-stone-100 placeholder-stone-600 focus:ring-0"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !chatInput.trim()}
              className="p-2 rounded-xl bg-lime-400 text-slate-950 hover:bg-lime-300 active:scale-90 disabled:opacity-25 transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          {onForgeBrief && (
            <button
              onClick={onForgeBrief}
              disabled={isSending}
              className="w-full py-2.5 rounded-xl border border-lime-400/25 bg-lime-400/10 text-lime-300 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-lime-400/20 disabled:opacity-40 transition-all"
            >
              Forge Director Brief
            </button>
          )}
        </div>
      </div>

      <audio ref={audioRef} hidden />
    </>
  );
}
