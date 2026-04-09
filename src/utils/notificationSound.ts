const DEFAULT_NOTIFICATION_SOUND = 16;

function normalizeNotificationSound(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_NOTIFICATION_SOUND;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function playNotificationSound(volume = DEFAULT_NOTIFICATION_SOUND) {
  if (typeof window === "undefined") return;
  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) return;

  const context = new AudioContextConstructor();
  const now = context.currentTime;
  const beepDuration = 0.13;
  const gap = 0.001;
  const normalizedVolume = normalizeNotificationSound(volume) / 100;

  const scheduleBeep = (startAt: number, frequency: number) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 1.18,
      startAt + beepDuration
    );

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(normalizedVolume, 0.0001),
      startAt + 0.01
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + beepDuration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + beepDuration);
  };

  scheduleBeep(now, 820);
  scheduleBeep(now + beepDuration + gap, 980);

  window.setTimeout(() => {
    void context.close();
  }, Math.ceil((beepDuration * 2 + gap + 0.05) * 1000));
}

export function getDefaultNotificationSound() {
  return DEFAULT_NOTIFICATION_SOUND;
}
