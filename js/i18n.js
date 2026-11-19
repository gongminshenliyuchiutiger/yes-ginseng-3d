/**
 * 《夜市人蔘 YES! GINSENG》雙語系統（繁體中文 / English）
 * 支援即時無縫切換全站 UI、3D 牌面、規則書、小吃圖鑑與吉祥物提示
 */
window.I18N = (function () {
  let currentLang = 'zh';
  const listeners = [];

  const DICT = {
    zh: {
      brandTitle: '夜市人蔘 3D',
      startTitle: '夜市人蔘',
      startSub: 'YES! GINSENG — 臺灣夜市美食 3D 數位桌遊',
      modeLabel: '選擇遊戲模式',
      modeRace8Title: '8 元搶錢大戰（推薦）',
      modeRace8Desc: '節奏明快！首位賺滿 8 元的攤販立即獲勝。',
      modeStdTitle: '標準街頭廚藝賽',
      modeStdDesc: '完成全部 26 道小吃結算，做最多道菜者奪冠。',
      totalPlayersLabel: '總玩家人數（2–6 人）',
      humanPlayersLabel: '實際真人玩家人數（可選全部真人）',
      allHumanBadge: '全部真人！',
      mixHumanDesc: '{h} 位真人 + {a} 位電腦攤販',
      allHumanDesc: '全部 {h} 位真人同機對戰（自動防偷看交接）',
      btnStartGame: '夜市開張！進入 3D 牌桌',
      btnFoodGuide: '小吃圖鑑',
      btnRules: '規則',
      btnNewGame: '新局',
      btnBuySpecial: '買攻防牌 (2元)',
      btnEndTurn: '結束回合',
      btnDiscardEnd: '棄牌並結束 ({n}/8)',
      logHeader: '夜市即時戰報',
      readyOpen: '準備開張',
      modeRace8Short: '8元搶錢模式',
      modeStdShort: '標準廚藝賽（剩 {n} 道菜）',
      turnBanner: '第 {r} 輪｜目前回合：<strong>{name}</strong>',
      deckIng: '食材',
      deckSp: '攻防',
      deckOrd: '餐點',
      unitDollar: '元',
      unitDish: '道菜',
      unitDishShort: '道',
      handCount: '手牌',
      buffBuddha: '佛跳牆生效中',
      buffDirect: '產地直送中',
      buffBug: '蟑螂暫停做菜',
      discardBanner: '手牌超過 8 張！請點擊下方手牌捨棄 <strong>{n}</strong> 張牌以結束回合',
      ingBadgeNormal: '食材',
      ingBadgeRotten: '腐壞',
      ingBadgeWild: '萬用×2',
      spTypeAttack: '攻',
      spTypeSupport: '輔',
      spTypeDefense: '防',
      cancel: '取消',
      confirm: '確認',
      gotIt: '我瞭解了',
      closeGuide: '關閉圖鑑',
      playAgain: '再玩一局',
      // 3D 牌面文字
      card3dReady: '食材充足！點擊立即出菜',
      card3dIngLabel: '食材',
      card3dTaiwanese: '臺語發音',
      deck3dIngDiscard: '食材棄牌',
      deck3dSpDiscard: '攻防棄牌',
      deck3dOrder: '餐點牌堆',
      deck3dIng: '食材牌堆',
      deck3dSp: '攻防牌堆',
      deck3dSpSub: '2元購買',
      // 互動提示與彈窗
      toastMuted: '已靜音',
      toastUnmuted: '已開啟音效',
      toastLangSwitched: '已切換為繁體中文',
      toastNotYourTurn: '目前不是你的回合喔！',
      toastDiscardFirst: '請先捨棄多餘手牌至 8 張以下！',
      toastSkipCook: '本回合因「蟑螂」效果暫停做菜！',
      toastNotEnoughIng: '食材不足，無法料理【{name}】！',
      toastNotEnoughMoney: '金錢不足！需要 2 元才能購買 1 張攻防牌。',
      toastNoSpecialLeft: '攻防牌堆與棄牌堆皆已空！',
      toastBoughtSpecial: '獲得攻防牌：{name}',
      toastYourTurn: '輪到【{name}】！點擊發光餐點牌出菜，或使用攻防牌。',
      toastYourTurnBug: '【{name}】本回合遭逢蟑螂突襲，無法做菜！但仍可買牌或出攻防牌。',
      toastRottenHint: '【{name}】是腐壞食材，無法用來做菜，請在手牌超額時優先捨棄！',
      toastGinsengHint: '【黑色人蔘】可替代任意 2 張食材！直接點擊場上餐點牌即可使用。',
      toastIngHint: '食材【{name}】：點擊場上發光的餐點牌即可自動搭配做菜！',
      toastDefHint: '【{name}】為防禦牌，將於你受到對手攻擊時自動跳出詢問是否使用！',
      toastDiscardNeed: '手牌超過上限！請點擊並捨棄 {n} 張手牌至 8 張以下。',
      // 出菜確認
      cookTitleNormal: '確認出菜【{name}】',
      cookTitleGinseng: '大喊口令！料理【{name}】',
      cookEarn: '賺取 {p} 元',
      cookConsumeLabel: '將消耗以下手牌：',
      cookGinsengCallout: '<strong>人蔘發動提醒：</strong>依原版規則，出示黑色人蔘牌必須大聲喊出指定口令「<strong>夜市人蔘</strong>」才會生效！（更大聲也不能取代三張喔）',
      cookBtnNormal: '出菜賺 {p} 元',
      cookBtnGinseng: '大喊「夜市人蔘」並出菜！',
      // 佛跳牆
      buddhaTitle: '發動【佛跳牆】',
      buddhaBody: '依《夜市人蔘》規則：使用「佛跳牆」須雙手合十唸出「<strong>阿彌陀佛</strong>」才會生效！本回合可用「菜或五穀雜糧」代替「肉或海鮮」，不限次數。',
      buddhaCancel: '先不要',
      buddhaConfirm: '雙手合十唸「阿彌陀佛」！',
      // 衛生稽查
      hygieneTitle: '發動【衛生稽查】',
      hygieneBody: '此牌<strong>所有防禦牌無效</strong>！全場所有玩家（包含你自己）將立即丟棄手上所有食材牌！確定要檢舉全夜市嗎？',
      hygieneConfirm: '啟動衛生稽查！',
      // 選目標 & 食物中毒
      targetTitle: '選擇【{name}】攻擊目標',
      poisonTitle: '食物中毒：喊出一種食材',
      poisonLead: '請選擇要喊出的食材種類，目標玩家將被迫丟棄手上所有該類食材！',
      // 防禦反應
      defTitle: '遭到攻擊！是否出防禦牌？',
      defAlert: '<strong>【{atk}】</strong>對<strong>【{def}】</strong>發動了 <strong>【{card}】</strong>！',
      defUseTransfer2P: '使用【有關係沒關係】反彈回 {name}（兩人局規則）',
      defUseTransfer2PDesc: '僅有兩人遊玩時，可直接將攻擊返回攻擊者！',
      defUseTransfer3P: '使用【有關係沒關係】轉移給 {name}',
      defUseTransfer3PDesc: '把這次攻擊轉嫁給第三方 {name} 承受！',
      defUseCard: '使用【{name}】',
      defPass: '不防禦，承受攻擊',
      // 警察
      policeTitle: '警察臨檢！請【{name}】做選擇',
      policeBody: '【{atk}】向警察檢舉了你的攤位！請選擇繳交 <strong>2 元罰款</strong>，或 <strong>丟棄手上所有食材牌</strong>。',
      policeDrop: '丟棄全部食材牌',
      policePay: '繳交 2 元罰款',
      // 多人真人熱座交接
      passDeviceTitle: '請將畫面交給下一位攤販',
      passDeviceTurnMsg: '現在輪到 <strong>{name}</strong> 的回合！為避免手牌曝光，請確認已換人操作後點擊下方按鈕。',
      passDeviceReactMsg: '<strong>{name}</strong> 遭到突襲！請將畫面交給 <strong>{name}</strong> 進行防禦或選擇。',
      passDeviceBtn: '我是 {name}，顯示我的手牌',
      // 勝負結算
      victoryTitle: '夜市料理大賽結算',
      victoryCrown: '冠軍：{name}',
      victoryRace8Sub: '率先賺滿 8 元！奪得夜市首富寶座！',
      victoryStdSub: '所有 26 道夜市餐點全數售罄！榮獲「料理廚蔘」稱號！',
      // 玩家預設名稱
      humanPlayerName: '玩家 {n}',
      humanSingleName: '你（掌廚老闆）',
      humanRoleTag: '真人',
      aiRoleTag: '電腦',
      // 圖鑑與規則標題
      rulesTitle: '《夜市人蔘》店家守則',
      foodGuideTitle: '臺灣夜市小吃圖鑑（共 26 道）',
      taiwaneseTag: '（臺語）'
    },

    en: {
      brandTitle: 'YES! GINSENG 3D',
      startTitle: 'YES! GINSENG',
      startSub: 'Taiwan Night Market Street Food — 3D Digital Board Game',
      modeLabel: 'Game Mode',
      modeRace8Title: '$8 Money Rush (Recommended)',
      modeRace8Desc: 'Fast-paced! First food stall to earn $8 wins immediately.',
      modeStdTitle: 'Standard Street Chef Contest',
      modeStdDesc: 'Finish all 26 orders. Most completed dishes wins (ties broken by cash).',
      totalPlayersLabel: 'Total Players (2–6)',
      humanPlayersLabel: 'Human Players (Supports All-Human)',
      allHumanBadge: 'ALL HUMAN!',
      mixHumanDesc: '{h} Human + {a} AI Stalls',
      allHumanDesc: 'All {h} Human Pass-and-Play (with privacy handoff)',
      btnStartGame: 'Open Night Market! Enter 3D Table',
      btnFoodGuide: 'Food Guide',
      btnRules: 'Rules',
      btnNewGame: 'New Game',
      btnBuySpecial: 'Buy Special ($2)',
      btnEndTurn: 'End Turn',
      btnDiscardEnd: 'Discard & End ({n}/8)',
      logHeader: 'Night Market Live Log',
      readyOpen: 'Ready to Open',
      modeRace8Short: '$8 Rush Mode',
      modeStdShort: 'Chef Contest ({n} left)',
      turnBanner: 'Round {r} | Turn: <strong>{name}</strong>',
      deckIng: 'Ing',
      deckSp: 'Sp',
      deckOrd: 'Ord',
      unitDollar: '$',
      unitDish: 'Dishes',
      unitDishShort: 'Dishes',
      handCount: 'Hand',
      buffBuddha: 'Ah-Meat-Tofu Active',
      buffDirect: 'Store Delivery Active',
      buffBug: 'Cockroach: No Cooking',
      discardBanner: 'Hand limit is 8! Click <strong>{n}</strong> card(s) below to discard and end turn.',
      ingBadgeNormal: 'ING',
      ingBadgeRotten: 'ROTTEN',
      ingBadgeWild: 'WILD ×2',
      spTypeAttack: 'ATK',
      spTypeSupport: 'SUP',
      spTypeDefense: 'DEF',
      cancel: 'Cancel',
      confirm: 'Confirm',
      gotIt: 'Got It',
      closeGuide: 'Close Guide',
      playAgain: 'Play Again',
      // 3D 牌面文字
      card3dReady: 'Ready! Click to Cook',
      card3dIngLabel: 'ING',
      card3dTaiwanese: 'Taiwanese',
      deck3dIngDiscard: 'ING DISCARD',
      deck3dSpDiscard: 'SP DISCARD',
      deck3dOrder: 'ORDERS',
      deck3dIng: 'INGREDIENTS',
      deck3dSp: 'SPECIALS',
      deck3dSpSub: 'BUY FOR $2',
      // 互動提示與彈窗
      toastMuted: 'Audio Muted',
      toastUnmuted: 'Audio Enabled',
      toastLangSwitched: 'Switched to English',
      toastNotYourTurn: 'It is not your turn yet!',
      toastDiscardFirst: 'Please discard down to 8 cards first!',
      toastSkipCook: 'Cockroach active! Cannot cook dishes this turn.',
      toastNotEnoughIng: 'Not enough ingredients to cook [{name}]!',
      toastNotEnoughMoney: 'Need $2 to buy a Special card!',
      toastNoSpecialLeft: 'No Special cards left in deck or discard!',
      toastBoughtSpecial: 'Bought Special Card: {name}',
      toastYourTurn: '[{name}]\'s turn! Click a glowing Order card to cook, or play Special cards.',
      toastYourTurnBug: '[{name}] hit by Cockroach! Cannot cook this turn, but can buy/play Specials.',
      toastRottenHint: '[{name}] is rotten and cannot be used for cooking. Discard it first!',
      toastGinsengHint: '[Ginseng] substitutes for ANY 2 ingredients! Click any Order card to use.',
      toastIngHint: 'Ingredient [{name}]: Click a glowing Order card on the table to cook!',
      toastDefHint: '[{name}] is a Defense card. It triggers automatically when you are attacked!',
      toastDiscardNeed: 'Over 8-card limit! Please discard {n} card(s).',
      // 出菜確認
      cookTitleNormal: 'Cook [{name}]',
      cookTitleGinseng: 'Shout the Magic Words! Cook [{name}]',
      cookEarn: 'Earn ${p}',
      cookConsumeLabel: 'Ingredients to consume:',
      cookGinsengCallout: '<strong>Ginseng Rule:</strong> You must shout "<strong>YES! GINSENG!</strong>" to activate the black Ginseng card! (Shouting louder still only replaces 2 cards.)',
      cookBtnNormal: 'Cook & Earn ${p}',
      cookBtnGinseng: 'Shout "YES! GINSENG!" & Cook!',
      // 佛跳牆
      buddhaTitle: 'Activate [AH-MEAT-TOFU]',
      buddhaBody: 'Put your palms together and say "<strong>AH-MEAT-TOFU!</strong>" This turn, Vegetable or Rice/Flour can replace Meat or Seafood (unlimited times).',
      buddhaCancel: 'Not Now',
      buddhaConfirm: 'Say "AH-MEAT-TOFU!"',
      // 衛生稽查
      hygieneTitle: 'Play [HYGIENE INSPECTION]',
      hygieneBody: '<strong>Unblockable!</strong> ALL players (including yourself) must discard ALL Ingredient cards in hand! Proceed?',
      hygieneConfirm: 'Start Hygiene Inspection!',
      // 選目標 & 食物中毒
      targetTitle: 'Choose Target for [{name}]',
      poisonTitle: 'Food Poisoning: Name an Ingredient',
      poisonLead: 'Choose an ingredient type. Target pays $1 and discards all cards of that type!',
      // 防禦反應
      defTitle: 'Under Attack! Play a Defense Card?',
      defAlert: '<strong>[{atk}]</strong> played <strong>[{card}]</strong> against <strong>[{def}]</strong>!',
      defUseTransfer2P: 'Play [Thank You] to Reflect back to {name} (2P Rule)',
      defUseTransfer2PDesc: 'In a 2-player game, this reflects the attack back to the attacker!',
      defUseTransfer3P: 'Play [Thank You] to Transfer to {name}',
      defUseTransfer3PDesc: 'Redirect this attack to a third player ({name})!',
      defUseCard: 'Play [{name}]',
      defPass: 'Take the Hit',
      // 警察
      policeTitle: 'Police Inspection! [{name}], Choose:',
      policeBody: '[{atk}] reported your stall to the Police! Pay a <strong>$2 fine</strong> or <strong>discard ALL Ingredient cards</strong>.',
      policeDrop: 'Discard All Ingredients',
      policePay: 'Pay $2 Fine',
      // 多人真人熱座交接
      passDeviceTitle: 'Pass Device to Next Chef',
      passDeviceTurnMsg: 'It is now <strong>{name}</strong>\'s turn! Please hand over the device before revealing the hand.',
      passDeviceReactMsg: '<strong>{name}</strong> is under attack! Please hand over the device to <strong>{name}</strong> to respond.',
      passDeviceBtn: 'I am {name}, Show My Hand',
      // 勝負結算
      victoryTitle: 'Night Market Championship Results',
      victoryCrown: 'Champion: {name}',
      victoryRace8Sub: 'First stall to reach $8! Crowned Night Market Tycoon!',
      victoryStdSub: 'All 26 street food orders sold out! Crowned Master Chef!',
      // 玩家預設名稱
      humanPlayerName: 'Player {n}',
      humanSingleName: 'You (Head Chef)',
      humanRoleTag: 'Human',
      aiRoleTag: 'AI',
      // 圖鑑與規則標題
      rulesTitle: 'YES! GINSENG — Official Rules',
      foodGuideTitle: 'Taiwan Street Food Guide (26 Dishes)',
      taiwaneseTag: ' (Taiwanese)'
    }
  };

  function t(key, vars) {
    const table = DICT[currentLang] || DICT.zh;
    let str = table[key] !== undefined ? table[key] : (DICT.zh[key] || key);
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    currentLang = lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant';
    listeners.forEach((fn) => fn(lang));
  }

  function toggleLang() {
    setLang(currentLang === 'zh' ? 'en' : 'zh');
    return currentLang;
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  return { t, getLang, setLang, toggleLang, onChange };
})();
