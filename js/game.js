/**
 * 《夜市人蔘 YES! GINSENG》數位 3D 桌遊核心邏輯引擎
 * 支援：
 * - 2–6 人遊玩，可自由選擇實際真人玩家人數（1 位至全部真人 Pass-and-Play）
 * - 多人真人熱座防偷看交接機制
 * - 繁體中文 / English 完整雙語即時切換
 * - 純程式繪製牌卡（含實體卡半圓食材扇形）
 */

window.NightMarketGame = (function () {
  const DATA = window.GAME_DATA;
  const I18N = window.I18N;

  let state = null;
  let discardMode = false;
  let privacyHidden = false;
  let modalResolve = null;
  let modalClosable = false;
  let currentModalType = null; // 'guide' | 'rules' | null
  let fxTimer = null;

  // 開局設定暫存
  let setupTotalPlayers = 4;
  let setupHumanCount = 1;
  let setupHumanNames = ['', '', '', '', '', ''];
  try {
    const savedNames = JSON.parse(localStorage.getItem('yes_ginseng_human_names') || 'null');
    if (Array.isArray(savedNames)) {
      for (let i = 0; i < 6; i++) {
        if (typeof savedNames[i] === 'string') setupHumanNames[i] = savedNames[i].slice(0, 16);
      }
    }
  } catch (_) {}

  function saveHumanNames() {
    try {
      localStorage.setItem('yes_ginseng_human_names', JSON.stringify(setupHumanNames));
    } catch (_) {}
  }

  const el = {};

  function cacheDom() {
    el.turnBadge = document.getElementById('hud-turn-badge');
    el.modeBadge = document.getElementById('hud-mode-badge');
    el.deckCounts = document.getElementById('hud-deck-counts');
    el.opponentsBar = document.getElementById('opponents-bar');
    el.ordersStrip = document.getElementById('orders-strip');
    el.handContainer = document.getElementById('player-hand');
    el.playerStats = document.getElementById('player-stats');
    el.playerBuffs = document.getElementById('player-buffs');
    el.logList = document.getElementById('game-log-list');
    el.toastBox = document.getElementById('toast-container');
    el.fxStage = document.getElementById('fx-stage');
    el.btnBuySpecial = document.getElementById('btn-buy-special');
    el.btnEndTurn = document.getElementById('btn-end-turn');
    el.btnBgm = document.getElementById('btn-bgm');
    el.btnBgmStyle = document.getElementById('btn-bgm-style');
    el.btnMute = document.getElementById('btn-mute');
    el.btnFoodGuide = document.getElementById('btn-food-guide');
    el.btnRules = document.getElementById('btn-rules');
    el.btnPromoVideo = document.getElementById('btn-promo-video');
    el.btnStartPromo = document.getElementById('btn-start-promo');
    el.btnNewGame = document.getElementById('btn-new-game');
    el.discardBanner = document.getElementById('discard-banner');
    el.modalOverlay = document.getElementById('modal-overlay');
    el.modalCard = document.getElementById('modal-card');
    el.modalTitle = document.getElementById('modal-title');
    el.modalBody = document.getElementById('modal-body');
    el.modalFooter = document.getElementById('modal-footer');
    el.photoLightbox = document.getElementById('photo-lightbox');
    el.startOverlay = document.getElementById('start-overlay');
    el.totalPlayersGroup = document.getElementById('total-players-group');
    el.humanCountGroup = document.getElementById('human-count-group');
    el.humanNamesGroup = document.getElementById('human-names-group');
    el.humanSummaryText = document.getElementById('human-summary-text');
  }

  // ==================== 美食小當家風格全螢幕特效 ====================
  function triggerFxOverlay(type, mainTitleHtml, subTextHtml = '') {
    if (!el.fxStage) return;
    clearTimeout(fxTimer);

    const isAttack = type === 'attack' || type === 'hygiene';
    const isDefense = type === 'defense';
    const isGold = type === 'cook' || type === 'ginseng' || type === 'buddha';

    if (isAttack) {
      document.body.classList.remove('fx-shake');
      void document.body.offsetWidth;
      document.body.classList.add('fx-shake');
      setTimeout(() => document.body.classList.remove('fx-shake'), 520);
    }

    const icon =
      type === 'ginseng'
        ? 'fa-solid fa-seedling'
        : type === 'buddha'
        ? 'fa-solid fa-hands-praying'
        : type === 'cook'
        ? 'fa-solid fa-utensils'
        : isDefense
        ? 'fa-solid fa-shield-halved'
        : 'fa-solid fa-bolt';

    const sparkles = isGold
      ? Array.from({ length: 14 }, (_, i) => {
          const left = 10 + ((i * 37) % 80);
          const delay = ((i % 5) * 0.08).toFixed(2);
          return `<span class="fx-spark" style="left:${left}%; animation-delay:${delay}s;">✦</span>`;
        }).join('')
      : '';

    el.fxStage.innerHTML = `
      <div class="fx-banner fx-type-${type}">
        ${isGold ? '<div class="fx-sunburst"></div>' : ''}
        ${isDefense ? '<div class="fx-shield-wave"></div>' : ''}
        ${isAttack ? '<div class="fx-slash-flash"></div>' : ''}
        ${sparkles}
        <div class="fx-emblem"><i class="${icon}"></i></div>
        <div class="fx-title">${mainTitleHtml}</div>
        ${subTextHtml ? `<div class="fx-sub">${subTextHtml}</div>` : ''}
      </div>
    `;
    el.fxStage.classList.add('active');

    const duration = type === 'ginseng' || type === 'buddha' ? 1950 : isGold ? 1650 : 1200;
    fxTimer = setTimeout(() => {
      el.fxStage.classList.remove('active');
      setTimeout(() => {
        if (!el.fxStage.classList.contains('active')) {
          el.fxStage.innerHTML = '';
        }
      }, 320);
    }, duration);
  }

  function getBgmStyleMeta(style) {
    if (style === 'god') return { icon: 'fa-solid fa-crown', key: 'bgmStyleGod', cls: 'style-god' };
    if (style === 'lofi') return { icon: 'fa-solid fa-mug-hot', key: 'bgmStyleLofi', cls: 'style-lofi' };
    return { icon: 'fa-solid fa-fire', key: 'bgmStyleChef', cls: 'style-chef' };
  }

  function syncAudioButtons() {
    if (!window.SOUND) return;
    const style = window.SOUND.getBgmStyle ? window.SOUND.getBgmStyle() : 'chef';
    const meta = getBgmStyleMeta(style);
    if (el.btnBgm) {
      const playing = window.SOUND.isBgmPlaying();
      el.btnBgm.classList.toggle('is-playing', playing);
      el.btnBgm.classList.toggle('active', playing);
      el.btnBgm.title = `${playing ? I18N.t('btnBgmOn') : I18N.t('btnBgmOff')} (${I18N.t(meta.key)})`;
    }
    if (el.btnBgmStyle) {
      el.btnBgmStyle.classList.remove('style-chef', 'style-god', 'style-lofi');
      el.btnBgmStyle.classList.add(meta.cls);
      const icon = el.btnBgmStyle.querySelector('i');
      if (icon) icon.className = meta.icon;
      el.btnBgmStyle.title = `${I18N.t(meta.key)}`;
    }
    if (el.btnMute) {
      const muted = window.SOUND.isMuted();
      const icon = el.btnMute.querySelector('i');
      if (icon) icon.className = muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    }
  }

  // ==================== 初始化與開局設定 ====================
  function init() {
    cacheDom();
    window.NightMarket3D.init(document.getElementById('scene-3d-mount'), {
      onOrderClick: (orderUid) => onPlayerClickOrder(orderUid),
      onBuySpecialClick: () => onPlayerBuySpecial()
    });
    bindUiButtons();
    renderSetupSelectors();
    applyStaticTranslations();
    syncAudioButtons();

    I18N.onChange(() => {
      applyStaticTranslations();
      renderSetupSelectors();
      window.NightMarket3D.refreshLanguage();
      if (state) renderAll();
      // 若圖鑑或規則手冊正在開啟中，即時以新語言疊加重新渲染
      if (currentModalType === 'guide' && !el.modalOverlay.classList.contains('hidden')) {
        openFoodGuideModal();
      } else if (currentModalType === 'rules' && !el.modalOverlay.classList.contains('hidden')) {
        openRulesModal();
      }
    });

    showStartModal();
  }

  function syncLangButtons() {
    const active = I18N.getActiveLangs();
    const isAll = active.length === I18N.LANG_ORDER.length;
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.classList.toggle('active', active.includes(btn.dataset.langToggle));
    });
    document.querySelectorAll('[data-lang-all]').forEach((btn) => {
      btn.classList.toggle('active', isAll);
    });
    document.querySelectorAll('.lang-all-label').forEach((s) => {
      s.textContent = I18N.t('langAllBtn');
    });
  }

  function applyStaticTranslations() {
    const t = I18N.t;
    const tStack = I18N.tStack;

    const plainMap = {
      'brand-title-text': t('brandTitle'),
      'btn-guide-text': t('btnFoodGuide'),
      'btn-rules-text': t('btnRules'),
      'btn-new-text': t('btnNewGame'),
      'log-header-text': t('logHeader')
    };
    Object.entries(plainMap).forEach(([id, txt]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = txt;
    });

    // 開局面板與重點文字支援中／英／韓疊加顯示
    const stackMap = {
      'start-lang-hint-text': tStack('langOverlayHint', null, { inline: true, sep: ' · ' }),
      'start-title-text': tStack('startTitle', null, { inline: true, sep: ' / ' }),
      'start-sub-text': tStack('startSub'),
      'label-mode-text': tStack('modeLabel', null, { inline: true }),
      'mode-race8-title': tStack('modeRace8Title'),
      'mode-race8-desc': tStack('modeRace8Desc'),
      'mode-std-title': tStack('modeStdTitle'),
      'mode-std-desc': tStack('modeStdDesc'),
      'label-total-players': tStack('totalPlayersLabel', null, { inline: true }),
      'label-human-players': tStack('humanPlayersLabel', null, { inline: true }),
      'btn-start-promo-text': tStack('btnPromoVideo', null, { inline: true, sep: ' / ' }),
      'btn-start-text': tStack('btnStartGame', null, { inline: true })
    };
    Object.entries(stackMap).forEach(([id, html]) => {
      const node = document.getElementById(id);
      if (node) node.innerHTML = html;
    });

    if (el.btnBuySpecial) {
      el.btnBuySpecial.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${t('btnBuySpecial')}`;
    }

    if (el.btnFoodGuide) el.btnFoodGuide.title = I18N.t('btnFoodGuide');
    if (el.btnRules) el.btnRules.title = I18N.t('btnRules');
    if (el.btnPromoVideo) el.btnPromoVideo.title = I18N.t('btnPromoVideo');
    if (el.btnNewGame) el.btnNewGame.title = I18N.t('btnNewGame');

    syncLangButtons();
    syncAudioButtons();
  }

  function renderSetupSelectors() {
    if (!el.totalPlayersGroup || !el.humanCountGroup) return;
    const lang = I18N.getLang();

    // 總人數按鈕 (2–6 人)
    el.totalPlayersGroup.innerHTML = [2, 3, 4, 5, 6]
      .map(
        (n) => `
      <button type="button" class="pill-choice ${setupTotalPlayers === n ? 'active' : ''}" data-total="${n}">
        <i class="fa-solid fa-users"></i> ${lang === 'en' ? `${n}P` : lang === 'ko' ? `${n}명` : `${n} 人`}
      </button>`
      )
      .join('');

    el.totalPlayersGroup.querySelectorAll('[data-total]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        setupTotalPlayers = parseInt(btn.dataset.total, 10);
        if (setupHumanCount > setupTotalPlayers) {
          setupHumanCount = setupTotalPlayers;
        }
        renderSetupSelectors();
      });
    });

    // 實際真人人數按鈕 (1 ~ 總人數，含全部真人)
    const humanBtns = [];
    for (let h = 1; h <= setupTotalPlayers; h++) {
      const isAll = h === setupTotalPlayers;
      const label = isAll
        ? `<i class="fa-solid fa-people-group"></i> ${
            lang === 'en' ? `All ${h} Human` : lang === 'ko' ? `전원 ${h}명 사람` : `全部 ${h} 人真人`
          }`
        : `<i class="fa-solid fa-user"></i> ${
            lang === 'en' ? `${h} Human` : lang === 'ko' ? `사람 ${h}명` : `${h} 位真人`
          }`;
      humanBtns.push(`
        <button type="button" class="pill-choice ${setupHumanCount === h ? 'active' : ''} ${isAll ? 'all-human-btn' : ''}" data-human="${h}">
          ${label}
        </button>
      `);
    }
    el.humanCountGroup.innerHTML = humanBtns.join('');

    el.humanCountGroup.querySelectorAll('[data-human]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        setupHumanCount = parseInt(btn.dataset.human, 10);
        renderSetupSelectors();
      });
    });

    // 真人玩家自訂名稱輸入框
    if (el.humanNamesGroup) {
      const inputsHtml = [];
      for (let h = 0; h < setupHumanCount; h++) {
        const color = DATA.HUMAN_COLORS[h % DATA.HUMAN_COLORS.length];
        const val = (setupHumanNames[h] || '').replace(/"/g, '&quot;');
        const placeholder =
          setupHumanCount === 1
            ? I18N.t('humanSingleName')
            : I18N.t('humanNamePlaceholder', { n: h + 1 });
        inputsHtml.push(`
          <div class="human-name-field">
            <span class="hnf-dot" style="background:${color}">${h + 1}</span>
            <input type="text" class="hnf-input" data-name-idx="${h}" maxlength="16" value="${val}" placeholder="${placeholder}" />
          </div>
        `);
      }
      el.humanNamesGroup.innerHTML = inputsHtml.join('');
      el.humanNamesGroup.querySelectorAll('[data-name-idx]').forEach((inp) => {
        inp.addEventListener('input', (e) => {
          const idx = parseInt(inp.dataset.nameIdx, 10);
          setupHumanNames[idx] = e.target.value.slice(0, 16);
          saveHumanNames();
        });
      });
    }

    // 組合摘要說明（支援多語疊加）
    const aiCount = setupTotalPlayers - setupHumanCount;
    if (el.humanSummaryText) {
      el.humanSummaryText.innerHTML =
        aiCount === 0
          ? `<i class="fa-solid fa-user-check"></i> <span>${I18N.tStack('allHumanDesc', { h: setupHumanCount })}</span>`
          : `<i class="fa-solid fa-robot"></i> <span>${I18N.tStack('mixHumanDesc', { h: setupHumanCount, a: aiCount })}</span>`;
    }
  }

  function bindUiButtons() {
    document.getElementById('btn-start-game').addEventListener('click', () => {
      const mode = document.querySelector('input[name="game-mode"]:checked').value;
      el.startOverlay.classList.add('hidden');
      // 玩家點擊開局時自動啟動美食小當家熱血配樂（若未靜音）
      if (window.SOUND && !window.SOUND.isMuted() && !window.SOUND.isBgmPlaying()) {
        window.SOUND.startBgm();
        syncAudioButtons();
      }
      startNewGame(mode, setupTotalPlayers, setupHumanCount);
    });

    document.getElementById('btn-new-game').addEventListener('click', () => {
      if (window.SOUND) window.SOUND.click();
      showStartModal();
    });

    document.getElementById('btn-rules').addEventListener('click', () => {
      if (window.SOUND) window.SOUND.click();
      openRulesModal();
    });

    document.getElementById('btn-food-guide').addEventListener('click', () => {
      if (window.SOUND) window.SOUND.click();
      openFoodGuideModal();
    });

    if (el.btnPromoVideo) {
      el.btnPromoVideo.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        openPromoVideoModal();
      });
    }

    if (el.btnStartPromo) {
      el.btnStartPromo.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        openPromoVideoModal();
      });
    }

    // 中 / 英 / 韓可疊加複選按鈕
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        const code = btn.dataset.langToggle;
        const res = I18N.toggleLang(code);
        if (!res.changed) {
          toast(I18N.t('toastLangMinOne'), 'danger');
        } else {
          toast(I18N.t('toastLangUpdated', { langs: I18N.getActiveLangNames() }), 'gold');
        }
      });
    });

    // 一鍵三語全開 / 恢復單語繁中
    document.querySelectorAll('[data-lang-all]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        const isAll = I18N.getActiveLangs().length === I18N.LANG_ORDER.length;
        if (isAll) {
          I18N.setActiveLangs(['zh']);
        } else {
          I18N.setActiveLangs(['zh', 'en', 'ko']);
        }
        toast(I18N.t('toastLangUpdated', { langs: I18N.getActiveLangNames() }), 'gold');
      });
    });

    // 背景配樂開關 & 曲風切換（小當家 / 食神交響 / Chill Jazz Lo-Fi）
    if (el.btnBgm) {
      el.btnBgm.addEventListener('click', () => {
        if (!window.SOUND) return;
        const playing = window.SOUND.toggleBgm();
        syncAudioButtons();
        const meta = getBgmStyleMeta(window.SOUND.getBgmStyle());
        toast(playing ? I18N.t('toastBgmStyle', { style: I18N.t(meta.key) }) : I18N.t('toastBgmOff'), playing ? 'gold' : 'info');
      });
    }

    if (el.btnBgmStyle) {
      el.btnBgmStyle.addEventListener('click', () => {
        if (!window.SOUND) return;
        const nextStyle = window.SOUND.cycleBgmStyle();
        syncAudioButtons();
        const meta = getBgmStyleMeta(nextStyle);
        toast(I18N.t('toastBgmStyle', { style: I18N.t(meta.key) }), 'gold');
      });
    }

    if (el.btnMute) {
      el.btnMute.addEventListener('click', () => {
        const muted = window.SOUND.toggleMute();
        syncAudioButtons();
        toast(muted ? I18N.t('toastMuted') : I18N.t('toastUnmuted'), 'info');
      });
    }

    document.querySelectorAll('[data-cam]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        document.querySelectorAll('[data-cam]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        window.NightMarket3D.setCameraPreset(btn.dataset.cam);
      });
    });

    el.btnBuySpecial.addEventListener('click', () => onPlayerBuySpecial());
    el.btnEndTurn.addEventListener('click', () => onPlayerEndTurn());

    const logToggle = document.getElementById('btn-toggle-log');
    const logPanel = document.getElementById('log-panel');
    if (logToggle && logPanel) {
      logToggle.addEventListener('click', () => {
        logPanel.classList.toggle('open');
      });
    }

    // 點擊遮罩或按 ESC 可關閉非強制彈窗（如小吃圖鑑與規則手冊）
    el.modalOverlay.addEventListener('click', (e) => {
      if (e.target === el.modalOverlay && modalClosable) {
        if (window.SOUND) window.SOUND.click();
        closeModal(null);
      }
    });

    window.addEventListener('keydown', (e) => {
      // 若真實照片燈箱正在開啟，優先處理燈箱鍵盤操作
      if (el.photoLightbox && !el.photoLightbox.classList.contains('hidden')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closePhotoLightbox();
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          stepPhotoLightbox(-1);
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          stepPhotoLightbox(1);
          return;
        }
      }
      if (e.key === 'Escape' && modalClosable && !el.modalOverlay.classList.contains('hidden')) {
        if (window.SOUND) window.SOUND.click();
        closeModal(null);
      }
    });
  }

  function showStartModal() {
    el.startOverlay.classList.remove('hidden');
  }

  function startNewGame(mode, totalPlayers, humanCount) {
    discardMode = false;
    privacyHidden = false;
    const isMultiHuman = humanCount > 1;
    const players = [];

    // 建立真人玩家（1 ~ totalPlayers，支援自訂更名）
    for (let h = 0; h < humanCount; h++) {
      const custom = (setupHumanNames[h] || '').trim();
      players.push({
        index: h,
        name: custom || (humanCount === 1 ? '你（掌廚老闆）' : `玩家 ${h + 1}`),
        nameEn: custom || (humanCount === 1 ? 'You (Head Chef)' : `Player ${h + 1}`),
        nameKo: custom || (humanCount === 1 ? '나 (사장님)' : `플레이어 ${h + 1}`),
        icon: 'fa-solid fa-user-tie',
        color: DATA.HUMAN_COLORS[h % DATA.HUMAN_COLORS.length],
        isHuman: true,
        hand: [],
        money: 0,
        completedOrders: [],
        skipCookTurns: 0,
        buddhaActive: false,
        directDelivery: false
      });
    }

    // 剩餘名額補上電腦 AI 攤販
    const aiCount = totalPlayers - humanCount;
    for (let a = 0; a < aiCount; a++) {
      const prof = DATA.AI_PROFILES[a % DATA.AI_PROFILES.length];
      players.push({
        index: humanCount + a,
        name: prof.name,
        nameEn: prof.nameEn,
        nameKo: prof.nameKo,
        icon: prof.icon,
        color: prof.color,
        aggression: prof.aggression,
        isHuman: false,
        hand: [],
        money: 0,
        completedOrders: [],
        skipCookTurns: 0,
        buddhaActive: false,
        directDelivery: false
      });
    }

    state = {
      mode,
      totalPlayers,
      humanCount,
      isMultiHuman,
      players,
      turnIndex: 0,
      viewPlayerIndex: 0, // 目前底部手牌顯示的真人視角
      round: 1,
      busy: false,
      gameOver: false,
      ingDeck: DATA.createIngredientDeck(),
      ingDiscard: [],
      orderDeck: DATA.createOrderDeck(),
      orderDiscard: [],
      spDeck: DATA.createSpecialDeck(),
      spDiscard: [],
      tableOrders: [],
      logs: []
    };

    // 起始發牌：每人 3 張食材 + 2 張攻防牌
    players.forEach((p) => {
      for (let i = 0; i < 3; i++) drawIngredient(p);
      for (let i = 0; i < 2; i++) drawSpecial(p);
    });

    refillTableOrders();

    addLog(
      I18N.getLang() === 'en'
        ? `Night Market opened! ${totalPlayers} stalls (${humanCount} Human, ${aiCount} AI).`
        : `夜市開張！共 ${totalPlayers} 位攤販參戰（${humanCount} 位真人、${aiCount} 位電腦）！`,
      'gold'
    );
    if (window.SOUND) window.SOUND.cook();
    beginTurn(0, true);
  }

  // 取得目前可操作的真人玩家（非真人回合時回傳 null）
  function getActiveHuman() {
    if (!state) return null;
    const p = state.players[state.turnIndex];
    return p && p.isHuman ? p : null;
  }

  // ==================== 牌堆抽取工具 ====================
  function drawIngredient(player) {
    if (state.ingDeck.length === 0) {
      if (state.ingDiscard.length === 0) return null;
      state.ingDeck = DATA.shuffle(state.ingDiscard);
      state.ingDiscard = [];
      addLog(
        I18N.getLang() === 'en'
          ? 'Ingredient deck empty—reshuffled discard pile!'
          : '食材牌堆已用盡，將棄牌堆重新洗牌補回！',
        'info'
      );
    }
    const card = state.ingDeck.pop();
    if (card) player.hand.push(card);
    return card;
  }

  function drawSpecial(player) {
    if (state.spDeck.length === 0) {
      if (state.spDiscard.length === 0) return null;
      state.spDeck = DATA.shuffle(state.spDiscard);
      state.spDiscard = [];
      addLog(
        I18N.getLang() === 'en'
          ? 'Special deck empty—reshuffled discard pile!'
          : '攻防牌堆已用盡，將棄牌堆重新洗牌補回！',
        'info'
      );
    }
    const card = state.spDeck.pop();
    if (card) player.hand.push(card);
    return card;
  }

  function drawOrderCard() {
    if (state.orderDeck.length === 0) {
      if (state.mode === 'race8' && state.orderDiscard.length > 0) {
        state.orderDeck = DATA.shuffle(state.orderDiscard);
        state.orderDiscard = [];
        addLog(
          I18N.getLang() === 'en'
            ? 'Order deck empty—reshuffled completed orders!'
            : '餐點牌堆用盡，變化規則下將餐點棄牌堆重洗！',
          'info'
        );
      } else {
        return null;
      }
    }
    return state.orderDeck.pop();
  }

  function refillTableOrders() {
    const normalCount = state.tableOrders.filter((o) => !o.isExtra).length;
    for (let i = normalCount; i < 3; i++) {
      const c = drawOrderCard();
      if (!c) break;
      state.tableOrders.push({ card: c, isExtra: false });
    }
  }

  // ==================== 多人真人防偷看交接 ====================
  async function showPassDeviceModal(targetPlayer, reason = 'turn') {
    if (!state.isMultiHuman) return;
    privacyHidden = true;
    renderAll();

    const pName = DATA.playerName(targetPlayer);
    await openModal({
      title: `<i class="fa-solid fa-people-arrows"></i> ${I18N.t('passDeviceTitle')}`,
      body: `
        <div class="pass-device-box">
          <div class="pass-avatar" style="background:${targetPlayer.color}">
            <i class="${targetPlayer.icon}"></i>
          </div>
          <h3>${pName}</h3>
          <p>${reason === 'react' ? I18N.t('passDeviceReactMsg', { name: pName }) : I18N.t('passDeviceTurnMsg', { name: pName })}</p>
        </div>
      `,
      buttons: [
        {
          text: I18N.t('passDeviceBtn', { name: pName }),
          icon: 'fa-solid fa-eye',
          className: 'btn-gold',
          value: true
        }
      ]
    });

    state.viewPlayerIndex = targetPlayer.index;
    privacyHidden = false;
    renderAll();
  }

  // ==================== 回合流程 ====================
  async function beginTurn(playerIdx, isFirstTurn = false) {
    if (state.gameOver) return;
    state.turnIndex = playerIdx;
    const player = state.players[playerIdx];
    player.buddhaActive = false;
    player.directDelivery = false;
    discardMode = false;

    // 多人真人模式下，切換到真人玩家前先執行防偷看交接
    if (player.isHuman && state.isMultiHuman && !isFirstTurn) {
      state.busy = true;
      await showPassDeviceModal(player, 'turn');
    } else if (player.isHuman) {
      state.viewPlayerIndex = player.index;
    }

    // 回合開始抽取 3 張食材牌
    for (let i = 0; i < 3; i++) {
      drawIngredient(player);
    }
    if (window.SOUND) window.SOUND.card();

    const pName = DATA.playerName(player);
    const skipMsg =
      player.skipCookTurns > 0
        ? I18N.getLang() === 'en'
          ? ' (Cockroach: cannot cook this turn!)'
          : '（本回合受蟑螂影響暫停做菜！）'
        : '';
    addLog(
      I18N.getLang() === 'en'
        ? `Round ${state.round}: [${pName}] drew 3 Ingredient cards.${skipMsg}`
        : `第 ${state.round} 輪：輪到【${pName}】，抽取 3 張食材牌。${skipMsg}`,
      player.isHuman ? 'gold' : 'info'
    );

    renderAll();

    if (!player.isHuman) {
      state.busy = true;
      renderControls();
      runAITurn(player);
    } else {
      state.busy = false;
      renderControls();
      if (player.skipCookTurns > 0) {
        toast(I18N.t('toastYourTurnBug', { name: pName }), 'danger');
      } else {
        toast(I18N.t('toastYourTurn', { name: pName }), 'gold');
      }
    }
  }

  function finishTurn() {
    if (state.gameOver) return;
    const current = state.players[state.turnIndex];
    if (current.skipCookTurns > 0) {
      current.skipCookTurns -= 1;
    }
    current.buddhaActive = false;
    current.directDelivery = false;

    const nextIdx = (state.turnIndex + 1) % state.players.length;
    if (nextIdx === 0) state.round += 1;
    beginTurn(nextIdx, false);
  }

  // ==================== 做菜演算法（支援人蔘與佛跳牆） ====================
  function findBestCookPlan(player, orderCard) {
    if (player.skipCookTurns > 0) return null;
    const usable = player.hand.filter((c) => c.kind === 'ingredient' && !c.rotten);
    const reqs = [...orderCard.ingredients];
    let bestPlan = null;

    function scorePlan(usedCards) {
      const ginsengCount = usedCards.filter((c) => c.typeId === 'ginseng').length;
      return -ginsengCount * 100 - usedCards.length;
    }

    function backtrack(reqIdx, usedSet, chosen, wildLeft) {
      if (reqIdx === reqs.length) {
        if (!bestPlan || scorePlan(chosen) > scorePlan(bestPlan)) {
          bestPlan = [...chosen];
        }
        return;
      }
      if (wildLeft > 0) {
        backtrack(reqIdx + 1, usedSet, chosen, wildLeft - 1);
      }
      const need = reqs[reqIdx];
      for (let i = 0; i < usable.length; i++) {
        const c = usable[i];
        if (usedSet.has(c.uid)) continue;
        if (c.typeId === need) {
          usedSet.add(c.uid);
          chosen.push(c);
          backtrack(reqIdx + 1, usedSet, chosen, wildLeft);
          chosen.pop();
          usedSet.delete(c.uid);
          break;
        }
      }
      if (player.buddhaActive && (need === 'meat' || need === 'seafood')) {
        for (const subType of ['veg', 'grain']) {
          const c = usable.find((x) => x.typeId === subType && !usedSet.has(x.uid));
          if (c) {
            usedSet.add(c.uid);
            chosen.push(c);
            backtrack(reqIdx + 1, usedSet, chosen, wildLeft);
            chosen.pop();
            usedSet.delete(c.uid);
          }
        }
      }
      const ginseng = usable.find((x) => x.typeId === 'ginseng' && !usedSet.has(x.uid));
      if (ginseng) {
        usedSet.add(ginseng.uid);
        chosen.push(ginseng);
        backtrack(reqIdx + 1, usedSet, chosen, wildLeft + 1);
        chosen.pop();
        usedSet.delete(ginseng.uid);
      }
    }

    backtrack(0, new Set(), [], 0);
    return bestPlan;
  }

  // 純程式繪製「實體風格」迷你餐點牌（半圓扇形食材色塊 + 金額色帶 + Font Awesome 圖示）
  function buildProceduralOrderCardHtml(order, compact = false) {
    const lang = I18N.getLang();
    const tierClass = `tier-${order.price}`;
    const total = order.ingredients.length;
    const step = 180 / total;
    const stops = order.ingredients
      .map((ingId, idx) => {
        const c = DATA.INGREDIENTS[ingId].color;
        const a0 = (idx * step).toFixed(1);
        const a1 = ((idx + 1) * step).toFixed(1);
        return `${c} ${a0}deg ${a1}deg`;
      })
      .join(', ');

    const priceHtml =
      lang === 'en' ? `$${order.price}` : lang === 'ko' ? `${order.price}<small>원</small>` : `${order.price}<small>元</small>`;

    return `
      <div class="proc-order-card ${tierClass} ${compact ? 'is-compact' : ''}">
        <div class="poc-top">
          <span class="poc-price">${priceHtml}</span>
          <span class="poc-divider"></span>
          <span class="poc-name">${DATA.orderName(order)}</span>
        </div>
        <div class="poc-pie" style="background: conic-gradient(from 0deg at 0% 50%, ${stops}, transparent 180deg);"></div>
        <div class="poc-bowl" style="--bowl-accent:${order.accent}">
          <i class="${order.icon}"></i>
        </div>
        <div class="poc-footer-bar"></div>
      </div>
    `;
  }

  async function onPlayerClickOrder(orderUid) {
    if (!state || state.gameOver || state.busy || privacyHidden) return;
    const player = getActiveHuman();
    if (!player) {
      toast(I18N.t('toastNotYourTurn'), 'info');
      return;
    }
    if (discardMode) {
      toast(I18N.t('toastDiscardFirst'), 'danger');
      return;
    }

    const entryIdx = state.tableOrders.findIndex((o) => o.card.uid === orderUid);
    if (entryIdx === -1) return;
    const entry = state.tableOrders[entryIdx];
    const order = entry.card;

    if (player.skipCookTurns > 0) {
      toast(I18N.t('toastSkipCook'), 'danger');
      return;
    }

    const plan = findBestCookPlan(player, order);
    if (!plan) {
      toast(I18N.t('toastNotEnoughIng', { name: DATA.orderName(order) }), 'danger');
      return;
    }

    const usesGinseng = plan.some((c) => c.typeId === 'ginseng');
    const usedHtml = plan
      .map((c) => {
        const meta = DATA.INGREDIENTS[c.typeId];
        return `<span class="ing-pill" style="background:${meta.color}"><i class="${meta.icon}"></i> ${DATA.ingName(c)}</span>`;
      })
      .join('');

    const oName = DATA.orderName(order);
    const confirmed = await openModal({
      title: usesGinseng
        ? `<i class="fa-solid fa-bullhorn"></i> ${I18N.t('cookTitleGinseng', { name: oName })}`
        : `<i class="fa-solid fa-fire-burner"></i> ${I18N.t('cookTitleNormal', { name: oName })}`,
      body: `
        <div class="cook-confirm-layout">
          <div class="cook-card-preview">${buildProceduralOrderCardHtml(order, false)}</div>
          <div class="cook-confirm-box">
            <div class="cook-dish-head">
              <span class="price-badge"><i class="fa-solid fa-coins"></i> ${I18N.t('cookEarn', { p: order.price })}</span>
              <span class="pinyin-tag">${order.pinyin}${order.taiwanese ? I18N.t('taiwaneseTag') : ''}</span>
            </div>
            <div class="cook-multilang-name">${DATA.orderNameStack(order, { inline: true })}</div>
            <p class="cook-desc">${DATA.orderDescStack(order)}</p>
            <div class="cook-consume">
              <div class="label">${I18N.t('cookConsumeLabel')}</div>
              <div class="pill-row">${usedHtml}</div>
            </div>
            ${
              usesGinseng
                ? `<div class="ginseng-callout">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    ${I18N.t('cookGinsengCallout')}
                  </div>`
                : ''
            }
          </div>
        </div>
      `,
      buttons: [
        { text: I18N.t('cancel'), icon: 'fa-solid fa-xmark', className: 'btn-secondary', value: false },
        {
          text: usesGinseng ? I18N.t('cookBtnGinseng') : I18N.t('cookBtnNormal', { p: order.price }),
          icon: usesGinseng ? 'fa-solid fa-bullhorn' : 'fa-solid fa-utensils',
          className: 'btn-gold',
          value: true
        }
      ]
    });

    if (!confirmed) return;
    executeCook(player, entryIdx, plan, usesGinseng);
  }

  function executeCook(player, entryIdx, usedCards, shoutedGinseng) {
    const entry = state.tableOrders[entryIdx];
    const order = entry.card;

    const usedIds = new Set(usedCards.map((c) => c.uid));
    player.hand = player.hand.filter((c) => !usedIds.has(c.uid));
    usedCards.forEach((c) => state.ingDiscard.push(c));
    state.tableOrders.splice(entryIdx, 1);

    player.money += order.price;
    player.completedOrders.push(order);
    if (state.mode === 'race8') {
      state.orderDiscard.push(order);
    }

    const pName = DATA.playerName(player);
    const oName = DATA.orderName(order);
    const isEn = I18N.getLang() === 'en';

    if (shoutedGinseng) {
      window.NightMarket3D.burstGinsengEffect();
      if (window.SOUND) window.SOUND.ginseng();
      triggerFxOverlay(
        'ginseng',
        I18N.tStack('fxGinsengTitle', null, { inline: true, sep: ' · ' }),
        `${DATA.orderNameStack(order, { inline: true })} · +${I18N.formatPrice(order.price)}`
      );
      addLog(
        isEn
          ? `[${pName}] shouted "YES! GINSENG!" and cooked [${oName}] for $${order.price}!`
          : `【${pName}】大喊「夜市人蔘」！以人蔘完美做出【${oName}】，賺取 ${order.price} 元！`,
        'gold'
      );
    } else {
      window.NightMarket3D.burstCookEffect(order.uid);
      if (window.SOUND) window.SOUND.cook();
      triggerFxOverlay(
        'cook',
        I18N.tStack('fxCookTitle', null, { inline: true, sep: ' · ' }),
        `${DATA.orderNameStack(order, { inline: true })} · +${I18N.formatPrice(order.price)}`
      );
      addLog(
        isEn
          ? `[${pName}] cooked [${oName}] and earned $${order.price}!`
          : `【${pName}】成功做出【${oName}】，賺取 ${order.price} 元！`,
        'success'
      );
    }

    if (player.directDelivery) {
      const bonus = drawIngredient(player);
      if (bonus) {
        addLog(
          isEn
            ? `[Store Delivery] [${pName}] drew 1 bonus Ingredient card!`
            : `【產地直送】發動！【${pName}】加抽 1 張食材牌。`,
          'info'
        );
      }
    }

    if (!entry.isExtra) {
      refillTableOrders();
    } else {
      addLog(
        isEn
          ? 'Extra tourist order finished! Table returns to 3 orders.'
          : '外國觀光客結帳完畢！場上恢復為 3 張餐點牌。',
        'info'
      );
    }

    if (checkVictory()) {
      renderAll();
      return;
    }

    renderAll();
  }

  // ==================== 購買攻防牌 ====================
  function onPlayerBuySpecial() {
    if (!state || state.gameOver || state.busy || privacyHidden) return;
    const player = getActiveHuman();
    if (!player) {
      toast(I18N.t('toastNotYourTurn'), 'info');
      return;
    }
    if (discardMode) {
      toast(I18N.t('toastDiscardFirst'), 'danger');
      return;
    }
    if (player.money < 2) {
      toast(I18N.t('toastNotEnoughMoney'), 'danger');
      return;
    }
    const card = drawSpecial(player);
    if (!card) {
      toast(I18N.t('toastNoSpecialLeft'), 'danger');
      return;
    }
    player.money -= 2;
    if (window.SOUND) window.SOUND.coin();
    const cName = DATA.specialName(card);
    addLog(
      I18N.getLang() === 'en'
        ? `[${DATA.playerName(player)}] spent $2 to buy a Special card.`
        : `【${DATA.playerName(player)}】花費 2 元購買了 1 張攻防牌。`,
      'info'
    );
    toast(I18N.t('toastBoughtSpecial', { name: cName }), 'gold');
    renderAll();
  }

  // ==================== 出攻防牌（真人操作） ====================
  async function onPlayerClickHandCard(cardUid) {
    if (!state || state.gameOver || state.busy || privacyHidden) return;
    const player = getActiveHuman();
    if (!player) return;

    const idx = player.hand.findIndex((c) => c.uid === cardUid);
    if (idx === -1) return;
    const card = player.hand[idx];

    if (discardMode) {
      player.hand.splice(idx, 1);
      if (card.kind === 'ingredient') state.ingDiscard.push(card);
      else state.spDiscard.push(card);
      if (window.SOUND) window.SOUND.card();
      const cName = card.kind === 'ingredient' ? DATA.ingName(card) : DATA.specialName(card);
      addLog(
        I18N.getLang() === 'en'
          ? `[${DATA.playerName(player)}] discarded [${cName}].`
          : `【${DATA.playerName(player)}】捨棄了手牌【${cName}】。`,
        'info'
      );

      if (player.hand.length <= 8) {
        discardMode = false;
        renderAll();
        finishTurn();
      } else {
        renderAll();
      }
      return;
    }

    if (card.kind === 'ingredient') {
      const iName = DATA.ingName(card);
      if (card.rotten) {
        toast(I18N.t('toastRottenHint', { name: iName }), 'danger');
      } else if (card.typeId === 'ginseng') {
        toast(I18N.t('toastGinsengHint'), 'gold');
      } else {
        toast(I18N.t('toastIngHint', { name: iName }), 'info');
      }
      return;
    }

    if (card.type === 'defense') {
      toast(I18N.t('toastDefHint', { name: DATA.specialName(card) }), 'info');
      return;
    }

    if (card.type === 'support') {
      await playSupportCard(player, card);
      return;
    }

    if (card.type === 'attack') {
      await playAttackCardFromHuman(player, card);
    }
  }

  // ==================== 輔助牌結算 ====================
  async function playSupportCard(player, card) {
    if (card.id === 'buddha' && player.isHuman) {
      const ok = await openModal({
        title: `<i class="fa-solid fa-hands-praying"></i> ${I18N.t('buddhaTitle')}`,
        body: `<div class="ginseng-callout"><i class="fa-solid fa-hands-praying"></i> ${I18N.t('buddhaBody')}</div>`,
        buttons: [
          { text: I18N.t('buddhaCancel'), icon: 'fa-solid fa-xmark', className: 'btn-secondary', value: false },
          { text: I18N.t('buddhaConfirm'), icon: 'fa-solid fa-hands-praying', className: 'btn-gold', value: true }
        ]
      });
      if (!ok) return;
    }

    removeCardFromHand(player, card.uid);
    state.spDiscard.push(card);

    const pName = DATA.playerName(player);
    const isEn = I18N.getLang() === 'en';

    if (card.id === 'tv') {
      for (let i = 0; i < 3; i++) drawIngredient(player);
      if (window.SOUND) window.SOUND.cook();
      addLog(
        isEn ? `[${pName}] played [Press Interview] and drew 3 Ingredients!` : `【${pName}】打出【上電視】，爆紅加抽 3 張食材牌！`,
        'success'
      );
    } else if (card.id === 'direct_farm') {
      drawIngredient(player);
      player.directDelivery = true;
      if (window.SOUND) window.SOUND.cook();
      addLog(
        isEn
          ? `[${pName}] played [Store Delivery]: +1 Ingredient now & +1 per dish this turn!`
          : `【${pName}】打出【產地直送】，先抽 1 張食材，且本回合每做完一道菜再抽 1 張！`,
        'success'
      );
    } else if (card.id === 'english') {
      const extra = drawOrderCard();
      if (extra) {
        state.tableOrders.push({ card: extra, isExtra: true });
        if (window.SOUND) window.SOUND.cook();
        addLog(
          isEn
            ? `[${pName}] played [YES! WE SPEAK ENGLISH], flipping extra Order [${DATA.orderName(extra)}]!`
            : `【${pName}】打出【YES! WE SPEAK ENGLISH】，場上橫向多翻開【${DATA.orderName(extra)}】！`,
          'gold'
        );
      }
    } else if (card.id === 'buddha') {
      player.buddhaActive = true;
      window.NightMarket3D.burstGinsengEffect();
      if (window.SOUND) window.SOUND.buddha();
      triggerFxOverlay('buddha', I18N.tStack('fxBuddhaTitle', null, { inline: true, sep: ' · ' }), DATA.playerName(player));
      addLog(
        isEn
          ? `[${pName}] chanted "AH-MEAT-TOFU!" Veg/Grain can replace Meat/Seafood this turn!`
          : `【${pName}】唸出「阿彌陀佛」發動【佛跳牆】！本回合菜/五穀可代肉/海鮮！`,
        'gold'
      );
    } else if (card.id === 'scallion') {
      const top = drawIngredient(player);
      if (top && top.typeId === 'veg') {
        drawIngredient(player);
        drawIngredient(player);
        if (window.SOUND) window.SOUND.cook();
        addLog(
          isEn
            ? `[${pName}] played [Greedy Scallion], revealed [${DATA.ingName(top)}] & drew 2 bonus cards!`
            : `【${pName}】打出【買菜抓把蔥】，翻出【${DATA.ingName(top)}】中獎！免費加抽 2 張食材牌！`,
          'gold'
        );
      } else if (top) {
        if (window.SOUND) window.SOUND.card();
        addLog(
          isEn
            ? `[${pName}] played [Greedy Scallion], revealed [${DATA.ingName(top)}] (not Veg).`
            : `【${pName}】打出【買菜抓把蔥】，翻出【${DATA.ingName(top)}】（非菜類），僅收下該張。`,
          'info'
        );
      }
    }

    renderAll();
  }

  // ==================== 攻擊牌與防禦反制鏈 ====================
  async function playAttackCardFromHuman(player, card) {
    if (card.id === 'hygiene') {
      const ok = await openModal({
        title: `<i class="fa-solid fa-clipboard-list"></i> ${I18N.t('hygieneTitle')}`,
        body: `<p>${I18N.t('hygieneBody')}</p>`,
        buttons: [
          { text: I18N.t('cancel'), icon: 'fa-solid fa-xmark', className: 'btn-secondary', value: false },
          { text: I18N.t('hygieneConfirm'), icon: 'fa-solid fa-triangle-exclamation', className: 'btn-danger', value: true }
        ]
      });
      if (!ok) return;
      removeCardFromHand(player, card.uid);
      state.spDiscard.push(card);
      executeHygieneCheckup(player);
      return;
    }

    const opponents = state.players.filter((p) => p.index !== player.index);
    const targetIdx = await openTargetSelectorModal(card, opponents);
    if (targetIdx === null || targetIdx === undefined) return;

    let chosenIngType = null;
    if (card.needsIngredientChoice) {
      chosenIngType = await openIngredientTypeModal();
      if (!chosenIngType) return;
    }

    removeCardFromHand(player, card.uid);
    state.spDiscard.push(card);
    state.busy = true;
    renderAll();

    await resolveAttackChain(player, state.players[targetIdx], card, { chosenIngType });

    // 多人真人模式下，若剛剛因為防禦/警察而交給其他真人，現在交回原行動玩家
    if (state.isMultiHuman && state.viewPlayerIndex !== player.index && !state.gameOver) {
      await showPassDeviceModal(player, 'turn');
    }

    state.busy = false;
    renderAll();
  }

  function executeHygieneCheckup(attacker) {
    window.NightMarket3D.burstAttackEffect();
    if (window.SOUND) window.SOUND.attack();
    triggerFxOverlay('hygiene', I18N.tStack('fxHygieneTitle', null, { inline: true, sep: ' · ' }), DATA.playerName(attacker));
    state.players.forEach((p) => {
      const ings = p.hand.filter((c) => c.kind === 'ingredient');
      p.hand = p.hand.filter((c) => c.kind !== 'ingredient');
      ings.forEach((c) => state.ingDiscard.push(c));
    });
    const isEn = I18N.getLang() === 'en';
    addLog(
      isEn
        ? `[${DATA.playerName(attacker)}] triggered [Hygiene Inspection]! All players discarded all Ingredients!`
        : `【${DATA.playerName(attacker)}】發動【衛生稽查】！所有防禦無效，全場玩家丟棄所有食材牌！`,
      'danger'
    );
    renderAll();
  }

  async function resolveAttackChain(attacker, defender, attackCard, extra = {}, depth = 0) {
    if (depth > 6) return;

    window.NightMarket3D.burstAttackEffect();
    if (window.SOUND) window.SOUND.attack();
    triggerFxOverlay(
      'attack',
      I18N.tStack('fxAttackTitle', null, { inline: true, sep: ' · ' }),
      `${DATA.specialNameStack(attackCard, { inline: true })}`
    );
    const isEn = I18N.getLang() === 'en';
    addLog(
      isEn
        ? `[${DATA.playerName(attacker)}] attacked [${DATA.playerName(defender)}] with [${DATA.specialName(attackCard)}]!`
        : `【${DATA.playerName(attacker)}】對【${DATA.playerName(defender)}】打出攻擊牌【${DATA.specialName(attackCard)}】！`,
      'danger'
    );
    renderAll();
    await sleep(420);

    const defCards = defender.hand.filter((c) => c.kind === 'special' && c.type === 'defense');
    if (defCards.length > 0 && !attackCard.unblockable) {
      let chosenDef = null;
      let transferTargetIdx = null;

      if (defender.isHuman) {
        if (state.isMultiHuman && state.viewPlayerIndex !== defender.index) {
          await showPassDeviceModal(defender, 'react');
        }
        const res = await openDefenseReactionModal(attacker, defender, attackCard, defCards);
        if (res && res.defCard) {
          chosenDef = res.defCard;
          transferTargetIdx = res.transferTargetIdx;
        }
      } else {
        chosenDef = defCards.find((c) => c.id === 'gangster') || defCards.find((c) => c.id === 'transfer') || defCards[0];
        if (chosenDef.id === 'transfer') {
          const others = state.players.filter((p) => p.index !== defender.index && p.index !== attacker.index);
          const pickPool = others.length > 0 ? others : [attacker];
          transferTargetIdx = pickPool[Math.floor(Math.random() * pickPool.length)].index;
        }
      }

      if (chosenDef) {
        removeCardFromHand(defender, chosenDef.uid);
        state.spDiscard.push(chosenDef);
        if (window.NightMarket3D.burstDefenseEffect) window.NightMarket3D.burstDefenseEffect();
        if (window.SOUND) window.SOUND.defense();
        triggerFxOverlay(
          'defense',
          I18N.tStack('fxDefenseTitle', null, { inline: true, sep: ' · ' }),
          `${DATA.specialNameStack(chosenDef, { inline: true })}`
        );

        if (chosenDef.id === 'idol') {
          addLog(
            isEn
              ? `[${DATA.playerName(defender)}] blocked with [Market Idol]!`
              : `【${DATA.playerName(defender)}】亮出【夜市之光】成功抵擋了【${DATA.specialName(attackCard)}】！`,
            'success'
          );
          renderAll();
          await sleep(400);
          return;
        }

        if (chosenDef.id === 'gangster') {
          addLog(
            isEn
              ? `[${DATA.playerName(defender)}] played [Gangster] to reflect back at [${DATA.playerName(attacker)}]!`
              : `【${DATA.playerName(defender)}】亮出【黑社會】，將【${DATA.specialName(attackCard)}】反彈回【${DATA.playerName(attacker)}】！`,
            'gold'
          );
          renderAll();
          await sleep(450);
          await resolveAttackChain(defender, attacker, attackCard, extra, depth + 1);
          return;
        }

        if (chosenDef.id === 'transfer') {
          const third = state.players[transferTargetIdx];
          addLog(
            isEn
              ? `[${DATA.playerName(defender)}] played [Thank You] to shift the attack to [${DATA.playerName(third)}]!`
              : `【${DATA.playerName(defender)}】打出【有關係沒關係】，將【${DATA.specialName(attackCard)}】轉移給【${DATA.playerName(third)}】承受！`,
            'gold'
          );
          renderAll();
          await sleep(450);
          await resolveAttackChain(defender, third, attackCard, extra, depth + 1);
          return;
        }
      }
    }

    await applyAttackEffect(attacker, defender, attackCard, extra);
    renderAll();
  }

  async function applyAttackEffect(attacker, target, card, extra) {
    const id = card.id;
    const isEn = I18N.getLang() === 'en';
    const aName = DATA.playerName(attacker);
    const tName = DATA.playerName(target);

    if (id === 'police') {
      let payFine = false;
      if (target.money >= 2) {
        if (target.isHuman) {
          if (state.isMultiHuman && state.viewPlayerIndex !== target.index) {
            await showPassDeviceModal(target, 'react');
          }
          payFine = await openModal({
            title: `<i class="fa-solid fa-shield-halved"></i> ${I18N.t('policeTitle', { name: tName })}`,
            body: `<p>${I18N.t('policeBody', { atk: aName })}</p>`,
            buttons: [
              { text: I18N.t('policeDrop'), icon: 'fa-solid fa-trash-can', className: 'btn-danger', value: false },
              { text: I18N.t('policePay'), icon: 'fa-solid fa-coins', className: 'btn-gold', value: true }
            ]
          });
        } else {
          payFine = target.hand.filter((c) => c.kind === 'ingredient').length >= 3;
        }
      }
      if (payFine) {
        target.money -= 2;
        addLog(isEn ? `[${tName}] paid a $2 Police fine.` : `【${tName}】選擇向警察繳交 2 元罰款保住食材。`, 'danger');
      } else {
        const ings = target.hand.filter((c) => c.kind === 'ingredient');
        target.hand = target.hand.filter((c) => c.kind !== 'ingredient');
        ings.forEach((c) => state.ingDiscard.push(c));
        addLog(
          isEn ? `[${tName}] lost all ${ings.length} Ingredient cards to Police!` : `【${tName}】遭警察查扣，丟棄了全部 ${ings.length} 張食材牌！`,
          'danger'
        );
      }
    } else if (id === 'picky') {
      const ings = target.hand.filter((c) => c.kind === 'ingredient');
      const dropCount = Math.ceil(ings.length / 2);
      const dropped = DATA.shuffle(ings).slice(0, dropCount);
      const dropIds = new Set(dropped.map((c) => c.uid));
      target.hand = target.hand.filter((c) => !dropIds.has(c.uid));
      dropped.forEach((c) => state.ingDiscard.push(c));
      addLog(
        isEn ? `[Picky Customer] [${tName}] lost ${dropCount} Ingredient card(s).` : `奧客大鬧攤位！【${tName}】被迫捨棄一半共 ${dropCount} 張食材牌。`,
        'danger'
      );
    } else if (id === 'steal_card') {
      const sps = target.hand.filter((c) => c.kind === 'special');
      if (sps.length > 0) {
        const stolen = sps[Math.floor(Math.random() * sps.length)];
        removeCardFromHand(target, stolen.uid);
        attacker.hand.push(stolen);
        addLog(
          isEn ? `[${aName}] stole 1 Special card from [${tName}]!` : `【${aName}】成功從【${tName}】手上偷走 1 張攻防牌！`,
          'danger'
        );
      } else {
        addLog(isEn ? `[${tName}] had no Special cards to steal.` : `【${tName}】手上沒有攻防牌，偷牌落空！`, 'info');
      }
    } else if (id === 'poison') {
      const paid = Math.min(1, target.money);
      target.money -= paid;
      attacker.money += paid;
      const ingType = extra.chosenIngType || pickRandomIngredientType();
      const matched = target.hand.filter((c) => c.kind === 'ingredient' && c.typeId === ingType);
      const mIds = new Set(matched.map((c) => c.uid));
      target.hand = target.hand.filter((c) => !mIds.has(c.uid));
      matched.forEach((c) => state.ingDiscard.push(c));
      addLog(
        isEn
          ? `[Food Poisoning] [${tName}] paid $${paid} & discarded ${matched.length} [${DATA.ingMetaName(ingType)}].`
          : `食物中毒！【${tName}】賠償 ${paid} 元醫藥費，並丟棄全部 ${matched.length} 張【${DATA.ingMetaName(ingType)}】。`,
        'danger'
      );
      checkVictory();
    } else if (id === 'cockroach') {
      target.skipCookTurns += 1;
      addLog(
        isEn ? `[Cockroach] [${tName}] cannot cook on their next turn!` : `廚房出現蟑螂！【${tName}】下回合暫停做菜一次！`,
        'danger'
      );
    } else if (id === 'pickpocket') {
      const amt = Math.min(2, target.money);
      target.money -= amt;
      attacker.money += amt;
      if (window.SOUND && amt > 0) window.SOUND.coin();
      addLog(
        isEn ? `[Pickpocket] [${aName}] stole $${amt} from [${tName}]!` : `扒手出沒！【${aName}】從【${tName}】身上扒走 ${amt} 元！`,
        'danger'
      );
      checkVictory();
    } else if (id === 'veg_thief') {
      const ings = target.hand.filter((c) => c.kind === 'ingredient');
      const count = Math.min(2, ings.length);
      const stolen = DATA.shuffle(ings).slice(0, count);
      const sIds = new Set(stolen.map((c) => c.uid));
      target.hand = target.hand.filter((c) => !sIds.has(c.uid));
      stolen.forEach((c) => attacker.hand.push(c));
      addLog(
        isEn ? `[Thief] [${aName}] stole ${count} Ingredient card(s) from [${tName}]!` : `偷菜賊潛入！【${aName}】從【${tName}】偷走 ${count} 張食材牌！`,
        'danger'
      );
    }
  }

  // ==================== 結束回合與 8 張上限 ====================
  function onPlayerEndTurn() {
    if (!state || state.gameOver || state.busy || privacyHidden) return;
    const player = getActiveHuman();
    if (!player) return;

    if (player.hand.length > 8) {
      discardMode = true;
      toast(I18N.t('toastDiscardNeed', { n: player.hand.length - 8 }), 'danger');
      renderAll();
      return;
    }
    if (window.SOUND) window.SOUND.click();
    finishTurn();
  }

  // ==================== 智慧 AI 回合 ====================
  async function runAITurn(ai) {
    await sleep(600);
    if (state.gameOver) return;

    const supports = ai.hand.filter((c) => c.kind === 'special' && c.type === 'support');
    for (const sp of supports) {
      if (state.gameOver) return;
      await playSupportCard(ai, sp);
      await sleep(500);
    }

    let cookedSomething = true;
    while (cookedSomething && !state.gameOver && ai.skipCookTurns === 0) {
      cookedSomething = false;
      const sortedOrders = [...state.tableOrders]
        .map((entry, idx) => ({ entry, idx }))
        .sort((a, b) => b.entry.card.price - a.entry.card.price);

      for (const item of sortedOrders) {
        const plan = findBestCookPlan(ai, item.entry.card);
        if (plan) {
          const usesGinseng = plan.some((c) => c.typeId === 'ginseng');
          executeCook(ai, item.idx, plan, usesGinseng);
          cookedSomething = true;
          await sleep(700);
          break;
        }
      }
    }
    if (state.gameOver) return;

    const attacks = ai.hand.filter((c) => c.kind === 'special' && c.type === 'attack');
    if (attacks.length > 0 && Math.random() < (ai.aggression || 0.65)) {
      const atk = attacks[0];
      if (atk.id === 'hygiene') {
        const myIngs = ai.hand.filter((c) => c.kind === 'ingredient').length;
        if (myIngs <= 2) {
          removeCardFromHand(ai, atk.uid);
          state.spDiscard.push(atk);
          executeHygieneCheckup(ai);
          await sleep(600);
        }
      } else {
        const leader = pickLeadingOpponent(ai);
        if (leader) {
          removeCardFromHand(ai, atk.uid);
          state.spDiscard.push(atk);
          const extra = atk.needsIngredientChoice ? { chosenIngType: pickRandomIngredientType() } : {};
          await resolveAttackChain(ai, leader, atk, extra);
          await sleep(500);
        }
      }
    }
    if (state.gameOver) return;

    const aiSpecials = ai.hand.filter((c) => c.kind === 'special').length;
    const safeToBuy = state.mode === 'standard' ? ai.money >= 2 : ai.money >= 3 && ai.money < 6;
    if (safeToBuy && aiSpecials < 2 && Math.random() < 0.45) {
      const sp = drawSpecial(ai);
      if (sp) {
        ai.money -= 2;
        addLog(
          I18N.getLang() === 'en'
            ? `[${DATA.playerName(ai)}] spent $2 to buy a Special card.`
            : `【${DATA.playerName(ai)}】花費 2 元購買了 1 張攻防牌。`,
          'info'
        );
        renderAll();
        await sleep(420);
      }
    }

    if (ai.hand.length > 8) {
      const dropCount = ai.hand.length - 8;
      ai.hand.sort((a, b) => aiKeepPriority(a) - aiKeepPriority(b));
      for (let i = 0; i < dropCount; i++) {
        const dropped = ai.hand.shift();
        if (dropped.kind === 'ingredient') state.ingDiscard.push(dropped);
        else state.spDiscard.push(dropped);
      }
      addLog(
        I18N.getLang() === 'en'
          ? `[${DATA.playerName(ai)}] discarded ${dropCount} extra card(s).`
          : `【${DATA.playerName(ai)}】捨棄了 ${dropCount} 張多餘手牌，結束回合。`,
        'info'
      );
    }

    renderAll();
    await sleep(420);
    finishTurn();
  }

  function aiKeepPriority(card) {
    if (card.kind === 'ingredient') {
      if (card.rotten) return 0;
      if (card.typeId === 'ginseng') return 100;
      if (card.typeId === 'meat') return 60;
      if (card.typeId === 'seafood') return 50;
      return 30;
    }
    return card.type === 'defense' ? 75 : 65;
  }

  function pickLeadingOpponent(ai) {
    const others = state.players.filter((p) => p.index !== ai.index);
    others.sort((a, b) => {
      if (state.mode === 'race8') return b.money - a.money;
      return b.completedOrders.length - a.completedOrders.length || b.money - a.money;
    });
    return others[0] || null;
  }

  // ==================== 勝負判定 ====================
  function checkVictory() {
    if (state.gameOver) return true;

    if (state.mode === 'race8') {
      const winner = state.players.find((p) => p.money >= 8);
      if (winner) {
        state.gameOver = true;
        showVictoryModal(winner, I18N.t('victoryRace8Sub'));
        return true;
      }
      return false;
    }

    if (state.tableOrders.length === 0 && state.orderDeck.length === 0) {
      state.gameOver = true;
      const ranked = [...state.players].sort(
        (a, b) => b.completedOrders.length - a.completedOrders.length || b.money - a.money
      );
      showVictoryModal(ranked[0], I18N.t('victoryStdSub'));
      return true;
    }
    return false;
  }

  function showVictoryModal(winner, subtitle) {
    if (window.SOUND) window.SOUND.win();
    window.NightMarket3D.burstGinsengEffect();

    const isEn = I18N.getLang() === 'en';
    const ranked = [...state.players].sort((a, b) => {
      if (state.mode === 'race8') return b.money - a.money || b.completedOrders.length - a.completedOrders.length;
      return b.completedOrders.length - a.completedOrders.length || b.money - a.money;
    });

    const rows = ranked
      .map(
        (p, idx) => `
      <div class="rank-row ${p.index === winner.index ? 'winner' : ''}">
        <span class="rank-num">#${idx + 1}</span>
        <span class="rank-name"><i class="${p.icon}"></i> ${DATA.playerName(p)}</span>
        <span class="rank-stat"><i class="fa-solid fa-bowl-food"></i> ${p.completedOrders.length} ${I18N.t('unitDishShort')}</span>
        <span class="rank-stat"><i class="fa-solid fa-coins"></i> ${isEn ? `$${p.money}` : `${p.money} 元`}</span>
      </div>`
      )
      .join('');

    openModal({
      title: `<i class="fa-solid fa-trophy"></i> ${I18N.t('victoryTitle')}`,
      body: `
        <div class="victory-banner">
          <div class="victory-crown"><i class="fa-solid fa-crown"></i></div>
          <h3>${I18N.t('victoryCrown', { name: DATA.playerName(winner) })}</h3>
          <p>${subtitle}</p>
        </div>
        <div class="rank-list">${rows}</div>
      `,
      buttons: [{ text: I18N.t('playAgain'), icon: 'fa-solid fa-rotate-right', className: 'btn-gold', value: 'replay' }]
    }).then(() => {
      showStartModal();
    });
  }

  // ==================== 畫面渲染與 3D 同步 ====================
  function renderAll() {
    if (!state) return;

    const isEn = I18N.getLang() === 'en';
    const viewPlayer = state.players[state.viewPlayerIndex] || state.players[0];
    const active = state.players[state.turnIndex];

    el.turnBadge.innerHTML = `<i class="${active.icon}"></i> ${I18N.t('turnBanner', { r: state.round, name: DATA.playerName(active) })}`;
    el.modeBadge.innerHTML =
      state.mode === 'race8'
        ? `<i class="fa-solid fa-coins"></i> ${I18N.t('modeRace8Short')}`
        : `<i class="fa-solid fa-utensils"></i> ${I18N.t('modeStdShort', { n: state.orderDeck.length + state.tableOrders.length })}`;

    el.deckCounts.innerHTML = `
      <span><i class="fa-solid fa-layer-group"></i> ${I18N.t('deckIng')} ${state.ingDeck.length}</span>
      <span><i class="fa-solid fa-bolt"></i> ${I18N.t('deckSp')} ${state.spDeck.length}</span>
      <span><i class="fa-solid fa-book-open"></i> ${I18N.t('deckOrd')} ${state.orderDeck.length}</span>
    `;

    // 對手資訊列（排除目前底部視角玩家以外的所有玩家，包含其他真人與 AI）
    const opponents = state.players.filter((p) => p.index !== viewPlayer.index);
    el.opponentsBar.innerHTML = opponents
      .map((op) => {
        const isTurn = op.index === state.turnIndex;
        const ingCnt = op.hand.filter((c) => c.kind === 'ingredient').length;
        const spCnt = op.hand.filter((c) => c.kind === 'special').length;
        const roleTag = op.isHuman ? I18N.t('humanRoleTag') : I18N.t('aiRoleTag');
        return `
          <div class="opponent-chip ${isTurn ? 'active-turn' : ''}">
            <div class="op-avatar" style="background:${op.color}"><i class="${op.icon}"></i></div>
            <div class="op-info">
              <div class="op-name">
                ${DATA.playerName(op)}
                <span class="role-mini-tag ${op.isHuman ? 'is-human' : ''}">${roleTag}</span>
                ${op.skipCookTurns > 0 ? '<span class="status-bug"><i class="fa-solid fa-bug"></i></span>' : ''}
              </div>
              <div class="op-metrics">
                <span><i class="fa-solid fa-coins"></i> ${op.money}</span>
                <span><i class="fa-solid fa-bowl-food"></i> ${op.completedOrders.length}</span>
                <span><i class="fa-solid fa-carrot"></i> ${ingCnt}</span>
                <span><i class="fa-solid fa-bolt"></i> ${spCnt}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    const isViewMyTurn = viewPlayer.index === state.turnIndex && viewPlayer.isHuman && !privacyHidden;
    const cookableMap = {};
    state.tableOrders.forEach((entry) => {
      cookableMap[entry.card.uid] = isViewMyTurn && !discardMode && !!findBestCookPlan(viewPlayer, entry.card);
    });

    el.ordersStrip.innerHTML = state.tableOrders
      .map((entry) => {
        const o = entry.card;
        const can = cookableMap[o.uid];
        const dots = o.ingredients
          .map((ingId) => {
            const m = DATA.INGREDIENTS[ingId];
            return `<span class="mini-dot" style="background:${m.color}" title="${DATA.ingMetaName(ingId)}"><i class="${m.icon}"></i></span>`;
          })
          .join('');
        return `
          <button class="order-chip ${can ? 'can-cook' : ''} ${entry.isExtra ? 'extra-order' : ''}" data-order-uid="${o.uid}">
            <div class="order-chip-top">
              <span class="order-chip-price">${I18N.formatPrice(o.price)}</span>
              <span class="order-chip-name">${DATA.orderNameStack(o)}</span>
              ${entry.isExtra ? '<span class="extra-tag"><i class="fa-solid fa-language"></i></span>' : ''}
            </div>
            <div class="order-chip-dots">${dots}</div>
          </button>
        `;
      })
      .join('');

    el.ordersStrip.querySelectorAll('[data-order-uid]').forEach((btn) => {
      btn.addEventListener('click', () => onPlayerClickOrder(btn.dataset.orderUid));
    });

    // 底部視角玩家資訊（含隨時可點擊更名的名稱徽章）
    const viewTag = `<button type="button" id="btn-rename-player" class="stat-pill viewer-pill rename-pill" style="border-color:${viewPlayer.color}" title="${I18N.t('renameTooltip')}">
      <i class="${viewPlayer.icon}"></i> <strong>${DATA.playerName(viewPlayer)}</strong> <i class="fa-solid fa-pen rename-pen"></i>
    </button>`;
    el.playerStats.innerHTML = `
      ${viewTag}
      <span class="stat-pill gold"><i class="fa-solid fa-coins"></i> <strong>${I18N.formatPrice(viewPlayer.money)}</strong></span>
      <span class="stat-pill"><i class="fa-solid fa-bowl-food"></i> <strong>${viewPlayer.completedOrders.length}</strong> ${I18N.t('unitDish')}</span>
      <span class="stat-pill ${viewPlayer.hand.length > 8 ? 'warn' : ''}"><i class="fa-solid fa-hand"></i> ${I18N.t('handCount')} <strong>${viewPlayer.hand.length}</strong>/8</span>
    `;
    const renameBtn = document.getElementById('btn-rename-player');
    if (renameBtn) {
      renameBtn.addEventListener('click', () => openRenameModal(viewPlayer));
    }

    const buffs = [];
    if (viewPlayer.buddhaActive) buffs.push(`<span class="buff-tag gold"><i class="fa-solid fa-hands-praying"></i> ${I18N.t('buffBuddha')}</span>`);
    if (viewPlayer.directDelivery) buffs.push(`<span class="buff-tag green"><i class="fa-solid fa-truck-fast"></i> ${I18N.t('buffDirect')}</span>`);
    if (viewPlayer.skipCookTurns > 0) buffs.push(`<span class="buff-tag red"><i class="fa-solid fa-bug"></i> ${I18N.t('buffBug')}</span>`);
    el.playerBuffs.innerHTML = buffs.join('');

    if (discardMode && isViewMyTurn) {
      el.discardBanner.classList.remove('hidden');
      el.discardBanner.innerHTML = `<i class="fa-solid fa-trash-can"></i> ${I18N.t('discardBanner', { n: viewPlayer.hand.length - 8 })}`;
    } else {
      el.discardBanner.classList.add('hidden');
    }

    // 隱私遮罩期間隱藏手牌卡面
    if (privacyHidden) {
      el.handContainer.innerHTML = `<div class="privacy-hand-mask"><i class="fa-solid fa-eye-slash"></i> ${I18N.t('passDeviceTitle')}</div>`;
    } else {
      const sortedHand = [...viewPlayer.hand].sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'ingredient' ? -1 : 1;
        if (a.kind === 'ingredient') {
          if (a.typeId === 'ginseng') return -1;
          if (b.typeId === 'ginseng') return 1;
          return a.typeId.localeCompare(b.typeId);
        }
        return a.type.localeCompare(b.type);
      });

      el.handContainer.innerHTML = sortedHand
        .map((c) => {
          if (c.kind === 'ingredient') {
            const meta = DATA.INGREDIENTS[c.typeId];
            const iName = DATA.ingName(c);
            const iNameStack = DATA.ingNameStack(c);
            const badge = c.rotten
              ? `<i class="fa-solid fa-ban"></i> ${I18N.t('ingBadgeRotten')}`
              : c.special
              ? `<i class="fa-solid fa-star"></i> ${I18N.t('ingBadgeWild')}`
              : I18N.t('ingBadgeNormal');
            return `
              <button class="hand-card ing-card ${c.rotten ? 'is-rotten' : ''} ${c.typeId === 'ginseng' ? 'is-ginseng' : ''} ${discardMode ? 'discard-pick' : ''}"
                      data-card-uid="${c.uid}" style="--card-accent:${meta.color}; --card-dark:${meta.dark}; --card-light:${meta.light};" title="${iName}">
                <div class="hc-top">
                  <span class="hc-badge">${badge}</span>
                  ${c.rotten ? '<span class="rotten-mark"><i class="fa-solid fa-ban"></i></span>' : ''}
                </div>
                <div class="hc-icon-ring"><i class="${meta.icon}"></i></div>
                <div class="hc-name">${iNameStack}</div>
                <div class="hc-sub">${meta.en}</div>
              </button>
            `;
          } else {
            const typeLabel =
              c.type === 'attack' ? I18N.t('spTypeAttack') : c.type === 'support' ? I18N.t('spTypeSupport') : I18N.t('spTypeDefense');
            const typeClass = `sp-${c.type}`;
            const sName = DATA.specialName(c);
            const sNameStack = DATA.specialNameStack(c);
            const sDesc = DATA.specialDesc(c);
            return `
              <button class="hand-card sp-card ${typeClass} ${discardMode ? 'discard-pick' : ''}" data-card-uid="${c.uid}" title="${sName}: ${sDesc}">
                <div class="hc-top">
                  <span class="hc-type-pill">${typeLabel}</span>
                  <span class="hc-code-pill">${DATA.specialCode(c)}</span>
                </div>
                <div class="hc-icon"><i class="${c.icon}"></i></div>
                <div class="hc-name">${sNameStack}</div>
                <div class="hc-desc">${sDesc}</div>
                <span class="hc-corner-pill">${typeLabel}</span>
              </button>
            `;
          }
        })
        .join('');

      el.handContainer.querySelectorAll('[data-card-uid]').forEach((btn) => {
        btn.addEventListener('click', () => onPlayerClickHandCard(btn.dataset.cardUid));
      });
    }

    renderControls();

    // 同步 3D 場景
    window.NightMarket3D.syncOrders(state.tableOrders, cookableMap);
    window.NightMarket3D.syncDecks({
      orderDeck: state.orderDeck.length,
      ingDeck: state.ingDeck.length,
      spDeck: state.spDeck.length,
      ingDiscard: state.ingDiscard.length,
      spDiscard: state.spDiscard.length
    });
    window.NightMarket3D.syncPlayerCoins(viewPlayer.money);
    window.NightMarket3D.syncOpponents(opponents, state.turnIndex);
  }

  function renderControls() {
    if (!state) return;
    const player = getActiveHuman();
    const isMyTurn = !!player && !state.busy && !state.gameOver && !privacyHidden;
    const viewPlayer = state.players[state.viewPlayerIndex] || state.players[0];

    el.btnBuySpecial.disabled = !isMyTurn || discardMode || viewPlayer.money < 2;
    el.btnEndTurn.disabled = !isMyTurn;
    el.btnEndTurn.innerHTML =
      viewPlayer.hand.length > 8
        ? `<i class="fa-solid fa-trash-can"></i> ${I18N.t('btnDiscardEnd', { n: viewPlayer.hand.length })}`
        : `<i class="fa-solid fa-forward-step"></i> ${I18N.t('btnEndTurn')}`;
  }

  // ==================== 互動彈窗系統 ====================
  function openModal({ title, body, buttons, wide = false, closable = false, modalType = null }) {
    return new Promise((resolve) => {
      modalResolve = resolve;
      modalClosable = closable;
      currentModalType = modalType;
      if (el.modalCard) {
        el.modalCard.classList.toggle('modal-wide', !!wide);
      }
      el.modalTitle.innerHTML = title;
      el.modalBody.innerHTML = body;
      el.modalFooter.innerHTML = '';

      buttons.forEach((b) => {
        const btn = document.createElement('button');
        btn.className = `btn ${b.className || 'btn-secondary'}`;
        btn.innerHTML = `${b.icon ? `<i class="${b.icon}"></i> ` : ''}${b.text}`;
        btn.addEventListener('click', () => {
          if (window.SOUND) window.SOUND.click();
          closeModal(b.value);
        });
        el.modalFooter.appendChild(btn);
      });

      el.modalOverlay.classList.remove('hidden');
    });
  }

  function closeModal(val) {
    el.modalOverlay.classList.add('hidden');
    modalClosable = false;
    currentModalType = null;
    if (el.modalCard) {
      el.modalCard.classList.remove('modal-wide');
    }
    if (modalResolve) {
      const fn = modalResolve;
      modalResolve = null;
      fn(val);
    }
  }

  // 局內玩家即時更名彈窗
  function openRenameModal(player) {
    if (!player) return;
    if (window.SOUND) window.SOUND.click();
    const current = DATA.playerName(player).replace(/"/g, '&quot;');
    openModal({
      title: `<i class="fa-solid fa-pen"></i> ${I18N.tStack('renameTitle', null, { inline: true, sep: ' / ' })}`,
      body: `
        <p class="modal-lead">${I18N.tStack('renameLead')}</p>
        <div class="rename-input-wrap">
          <input type="text" id="rename-player-input" class="rename-input" maxlength="16" value="${current}" placeholder="${I18N.t('renamePlaceholder')}" />
        </div>
      `,
      buttons: [
        { text: I18N.t('cancel'), icon: 'fa-solid fa-xmark', className: 'btn-secondary', value: false },
        { text: I18N.t('confirm'), icon: 'fa-solid fa-check', className: 'btn-gold', value: true }
      ],
      closable: true
    }).then((confirmed) => {
      if (!confirmed) return;
      const inp = document.getElementById('rename-player-input');
      const next = inp ? inp.value.trim().slice(0, 16) : '';
      if (!next) return;
      player.name = next;
      player.nameEn = next;
      player.nameKo = next;
      if (player.isHuman && player.index < setupHumanNames.length) {
        setupHumanNames[player.index] = next;
        saveHumanNames();
      }
      toast(I18N.t('renameSuccess', { name: next }), 'gold');
      renderAll();
    });

    setTimeout(() => {
      const inp = document.getElementById('rename-player-input');
      if (inp) {
        inp.focus();
        inp.select();
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            closeModal(true);
          }
        });
      }
    }, 50);
  }

  function openTargetSelectorModal(card, opponents) {
    const isEn = I18N.getLang() === 'en';
    return new Promise((resolve) => {
      modalResolve = resolve;
      el.modalTitle.innerHTML = `<i class="${card.icon}"></i> ${I18N.t('targetTitle', { name: DATA.specialName(card) })}`;
      el.modalBody.innerHTML = `
        <p class="modal-lead">${DATA.specialDesc(card)}</p>
        <div class="target-grid">
          ${opponents
            .map((op) => {
              const ingCnt = op.hand.filter((c) => c.kind === 'ingredient').length;
              const spCnt = op.hand.filter((c) => c.kind === 'special').length;
              return `
                <button class="target-card" data-target-idx="${op.index}">
                  <div class="tc-avatar" style="background:${op.color}"><i class="${op.icon}"></i></div>
                  <div class="tc-name">${DATA.playerName(op)}</div>
                  <div class="tc-stats">
                    <span><i class="fa-solid fa-coins"></i> ${isEn ? `$${op.money}` : `${op.money}元`}</span>
                    <span><i class="fa-solid fa-carrot"></i> ${ingCnt}</span>
                    <span><i class="fa-solid fa-bolt"></i> ${spCnt}</span>
                  </div>
                </button>
              `;
            })
            .join('')}
        </div>
      `;
      el.modalFooter.innerHTML = '';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.innerHTML = `<i class="fa-solid fa-xmark"></i> ${I18N.t('cancel')}`;
      cancelBtn.addEventListener('click', () => closeModal(null));
      el.modalFooter.appendChild(cancelBtn);

      el.modalBody.querySelectorAll('[data-target-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (window.SOUND) window.SOUND.click();
          closeModal(parseInt(btn.dataset.targetIdx, 10));
        });
      });
      el.modalOverlay.classList.remove('hidden');
    });
  }

  function openIngredientTypeModal() {
    const types = ['grain', 'soup', 'veg', 'seafood', 'meat'];
    return new Promise((resolve) => {
      modalResolve = resolve;
      el.modalTitle.innerHTML = `<i class="fa-solid fa-skull-crossbones"></i> ${I18N.t('poisonTitle')}`;
      el.modalBody.innerHTML = `
        <p class="modal-lead">${I18N.t('poisonLead')}</p>
        <div class="ing-choice-grid">
          ${types
            .map((t) => {
              const m = DATA.INGREDIENTS[t];
              return `<button class="ing-choice-btn" data-ing-type="${t}" style="background:${m.color}">
                <i class="${m.icon}"></i> ${DATA.ingMetaName(t)}
              </button>`;
            })
            .join('')}
        </div>
      `;
      el.modalFooter.innerHTML = '';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.innerHTML = `<i class="fa-solid fa-xmark"></i> ${I18N.t('cancel')}`;
      cancelBtn.addEventListener('click', () => closeModal(null));
      el.modalFooter.appendChild(cancelBtn);

      el.modalBody.querySelectorAll('[data-ing-type]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (window.SOUND) window.SOUND.click();
          closeModal(btn.dataset.ingType);
        });
      });
      el.modalOverlay.classList.remove('hidden');
    });
  }

  function openDefenseReactionModal(attacker, defender, attackCard, defCards) {
    return new Promise((resolve) => {
      modalResolve = resolve;
      el.modalTitle.innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${I18N.t('defTitle')}`;
      const isTwoPlayer = state.players.length === 2;
      const otherPlayers = state.players.filter((p) => p.index !== defender.index && p.index !== attacker.index);
      const fallbackTargets = otherPlayers.length > 0 ? otherPlayers : [attacker];

      el.modalBody.innerHTML = `
        <div class="attack-alert">
          ${I18N.t('defAlert', {
            atk: DATA.playerName(attacker),
            def: DATA.playerName(defender),
            card: DATA.specialName(attackCard)
          })}
          <div class="small-desc">${DATA.specialDesc(attackCard)}</div>
        </div>
        <div class="def-choice-list">
          ${defCards
            .map((dc) => {
              if (dc.id === 'transfer') {
                return fallbackTargets
                  .map(
                    (t) => `
                  <button class="def-btn" data-def-uid="${dc.uid}" data-transfer="${t.index}">
                    <i class="${dc.icon}"></i>
                    <div>
                      <strong>${isTwoPlayer ? I18N.t('defUseTransfer2P', { name: DATA.playerName(t) }) : I18N.t('defUseTransfer3P', { name: DATA.playerName(t) })}</strong>
                      <small>${isTwoPlayer ? I18N.t('defUseTransfer2PDesc') : I18N.t('defUseTransfer3PDesc', { name: DATA.playerName(t) })}</small>
                    </div>
                  </button>`
                  )
                  .join('');
              }
              return `
                <button class="def-btn" data-def-uid="${dc.uid}">
                  <i class="${dc.icon}"></i>
                  <div>
                    <strong>${I18N.t('defUseCard', { name: DATA.specialName(dc) })}</strong>
                    <small>${DATA.specialDesc(dc)}</small>
                  </div>
                </button>
              `;
            })
            .join('')}
        </div>
      `;
      el.modalFooter.innerHTML = '';
      const passBtn = document.createElement('button');
      passBtn.className = 'btn btn-danger';
      passBtn.innerHTML = `<i class="fa-solid fa-face-grimace"></i> ${I18N.t('defPass')}`;
      passBtn.addEventListener('click', () => closeModal(null));
      el.modalFooter.appendChild(passBtn);

      el.modalBody.querySelectorAll('[data-def-uid]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const uid = btn.dataset.defUid;
          const defCard = defCards.find((c) => c.uid === uid);
          const transferTargetIdx = btn.dataset.transfer ? parseInt(btn.dataset.transfer, 10) : null;
          closeModal({ defCard, transferTargetIdx });
        });
      });

      el.modalOverlay.classList.remove('hidden');
    });
  }

  // ==================== 三語疊加官方完整規則手冊與可展開小吃圖鑑 ====================
  let activeRulesTab = 'overview';
  let guideSearchQuery = '';
  let guidePriceFilter = 'all';
  let guideIngFilter = 'all';
  let guideViewMode = 'list'; // 'list' | 'gallery'
  let lightboxItems = [];
  let lightboxIndex = 0;

  // ==================== 高解析度真實美食照片燈箱 ====================
  function renderPhotoLightbox() {
    if (!el.photoLightbox || lightboxItems.length === 0) return;
    const o = lightboxItems[lightboxIndex];
    if (!o) return;
    const photoUrl = DATA.orderPhotoUrl(o);
    const dots = o.ingredients
      .map((id) => {
        const m = DATA.INGREDIENTS[id];
        return `<span class="ing-pill sm" style="background:${m.color}"><i class="${m.icon}"></i> ${DATA.ingMetaName(id)}</span>`;
      })
      .join('');

    el.photoLightbox.innerHTML = `
      <div class="plb-dialog">
        <button type="button" class="plb-close" id="plb-close-btn" title="${I18N.t('closeGuide')}">
          <i class="fa-solid fa-xmark"></i>
        </button>
        ${
          lightboxItems.length > 1
            ? `<button type="button" class="plb-nav plb-prev" id="plb-prev-btn" title="上一道">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button type="button" class="plb-nav plb-next" id="plb-next-btn" title="下一道">
                <i class="fa-solid fa-chevron-right"></i>
              </button>`
            : ''
        }
        <div class="plb-stage">
          <img src="${photoUrl}" alt="${DATA.orderName(o)}" class="plb-img" decoding="async" />
          <span class="plb-counter">${lightboxIndex + 1} / ${lightboxItems.length}</span>
        </div>
        <div class="plb-caption">
          <div class="plb-cap-head">
            <span class="guide-price">${I18N.formatPrice(o.price)}</span>
            <span class="guide-region"><i class="fa-solid fa-location-dot"></i> ${DATA.orderRegionStack(o, { inline: true, sep: ' / ' })}</span>
            ${o.taiwanese ? `<span class="guide-tw-badge"><i class="fa-solid fa-volume-high"></i> ${I18N.t('card3dTaiwanese')}</span>` : ''}
            <span class="guide-pinyin">${o.pinyin}${o.taiwanese ? ' *' : ''}</span>
          </div>
          <div class="plb-title">${DATA.orderNameStack(o, { inline: true, sep: ' · ' })}</div>
          <div class="plb-desc">${DATA.orderDescStack(o)}</div>
          <div class="plb-foot">
            <div class="pill-row">${dots}</div>
            <span class="plb-hint"><i class="fa-solid fa-keyboard"></i> ${I18N.t('guideLightboxHint')}</span>
          </div>
        </div>
      </div>
    `;

    el.photoLightbox.classList.remove('hidden');

    const closeBtn = document.getElementById('plb-close-btn');
    const prevBtn = document.getElementById('plb-prev-btn');
    const nextBtn = document.getElementById('plb-next-btn');
    if (closeBtn) closeBtn.addEventListener('click', closePhotoLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => stepPhotoLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => stepPhotoLightbox(1));

    el.photoLightbox.onclick = (e) => {
      if (e.target === el.photoLightbox) closePhotoLightbox();
    };
  }

  function openPhotoLightbox(items, idx = 0) {
    if (!items || items.length === 0) return;
    if (window.SOUND) window.SOUND.click();
    lightboxItems = items;
    lightboxIndex = Math.max(0, Math.min(idx, items.length - 1));
    renderPhotoLightbox();
  }

  function stepPhotoLightbox(delta) {
    if (lightboxItems.length <= 1) return;
    if (window.SOUND) window.SOUND.click();
    lightboxIndex = (lightboxIndex + delta + lightboxItems.length) % lightboxItems.length;
    renderPhotoLightbox();
  }

  function closePhotoLightbox() {
    if (!el.photoLightbox) return;
    if (window.SOUND) window.SOUND.click();
    el.photoLightbox.classList.add('hidden');
    el.photoLightbox.innerHTML = '';
  }

  // ==================== 60 秒遊戲介紹影片播放彈窗 ====================
  function openPromoVideoModal() {
    // 播放介紹影片時自動暫停遊戲背景配樂，避免重疊干擾
    const wasBgmPlaying = window.SOUND && window.SOUND.isBgmPlaying();
    if (wasBgmPlaying) {
      window.SOUND.stopBgm();
      syncAudioButtons();
    }

    openModal({
      title: `<i class="fa-solid fa-film"></i> <span>${I18N.tStack('promoModalTitle', null, { inline: true, sep: ' / ' })}</span>`,
      body: `
        <div class="promo-video-wrap">
          <video id="promo-video-player" class="promo-video-el" src="yes-ginseng-3d-promo.mp4" controls autoplay playsinline preload="metadata"></video>
        </div>
      `,
      buttons: [{ text: I18N.t('promoClose'), icon: 'fa-solid fa-xmark', className: 'btn-gold', value: true }],
      wide: true,
      closable: true,
      modalType: 'video'
    }).then(() => {
      const v = document.getElementById('promo-video-player');
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
      // 關閉影片後自動恢復原本播放中的背景音樂
      if (wasBgmPlaying && window.SOUND && !window.SOUND.isMuted()) {
        window.SOUND.startBgm();
        syncAudioButtons();
      }
    });
  }

  function openRulesModal() {
    const S = (zh, en, ko) => I18N.stackValues({ zh, en, ko });

    // 食材張數列表
    const ingListHtml = Object.values(DATA.INGREDIENTS)
      .map(
        (m) => `
      <div class="rule-ing-card" style="--rc:${m.color}">
        <div class="ric-icon"><i class="${m.icon}"></i></div>
        <div class="ric-info">
          <div class="ric-name">${DATA.ingMetaNameStack(m.id, { inline: true })}</div>
          <div class="ric-meta">
            ${S(
              `共 ${m.total} 張${m.rottenCount ? `（含 ${m.rottenCount} 張腐壞不可用）` : '（黑色萬用牌，替代任意 2 張）'}`,
              `${m.total} cards${m.rottenCount ? ` (${m.rottenCount} rotten unusable)` : ' (Black Wild: replaces ANY 2)'}`,
              `총 ${m.total}장${m.rottenCount ? ` (상한 카드 ${m.rottenCount}장 사용 불가)` : ' (만능 카드: 원하는 재료 2장 대체)'}`
            )}
          </div>
        </div>
      </div>`
      )
      .join('');

    // 攻防牌全圖鑑（依攻擊 / 輔助 / 防禦分組）
    const buildSpecialGroup = (type, titleHtml, badgeClass) => {
      const items = DATA.SPECIALS.filter((sp) => sp.type === type);
      const totalCards = items.reduce((sum, x) => sum + x.count, 0);
      return `
        <div class="rule-sp-group">
          <h5 class="rule-sp-heading ${badgeClass}">${titleHtml} <span class="rule-sp-total">(${items.length} / ${totalCards})</span></h5>
          <div class="rule-sp-grid">
            ${items
              .map(
                (sp) => `
              <div class="rule-sp-item ${badgeClass}">
                <div class="rsp-head">
                  <span class="rsp-icon"><i class="${sp.icon}"></i></span>
                  <div class="rsp-title">${DATA.specialNameStack(sp, { inline: true })}</div>
                  <span class="rsp-count">×${sp.count}</span>
                </div>
                <div class="rsp-desc">${DATA.specialDescStack(sp)}</div>
              </div>`
              )
              .join('')}
          </div>
        </div>
      `;
    };

    const tabsHtml = `
      <div class="rules-tabs" role="tablist">
        <button type="button" class="rules-tab-btn ${activeRulesTab === 'overview' ? 'active' : ''}" data-rtab="overview">
          <i class="fa-solid fa-compass"></i> <span>${I18N.t('rulesTabOverview')}</span>
        </button>
        <button type="button" class="rules-tab-btn ${activeRulesTab === 'flow' ? 'active' : ''}" data-rtab="flow">
          <i class="fa-solid fa-arrows-spin"></i> <span>${I18N.t('rulesTabFlow')}</span>
        </button>
        <button type="button" class="rules-tab-btn ${activeRulesTab === 'cards' ? 'active' : ''}" data-rtab="cards">
          <i class="fa-solid fa-seedling"></i> <span>${I18N.t('rulesTabCards')}</span>
        </button>
        <button type="button" class="rules-tab-btn ${activeRulesTab === 'specials' ? 'active' : ''}" data-rtab="specials">
          <i class="fa-solid fa-bolt"></i> <span>${I18N.t('rulesTabSpecials')}</span>
        </button>
      </div>
    `;

    const panelOverview = `
      <div class="rules-panel ${activeRulesTab === 'overview' ? 'active' : ''}" data-rpanel="overview">
        <div class="rule-hero-note">
          ${S(
            '夜市是臺灣最具代表性的文化風景。《夜市人蔘》讓玩家化身為夜市攤販，一邊運用食材端出 26 道經典臺灣小吃賺錢，一邊活用攻防牌互相干擾、守護攤位，爭奪「料理廚蔘」最高榮耀！',
            'Night markets represent the heart of Taiwanese culture. In YES! GINSENG, players run rival street food stalls—cooking 26 iconic Taiwanese dishes while playing Special cards to outsmart rivals and claim the Master Chef title!',
            '야시장은 대만 문화를 대표하는 명소입니다. 《야시장 인삼》에서 플레이어는 야시장 포장마차 사장이 되어 26가지 대만 명물 요리를 만들고, 특수카드로 라이벌을 견제하며 최고의 요리왕에 도전합니다!'
          )}
        </div>

        <div class="rule-meta-grid">
          <div class="rule-meta-box"><i class="fa-solid fa-users"></i><strong>2–6</strong><span>${S('建議人數', 'Players', '플레이어')}</span></div>
          <div class="rule-meta-box"><i class="fa-solid fa-clock"></i><strong>15–20m</strong><span>${S('遊玩時間', 'Play Time', '플레이 시간')}</span></div>
          <div class="rule-meta-box"><i class="fa-solid fa-graduation-cap"></i><strong>3m</strong><span>${S('學習時間', 'Learn Time', '학습 시간')}</span></div>
          <div class="rule-meta-box"><i class="fa-solid fa-child-reaching"></i><strong>8+</strong><span>${S('適合年齡', 'Ages', '권장 연령')}</span></div>
        </div>

        <div class="rule-factors-row">
          <span>${S('策略', 'Strategy', '전략')} ★★★</span>
          <span>${S('運氣', 'Luck', '운')} ★★★★</span>
          <span>${S('互動', 'Interaction', '상호작용')} ★★★★★</span>
          <span>${S('難度', 'Difficulty', '난이도')} ★</span>
        </div>

        <h4><i class="fa-solid fa-box-open"></i> ${S('遊戲配件與開局準備', 'Components & Game Setup', '구성물 및 게임 준비')}</h4>
        <ol class="rule-list">
          <li>${S(
            '牌庫組成：<strong>餐點牌 26 張</strong>（1元×12、2元×8、3元×4、4元×2）、<strong>食材牌 46 張</strong>（含 5 張腐壞食材與 2 張黑色人蔘）、<strong>攻防牌 27 張</strong>（攻擊 18、輔助 5、防禦 4）與 <strong>錢幣 60 元</strong>。',
            'Decks: <strong>26 Order cards</strong> ($1×12, $2×8, $3×4, $4×2), <strong>46 Ingredient cards</strong> (incl. 5 Rotten & 2 Ginseng), <strong>27 Special cards</strong> (18 ATK, 5 SUP, 4 DEF), and <strong>60 Coins</strong>.',
            '카드 구성: <strong>요리 카드 26장</strong>(1원×12, 2원×8, 3원×4, 4원×2), <strong>식재료 46장</strong>(상한 재료 5장·흑인삼 2장 포함), <strong>특수카드 27장</strong>(공격18·보조5·방어4), <strong>동전 60원</strong>.'
          )}</li>
          <li>${S(
            '起始發牌：三類牌堆分別洗勻，每位玩家發給 <strong>食材牌 3 張 + 攻防牌 2 張</strong>。',
            'Starting Hand: Shuffle all 3 decks separately and deal <strong>3 Ingredient cards + 2 Special cards</strong> to each player.',
            '시작 손패: 3종류 덱을 각각 섞어 각 플레이어에게 <strong>식재료 3장 + 특수카드 2장</strong>을 배분합니다.'
          )}</li>
          <li>${S(
            '開張擺盤：桌面中央翻開 <strong>3 張餐點牌</strong>，即可開始順時針輪流開煮！',
            'Table Setup: Flip <strong>3 Order cards</strong> face-up in the center. The night market is open!',
            '테이블 세팅: 중앙에 <strong>요리 카드 3장</strong>을 앞면으로 펼치면 야시장 개장!'
          )}</li>
        </ol>
      </div>
    `;

    const panelFlow = `
      <div class="rules-panel ${activeRulesTab === 'flow' ? 'active' : ''}" data-rpanel="flow">
        <h4><i class="fa-solid fa-list-ol"></i> ${S('每回合四步驟流程', '4-Step Turn Flow', '매 턴 4단계 진행')}</h4>
        <div class="rule-steps-grid">
          <div class="rule-step-card">
            <div class="rs-num">1</div>
            <div class="rs-body">
              <strong>${S('抽 3 張食材牌', 'Draw 3 Ingredients', '식재료 3장 뽑기')}</strong>
              <p>${S(
                '回合一開始自動從食材牌堆抽取 3 張到手牌（牌堆用盡時自動重洗食材棄牌堆）。',
                'Automatically draw 3 Ingredient cards at the start of your turn (discard reshuffles when empty).',
                '턴 시작 시 식재료 덱에서 자동으로 3장을 뽑습니다 (덱이 비면 버림더미를 섞어 보충).'
              )}</p>
            </div>
          </div>
          <div class="rule-step-card">
            <div class="rs-num">2</div>
            <div class="rs-body">
              <strong>${S('不限次數出菜賺錢', 'Cook Unlimited Dishes', '무제한 요리 & 수익')}</strong>
              <p>${S(
                '只要手牌符合場上餐點半圓色塊所需食材，點擊發光餐點牌即可出菜賺取標示金額，並立即補翻 1 張新餐點（場上常駐 3 張；若發動英文牌則橫向多 1 張，做完不補）。',
                'Cook as many dishes as your hand allows! Click glowing Orders to earn cash and refill back to 3 orders (extra sideways tourist order is not refilled).',
                '손패 재료가 맞으면 빛나는 요리 카드를 클릭해 횟수 제한 없이 요리하고 돈을 법니다. 완성 즉시 새 요리가 보충됩니다 (상시 3장 유지).'
              )}</p>
            </div>
          </div>
          <div class="rule-step-card">
            <div class="rs-num">3</div>
            <div class="rs-body">
              <strong>${S('出攻防牌／花 2 元買牌', 'Play or Buy Specials ($2)', '특수카드 사용 / 2원 구매')}</strong>
              <p>${S(
                '本回合可不限次數打出攻擊或輔助牌（被攻擊者若有防禦牌可立即反制）；也可花費 <strong>2 元</strong>購買 1 張攻防牌。',
                'Play unlimited Attack/Support cards (defenders may react immediately), or spend <strong>$2</strong> to buy 1 Special card.',
                '공격·보조 카드를 무제한 사용할 수 있으며 (방어 카드 즉시 대응 가능), <strong>2원</strong>으로 특수카드 1장을 구매할 수 있습니다.'
              )}</p>
            </div>
          </div>
          <div class="rule-step-card">
            <div class="rs-num">4</div>
            <div class="rs-body">
              <strong>${S('手牌上限 8 張棄牌結束', '8-Card Hand Limit', '손패 상한 8장 정리')}</strong>
              <p>${S(
                '結束回合前，若手牌總數（食材＋攻防）超過 <strong>8 張</strong>，必須自行挑選捨棄至 8 張以下並結束回合。',
                'Before ending your turn, if your total hand (Ingredients + Specials) exceeds <strong>8 cards</strong>, discard down to 8.',
                '턴 종료 전 손패(식재료+특수카드)가 <strong>8장</strong>을 초과하면 8장 이하가 되도록 직접 버려야 합니다.'
              )}</p>
            </div>
          </div>
        </div>

        <h4><i class="fa-solid fa-trophy"></i> ${S('兩種遊戲模式與勝負判定', 'Two Game Modes & Victory', '두 가지 게임 모드 및 승리 조건')}</h4>
        <div class="rule-modes-compare">
          <div class="rule-mode-card gold">
            <h5><i class="fa-solid fa-coins"></i> ${S('變化規則：8 元搶錢大戰（推薦）', 'Variant: $8 Money Rush (Recommended)', '변형 규칙: 8원 스피드 쟁탈전 (추천)')}</h5>
            <ul>
              <li>${S('首位累計賺滿 <strong>8 元</strong> 的玩家<strong>立即獲勝</strong>！', 'First player to accumulate <strong>$8</strong> wins <strong>immediately</strong>!', '가장 먼저 <strong>8원</strong>을 모은 플레이어가 <strong>즉시 승리</strong>!')}</li>
              <li>${S('做完的餐點牌會回收至餐點棄牌堆，餐點牌堆用盡時會重新洗牌續用。', 'Completed Orders go to the discard pile and reshuffle if the Order deck runs out.', '완성한 요리 카드는 버림더미로 가며, 요리 덱이 비면 다시 섞어 사용합니다.')}</li>
              <li>${S('節奏緊湊刺激，盯緊領先者用扒手、警察與食物中毒全力擋財路！', 'Fast and cutthroat—watch the leader and use Pickpocket or Police to stop them!', '전개가 빠르고 치열합니다. 선두 주자를 소매치기나 경찰 단속으로 견제하세요!')}</li>
            </ul>
          </div>
          <div class="rule-mode-card blue">
            <h5><i class="fa-solid fa-utensils"></i> ${S('標準模式：街頭廚藝賽（經典）', 'Classic: Standard Street Chef Contest', '클래식: 표준 스트리트 셰프 대전')}</h5>
            <ul>
              <li>${S('玩家贏得並保留自己做完的餐點牌，不回收重洗。', 'Players keep all completed Order cards (no reshuffling Orders).', '완성한 요리 카드를 본인이 보관하며 재활용하지 않습니다.')}</li>
              <li>${S('當全部 <strong>26 道小吃</strong>皆製作完畢時遊戲結束。', 'Game ends when all <strong>26 street food orders</strong> are completed.', '<strong>26가지 요리</strong>가 모두 완성되면 게임이 종료됩니다.')}</li>
              <li>${S('結算累積完成餐點<strong>道數最多者奪冠</strong>；若道數相同，則<strong>剩餘金額最高者</strong>勝出！', 'Most completed <strong>dishes wins</strong>; ties are broken by <strong>highest cash</strong>!', '완성한 <strong>요리 개수가 가장 많은</strong> 셰프가 우승 (동점 시 보유 금액 순)!')}</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    const panelCards = `
      <div class="rules-panel ${activeRulesTab === 'cards' ? 'active' : ''}" data-rpanel="cards">
        <h4><i class="fa-solid fa-layer-group"></i> ${S('食材牌種類與張數（共 46 張）', 'Ingredient Cards (46 Total)', '식재료 카드 구성 (총 46장)')}</h4>
        <div class="rule-ing-grid">${ingListHtml}</div>

        <div class="rule-callout-box">
          <h5><i class="fa-solid fa-ban"></i> ${S('腐壞食材規則（共 5 張）', 'Rotten Ingredients (5 Cards)', '상한 식재료 규칙 (5장)')}</h5>
          <p>${S(
            '五種一般食材中各有 1 張標示「禁止符號」的腐壞食材（腐壞五穀、酸掉的湯、爛菜、變質海鮮、壞肉）。腐壞食材<strong>無法用來做菜</strong>，但仍計入手牌上限，建議在超過 8 張棄牌時優先捨棄！',
            'Each of the 5 basic ingredients contains 1 Rotten card marked with a ban icon. Rotten cards <strong>cannot be used for cooking</strong>, yet still count toward your 8-card limit—discard them first!',
            '5종의 기본 식재료에는 각각 1장씩 상한 카드가 섞여 있습니다. 상한 재료는 <strong>요리에 사용할 수 없으므로</strong> 손패 8장 정리 시 최우선으로 버리세요!'
          )}</p>
        </div>

        <div class="rule-callout-box gold">
          <h5><i class="fa-solid fa-bullhorn"></i> ${S('特別食材：黑色人蔘（2 張）與指定口令', 'Special Ingredient: Black Ginseng (2 Cards)', '특수 식재료: 흑인삼 (2장) & 필수 구호')}</h5>
          <p>${S(
            '黑色人蔘牌可一次替代<strong>任意 2 張食材牌</strong>！依實體桌遊原版規則，出示此牌時必須大聲喊出指定口令「<strong>夜市人蔘</strong>」（英文版喊 <strong>YES! GINSENG!</strong>）才會立即生效。若忘記喊出口令會失去替代效果——而且<strong>喊得更大聲也不能取代三張喔</strong>！',
            'Black Ginseng substitutes for <strong>ANY 2 Ingredient cards</strong>! Per official rules, you must shout "<strong>YES! GINSENG!</strong>" to activate it. Forgetting nullifies it—and <strong>shouting louder still only replaces 2 cards!</strong>',
            '흑인삼 카드는 <strong>원하는 식재료 2장</strong>을 대체할 수 있습니다! 카드를 낼 때 반드시 "<strong>야시장 인삼! (YES! GINSENG!)</strong>"을 외쳐야 발동하며, <strong>더 크게 외쳐도 3장을 대체할 수는 없습니다!</strong>'
          )}</p>
        </div>
      </div>
    `;

    const panelSpecials = `
      <div class="rules-panel ${activeRulesTab === 'specials' ? 'active' : ''}" data-rpanel="specials">
        <div class="rule-callout-box">
          <h5><i class="fa-solid fa-scale-balanced"></i> ${S('重要攻防裁定說明', 'Key Special Card Rulings', '핵심 특수카드 판정 규칙')}</h5>
          <ul class="rule-list">
            <li>${S(
              '<strong>衛生稽查：</strong>全遊戲唯一「所有防禦牌皆無效」的核彈卡，包含發動者自己在內，全場丟棄所有食材牌。',
              '<strong>Hygiene Inspection:</strong> The only unblockable card—ALL players including yourself discard all Ingredients.',
              '<strong>위생 점검:</strong> 모든 방어 카드가 무효화되며, 사용자를 포함한 전원 식재료 전부 폐기.'
            )}</li>
            <li>${S(
              '<strong>有關係沒關係 ＋ 黑社會：</strong>將攻擊轉移給第三方時，若第三方打出「黑社會」，攻擊會反彈給<strong>使用有關係沒關係的轉移者</strong>，而非原始攻擊者！僅兩人遊玩時，有關係沒關係可直接反彈攻擊者。',
              '<strong>Thank You + Gangster:</strong> If the third player plays Gangster, the attack reflects back to the <strong>redirector</strong>, not the original attacker! In 2-player games, it reflects directly to the attacker.',
              '<strong>인맥 찬스 + 흑사회:</strong> 제3자가 흑사회를 쓰면 최초 공격자가 아니라 <strong>떠넘긴 사람</strong>에게 반사됩니다! 2인 게임에서는 공격자에게 반사.'
            )}</li>
            <li>${S(
              '<strong>買菜抓把蔥：</strong>翻出的第一張只要是菜類（<strong>包含爛菜</strong>）皆算中獎，可再加抽 2 張食材牌！',
              '<strong>Greedy Scallion:</strong> Drawing ANY Vegetable—<strong>even Rotten Veg</strong>—triggers the +2 bonus Ingredient draw!',
              '<strong>장보다 파 한 줌:</strong> 뽑은 첫 카드가 채소라면 <strong>상한 채소라도</strong> 보너스 2장을 추가 획득합니다!'
            )}</li>
          </ul>
        </div>
        ${buildSpecialGroup('attack', S('攻擊牌', 'Attack Cards', '공격 카드'), 'sp-attack')}
        ${buildSpecialGroup('support', S('輔助牌', 'Support Cards', '보조 카드'), 'sp-support')}
        ${buildSpecialGroup('defense', S('防禦牌', 'Defense Cards', '방어 카드'), 'sp-defense')}
      </div>
    `;

    openModal({
      title: `<i class="fa-solid fa-book-open"></i> <span>${I18N.tStack('rulesTitle', null, { inline: true, sep: ' / ' })}</span>`,
      body: `<div class="rules-book">${tabsHtml}${panelOverview}${panelFlow}${panelCards}${panelSpecials}</div>`,
      buttons: [{ text: I18N.t('gotIt'), icon: 'fa-solid fa-check', className: 'btn-gold', value: true }],
      wide: true,
      closable: true,
      modalType: 'rules'
    });

    // 綁定分頁切換事件
    el.modalBody.querySelectorAll('[data-rtab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        activeRulesTab = btn.dataset.rtab;
        el.modalBody.querySelectorAll('[data-rtab]').forEach((b) => b.classList.toggle('active', b === btn));
        el.modalBody.querySelectorAll('[data-rpanel]').forEach((p) => {
          p.classList.toggle('active', p.dataset.rpanel === activeRulesTab);
        });
      });
    });
  }

  function openFoodGuideModal() {
    const ingTypes = ['grain', 'soup', 'veg', 'seafood', 'meat'];

    const renderGuideList = () => {
      const q = guideSearchQuery.trim().toLowerCase();
      const filtered = DATA.ORDERS.filter((o) => {
        if (guidePriceFilter !== 'all' && o.price !== Number(guidePriceFilter)) return false;
        if (guideIngFilter !== 'all' && !o.ingredients.includes(guideIngFilter)) return false;
        if (q) {
          const hay = `${o.name} ${o.en} ${o.ko || ''} ${o.pinyin} ${o.region || ''} ${o.regionEn || ''} ${o.regionKo || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      const listEl = el.modalBody.querySelector('#guide-cards-container');
      const expandActions = el.modalBody.querySelector('.guide-expand-actions');
      if (expandActions) {
        expandActions.style.display = guideViewMode === 'list' ? 'flex' : 'none';
      }
      if (!listEl) return;

      if (filtered.length === 0) {
        listEl.className = 'food-guide-list';
        listEl.innerHTML = `<div class="guide-empty"><i class="fa-solid fa-magnifying-glass"></i> ${I18N.tStack('guideNoResult')}</div>`;
        return;
      }

      // 視圖 B：真實美食照片總覽畫廊
      if (guideViewMode === 'gallery') {
        listEl.className = 'food-gallery-grid';
        listEl.innerHTML = filtered
          .map((o, idx) => {
            const photoUrl = DATA.orderPhotoUrl(o);
            return `
              <button type="button" class="gallery-card" data-photo-idx="${idx}" title="${I18N.t('guideLightboxHint')}">
                <div class="gc-thumb-wrap">
                  <img src="${photoUrl}" alt="${DATA.orderName(o)}" class="gc-thumb" loading="lazy" decoding="async" />
                  <span class="gc-price">${I18N.formatPrice(o.price)}</span>
                  <span class="gc-zoom-badge"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
                </div>
                <div class="gc-info">
                  <div class="gc-name">${DATA.orderNameStack(o)}</div>
                  <div class="gc-meta">
                    <span>${o.pinyin}</span>
                    ${o.taiwanese ? `<span class="gc-tw">臺語</span>` : ''}
                  </div>
                </div>
              </button>
            `;
          })
          .join('');

        listEl.querySelectorAll('[data-photo-idx]').forEach((btn) => {
          btn.addEventListener('click', () => {
            openPhotoLightbox(filtered, parseInt(btn.dataset.photoIdx, 10));
          });
        });
        return;
      }

      // 視圖 A：可展開文化詳解列表（內含真實美食照片預覽與放大按鈕）
      listEl.className = 'food-guide-list';
      listEl.innerHTML = filtered
        .map((o, idx) => {
          const photoUrl = DATA.orderPhotoUrl(o);
          const dots = o.ingredients
            .map((id) => {
              const m = DATA.INGREDIENTS[id];
              return `<span class="ing-pill sm" style="background:${m.color}"><i class="${m.icon}"></i> ${DATA.ingMetaName(id)}</span>`;
            })
            .join('');

          return `
            <article class="guide-item" data-guide-id="${o.id}">
              <div class="guide-summary-wrap">
                <button type="button" class="guide-summary-btn" aria-expanded="false">
                  ${buildProceduralOrderCardHtml(o, true)}
                  <div class="guide-body">
                    <div class="guide-head">
                      <span class="guide-price">${I18N.formatPrice(o.price)}</span>
                      <span class="guide-region"><i class="fa-solid fa-location-dot"></i> ${DATA.orderRegionStack(o, { inline: true, sep: ' / ' })}</span>
                      ${o.taiwanese ? `<span class="guide-tw-badge"><i class="fa-solid fa-volume-high"></i> ${I18N.t('card3dTaiwanese')}</span>` : ''}
                    </div>
                    <div class="guide-title">${DATA.orderNameStack(o, { inline: true, sep: ' · ' })}</div>
                    <div class="guide-pinyin">${o.pinyin}${o.taiwanese ? ' *' : ''}</div>
                    <p class="guide-desc">${DATA.orderDescStack(o)}</p>
                    <div class="guide-foot-row">
                      <div class="pill-row">${dots}</div>
                      <span class="guide-expand-cue">
                        <span class="cue-open">${I18N.t('guideClickExpand')}</span>
                        <span class="cue-close">${I18N.t('guideClickCollapse')}</span>
                        <i class="fa-solid fa-chevron-down"></i>
                      </span>
                    </div>
                  </div>
                </button>
                <button type="button" class="guide-photo-quick-btn" data-open-photo="${idx}" title="${I18N.t('guideViewPhoto')}">
                  <i class="fa-solid fa-camera"></i>
                  <span>${I18N.t('guideViewPhoto')}</span>
                </button>
              </div>

              <div class="guide-detail">
                <div class="guide-detail-inner">
                  <button type="button" class="gd-photo-banner" data-open-photo="${idx}" title="${I18N.t('guideLightboxHint')}">
                    <img src="${photoUrl}" alt="${DATA.orderName(o)}" loading="lazy" decoding="async" />
                    <span class="gd-photo-overlay"><i class="fa-solid fa-expand"></i> ${I18N.t('guideViewPhoto')}</span>
                  </button>
                  <div class="gd-block">
                    <h6><i class="fa-solid fa-landmark"></i> ${I18N.tStack('guideSectionStory', null, { inline: true, sep: ' / ' })}</h6>
                    <div class="gd-text">${DATA.orderStoryStack(o)}</div>
                  </div>
                  <div class="gd-block">
                    <h6><i class="fa-solid fa-fire-burner"></i> ${I18N.tStack('guideSectionRecipe', null, { inline: true, sep: ' / ' })}</h6>
                    <div class="gd-text">${DATA.orderRecipeStack(o)}</div>
                  </div>
                  <div class="gd-block gd-tip">
                    <h6><i class="fa-solid fa-lightbulb"></i> ${I18N.tStack('guideSectionTip', null, { inline: true, sep: ' / ' })}</h6>
                    <div class="gd-text">${DATA.orderTipStack(o)}</div>
                  </div>
                </div>
              </div>
            </article>
          `;
        })
        .join('');

      // 單張卡片展開／收合
      listEl.querySelectorAll('.guide-summary-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (window.SOUND) window.SOUND.click();
          const card = btn.closest('.guide-item');
          const expanded = card.classList.toggle('is-expanded');
          btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
      });

      // 開啟真實美食照片燈箱
      listEl.querySelectorAll('[data-open-photo]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          openPhotoLightbox(filtered, parseInt(btn.dataset.openPhoto, 10));
        });
      });
    };

    const toolbarHtml = `
      <div class="guide-toolbar">
        <div class="guide-view-tabs" role="tablist">
          <button type="button" class="guide-view-btn ${guideViewMode === 'list' ? 'active' : ''}" data-gview="list">
            <i class="fa-solid fa-book-open"></i> <span>${I18N.tStack('guideViewList', null, { inline: true, sep: ' / ' })}</span>
          </button>
          <button type="button" class="guide-view-btn ${guideViewMode === 'gallery' ? 'active' : ''}" data-gview="gallery">
            <i class="fa-solid fa-images"></i> <span>${I18N.tStack('guideViewGallery', null, { inline: true, sep: ' / ' })}</span>
          </button>
        </div>

        <div class="guide-search-row">
          <div class="guide-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="guide-search-input" value="${guideSearchQuery}" placeholder="${I18N.t('guideSearchPlaceholder')}" />
          </div>
          <div class="guide-expand-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-guide-expand-all">
              <i class="fa-solid fa-angles-down"></i> ${I18N.t('guideExpandAll')}
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-guide-collapse-all">
              <i class="fa-solid fa-angles-up"></i> ${I18N.t('guideCollapseAll')}
            </button>
          </div>
        </div>

        <div class="guide-filter-row">
          <div class="guide-filter-group">
            <button type="button" class="gf-chip ${guidePriceFilter === 'all' ? 'active' : ''}" data-gprice="all">${I18N.t('guideFilterAll')}</button>
            ${[1, 2, 3, 4]
              .map(
                (p) =>
                  `<button type="button" class="gf-chip ${String(guidePriceFilter) === String(p) ? 'active' : ''}" data-gprice="${p}">${I18N.formatPrice(p)}</button>`
              )
              .join('')}
          </div>
          <div class="guide-filter-group">
            <button type="button" class="gf-chip ${guideIngFilter === 'all' ? 'active' : ''}" data-ging="all"><i class="fa-solid fa-layer-group"></i></button>
            ${ingTypes
              .map((id) => {
                const m = DATA.INGREDIENTS[id];
                return `<button type="button" class="gf-chip ${guideIngFilter === id ? 'active' : ''}" data-ging="${id}" style="--chip-color:${m.color}" title="${DATA.ingMetaName(id)}"><i class="${m.icon}"></i> ${DATA.ingMetaName(id)}</button>`;
              })
              .join('')}
          </div>
        </div>
      </div>
      <div id="guide-cards-container" class="food-guide-list"></div>
    `;

    openModal({
      title: `<i class="fa-solid fa-utensils"></i> <span>${I18N.tStack('foodGuideTitle', null, { inline: true, sep: ' / ' })}</span>`,
      body: toolbarHtml,
      buttons: [{ text: I18N.t('closeGuide'), icon: 'fa-solid fa-xmark', className: 'btn-gold', value: true }],
      wide: true,
      closable: true,
      modalType: 'guide'
    });

    renderGuideList();

    // 綁定視圖模式切換（文化列表 / 真實照片總覽）
    el.modalBody.querySelectorAll('[data-gview]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        guideViewMode = btn.dataset.gview;
        el.modalBody.querySelectorAll('[data-gview]').forEach((b) => b.classList.toggle('active', b === btn));
        renderGuideList();
      });
    });

    // 綁定搜尋與篩選控制
    const searchInput = el.modalBody.querySelector('#guide-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        guideSearchQuery = e.target.value;
        renderGuideList();
      });
    }

    el.modalBody.querySelectorAll('[data-gprice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        guidePriceFilter = btn.dataset.gprice;
        el.modalBody.querySelectorAll('[data-gprice]').forEach((b) => b.classList.toggle('active', b === btn));
        renderGuideList();
      });
    });

    el.modalBody.querySelectorAll('[data-ging]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        guideIngFilter = btn.dataset.ging;
        el.modalBody.querySelectorAll('[data-ging]').forEach((b) => b.classList.toggle('active', b === btn));
        renderGuideList();
      });
    });

    const btnExp = el.modalBody.querySelector('#btn-guide-expand-all');
    const btnCol = el.modalBody.querySelector('#btn-guide-collapse-all');
    if (btnExp) {
      btnExp.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        el.modalBody.querySelectorAll('.guide-item').forEach((item) => {
          item.classList.add('is-expanded');
          const b = item.querySelector('.guide-summary-btn');
          if (b) b.setAttribute('aria-expanded', 'true');
        });
      });
    }
    if (btnCol) {
      btnCol.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        el.modalBody.querySelectorAll('.guide-item').forEach((item) => {
          item.classList.remove('is-expanded');
          const b = item.querySelector('.guide-summary-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // ==================== 工具函式 ====================
  function removeCardFromHand(player, uid) {
    const i = player.hand.findIndex((c) => c.uid === uid);
    if (i !== -1) player.hand.splice(i, 1);
  }

  function pickRandomIngredientType() {
    const arr = ['grain', 'soup', 'veg', 'seafood', 'meat'];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function addLog(msg, type = 'info') {
    if (!state) return;
    state.logs.unshift({
      msg,
      type,
      time: new Date().toLocaleTimeString('zh-TW', { hour12: false, minute: '2-digit', second: '2-digit' })
    });
    if (state.logs.length > 40) state.logs.pop();
    if (el.logList) {
      el.logList.innerHTML = state.logs
        .map((l) => `<div class="log-item log-${l.type}"><span class="log-time">${l.time}</span> ${l.msg}</div>`)
        .join('');
    }
  }

  function toast(msg, type = 'info') {
    if (!el.toastBox) return;
    const item = document.createElement('div');
    item.className = `toast-msg toast-${type}`;
    const icon =
      type === 'gold'
        ? 'fa-solid fa-star'
        : type === 'danger'
        ? 'fa-solid fa-triangle-exclamation'
        : 'fa-solid fa-circle-info';
    item.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
    el.toastBox.appendChild(item);
    setTimeout(() => {
      item.classList.add('fade-out');
      setTimeout(() => item.remove(), 350);
    }, 3200);
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  window.addEventListener('DOMContentLoaded', init);

  return { startNewGame };
})();
