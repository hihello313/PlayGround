export class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.timer = null;
    this.step = 0;
    this.started = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted) {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(muted ? 0 : 0.55, now, 0.025);
  }

  tone(freq, freqEnd, dur, type = "sine", vol = 0.04, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.04);
  }

  jump() {
    this.tone(310, 590, 0.16, "triangle", 0.055);
  }

  doubleJump() {
    this.tone(640, 1080, 0.17, "sine", 0.045);
    this.tone(980, 1420, 0.14, "sine", 0.022, 0.035);
  }

  land() {
    this.tone(140, 86, 0.1, "sine", 0.045);
  }

  collect() {
    this.tone(920, 0, 0.075, "sine", 0.04);
    this.tone(1380, 0, 0.13, "sine", 0.028, 0.055);
  }

  hurt() {
    this.tone(260, 84, 0.32, "sawtooth", 0.055);
    this.tone(190, 70, 0.24, "triangle", 0.035, 0.03);
  }

  checkpoint() {
    this.tone(523.25, 0, 0.22, "sine", 0.04);
    this.tone(659.25, 0, 0.26, "sine", 0.032, 0.08);
    this.tone(783.99, 0, 0.3, "sine", 0.025, 0.16);
  }

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => this.tone(f, 0, 0.38, "triangle", 0.045 - i * 0.004, i * 0.11));
    this.tone(261.63, 0, 0.8, "sine", 0.03, 0.05);
  }

  ui() {
    this.tone(480, 620, 0.055, "sine", 0.02);
  }

  startMusic() {
    this.init();
    if (!this.ctx) return;
    this.started = true;
    if (this.timer) return;
    this.step = 0;
    this.timer = setInterval(() => this.musicTick(), 470);
  }

  stopMusic() {
    this.started = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  musicTick() {
    if (!this.ctx || !this.started || this.muted) return;
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const sequence = [0, 2, 4, 3, 5, 4, 2, 1, 0, 3, 5, 7, 6, 4, 2, 3];
    const step = this.step++;
    const idx = sequence[step % sequence.length];
    const octave = step % 32 >= 16 ? 2 : 1;
    const freq = scale[idx] * octave;
    this.tone(freq, 0, 0.52, "sine", 0.0125);
    if (step % 4 === 0) {
      this.tone(scale[0] / 2, 0, 1.4, "sine", 0.009);
      this.tone(scale[4] / 2, 0, 1.2, "triangle", 0.006);
    }
    if (step % 8 === 3) {
      this.tone(scale[7] * 2, 0, 0.4, "sine", 0.007);
    }
  }
}
