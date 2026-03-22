import { useEffect, useRef, useState } from 'react';

/**
 * AmbientAudio — Serene Tapovan ambient sound.
 *
 * Inspired by Swami Tapovan Maharaj's Himalayan ashram.
 * Uses Web Audio API to generate gentle nature-inspired ambient sound:
 * - Soft wind-like noise (filtered white noise)
 * - Gentle drone/om hum (sine waves at harmonious frequencies)
 * - Occasional bird-like tones
 *
 * Props:
 *   volume: 0-1 (default 0.15 for subtle ambient)
 *   playing: boolean
 *   lowVolume: boolean (reduces to 30% — for when in the classroom)
 */
export default function AmbientAudio({ volume = 0.15, playing = true, lowVolume = false }) {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const nodesRef = useRef([]);
  const [muted, setMuted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const effectiveVolume = muted ? 0 : lowVolume ? volume * 0.3 : volume;

  const initAudio = () => {
    if (audioCtxRef.current) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = effectiveVolume;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // 1. Soft wind (filtered white noise)
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400;
    windFilter.Q.value = 0.5;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.08;

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windSource.start();
    nodesRef.current.push(windSource);

    // 2. Om drone (two harmonious sine waves)
    const droneFreqs = [136.1, 272.2]; // C# — sa in Indian classical (approximate Om frequency)
    droneFreqs.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const droneGain = ctx.createGain();
      droneGain.gain.value = freq === 136.1 ? 0.04 : 0.02;

      osc.connect(droneGain);
      droneGain.connect(masterGain);
      osc.start();
      nodesRef.current.push(osc);
    });

    // 3. Subtle tanpura-like shimmer
    const shimmerOsc = ctx.createOscillator();
    shimmerOsc.type = 'triangle';
    shimmerOsc.frequency.value = 204.15; // Perfect fifth above drone
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.015;
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(masterGain);
    shimmerOsc.start();
    nodesRef.current.push(shimmerOsc);

    setInitialized(true);
  };

  // Update volume when props change
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        effectiveVolume,
        audioCtxRef.current.currentTime + 0.5
      );
    }
  }, [effectiveVolume]);

  // Play/pause
  useEffect(() => {
    if (!audioCtxRef.current) return;
    if (playing) {
      audioCtxRef.current.resume();
    } else {
      audioCtxRef.current.suspend();
    }
  }, [playing]);

  // Cleanup
  useEffect(() => {
    return () => {
      nodesRef.current.forEach(node => {
        try { node.stop(); } catch (_) {}
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {!initialized ? (
        <button
          onClick={initAudio}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] text-text-muted hover:text-text-secondary bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
          title="Play ambient Tapovan sound"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span>Tapovan</span>
        </button>
      ) : (
        <button
          onClick={() => setMuted(!muted)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] transition-all border ${
            muted
              ? 'text-text-muted bg-white/[0.02] border-white/[0.04]'
              : 'text-accent/70 bg-accent/5 border-accent/10'
          }`}
          title={muted ? 'Unmute ambient sound' : 'Mute ambient sound'}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            {muted ? (
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            ) : (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            )}
          </svg>
          <span>{muted ? 'Sound off' : 'Tapovan'}</span>
        </button>
      )}
    </div>
  );
}
