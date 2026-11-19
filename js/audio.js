/**
 * 《夜市人蔘》Web Audio API 音效引擎
 * 零外部素材依賴，即時合成夜市桌遊互動音效
 */
window.SOUND = (function () {
  let ctx = null;
  let muted = false;

  function ensureCtx() {
    if (muted) return null;
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      ctx = new AudioContext();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq, duration, type = 'triangle', volume = 0.12, delay = 0) {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  return {
    isMuted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    card() {
      playTone(420, 0.08, 'sine', 0.08);
      playTone(580, 0.06, 'triangle', 0.06, 0.04);
    },
    coin() {
      playTone(987.77, 0.12, 'sine', 0.12, 0);
      playTone(1318.51, 0.22, 'sine', 0.12, 0.09);
    },
    cook() {
      // 愉悅的夜市出菜五聲音階
      const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => playTone(n, 0.14, 'triangle', 0.11, i * 0.055));
    },
    attack() {
      playTone(220, 0.16, 'sawtooth', 0.1, 0);
      playTone(165, 0.24, 'sawtooth', 0.11, 0.11);
    },
    defense() {
      playTone(440, 0.1, 'square', 0.08, 0);
      playTone(659.25, 0.18, 'triangle', 0.12, 0.08);
    },
    ginseng() {
      // 喊出「夜市人蔘」的震撼金鐘音效
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((n, i) => {
        playTone(n, 0.35, 'triangle', 0.13, i * 0.04);
      });
    },
    win() {
      const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      const delays = [0, 0.12, 0.24, 0.36, 0.54, 0.66];
      melody.forEach((n, i) => playTone(n, 0.26, 'triangle', 0.14, delays[i]));
    },
    click() {
      playTone(640, 0.05, 'sine', 0.06);
    }
  };
})();
