// Persistent AudioContext - initialized once on first user click
let audioCtx = null;

// Call this on any user interaction (button click) to unlock audio
export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Generate alert sound using the pre-initialized AudioContext
export function playAlertSound(duration = 4000) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const startTime = audioCtx.currentTime;

  // Create a repeating beep pattern
  const beepCount = Math.floor(duration / 500);
  for (let i = 0; i < beepCount; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.value = i % 2 === 0 ? 880 : 660;
    osc.type = 'square';

    const beepStart = startTime + i * 0.5;
    const beepEnd = beepStart + 0.35;

    gain.gain.setValueAtTime(0.3, beepStart);
    gain.gain.setValueAtTime(0, beepEnd);

    osc.start(beepStart);
    osc.stop(beepEnd);
  }
}
