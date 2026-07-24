// Audio utility for global notifications and chimes

export function playGlobalNotificationChime() {
  if (typeof window === "undefined") return;

  // 1. Try HTML5 Audio playback first
  try {
    const audio = new Audio("/universfield-new-notification-051-494246.mp3");
    audio.volume = 0.5;
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        // Autoplay blocked by browser policy, fallback to Web Audio API
        playWebAudioChime();
      });
    }
  } catch {
    playWebAudioChime();
  }
}

export function playWebAudioChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1 (High bell)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.5);

    // Tone 2 (Harmonic echo)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + 0.1); // E6
    gain2.gain.setValueAtTime(0.25, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.1);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn("Web Audio Chime failed:", e);
  }
}
