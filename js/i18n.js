/**
 * 《夜市人蔘 YES! GINSENG》三語可疊加翻譯系統（繁體中文 / English / 한국어）
 * 支援單語切換或任意複選疊加顯示（中+英、中+韓、英+韓、中+英+韓同屏顯示），
 * 即時同步更新全站 UI、3D 牌面、規則手冊、小吃圖鑑與吉祥物提示。
 */
window.I18N = (function () {
  const LANG_ORDER = ['zh', 'en', 'ko'];
  const LANG_META = {
    zh: { code: 'zh', short: '中', label: '繁體中文', htmlLang: 'zh-Hant' },
    en: { code: 'en', short: 'EN', label: 'English', htmlLang: 'en' },
    ko: { code: 'ko', short: '한', label: '한국어', htmlLang: 'ko' }
  };

  let activeLangs = ['zh'];
  try {
    const saved = JSON.parse(localStorage.getItem('yes_ginseng_langs') || 'null');
    if (Array.isArray(saved) && saved.length > 0) {
      const valid = LANG_ORDER.filter((l) => saved.includes(l));
      if (valid.length > 0) activeLangs = valid;
    }
  } catch (_) {}

  const listeners = [];

  const DICT = {
    zh: {
      brandTitle: '夜市人蔘 3D',
      startTitle: '夜市人蔘',
      startSub: 'YES! GINSENG — 臺灣夜市美食 3D 數位桌遊',
      langOverlayHint: '可複選疊加中 / 英 / 韓三語同時顯示',
      langAllBtn: '三語',
      modeLabel: '選擇遊戲模式',
      modeRace8Title: '8 元搶錢大戰（變化規則・推薦）',
      modeRace8Desc: '節奏明快！首位賺滿 8 元的攤販立即獲勝（餐點可回收重洗）。',
      modeStdTitle: '標準街頭廚藝賽（經典規則）',
      modeStdDesc: '完成全部 26 道小吃結算，累積道數最多者奪冠（同數比金額）。',
      totalPlayersLabel: '總玩家人數（2–6 人）',
      humanPlayersLabel: '實際真人玩家人數（可選全部真人）',
      allHumanBadge: '全部真人！',
      mixHumanDesc: '{h} 位真人 + {a} 位電腦攤販',
      allHumanDesc: '全部 {h} 位真人同機對戰（自動防偷看交接）',
      btnStartGame: '夜市開張！進入 3D 牌桌',
      btnFoodGuide: '小吃圖鑑',
      btnRules: '規則手冊',
      btnPromoVideo: '觀看 60 秒遊戲介紹影片',
      promoModalTitle: '《夜市人蔘》60 秒遊戲介紹影片（中／英／韓）',
      promoClose: '關閉影片',
      btnNewGame: '新局',
      btnBgmOn: '背景配樂：開',
      btnBgmOff: '背景配樂：關',
      bgmStyleChef: '美食小當家・熱血對決',
      bgmStyleGod: '食神降臨・氣勢交響',
      bgmStyleLofi: 'Chill Jazz Lo-Fi・夜市漫步',
      toastBgmStyle: '已切換配樂曲風：{style}',
      btnBuySpecial: '買攻防牌 (2元)',
      btnEndTurn: '結束回合',
      btnDiscardEnd: '棄牌並結束 ({n}/8)',
      logHeader: '夜市即時戰報',
      readyOpen: '準備開張',
      modeRace8Short: '8元搶錢模式',
      modeStdShort: '標準廚藝賽（剩 {n} 道）',
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
      toastMuted: '已關閉音效與配樂',
      toastUnmuted: '已開啟音效',
      toastBgmOn: '美食小當家風配樂啟動！熱血開煮！',
      toastBgmOff: '已暫停背景配樂',
      toastLangUpdated: '語言顯示已更新：{langs}',
      toastLangMinOne: '請至少保留一種顯示語言！',
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
      // 料理發光特效字樣
      fxCookTitle: '美味發光！料理完成！',
      fxGinsengTitle: '夜市人蔘！神級出菜！',
      fxBuddhaTitle: '阿彌陀佛！佛跳牆顯靈！',
      fxAttackTitle: '夜市突襲！',
      fxDefenseTitle: '完美防禦！',
      fxHygieneTitle: '全場衛生稽查！',
      // 出菜確認
      cookTitleNormal: '確認出菜【{name}】',
      cookTitleGinseng: '大喊口令！料理【{name}】',
      cookEarn: '賺取 {p} 元',
      cookConsumeLabel: '將消耗以下手牌：',
      cookGinsengCallout: '<strong>人蔘發動提醒：</strong>依原版規則，出示黑色人蔘牌必須大聲喊出指定口令「<strong>夜市人蔘</strong>」才會生效！（忘記喊會失效，更大聲也不能取代三張喔）',
      cookBtnNormal: '揭蓋出菜賺 {p} 元',
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
      poisonLead: '請選擇要喊出的食材種類，目標玩家須賠償 1 元並丟棄手上所有該類食材！',
      // 防禦反應
      defTitle: '遭到攻擊！是否出防禦牌？',
      defAlert: '<strong>【{atk}】</strong>對<strong>【{def}】</strong>發動了 <strong>【{card}】</strong>！',
      defUseTransfer2P: '使用【有關係沒關係】反彈回 {name}（兩人局規則）',
      defUseTransfer2PDesc: '僅有兩人遊玩時，可直接將攻擊返回攻擊者！',
      defUseTransfer3P: '使用【有關係沒關係】轉移給 {name}',
      defUseTransfer3PDesc: '把這次攻擊轉嫁給第三方 {name} 承受！若對方出黑社會將反彈給你。',
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
      victoryStdSub: '所有 26 道夜市餐點全數售罄！榮獲「料理廚蔘」封號！',
      // 玩家預設名稱
      humanPlayerName: '玩家 {n}',
      humanSingleName: '你（掌廚老闆）',
      humanNamePlaceholder: '輸入玩家 {n} 攤位名稱...',
      renameTitle: '更改攤販名稱',
      renameLead: '請輸入新的老闆／攤位名稱（最多 16 字）：',
      renamePlaceholder: '例如：阿明夜市王、食神小當家...',
      renameSuccess: '已更名為【{name}】！',
      renameTooltip: '點擊更改玩家名稱',
      selSpeakOrig: '朗讀原文',
      selTranslating: '翻譯中...',
      selFail: '暫時無法連線翻譯，已顯示內建參考',
      humanRoleTag: '真人',
      aiRoleTag: '電腦',
      // 圖鑑與規則標題
      rulesTitle: '《夜市人蔘》官方完整規則手冊',
      foodGuideTitle: '臺灣夜市小吃文化圖鑑（共 26 道）',
      taiwaneseTag: '（臺語）',
      guideSearchPlaceholder: '搜尋小吃名稱（中 / 英 / 韓 / 拼音）...',
      guideFilterAll: '全部 26 道',
      guideExpandAll: '全部展開',
      guideCollapseAll: '全部收合',
      guideClickExpand: '展開文化與作法介紹',
      guideClickCollapse: '收合詳細介紹',
      guideSectionStory: '文化典故與特色',
      guideSectionRecipe: '傳統作法與食材',
      guideSectionTip: '夜市品嚐與點餐小撇步',
      guideNoResult: '找不到符合條件的小吃，請換個關鍵字或篩選條件。',
      guideViewList: '文化詳解列表',
      guideViewGallery: '真實照片總覽',
      guideViewPhoto: '看真實照片',
      guideLightboxHint: '點擊放大欣賞真實美食照片（支援 ← / → 鍵切換）',
      rulesTabOverview: '總覽與準備',
      rulesTabFlow: '回合與模式',
      rulesTabCards: '食材與人蔘',
      rulesTabSpecials: '攻防牌全解'
    },

    en: {
      brandTitle: 'YES! GINSENG 3D',
      startTitle: 'YES! GINSENG',
      startSub: 'Taiwan Night Market Street Food — 3D Digital Board Game',
      langOverlayHint: 'Toggle multiple languages to overlay ZH / EN / KO',
      langAllBtn: 'ALL',
      modeLabel: 'Game Mode',
      modeRace8Title: '$8 Money Rush (Variant • Recommended)',
      modeRace8Desc: 'Fast-paced! First stall to earn $8 wins immediately (orders reshuffle).',
      modeStdTitle: 'Standard Street Chef Contest (Classic)',
      modeStdDesc: 'Finish all 26 orders. Most completed dishes wins (ties broken by cash).',
      totalPlayersLabel: 'Total Players (2–6)',
      humanPlayersLabel: 'Human Players (Supports All-Human)',
      allHumanBadge: 'ALL HUMAN!',
      mixHumanDesc: '{h} Human + {a} AI Stalls',
      allHumanDesc: 'All {h} Human Pass-and-Play (with privacy handoff)',
      btnStartGame: 'Open Night Market! Enter 3D Table',
      btnFoodGuide: 'Food Guide',
      btnRules: 'Rulebook',
      btnPromoVideo: 'Watch 60s Game Intro Video',
      promoModalTitle: 'YES! GINSENG — 60s Official Promo (ZH / EN / KO)',
      promoClose: 'Close Video',
      btnNewGame: 'New Game',
      btnBgmOn: 'BGM: ON',
      btnBgmOff: 'BGM: OFF',
      bgmStyleChef: 'Cooking Master (Upbeat)',
      bgmStyleGod: 'God of Cookery (Epic Orchestra)',
      bgmStyleLofi: 'Chill Jazz Lo-Fi (Night Stroll)',
      toastBgmStyle: 'Music Style: {style}',
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
      toastMuted: 'Audio & BGM Muted',
      toastUnmuted: 'Audio Enabled',
      toastBgmOn: 'Cooking Master BGM Started! Time to Cook!',
      toastBgmOff: 'Background Music Paused',
      toastLangUpdated: 'Display Languages: {langs}',
      toastLangMinOne: 'Keep at least one language active!',
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
      // 料理發光特效字樣
      fxCookTitle: 'GLOWING DELICIOUS!',
      fxGinsengTitle: 'YES! GINSENG! MASTERPIECE!',
      fxBuddhaTitle: 'AH-MEAT-TOFU BLESSING!',
      fxAttackTitle: 'MARKET AMBUSH!',
      fxDefenseTitle: 'PERFECT DEFENSE!',
      fxHygieneTitle: 'HYGIENE INSPECTION!',
      // 出菜確認
      cookTitleNormal: 'Cook [{name}]',
      cookTitleGinseng: 'Shout the Magic Words! Cook [{name}]',
      cookEarn: 'Earn ${p}',
      cookConsumeLabel: 'Ingredients to consume:',
      cookGinsengCallout: '<strong>Ginseng Rule:</strong> You must shout "<strong>YES! GINSENG!</strong>" to activate the black Ginseng card! (Forgetting nullifies it; shouting louder still only replaces 2 cards.)',
      cookBtnNormal: 'Serve & Earn ${p}',
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
      defUseTransfer3PDesc: 'Redirect this attack to a third player ({name})! If they play Gangster, it reflects back to you.',
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
      humanNamePlaceholder: 'Enter Player {n} stall name...',
      renameTitle: 'Rename Chef / Stall',
      renameLead: 'Enter a new player or stall name (max 16 chars):',
      renamePlaceholder: 'e.g., Chef Master, Night Market King...',
      renameSuccess: 'Renamed to [{name}]!',
      renameTooltip: 'Click to rename player',
      selSpeakOrig: 'Speak',
      selTranslating: 'Translating...',
      selFail: 'Translation unavailable offline',
      humanRoleTag: 'Human',
      aiRoleTag: 'AI',
      // 圖鑑與規則標題
      rulesTitle: 'YES! GINSENG — Official Rulebook',
      foodGuideTitle: 'Taiwan Street Food Cultural Guide (26 Dishes)',
      taiwaneseTag: ' (Taiwanese)',
      guideSearchPlaceholder: 'Search dish (ZH / EN / KO / Pinyin)...',
      guideFilterAll: 'All 26',
      guideExpandAll: 'Expand All',
      guideCollapseAll: 'Collapse All',
      guideClickExpand: 'Expand Cultural Story & Recipe',
      guideClickCollapse: 'Collapse Details',
      guideSectionStory: 'Cultural Background & Origin',
      guideSectionRecipe: 'Traditional Preparation & Ingredients',
      guideSectionTip: 'Night Market Ordering & Tasting Tip',
      guideNoResult: 'No matching street food found. Try another keyword or filter.',
      guideViewList: 'Cultural List',
      guideViewGallery: 'Photo Gallery',
      guideViewPhoto: 'Real Photo',
      guideLightboxHint: 'Click to view real food photo (use ← / → keys to browse)',
      rulesTabOverview: 'Overview & Setup',
      rulesTabFlow: 'Turn & Modes',
      rulesTabCards: 'Ingredients & Ginseng',
      rulesTabSpecials: 'Special Cards'
    },

    ko: {
      brandTitle: '야시장 인삼 3D',
      startTitle: '야시장 인삼',
      startSub: 'YES! GINSENG — 대만 야시장 미식 3D 보드게임',
      langOverlayHint: '중 / 영 / 한 다국어 중복 표시 가능',
      langAllBtn: '3개국어',
      modeLabel: '게임 모드 선택',
      modeRace8Title: '8원 스피드 쟁탈전 (변형 규칙・추천)',
      modeRace8Desc: '빠른 전개! 먼저 8원을 모으는 포장마차가 즉시 승리합니다.',
      modeStdTitle: '표준 스트리트 셰프 대전 (클래식)',
      modeStdDesc: '26가지 요리를 모두 완성하면 종료, 가장 많은 요리를 만든 셰프가 우승합니다.',
      totalPlayersLabel: '총 플레이어 수 (2–6명)',
      humanPlayersLabel: '실제 플레이어 수 (전원 사람 가능)',
      allHumanBadge: '전원 사람!',
      mixHumanDesc: '사람 {h}명 + AI {a}명',
      allHumanDesc: '전원 사람 {h}명 핫시트 대전 (손패 가림 보호)',
      btnStartGame: '야시장 개장! 3D 테이블 입장',
      btnFoodGuide: '야시장 도감',
      btnRules: '규칙서',
      btnPromoVideo: '60초 게임 소개 영상 보기',
      promoModalTitle: '《야시장 인삼》 60초 공식 소개 영상 (중/영/한)',
      promoClose: '영상 닫기',
      btnNewGame: '새 게임',
      btnBgmOn: '배경음악: 켜짐',
      btnBgmOff: '배경음악: 꺼짐',
      bgmStyleChef: '요리왕 비룡 (열혈 대결)',
      bgmStyleGod: '식신 강림 (웅장한 교향곡)',
      bgmStyleLofi: 'Chill Jazz Lo-Fi (야시장 산책)',
      toastBgmStyle: '음악 스타일 변경: {style}',
      btnBuySpecial: '특수카드 구매 (2원)',
      btnEndTurn: '턴 종료',
      btnDiscardEnd: '버리고 종료 ({n}/8)',
      logHeader: '야시장 실시간 전황',
      readyOpen: '개장 준비',
      modeRace8Short: '8원 쟁탈 모드',
      modeStdShort: '표준 셰프전 (남은 요리 {n})',
      turnBanner: '{r}라운드 | 현재 턴: <strong>{name}</strong>',
      deckIng: '식재료',
      deckSp: '공방',
      deckOrd: '요리',
      unitDollar: '원',
      unitDish: '요리',
      unitDishShort: '개',
      handCount: '손패',
      buffBuddha: '불도장 발동 중',
      buffDirect: '산지직송 중',
      buffBug: '바퀴벌레: 요리 불가',
      discardBanner: '손패 상한은 8장! 아래 카드 중 <strong>{n}</strong>장을 클릭해 버리세요.',
      ingBadgeNormal: '식재료',
      ingBadgeRotten: '상함',
      ingBadgeWild: '만능×2',
      spTypeAttack: '공격',
      spTypeSupport: '보조',
      spTypeDefense: '방어',
      cancel: '취소',
      confirm: '확인',
      gotIt: '이해했습니다',
      closeGuide: '도감 닫기',
      playAgain: '다시 플레이',
      // 3D 牌面文字
      card3dReady: '재료 충분! 클릭해 요리',
      card3dIngLabel: '재료',
      card3dTaiwanese: '대만어 발음',
      deck3dIngDiscard: '재료 버림더미',
      deck3dSpDiscard: '특수 버림더미',
      deck3dOrder: '요리 덱',
      deck3dIng: '식재료 덱',
      deck3dSp: '특수카드 덱',
      deck3dSpSub: '2원 구매',
      // 互動提示與彈窗
      toastMuted: '효과음 및 음악 음소거',
      toastUnmuted: '효과음 켜짐',
      toastBgmOn: '요리왕 비룡 스타일 BGM 시작!',
      toastBgmOff: '배경 음악 일시정지',
      toastLangUpdated: '표시 언어 변경: {langs}',
      toastLangMinOne: '최소 1개 언어는 선택해야 합니다!',
      toastNotYourTurn: '아직 당신의 턴이 아닙니다!',
      toastDiscardFirst: '먼저 손패를 8장 이하로 버려주세요!',
      toastSkipCook: '바퀴벌레 효과로 이번 턴에는 요리할 수 없습니다!',
      toastNotEnoughIng: '재료가 부족하여 [{name}] 요리를 만들 수 없습니다!',
      toastNotEnoughMoney: '특수카드 구매에는 2원이 필요합니다!',
      toastNoSpecialLeft: '남은 특수카드가 없습니다!',
      toastBoughtSpecial: '특수카드 획득: {name}',
      toastYourTurn: '[{name}]의 턴! 빛나는 요리 카드를 클릭해 조리하세요.',
      toastYourTurnBug: '[{name}] 바퀴벌레 습격! 이번 턴 요리 불가 (특수카드 사용/구매 가능).',
      toastRottenHint: '[{name}]은(는) 상한 재료라 요리할 수 없습니다. 우선 버리세요!',
      toastGinsengHint: '[흑인삼]은 원하는 식재료 2장을 대체합니다! 요리 카드를 클릭하세요.',
      toastIngHint: '식재료 [{name}]: 테이블 위 빛나는 요리 카드를 클릭해 조리하세요!',
      toastDefHint: '[{name}]은(는) 방어 카드입니다. 공격받을 때 자동으로 선택창이 뜹니다!',
      toastDiscardNeed: '손패 8장 초과! {n}장을 클릭해 버려주세요.',
      // 料理發光特效字樣
      fxCookTitle: '눈부신 특급 요리 완성!',
      fxGinsengTitle: '야시장 인삼! 전설의 한 그릇!',
      fxBuddhaTitle: '아미타불! 불도장 발동!',
      fxAttackTitle: '야시장 기습 공격!',
      fxDefenseTitle: '완벽한 방어!',
      fxHygieneTitle: '전원 위생 점검!',
      // 出菜確認
      cookTitleNormal: '요리 완성 [{name}]',
      cookTitleGinseng: '구호를 외쳐라! [{name}]',
      cookEarn: '{p}원 획득',
      cookConsumeLabel: '사용할 식재료:',
      cookGinsengCallout: '<strong>인삼 발동 규칙:</strong> 원작 규칙에 따라 흑인삼을 낼 때 "<strong>예스 진생! (夜市人蔘)</strong>"을 외쳐야 발동합니다! (더 크게 외쳐도 2장까지만 대체)',
      cookBtnNormal: '뚜껑 열고 {p}원 받기',
      cookBtnGinseng: '"夜市人蔘!" 외치고 요리 완성!',
      // 佛跳牆
      buddhaTitle: '[불도장] 발동',
      buddhaBody: '두 손을 모으고 "<strong>아미타불</strong>"을 외치세요! 이번 턴 동안 채소나 곡물로 고기/해산물을 무제한 대체할 수 있습니다.',
      buddhaCancel: '취소',
      buddhaConfirm: '합장하고 "아미타불" 외치기!',
      // 衛生稽查
      hygieneTitle: '[위생 점검] 발동',
      hygieneBody: '<strong>방어 불가!</strong> 자신을 포함한 모든 플레이어가 손안의 모든 식재료 카드를 버립니다! 진행할까요?',
      hygieneConfirm: '위생 점검 실시!',
      // 選目標 & 食物中毒
      targetTitle: '[{name}] 공격 대상 선택',
      poisonTitle: '식중독: 식재료 1종 지목',
      poisonLead: '지목한 식재료를 대상이 모두 버리고 치료비 1원을 지불합니다!',
      // 防禦反應
      defTitle: '공격 당했습니다! 방어하시겠습니까?',
      defAlert: '<strong>[{atk}]</strong>님이 <strong>[{def}]</strong>님에게 <strong>[{card}]</strong>을(를) 사용했습니다!',
      defUseTransfer2P: '[인맥 찬스]로 {name}에게 반사 (2인 규칙)',
      defUseTransfer2PDesc: '2인 게임에서는 공격자에게 그대로 반사할 수 있습니다!',
      defUseTransfer3P: '[인맥 찬스]로 {name}에게 떠넘기기',
      defUseTransfer3PDesc: '제3자({name})에게 공격을 넘깁니다! 상대가 흑사회로 반사하면 자신에게 돌아옵니다.',
      defUseCard: '[{name}] 사용',
      defPass: '방어 포기 (공격 수용)',
      // 警察
      policeTitle: '경찰 단속! [{name}] 선택하세요',
      policeBody: '[{atk}]님이 포장마차를 신고했습니다! <strong>벌금 2원 납부</strong> 또는 <strong>모든 식재료 포기</strong> 중 선택하세요.',
      policeDrop: '모든 식재료 버리기',
      policePay: '벌금 2원 내기',
      // 多人真人熱座交接
      passDeviceTitle: '다음 셰프에게 화면을 넘겨주세요',
      passDeviceTurnMsg: '이제 <strong>{name}</strong>님의 턴입니다! 손패가 보이지 않도록 기기를 넘긴 뒤 버튼을 눌러주세요.',
      passDeviceReactMsg: '<strong>{name}</strong>님이 공격받았습니다! 기기를 <strong>{name}</strong>님에게 넘겨주세요.',
      passDeviceBtn: '저는 {name}입니다. 손패 보기',
      // 勝負結算
      victoryTitle: '야시장 요리 대회 최종 결과',
      victoryCrown: '우승: {name}',
      victoryRace8Sub: '가장 먼저 8원 달성! 야시장 최고의 거부가 되었습니다!',
      victoryStdSub: '26가지 대만 야시장 요리 완판! 전설의 "요리왕" 등극!',
      // 玩家預設名稱
      humanPlayerName: '플레이어 {n}',
      humanSingleName: '나 (사장님)',
      humanNamePlaceholder: '플레이어 {n} 닉네임 입력...',
      renameTitle: '플레이어 이름 변경',
      renameLead: '새로운 사장님 / 포장마차 이름을 입력하세요 (최대 16자):',
      renamePlaceholder: '예: 식신 셰프, 야시장의 왕...',
      renameSuccess: '[{name}](으)로 이름이 변경되었습니다!',
      renameTooltip: '클릭해 이름 변경',
      selSpeakOrig: '원문 듣기',
      selTranslating: '번역 중...',
      selFail: '오프라인 상태에서는 번역을 불러올 수 없습니다',
      humanRoleTag: '사람',
      aiRoleTag: 'AI',
      // 圖鑑與規則標題
      rulesTitle: '《야시장 인삼》 공식 완전 규칙서',
      foodGuideTitle: '대만 야시장 먹거리 문화 도감 (총 26종)',
      taiwaneseTag: ' (대만어)',
      guideSearchPlaceholder: '요리 이름 검색 (중 / 영 / 한 / 병음)...',
      guideFilterAll: '전체 26종',
      guideExpandAll: '모두 펼치기',
      guideCollapseAll: '모두 접기',
      guideClickExpand: '문화 이야기 & 레시피 펼치기',
      guideClickCollapse: '상세 내용 접기',
      guideSectionStory: '문화 배경과 유래',
      guideSectionRecipe: '전통 조리법과 재료',
      guideSectionTip: '야시장 주문 & 시식 꿀팁',
      guideNoResult: '조건에 맞는 요리가 없습니다. 다른 검색어나 필터를 선택해 주세요.',
      guideViewList: '문화 상세 목록',
      guideViewGallery: '실제 사진 갤러리',
      guideViewPhoto: '실제 사진 보기',
      guideLightboxHint: '클릭해 실제 음식 사진 크게 보기 (← / → 키로 이동)',
      rulesTabOverview: '개요 & 준비',
      rulesTabFlow: '턴 진행 & 모드',
      rulesTabCards: '식재료 & 인삼',
      rulesTabSpecials: '특수카드 도감'
    }
  };

  function save() {
    try {
      localStorage.setItem('yes_ginseng_langs', JSON.stringify(activeLangs));
    } catch (_) {}
  }

  function applyHtmlLang() {
    const primary = activeLangs[0] || 'zh';
    document.documentElement.lang = LANG_META[primary].htmlLang;
  }

  function formatStr(str, vars) {
    if (!vars) return str;
    let out = str;
    Object.entries(vars).forEach(([k, v]) => {
      out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
    return out;
  }

  function t(key, vars, forceLang) {
    const lang = forceLang || activeLangs[0] || 'zh';
    const table = DICT[lang] || DICT.zh;
    const raw = table[key] !== undefined ? table[key] : (DICT.zh[key] || key);
    return formatStr(raw, vars);
  }

  /**
   * 依據目前啟用的語言組合，輸出可疊加的 HTML 字串
   * @param {Object} map - { zh: '...', en: '...', ko: '...' }
   * @param {Object} opts - { inline?: boolean, sep?: string, maxLangs?: number }
   */
  function stackValues(map, opts = {}) {
    const langs = opts.maxLangs ? activeLangs.slice(0, opts.maxLangs) : activeLangs;
    const parts = [];
    const seen = new Set();
    langs.forEach((l) => {
      const val = map[l];
      if (!val || seen.has(val)) return;
      seen.add(val);
      parts.push({ lang: l, text: val });
    });
    if (parts.length === 0) return map.zh || map.en || map.ko || '';
    if (parts.length === 1) return parts[0].text;

    if (opts.inline) {
      const sep = opts.sep || ' / ';
      return (
        `<span class="i18n-main">${parts[0].text}</span>` +
        parts
          .slice(1)
          .map((p) => `<span class="i18n-inline-sub i18n-lang-${p.lang}">${sep}${p.text}</span>`)
          .join('')
      );
    }

    return (
      `<span class="i18n-stack">` +
      `<span class="i18n-main">${parts[0].text}</span>` +
      parts
        .slice(1)
        .map((p) => `<span class="i18n-sub i18n-lang-${p.lang}">${p.text}</span>`)
        .join('') +
      `</span>`
    );
  }

  /**
   * 依據字典 key 輸出可疊加 HTML
   */
  function tStack(key, vars, opts = {}) {
    const map = {};
    activeLangs.forEach((l) => {
      map[l] = t(key, vars, l);
    });
    return stackValues(map, opts);
  }

  function getLang() {
    return activeLangs[0] || 'zh';
  }

  function getActiveLangs() {
    return [...activeLangs];
  }

  function hasLang(lang) {
    return activeLangs.includes(lang);
  }

  function setLang(lang) {
    if (!LANG_META[lang]) return;
    activeLangs = [lang];
    save();
    applyHtmlLang();
    listeners.forEach((fn) => fn(activeLangs));
  }

  function setActiveLangs(langs) {
    const valid = LANG_ORDER.filter((l) => langs.includes(l));
    if (valid.length === 0) return false;
    activeLangs = valid;
    save();
    applyHtmlLang();
    listeners.forEach((fn) => fn(activeLangs));
    return true;
  }

  /**
   * 切換單一語言的疊加開關（至少保留一種語言）
   * @returns {{ changed: boolean, activeLangs: string[] }}
   */
  function toggleLang(lang) {
    if (!lang) {
      // 向下相容：無參數時循環切換單語
      const idx = LANG_ORDER.indexOf(activeLangs[0]);
      const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
      setLang(next);
      return { changed: true, activeLangs: [...activeLangs] };
    }
    if (!LANG_META[lang]) return { changed: false, activeLangs: [...activeLangs] };

    if (activeLangs.includes(lang)) {
      if (activeLangs.length <= 1) {
        return { changed: false, activeLangs: [...activeLangs] };
      }
      activeLangs = activeLangs.filter((l) => l !== lang);
    } else {
      activeLangs = LANG_ORDER.filter((l) => l === lang || activeLangs.includes(l));
    }
    save();
    applyHtmlLang();
    listeners.forEach((fn) => fn(activeLangs));
    return { changed: true, activeLangs: [...activeLangs] };
  }

  function formatPrice(price) {
    const p = activeLangs[0];
    if (p === 'en') return `$${price}`;
    if (p === 'ko') return `${price}원`;
    return `${price}元`;
  }

  function getActiveLangNames() {
    return activeLangs.map((l) => LANG_META[l].label).join(' + ');
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  applyHtmlLang();

  return {
    LANG_ORDER,
    LANG_META,
    t,
    tStack,
    stackValues,
    formatPrice,
    getLang,
    getActiveLangs,
    getActiveLangNames,
    hasLang,
    setLang,
    setActiveLangs,
    toggleLang,
    onChange
  };
})();
