// Audio utility for global notifications and chimes

export function playGlobalNotificationChime() {
  if (typeof window === "undefined") return;

  // Always play synthesized Web Audio chime bell for guaranteed sound
  playWebAudioChime();

  // Also attempt playing MP3 audio file
  try {
    const audio = new Audio("/universfield-new-notification-051-494246.mp3");
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch (e) {
    // Ignore html5 audio error as web audio chime already played
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
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.5);

    // Tone 2 (Harmonic echo)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + 0.12); // E6
    gain2.gain.setValueAtTime(0.35, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn("Web Audio Chime failed:", e);
  }
}
