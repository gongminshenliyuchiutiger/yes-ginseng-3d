/**
 * 《夜市人蔘 YES! GINSENG》多風格電腦合成音樂與音效引擎（Web Audio API）
 * 零外部音訊依賴，支援三種風格即時切換：
 * 1. 'chef'：美食小當家（中華一番）熱血料理對決（D大調五聲音階・笛子/揚琴/堂鼓/小鑼）
 * 2. 'god' ：氣勢磅礡「食神」史詩交響（雄渾銅管齊奏 + 史詩弦樂群 + 定音鼓 + 震撼大鑼）
 * 3. 'lofi'：Chill Jazz Lo-Fi 夜市漫步（溫暖電鋼琴七九和弦 + 慵懶 Swing 貝斯 + 柔和 Lo-Fi 鼓點）
 */
window.SOUND = (function () {
  let ctx = null;
  let masterGain = null;
  let bgmGain = null;
  let sfxGain = null;
  let noiseBuffer = null;

  let muted = false;
  let bgmPlaying = false;
  let bgmStyle = 'god'; // 預設：食神降臨氣勢交響 ('god' | 'chef' | 'lofi')
  const STYLE_ORDER = ['god', 'chef', 'lofi'];
  let bgmTimer = null;
  let nextStepTime = 0;
  let currentStep = 0;

  // 音高頻率表 (Hz)
  const N = {
    A1: 55.00, C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, B2: 123.47,
    C3: 130.81, Cs3: 138.59, D3: 146.83, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
    C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, Cs5: 554.37, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, A5: 880.00, Bb5: 932.33, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51, Fs6: 1479.98, A6: 1760.00
  };

  // ==================== 曲風 1：美食小當家熱血風 (64步, BPM 138) ====================
  const CHEF_MELODY = [
    [N.D5, 2], null, [N.E5, 2], null, [N.Fs5, 2], null, [N.A5, 3], null,
    null, [N.Fs5, 1], [N.A5, 2], null, [N.B5, 2], null, [N.A5, 2], null,
    [N.Fs5, 2], null, [N.E5, 1], [N.D5, 1], [N.B4, 2], null, [N.A4, 2], null,
    [N.B4, 2], null, [N.D5, 2], null, [N.E5, 4], null, null, null,
    [N.A5, 2], null, [N.A5, 1], [N.B5, 1], [N.D6, 3], null, null, [N.B5, 1],
    [N.A5, 2], null, [N.Fs5, 2], null, [N.E5, 2], null, [N.Fs5, 2], null,
    [N.A5, 2], null, [N.Fs5, 1], [N.E5, 1], [N.D5, 2], null, [N.B4, 2], null,
    [N.A4, 2], null, [N.B4, 1], [N.D5, 1], [N.D5, 4], null, null, null
  ];
  const CHEF_YANGQIN = [
    N.D4, N.A4, N.D5, N.Fs4, N.D4, N.A4, N.D5, N.A4,
    N.B3, N.Fs4, N.B4, N.D5, N.A3, N.E4, N.A4, N.E4,
    N.G3, N.D4, N.B4, N.D4, N.Fs3, N.D4, N.A4, N.D4,
    N.E3, N.B3, N.E4, N.A4, N.A3, N.E4, N.A4, N.B4,
    N.D4, N.A4, N.D5, N.Fs5, N.B3, N.Fs4, N.B4, N.D5,
    N.G3, N.D4, N.G4, N.B4, N.A3, N.E4, N.A4, N.E5,
    N.D4, N.A4, N.Fs4, N.A4, N.G3, N.D4, N.B4, N.G4,
    N.A3, N.E4, N.A4, N.E4, N.D4, N.A4, N.D5, null
  ];
  const CHEF_BASS = [
    N.D3, null, null, null, N.D3, null, N.A3, null,
    N.B3, null, null, null, N.A3, null, null, null,
    N.G3, null, null, null, N.Fs3, null, null, null,
    N.E3, null, N.B3, null, N.A3, null, N.E3, null,
    N.D3, null, null, null, N.B3, null, null, null,
    N.G3, null, null, null, N.A3, null, N.E3, null,
    N.D3, null, N.A3, null, N.G3, null, N.B3, null,
    N.A3, null, N.E3, null, N.D3, null, null, null
  ];
  const CHEF_PERC = [
    'G', null, 'W', null, 'K', null, 'W', 'W',
    'K', null, 'W', null, 'K', 'W', 'W', null,
    'K', null, 'W', null, 'K', null, 'W', 'W',
    'K', null, 'W', 'W', 'G', null, 'W', null,
    'G', null, 'W', 'W', 'K', null, 'W', null,
    'K', 'W', 'W', null, 'K', null, 'W', 'W',
    'K', null, 'W', null, 'K', null, 'W', 'W',
    'K', 'W', 'K', 'W', 'G', null, null, null
  ];

  // ==================== 曲風 2：氣勢磅礡「食神」史詩交響 (64步, BPM 104) ====================
  // 宏偉銅管主旋律（D 小調英雄風 → 凱旋大調收尾）
  const GOD_BRASS = [
    // 小節 1：食神降臨號角（D4 - A4 - D5!）
    [N.D4, 3], null, null, [N.A4, 1], [N.D5, 6], null, null, null,
    null, null, [N.C5, 2], null, [N.A4, 2], null, [N.G4, 2], null,
    // 小節 2：磅礡行進（F4 - G4 - A4 - E4）
    [N.F4, 4], null, null, null, [N.G4, 2], null, [N.A4, 2], null,
    [N.A4, 4], null, null, null, [N.E4, 4], null, null, null,
    // 小節 3：食神覺醒最高潮（Bb4 - C5 - D5 - F5!）
    [N.Bb4, 3], null, null, [N.C5, 1], [N.D5, 4], null, null, null,
    [N.F5, 4], null, null, null, [N.E5, 2], null, [N.D5, 2], null,
    // 小節 4：史詩凱旋（C5 - A4 - D5!）
    [N.C5, 3], null, null, [N.A4, 1], [N.A4, 4], null, null, null,
    [N.D5, 8], null, null, null, null, null, null, null
  ];
  // 史詩弦樂和弦群（每 8 步換一次和聲：Dm → C → Bb → A7 → Bb → Gm → A7 → D5）
  const GOD_STRINGS = {
    0:  [N.D3, N.A3, N.D4, N.F4],
    8:  [N.C3, N.G3, N.C4, N.E4],
    16: [N.Bb2, N.F3, N.Bb3, N.D4],
    24: [N.A2, N.E3, N.A3, N.Cs4],
    32: [N.Bb2, N.F3, N.Bb3, N.D4],
    40: [N.G2, N.D3, N.G3, N.Bb3],
    48: [N.A2, N.E3, N.A3, N.C4],
    56: [N.D3, N.A3, N.D4, N.Fs4]
  };
  // 定音鼓與史詩打擊（T=重定音鼓, t=定音鼓滾奏, G=震撼大銅鑼）
  const GOD_PERC = [
    'G', null, null, 't', 'T', null, 't', 't',
    'T', null, null, null, 'T', null, 't', 't',
    'T', null, null, 't', 'T', null, null, null,
    'T', null, 't', 't', 'T', 't', 't', 't',
    'G', null, null, 't', 'T', null, 't', 't',
    'T', null, null, null, 'T', null, 't', 't',
    'T', null, 't', 't', 'T', 't', 't', 't',
    'G', null, null, null, 'T', null, null, null
  ];

  // ==================== 曲風 3：Chill Jazz Lo-Fi 夜市漫步 (64步, BPM 82) ====================
  // 經典爵士 ii-V-I-VI 七九和弦進行（Dm9 → G13 → Cmaj9 → A7b9）
  const LOFI_CHORDS = {
    0:  [N.D3, N.F3, N.A3, N.C4, N.E4],   // Dm9
    16: [N.G2, N.F3, N.A3, N.B3, N.E4],   // G13
    32: [N.C3, N.E3, N.G3, N.B3, N.D4],   // Cmaj9
    48: [N.A2, N.G3, N.Cs4, N.E4]         // A7
  };
  // 慵懶爵士電鋼琴即興點綴音
  const LOFI_LICK = [
    null, null, null, [N.E5, 2], null, null, [N.C5, 2], null,
    null, [N.A4, 3], null, null, [N.G4, 2], null, null, null,
    null, null, [N.B4, 2], null, [N.D5, 2], null, [N.E5, 3], null,
    null, null, [N.B4, 2], null, [N.A4, 2], null, null, null,
    null, null, [N.G4, 2], null, [N.B4, 2], null, [N.D5, 3], null,
    null, [N.E5, 2], null, null, [N.D5, 2], null, [N.B4, 2], null,
    null, null, [N.C5, 2], null, [N.A4, 2], null, [N.G4, 3], null,
    null, [N.E4, 3], null, null, null, null, null, null
  ];
  // 溫暖 Walking Bass
  const LOFI_BASS = [
    N.D2, null, null, null, null, null, N.A2, null,
    N.F2, null, null, null, N.A2, null, null, null,
    N.G2, null, null, null, null, null, N.D3, null,
    N.B2, null, null, null, N.G2, null, null, null,
    N.C2, null, null, null, null, null, N.G2, null,
    N.E2, null, null, null, N.G2, null, null, null,
    N.A2, null, null, null, null, null, N.E2, null,
    N.G2, null, null, null, N.E2, null, null, null
  ];
  // 柔和 Lo-Fi 鼓點（K=軟踢鼓, S=悶小鼓, H=刷鼓 Hi-Hat）
  const LOFI_DRUM = [
    'K', null, 'H', null, 'S', null, 'H', 'K',
    null, 'H', 'K', null, 'S', null, 'H', null,
    'K', null, 'H', null, 'S', null, 'H', 'K',
    null, 'H', 'K', null, 'S', null, 'H', 'H',
    'K', null, 'H', null, 'S', null, 'H', 'K',
    null, 'H', 'K', null, 'S', null, 'H', null,
    'K', null, 'H', null, 'S', null, 'H', 'K',
    null, 'H', 'K', null, 'S', null, 'H', null
  ];

  const STYLE_BPM = {
    chef: 138,
    god: 104,
    lofi: 82
  };

  function getStepSec() {
    const bpm = STYLE_BPM[bgmStyle] || 138;
    return 60 / bpm / 4;
  }

  function ensureCtx() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      ctx = new AudioContext();

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 18;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.15;

      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0.0001 : 0.85;

      bgmGain = ctx.createGain();
      bgmGain.gain.value = 0.34;

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.88;

      bgmGain.connect(compressor);
      sfxGain.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      const bufSize = Math.floor(ctx.sampleRate * 1.2);
      noiseBuffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  // ==================== 樂器合成器 ====================
  // 1. 中華笛子 / 嗩吶（小當家主旋律）
  function playLeadFlute(c, freq, time, dur, vol = 0.16, dest = bgmGain) {
    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.003, time);

    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.setValueAtTime(5.6, time);
    lfoGain.gain.setValueAtTime(freq * 0.011, time);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, time);
    filter.Q.value = 1.6;

    const osc2Gain = c.createGain();
    osc2Gain.gain.value = 0.28;

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.025);
    gain.gain.setValueAtTime(vol * 0.88, time + Math.max(0.03, dur - 0.05));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur + 0.04);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    lfo.start(time);
    osc1.stop(time + dur + 0.06);
    osc2.stop(time + dur + 0.06);
    lfo.stop(time + dur + 0.06);
  }

  // 2. 揚琴撥弦
  function playYangqin(c, freq, time, vol = 0.075, dest = bgmGain) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.18);
  }

  // 3. 史詩交響銅管（食神號角：雙失諧鋸齒波 + 濾波輝煌展開）
  function playEpicBrass(c, freq, time, dur, vol = 0.16, dest = bgmGain) {
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    const sub = c.createOscillator();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();

    o1.type = 'sawtooth';
    o2.type = 'sawtooth';
    sub.type = 'triangle';
    o1.frequency.setValueAtTime(freq * 0.997, time);
    o2.frequency.setValueAtTime(freq * 1.004, time);
    sub.frequency.setValueAtTime(freq * 0.5, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, time);
    filter.frequency.exponentialRampToValueAtTime(2400, time + 0.12);
    filter.frequency.exponentialRampToValueAtTime(1400, time + dur);
    filter.Q.value = 1.4;

    const subGain = c.createGain();
    subGain.gain.value = 0.45;

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.06);
    gain.gain.setValueAtTime(vol * 0.85, time + Math.max(0.08, dur - 0.08));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur + 0.12);

    o1.connect(filter);
    o2.connect(filter);
    sub.connect(subGain);
    subGain.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    o1.start(time);
    o2.start(time);
    sub.start(time);
    o1.stop(time + dur + 0.15);
    o2.stop(time + dur + 0.15);
    sub.stop(time + dur + 0.15);
  }

  // 4. 史詩弦樂群 Pad（食神襯底和聲）
  function playStringPad(c, freqs, time, dur, vol = 0.055, dest = bgmGain) {
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1350, time);
    const padGain = c.createGain();
    padGain.gain.setValueAtTime(0.0001, time);
    padGain.gain.linearRampToValueAtTime(vol, time + 0.25);
    padGain.gain.setValueAtTime(vol * 0.9, time + Math.max(0.3, dur - 0.25));
    padGain.gain.exponentialRampToValueAtTime(0.0001, time + dur + 0.2);

    filter.connect(padGain);
    padGain.connect(dest);

    freqs.forEach((f) => {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, time);
      o.connect(filter);
      o.start(time);
      o.stop(time + dur + 0.22);
    });
  }

  // 5. 溫暖 Chill Jazz 電鋼琴（Rhodes 音色）
  function playRhodesChord(c, freqs, time, dur, vol = 0.065, dest = bgmGain) {
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, time);
    const chordGain = c.createGain();
    chordGain.gain.setValueAtTime(0.0001, time);
    chordGain.gain.linearRampToValueAtTime(vol, time + 0.03);
    chordGain.gain.exponentialRampToValueAtTime(vol * 0.45, time + dur * 0.7);
    chordGain.gain.exponentialRampToValueAtTime(0.0001, time + dur + 0.18);

    filter.connect(chordGain);
    chordGain.connect(dest);

    freqs.forEach((f, idx) => {
      const o = c.createOscillator();
      const overtone = c.createOscillator();
      const og = c.createGain();
      o.type = 'sine';
      overtone.type = 'triangle';
      const strum = idx * 0.018; // 微撥弦感更爵士
      o.frequency.setValueAtTime(f, time + strum);
      overtone.frequency.setValueAtTime(f * 2, time + strum);
      og.gain.setValueAtTime(0.18, time + strum);
      og.gain.exponentialRampToValueAtTime(0.001, time + strum + 0.35);

      o.connect(filter);
      overtone.connect(og);
      og.connect(filter);
      o.start(time + strum);
      overtone.start(time + strum);
      o.stop(time + dur + 0.2);
      overtone.stop(time + dur + 0.2);
    });
  }

  // 6. 低音貝斯（通用 / Lo-Fi 圓潤貝斯）
  function playBass(c, freq, time, dur = 0.22, vol = 0.16, warm = false, dest = bgmGain) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = warm ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.04);
  }

  // 7. 堂鼓 / 定音鼓 / 軟踢鼓
  function playTaiko(c, time, vol = 0.22, pitch = 135, dur = 0.22, dest = bgmGain) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(38, pitch * 0.38), time + dur * 0.75);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.03);
  }

  // 8. Lo-Fi 悶小鼓 & 刷鼓 Hi-Hat
  function playLofiSnare(c, time, vol = 0.085, dest = bgmGain) {
    if (!noiseBuffer) return;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1150, time);
    bp.Q.value = 0.9;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
    src.connect(bp);
    bp.connect(g);
    g.connect(dest);
    src.start(time);
    src.stop(time + 0.15);
  }

  function playLofiHat(c, time, vol = 0.032, dest = bgmGain) {
    if (!noiseBuffer) return;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(5200, time);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
    src.connect(hp);
    hp.connect(g);
    g.connect(dest);
    src.start(time);
    src.stop(time + 0.055);
  }

  // 9. 清脆木魚
  function playWoodblock(c, time, vol = 0.09, freq = 860, dest = bgmGain) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.72, time + 0.045);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.065);
  }

  // 10. 中華銅鑼 / 史詩大鑼
  function playGong(c, time, dur = 0.9, vol = 0.16, bright = false, dest = sfxGain) {
    const partials = bright ? [380, 562, 815, 1180, 1690] : [174, 261, 392, 588, 860];
    partials.forEach((f, idx) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, time);
      osc.frequency.exponentialRampToValueAtTime(f * 0.985, time + dur);
      const pVol = vol / (idx + 1.3);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(pVol, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      osc.connect(g);
      g.connect(dest);
      osc.start(time);
      osc.stop(time + dur + 0.04);
    });

    if (noiseBuffer) {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(bright ? 3400 : 1650, time);
      bp.Q.value = 1.4;
      const g = c.createGain();
      g.gain.setValueAtTime(vol * 0.45, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur * 0.72);
      src.connect(bp);
      bp.connect(g);
      g.connect(dest);
      src.start(time);
      src.stop(time + dur);
    }
  }

  // ==================== 多風格 BGM 排程器 ====================
  function scheduleStep(c, stepIdx, time) {
    const stepSec = getStepSec();

    if (bgmStyle === 'chef') {
      const mel = CHEF_MELODY[stepIdx];
      if (mel) playLeadFlute(c, mel[0], time, mel[1] * stepSec * 0.95, 0.15, bgmGain);
      const yq = CHEF_YANGQIN[stepIdx];
      if (yq) playYangqin(c, yq, time, 0.068, bgmGain);
      const bass = CHEF_BASS[stepIdx];
      if (bass) playBass(c, bass, time, stepSec * 2.4, 0.17, false, bgmGain);
      const perc = CHEF_PERC[stepIdx];
      if (perc === 'K') playTaiko(c, time, 0.2, 130, 0.22, bgmGain);
      else if (perc === 'W') playWoodblock(c, time, 0.075, stepIdx % 4 === 2 ? 920 : 780, bgmGain);
      else if (perc === 'G') {
        playTaiko(c, time, 0.24, 150, 0.24, bgmGain);
        playGong(c, time, 0.55, 0.11, true, bgmGain);
      }
      return;
    }

    if (bgmStyle === 'god') {
      // 氣勢磅礡「食神」史詩交響
      const chord = GOD_STRINGS[stepIdx];
      if (chord) {
        playStringPad(c, chord, time, stepSec * 8, 0.052, bgmGain);
        playBass(c, chord[0] * 0.5, time, stepSec * 7.5, 0.2, true, bgmGain);
      }
      const brass = GOD_BRASS[stepIdx];
      if (brass) {
        playEpicBrass(c, brass[0], time, brass[1] * stepSec * 0.96, 0.15, bgmGain);
      }
      const perc = GOD_PERC[stepIdx];
      if (perc === 'T') playTaiko(c, time, 0.28, 115, 0.34, bgmGain);
      else if (perc === 't') playTaiko(c, time, 0.14, 135, 0.16, bgmGain);
      else if (perc === 'G') {
        playTaiko(c, time, 0.32, 105, 0.4, bgmGain);
        playGong(c, time, 1.3, 0.16, false, bgmGain);
      }
      return;
    }

    if (bgmStyle === 'lofi') {
      // Chill Jazz Lo-Fi（帶些微 swing 搖擺感）
      const swingOffset = stepIdx % 2 === 1 ? stepSec * 0.16 : 0;
      const t = time + swingOffset;

      const chord = LOFI_CHORDS[stepIdx];
      if (chord) {
        playRhodesChord(c, chord, t, stepSec * 15, 0.062, bgmGain);
      }
      const lick = LOFI_LICK[stepIdx];
      if (lick) {
        playRhodesChord(c, [lick[0]], t, lick[1] * stepSec * 1.3, 0.078, bgmGain);
      }
      const bass = LOFI_BASS[stepIdx];
      if (bass) {
        playBass(c, bass, t, stepSec * 4.5, 0.2, true, bgmGain);
      }
      const drum = LOFI_DRUM[stepIdx];
      if (drum === 'K') playTaiko(c, t, 0.18, 88, 0.18, bgmGain);
      else if (drum === 'S') playLofiSnare(c, t, 0.075, bgmGain);
      else if (drum === 'H') playLofiHat(c, t, 0.032, bgmGain);
    }
  }

  function schedulerTick() {
    if (!bgmPlaying || muted || !ctx) return;
    const lookAhead = 0.15;
    while (nextStepTime < ctx.currentTime + lookAhead) {
      scheduleStep(ctx, currentStep, nextStepTime);
      nextStepTime += getStepSec();
      currentStep = (currentStep + 1) % 64;
    }
  }

  function startBgm() {
    const c = ensureCtx();
    if (!c) return false;
    if (muted) {
      muted = false;
      if (masterGain) masterGain.gain.setValueAtTime(0.85, c.currentTime);
    }
    if (bgmPlaying) return true;
    bgmPlaying = true;
    currentStep = 0;
    nextStepTime = c.currentTime + 0.05;
    clearInterval(bgmTimer);
    bgmTimer = setInterval(schedulerTick, 40);
    return true;
  }

  function stopBgm() {
    bgmPlaying = false;
    clearInterval(bgmTimer);
    bgmTimer = null;
  }

  function toggleBgm() {
    if (bgmPlaying) {
      stopBgm();
      return false;
    }
    return startBgm();
  }

  function setBgmStyle(style) {
    if (!STYLE_ORDER.includes(style)) return bgmStyle;
    bgmStyle = style;
    currentStep = 0;
    if (ctx && bgmPlaying && !muted) {
      nextStepTime = ctx.currentTime + 0.05;
    } else if (!bgmPlaying) {
      startBgm();
    }
    return bgmStyle;
  }

  function cycleBgmStyle() {
    const idx = STYLE_ORDER.indexOf(bgmStyle);
    const next = STYLE_ORDER[(idx + 1) % STYLE_ORDER.length];
    return setBgmStyle(next);
  }

  function playTone(freq, duration, type = 'triangle', volume = 0.14, delay = 0) {
    if (muted) return;
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  return {
    isMuted() {
      return muted;
    },
    isBgmPlaying() {
      return bgmPlaying && !muted;
    },
    getBgmStyle() {
      return bgmStyle;
    },
    setBgmStyle,
    cycleBgmStyle,
    startBgm,
    stopBgm,
    toggleBgm,
    toggleMute() {
      muted = !muted;
      if (ctx && masterGain) {
        masterGain.gain.setValueAtTime(muted ? 0.0001 : 0.85, ctx.currentTime);
      }
      if (muted && bgmPlaying) {
        clearInterval(bgmTimer);
        bgmTimer = null;
      } else if (!muted && bgmPlaying && ctx) {
        nextStepTime = ctx.currentTime + 0.05;
        clearInterval(bgmTimer);
        bgmTimer = setInterval(schedulerTick, 40);
      }
      return muted;
    },
    card() {
      playTone(460, 0.07, 'sine', 0.09, 0);
      playTone(640, 0.055, 'triangle', 0.07, 0.035);
    },
    coin() {
      playTone(1046.5, 0.11, 'sine', 0.14, 0);
      playTone(1567.98, 0.24, 'sine', 0.15, 0.075);
      playTone(2093.0, 0.18, 'triangle', 0.08, 0.14);
    },
    cook() {
      if (muted) return;
      const c = ensureCtx();
      if (!c) return;
      const now = c.currentTime;
      playGong(c, now, 0.85, 0.17, true, sfxGain);
      const notes = [N.D5, N.E5, N.Fs5, N.A5, N.B5, N.D6, N.Fs6];
      notes.forEach((n, i) => {
        playTone(n, 0.24, 'triangle', 0.13, i * 0.048);
        playTone(n * 0.5, 0.18, 'sine', 0.06, i * 0.048);
      });
    },
    ginseng() {
      if (muted) return;
      const c = ensureCtx();
      if (!c) return;
      const now = c.currentTime;
      playTaiko(c, now, 0.34, 160, 0.28, sfxGain);
      playGong(c, now + 0.03, 1.35, 0.24, false, sfxGain);
      [N.D4, N.Fs4, N.A4, N.D5, N.Fs5, N.A5, N.D6, N.Fs6].forEach((n, i) => {
        playTone(n, 0.45, 'triangle', 0.13, 0.04 + i * 0.042);
      });
    },
    buddha() {
      if (muted) return;
      const c = ensureCtx();
      if (!c) return;
      const now = c.currentTime;
      playWoodblock(c, now, 0.18, 720, sfxGain);
      playWoodblock(c, now + 0.14, 0.18, 860, sfxGain);
      playGong(c, now + 0.26, 1.2, 0.16, false, sfxGain);
      [N.D5, N.A5, N.D6].forEach((n, i) => playTone(n, 0.55, 'sine', 0.12, 0.28 + i * 0.06));
    },
    attack() {
      if (muted) return;
      const c = ensureCtx();
      if (!c) return;
      const now = c.currentTime;
      playTaiko(c, now, 0.28, 140, 0.24, sfxGain);
      playTone(260, 0.14, 'sawtooth', 0.12, 0);
      playTone(175, 0.24, 'sawtooth', 0.13, 0.1);
      playGong(c, now + 0.06, 0.42, 0.12, true, sfxGain);
    },
    defense() {
      if (muted) return;
      const c = ensureCtx();
      if (!c) return;
      const now = c.currentTime;
      playGong(c, now, 0.55, 0.15, true, sfxGain);
      playTone(440, 0.12, 'square', 0.08, 0);
      playTone(659.25, 0.18, 'triangle', 0.13, 0.07);
      playTone(880, 0.26, 'triangle', 0.14, 0.14);
    },
    win() {
      if (muted) return;
      const c = ensureCtx();
      if (!c) return;
      const now = c.currentTime;
      playTaiko(c, now, 0.3, 150, 0.3, sfxGain);
      const melody = [N.D5, N.E5, N.Fs5, N.A5, N.Fs5, N.A5, N.D6];
      const delays = [0, 0.1, 0.2, 0.32, 0.46, 0.58, 0.72];
      melody.forEach((n, i) => {
        playLeadFlute(c, n, now + delays[i], i === melody.length - 1 ? 0.65 : 0.16, 0.18, sfxGain);
      });
      playGong(c, now + 0.72, 1.5, 0.24, true, sfxGain);
    },
    click() {
      playTone(680, 0.045, 'sine', 0.07);
    }
  };
})();
