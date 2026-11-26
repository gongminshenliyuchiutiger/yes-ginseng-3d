/**
 * 《夜市人蔘 YES! GINSENG》反白文字中／英／韓即時翻譯與語音朗讀工具
 * 特色：
 * - 反白頁面任意文字即自動浮出深藍燙金翻譯朗讀卡片
 * - 內建《夜市人蔘》全詞庫（26道小吃、食材、攻防牌）0ms 精準秒翻 + 免費線上 API 支援任意段落翻譯
 * - 內建 Web Speech API 多語 TTS 朗讀（自動辨識繁體中文 zh-TW / 英文 en-US / 韓文 ko-KR）
 */
window.SELECTION_TRANSLATOR = (function () {
  let popEl = null;
  let currentText = '';
  let localIndex = [];
  const apiCache = new Map();
  let hideTimer = null;

  const LANG_INFO = {
    zh: { label: '中', bcp47: 'zh-TW', gCode: 'zh-TW', mmCode: 'zh-TW' },
    en: { label: 'EN', bcp47: 'en-US', gCode: 'en', mmCode: 'en' },
    ko: { label: '한', bcp47: 'ko-KR', gCode: 'ko', mmCode: 'ko' }
  };

  // 偵測文字主要語系
  function detectLang(text) {
    if (/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(text)) return 'ko';
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
    return 'en';
  }

  // 建立內建遊戲三語對照詞庫（秒出精準小吃與牌卡翻譯）
  function buildLocalIndex() {
    localIndex = [];
    const DATA = window.GAME_DATA;
    if (!DATA) return;

    const addTriplet = (zh, en, ko) => {
      if (!zh && !en && !ko) return;
      localIndex.push({
        zh: (zh || '').trim(),
        en: (en || '').trim(),
        ko: (ko || '').trim()
      });
    };

    Object.values(DATA.INGREDIENTS || {}).forEach((m) => {
      addTriplet(m.name, m.en, m.ko);
      if (m.rottenName && m.rottenName !== m.name) {
        addTriplet(m.rottenName, m.rottenEn, m.rottenKo);
      }
    });

    (DATA.ORDERS || []).forEach((o) => {
      addTriplet(o.name, o.en, o.ko);
      addTriplet(o.region, o.regionEn, o.regionKo);
      addTriplet(o.desc, o.descEn, o.descKo);
      addTriplet(o.story, o.storyEn, o.storyKo);
      addTriplet(o.recipe, o.recipeEn, o.recipeKo);
      addTriplet(o.tip, o.tipEn, o.tipKo);
    });

    (DATA.SPECIALS || []).forEach((sp) => {
      addTriplet(sp.name, sp.en, sp.ko);
      addTriplet(sp.desc, sp.descEn, sp.descKo);
    });

    (DATA.AI_PROFILES || []).forEach((p) => {
      addTriplet(p.name, p.nameEn, p.nameKo);
      addTriplet(p.title, p.titleEn, p.titleKo);
    });
  }

  function lookupLocal(text) {
    const clean = text.trim().toLowerCase();
    if (!clean) return null;
    // 1. 精準匹配
    for (const row of localIndex) {
      if (
        row.zh.toLowerCase() === clean ||
        row.en.toLowerCase() === clean ||
        row.ko.toLowerCase() === clean
      ) {
        return row;
      }
    }
    // 2. 若反白字數 >= 4 且被某筆完整內文包含，且反白長度佔比夠高則直接命中
    if (clean.length >= 6) {
      for (const row of localIndex) {
        for (const field of [row.zh, row.en, row.ko]) {
          const low = field.toLowerCase();
          if (low && low.includes(clean) && clean.length / low.length >= 0.72) {
            return row;
          }
        }
      }
    }
    return null;
  }

  // Web Speech API 語音朗讀
  function speak(text, langCode) {
    if (!text || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const code = langCode || detectLang(text);
    const info = LANG_INFO[code] || LANG_INFO.zh;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = info.bcp47;
    utter.rate = code === 'en' ? 0.96 : 0.95;

    const voices = synth.getVoices ? synth.getVoices() : [];
    if (voices.length > 0) {
      const exact =
        voices.find((v) => v.lang.toLowerCase() === info.bcp47.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(code === 'zh' ? 'zh-tw' : code)) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(code));
      if (exact) utter.voice = exact;
    }

    synth.speak(utter);
  }

  // 線上即時翻譯（先試 Google 公開端點，失敗自動 fallback 到 MyMemory）
  async function translateOnline(text, targetLang) {
    const srcLang = detectLang(text);
    if (srcLang === targetLang) return text;

    const cacheKey = `${srcLang}_${targetLang}_${text}`;
    if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

    const tgt = LANG_INFO[targetLang];
    const src = LANG_INFO[srcLang];

    // 嘗試 1：Google Translate 公開端點
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
        tgt.gCode
      )}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && Array.isArray(json[0])) {
          const translated = json[0].map((seg) => seg[0] || '').join('').trim();
          if (translated) {
            apiCache.set(cacheKey, translated);
            return translated;
          }
        }
      }
    } catch (_) {}

    // 嘗試 2：MyMemory 免費翻譯 API Fallback
    try {
      const url2 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(
        src.mmCode
      )}|${encodeURIComponent(tgt.mmCode)}`;
      const res2 = await fetch(url2);
      if (res2.ok) {
        const json2 = await res2.json();
        const translated2 = json2 && json2.responseData && json2.responseData.translatedText;
        if (translated2) {
          apiCache.set(cacheKey, translated2.trim());
          return translated2.trim();
        }
      }
    } catch (_) {}

    return null;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function createPopover() {
    if (popEl) return popEl;
    popEl = document.createElement('div');
    popEl.id = 'sel-translator-pop';
    popEl.className = 'sel-trans-pop hidden';
    popEl.setAttribute('role', 'dialog');
    popEl.setAttribute('aria-label', '反白文字中英韓翻譯與朗讀');

    // 點擊翻譯卡片時避免清除頁面反白選取
    popEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    document.body.appendChild(popEl);
    return popEl;
  }

  function hidePopover() {
    if (!popEl) return;
    popEl.classList.add('hidden');
    currentText = '';
  }

  function positionPopover(rect) {
    if (!popEl) return;
    popEl.classList.remove('hidden');
    const popW = Math.min(360, window.innerWidth - 20);
    popEl.style.width = `${popW}px`;

    const popH = popEl.offsetHeight || 120;
    let left = rect.left + rect.width / 2 - popW / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - popW - 10));

    let top = rect.top - popH - 10;
    if (top < 64) {
      top = rect.bottom + 10;
    }
    if (top + popH > window.innerHeight - 12) {
      top = Math.max(64, window.innerHeight - popH - 12);
    }

    popEl.style.left = `${left}px`;
    popEl.style.top = `${top}px`;
  }

  function renderResultRows(container, results) {
    const order = ['zh', 'en', 'ko'];
    const html = order
      .filter((code) => results[code])
      .map(
        (code) => `
      <div class="stp-res-row stp-lang-${code}">
        <span class="stp-lang-badge">${LANG_INFO[code].label}</span>
        <span class="stp-res-text">${escapeHtml(results[code])}</span>
        <button type="button" class="stp-speak-btn" data-speak-lang="${code}" title="朗讀 (${LANG_INFO[code].label})">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>`
      )
      .join('');

    container.innerHTML = html;
    container.querySelectorAll('[data-speak-lang]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = btn.dataset.speakLang;
        speak(results[code], code);
      });
    });
  }

  async function runTranslate(targets) {
    if (!popEl || !currentText) return;
    const resBox = popEl.querySelector('.stp-results');
    if (!resBox) return;

    const hit = lookupLocal(currentText);
    if (hit) {
      const picked = {};
      targets.forEach((l) => {
        if (hit[l]) picked[l] = hit[l];
      });
      renderResultRows(resBox, picked);
      return;
    }

    const loadingLabel = window.I18N ? window.I18N.t('selTranslating') : '翻譯中...';
    resBox.innerHTML = `<div class="stp-loading"><i class="fa-solid fa-spinner fa-spin"></i> ${escapeHtml(loadingLabel)}</div>`;

    const results = {};
    await Promise.all(
      targets.map(async (lang) => {
        const tr = await translateOnline(currentText, lang);
        if (tr) results[lang] = tr;
      })
    );

    if (Object.keys(results).length === 0) {
      const failLabel = window.I18N ? window.I18N.t('selFail') : '暫時無法連線翻譯';
      resBox.innerHTML = `<div class="stp-loading">${escapeHtml(failLabel)}</div>`;
      return;
    }
    renderResultRows(resBox, results);
  }

  function showForSelection() {
    const sel = window.getSelection ? window.getSelection() : null;
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      hidePopover();
      return;
    }

    // 忽略輸入框內的反白，避免干擾更名或搜尋
    const anchorNode = sel.anchorNode;
    const parentEl = anchorNode && anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode;
    if (parentEl && parentEl.closest && parentEl.closest('input, textarea, #sel-translator-pop')) {
      return;
    }

    const text = sel.toString().trim().replace(/\s+/g, ' ');
    if (!text || text.length > 300) {
      hidePopover();
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      hidePopover();
      return;
    }

    currentText = text;
    const origLang = detectLang(text);
    const preview = text.length > 36 ? `${text.slice(0, 36)}…` : text;
    const pop = createPopover();

    pop.innerHTML = `
      <div class="stp-head">
        <span class="stp-preview" title="${escapeHtml(text)}">「${escapeHtml(preview)}」</span>
        <div class="stp-head-actions">
          <button type="button" class="stp-btn stp-btn-orig" data-act="speak-orig" title="${window.I18N ? window.I18N.t('selSpeakOrig') : '朗讀原文'}">
            <i class="fa-solid fa-volume-high"></i>
          </button>
          <button type="button" class="stp-btn stp-btn-close" data-act="close" title="關閉">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
      <div class="stp-bar">
        <button type="button" class="stp-lang-btn" data-tr="zh">譯 中</button>
        <button type="button" class="stp-lang-btn" data-tr="en">EN</button>
        <button type="button" class="stp-lang-btn" data-tr="ko">한</button>
        <button type="button" class="stp-lang-btn stp-all-btn" data-tr="all"><i class="fa-solid fa-language"></i> 中英韓</button>
      </div>
      <div class="stp-results"></div>
    `;

    pop.querySelector('[data-act="speak-orig"]').addEventListener('click', (e) => {
      e.stopPropagation();
      speak(currentText, origLang);
    });
    pop.querySelector('[data-act="close"]').addEventListener('click', (e) => {
      e.stopPropagation();
      hidePopover();
    });
    pop.querySelectorAll('[data-tr]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.SOUND) window.SOUND.click();
        const mode = btn.dataset.tr;
        const targets = mode === 'all' ? ['zh', 'en', 'ko'] : [mode];
        runTranslate(targets).then(() => positionPopover(rect));
      });
    });

    // 若精準命中遊戲內建詞庫，立即秒出三語對照；否則自動顯示按鈕供點選（且可立即朗讀）
    const instant = lookupLocal(text);
    if (instant) {
      renderResultRows(pop.querySelector('.stp-results'), instant);
    }

    positionPopover(rect);
  }

  function init() {
    buildLocalIndex();
    createPopover();

    // 預熱語音清單（部分瀏覽器需先呼叫一次 getVoices）
    if ('speechSynthesis' in window && window.speechSynthesis.getVoices) {
      window.speechSynthesis.getVoices();
    }

    document.addEventListener('mouseup', (e) => {
      if (popEl && popEl.contains(e.target)) return;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(showForSelection, 40);
    });

    document.addEventListener('touchend', (e) => {
      if (popEl && popEl.contains(e.target)) return;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(showForSelection, 160);
    });

    document.addEventListener('mousedown', (e) => {
      if (popEl && !popEl.classList.contains('hidden') && !popEl.contains(e.target)) {
        hidePopover();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hidePopover();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      }
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  return { speak, hidePopover, detectLang };
})();
