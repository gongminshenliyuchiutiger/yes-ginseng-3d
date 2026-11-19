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

  // 開局設定暫存
  let setupTotalPlayers = 4;
  let setupHumanCount = 1;

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
    el.btnBuySpecial = document.getElementById('btn-buy-special');
    el.btnEndTurn = document.getElementById('btn-end-turn');
    el.discardBanner = document.getElementById('discard-banner');
    el.modalOverlay = document.getElementById('modal-overlay');
    el.modalTitle = document.getElementById('modal-title');
    el.modalBody = document.getElementById('modal-body');
    el.modalFooter = document.getElementById('modal-footer');
    el.startOverlay = document.getElementById('start-overlay');
    el.totalPlayersGroup = document.getElementById('total-players-group');
    el.humanCountGroup = document.getElementById('human-count-group');
    el.humanSummaryText = document.getElementById('human-summary-text');
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

    I18N.onChange(() => {
      applyStaticTranslations();
      renderSetupSelectors();
      window.NightMarket3D.refreshLanguage();
      if (state) renderAll();
    });

    showStartModal();
  }

  function applyStaticTranslations() {
    const t = I18N.t;
    const map = {
      'brand-title-text': t('brandTitle'),
      'start-title-text': t('startTitle'),
      'start-sub-text': t('startSub'),
      'label-mode-text': t('modeLabel'),
      'mode-race8-title': t('modeRace8Title'),
      'mode-race8-desc': t('modeRace8Desc'),
      'mode-std-title': t('modeStdTitle'),
      'mode-std-desc': t('modeStdDesc'),
      'label-total-players': t('totalPlayersLabel'),
      'label-human-players': t('humanPlayersLabel'),
      'btn-start-text': t('btnStartGame'),
      'btn-guide-text': t('btnFoodGuide'),
      'btn-rules-text': t('btnRules'),
      'btn-new-text': t('btnNewGame'),
      'log-header-text': t('logHeader')
    };
    Object.entries(map).forEach(([id, txt]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = txt;
    });

    if (el.btnBuySpecial) {
      el.btnBuySpecial.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${t('btnBuySpecial')}`;
    }

    const langLabel = I18N.getLang() === 'zh' ? 'EN' : '中文';
    document.querySelectorAll('.lang-toggle-label').forEach((s) => {
      s.textContent = langLabel;
    });
  }

  function renderSetupSelectors() {
    if (!el.totalPlayersGroup || !el.humanCountGroup) return;
    const isEn = I18N.getLang() === 'en';

    // 總人數按鈕 (2–6 人)
    el.totalPlayersGroup.innerHTML = [2, 3, 4, 5, 6]
      .map(
        (n) => `
      <button type="button" class="pill-choice ${setupTotalPlayers === n ? 'active' : ''}" data-total="${n}">
        <i class="fa-solid fa-users"></i> ${isEn ? `${n}P` : `${n} 人`}
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
        ? `<i class="fa-solid fa-people-group"></i> ${isEn ? `All ${h} Human` : `全部 ${h} 人真人`}`
        : `<i class="fa-solid fa-user"></i> ${isEn ? `${h} Human` : `${h} 位真人`}`;
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

    // 組合摘要說明
    const aiCount = setupTotalPlayers - setupHumanCount;
    if (el.humanSummaryText) {
      el.humanSummaryText.innerHTML =
        aiCount === 0
          ? `<i class="fa-solid fa-user-check"></i> ${I18N.t('allHumanDesc', { h: setupHumanCount })}`
          : `<i class="fa-solid fa-robot"></i> ${I18N.t('mixHumanDesc', { h: setupHumanCount, a: aiCount })}`;
    }
  }

  function bindUiButtons() {
    document.getElementById('btn-start-game').addEventListener('click', () => {
      const mode = document.querySelector('input[name="game-mode"]:checked').value;
      el.startOverlay.classList.add('hidden');
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

    document.querySelectorAll('.btn-lang-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.SOUND) window.SOUND.click();
        I18N.toggleLang();
        toast(I18N.t('toastLangSwitched'), 'gold');
      });
    });

    document.getElementById('btn-mute').addEventListener('click', (e) => {
      const muted = window.SOUND.toggleMute();
      const icon = e.currentTarget.querySelector('i');
      icon.className = muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
      toast(muted ? I18N.t('toastMuted') : I18N.t('toastUnmuted'), 'info');
    });

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
  }

  function showStartModal() {
    el.startOverlay.classList.remove('hidden');
  }

  function startNewGame(mode, totalPlayers, humanCount) {
    discardMode = false;
    privacyHidden = false;
    const isMultiHuman = humanCount > 1;
    const players = [];

    // 建立真人玩家（1 ~ totalPlayers）
    for (let h = 0; h < humanCount; h++) {
      players.push({
        index: h,
        name: humanCount === 1 ? '你（掌廚老闆）' : `玩家 ${h + 1}`,
        nameEn: humanCount === 1 ? 'You (Head Chef)' : `Player ${h + 1}`,
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
    const isEn = I18N.getLang() === 'en';
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

    const priceHtml = isEn ? `$${order.price}` : `${order.price}<small>元</small>`;

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
            <p class="cook-desc">${DATA.orderDesc(order)}</p>
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
      addLog(
        isEn
          ? `[${pName}] shouted "YES! GINSENG!" and cooked [${oName}] for $${order.price}!`
          : `【${pName}】大喊「夜市人蔘」！以人蔘完美做出【${oName}】，賺取 ${order.price} 元！`,
        'gold'
      );
    } else {
      window.NightMarket3D.burstCookEffect(order.uid);
      if (window.SOUND) window.SOUND.cook();
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
      if (window.SOUND) window.SOUND.ginseng();
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
        if (window.SOUND) window.SOUND.defense();

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
              <span class="order-chip-price">${isEn ? `$${o.price}` : `${o.price}元`}</span>
              <span class="order-chip-name">${DATA.orderName(o)}</span>
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

    // 底部視角玩家資訊
    const viewTag = state.isMultiHuman
      ? `<span class="stat-pill viewer-pill" style="border-color:${viewPlayer.color}"><i class="${viewPlayer.icon}"></i> <strong>${DATA.playerName(viewPlayer)}</strong></span>`
      : '';
    el.playerStats.innerHTML = `
      ${viewTag}
      <span class="stat-pill gold"><i class="fa-solid fa-coins"></i> <strong>${isEn ? `$${viewPlayer.money}` : `${viewPlayer.money} 元`}</strong></span>
      <span class="stat-pill"><i class="fa-solid fa-bowl-food"></i> <strong>${viewPlayer.completedOrders.length}</strong> ${I18N.t('unitDish')}</span>
      <span class="stat-pill ${viewPlayer.hand.length > 8 ? 'warn' : ''}"><i class="fa-solid fa-hand"></i> ${I18N.t('handCount')} <strong>${viewPlayer.hand.length}</strong>/8</span>
    `;

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
                <div class="hc-name">${iName}</div>
                <div class="hc-sub">${meta.en}</div>
              </button>
            `;
          } else {
            const typeLabel =
              c.type === 'attack' ? I18N.t('spTypeAttack') : c.type === 'support' ? I18N.t('spTypeSupport') : I18N.t('spTypeDefense');
            const typeClass = `sp-${c.type}`;
            const sName = DATA.specialName(c);
            const sDesc = DATA.specialDesc(c);
            return `
              <button class="hand-card sp-card ${typeClass} ${discardMode ? 'discard-pick' : ''}" data-card-uid="${c.uid}" title="${sName}: ${sDesc}">
                <div class="hc-top">
                  <span class="hc-type-pill">${typeLabel}</span>
                  <span class="hc-code-pill">${DATA.specialCode(c)}</span>
                </div>
                <div class="hc-icon"><i class="${c.icon}"></i></div>
                <div class="hc-name">${sName}</div>
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
  function openModal({ title, body, buttons }) {
    return new Promise((resolve) => {
      modalResolve = resolve;
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
    if (modalResolve) {
      const fn = modalResolve;
      modalResolve = null;
      fn(val);
    }
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

  // ==================== 雙語店家守則與小吃圖鑑 ====================
  function openRulesModal() {
    const isEn = I18N.getLang() === 'en';
    const bodyHtml = isEn
      ? `
        <div class="rules-content">
          <h4><i class="fa-solid fa-bullseye"></i> Victory Conditions</h4>
          <ul>
            <li><strong>$8 Money Rush:</strong> First food stall to earn <strong>$8</strong> wins immediately!</li>
            <li><strong>Standard Street Chef Contest:</strong> Complete all 26 orders; the chef with the most completed dishes wins (ties broken by cash).</li>
          </ul>
          <h4><i class="fa-solid fa-arrows-spin"></i> Turn Flow</h4>
          <ol>
            <li>Draw <strong>3 Ingredient cards</strong> automatically at the start of your turn.</li>
            <li>Cook as many dishes as you can by clicking glowing 3D Order cards to earn cash.</li>
            <li>Play Special cards (unlimited), or spend <strong>$2</strong> to buy 1 Special card.</li>
            <li>At turn end, hand limit is <strong>8 cards</strong>—discard any excess cards.</li>
          </ol>
          <h4><i class="fa-solid fa-star"></i> Special Rules</h4>
          <ul>
            <li><strong>Rotten Ingredients (5 cards):</strong> Cannot be used for cooking—discard them first!</li>
            <li><strong>Black Ginseng (2 cards):</strong> Substitutes for ANY 2 ingredients when you shout "YES! GINSENG!"</li>
            <li><strong>Ah-Meat-Tofu:</strong> Say "AH-MEAT-TOFU!" to use Veg or Grain as Meat or Seafood all turn.</li>
            <li><strong>Hygiene Inspection:</strong> Unblockable! Every player discards all Ingredient cards.</li>
          </ul>
        </div>`
      : `
        <div class="rules-content">
          <h4><i class="fa-solid fa-bullseye"></i> 勝利目標</h4>
          <ul>
            <li><strong>變化規則（8 元搶錢大戰）：</strong>首位賺滿 <strong>8 元</strong> 的攤販立即奪冠！</li>
            <li><strong>標準模式（街頭廚藝賽）：</strong>場上 26 道餐點全數做完時結算，累積餐點數量最多者勝；若相同則金額最高者勝。</li>
          </ul>
          <h4><i class="fa-solid fa-arrows-spin"></i> 回合流程</h4>
          <ol>
            <li>回合開始自動從食材牌堆抽取 <strong>3 張</strong> 食材牌。</li>
            <li>不限次數<strong>做菜</strong>（點擊 3D 桌上發光餐點牌或上方快捷餐點列）賺取金額並補回餐點牌。</li>
            <li>不限次數<strong>使用攻防牌</strong>，或花費 <strong>2 元</strong>購買 1 張攻防牌。</li>
            <li>回合結束前手牌上限為 <strong>8 張</strong>，超過須捨棄多餘手牌。</li>
          </ol>
          <h4><i class="fa-solid fa-star"></i> 特別規則亮點</h4>
          <ul>
            <li><strong>腐壞食材（5 張）：</strong>爛菜、壞肉、變質海鮮等無法用於做菜，建議於手牌超額時優先捨棄。</li>
            <li><strong>黑色人蔘（2 張）：</strong>可替代任意 2 張食材，出示時記得按下「大喊夜市人蔘」！</li>
            <li><strong>佛跳牆：</strong>唸出「阿彌陀佛」後，本回合可用菜或五穀雜糧代替肉或海鮮，不限次數！</li>
            <li><strong>有關係沒關係：</strong>指定第三方承受攻擊（僅兩人遊玩時可直接反彈回攻擊者）。</li>
            <li><strong>衛生稽查：</strong>所有防禦牌皆無效，全場含自己丟棄全部食材牌！</li>
          </ul>
        </div>`;

    openModal({
      title: `<i class="fa-solid fa-book-open"></i> ${I18N.t('rulesTitle')}`,
      body: bodyHtml,
      buttons: [{ text: I18N.t('gotIt'), icon: 'fa-solid fa-check', className: 'btn-gold', value: true }]
    });
  }

  function openFoodGuideModal() {
    const isEn = I18N.getLang() === 'en';
    const cardsHtml = DATA.ORDERS.map((o) => {
      const dots = o.ingredients
        .map((id) => {
          const m = DATA.INGREDIENTS[id];
          return `<span class="ing-pill sm" style="background:${m.color}"><i class="${m.icon}"></i> ${DATA.ingMetaName(id)}</span>`;
        })
        .join('');
      return `
        <div class="guide-item">
          ${buildProceduralOrderCardHtml(o, true)}
          <div class="guide-body">
            <div class="guide-head">
              <span class="guide-price">${isEn ? `$${o.price}` : `${o.price}元`}</span>
              <strong>${DATA.orderName(o)}</strong>
              <span class="guide-pinyin">${isEn ? `${o.name} · ` : ''}${o.pinyin}${o.taiwanese ? I18N.t('taiwaneseTag') : ''}</span>
            </div>
            <p class="guide-desc">${DATA.orderDesc(o)}</p>
            <div class="pill-row">${dots}</div>
          </div>
        </div>
      `;
    }).join('');

    openModal({
      title: `<i class="fa-solid fa-utensils"></i> ${I18N.t('foodGuideTitle')}`,
      body: `<div class="food-guide-grid">${cardsHtml}</div>`,
      buttons: [{ text: I18N.t('closeGuide'), icon: 'fa-solid fa-xmark', className: 'btn-gold', value: true }]
    });
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
