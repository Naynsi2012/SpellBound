const SOUNDS = {
  select: "/assets/audio/select.wav",
  lost: "/assets/audio/lost.wav",
  won: "/assets/audio/won.mp3",
  waveWon: "/assets/audio/wave-won.wav",
  type: "/assets/audio/type.wav",
  death: "/assets/audio/death.wav",
  spellSwitch: "/assets/audio/spell-switch.wav"
};

export class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.volume = 0.5;
  }

  loadAll() {
    for (const [name, src] of Object.entries(SOUNDS)) {
      const audio = new Audio(src);

      audio.preload = "auto";
      audio.volume = this.volume;

      this.sounds.set(name, audio);
    }
  }

  play(name) {
    const audio = this.sounds.get(name);

    if (!audio) {
      console.warn(`Sound "${name}" has not been loaded.`);
      return;
    }

    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    for (const audio of this.sounds.values()) {
      audio.volume = this.volume;
    }
  }
}
