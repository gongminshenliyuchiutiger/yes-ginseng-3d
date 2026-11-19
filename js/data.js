/**
 * 《夜市人蔘 YES! GINSENG》完整雙語遊戲資料庫（純程式繪製牌卡版）
 * 已依據實體桌遊牌卡 100% 精準校正，並支援繁體中文 / English 雙語即時顯示。
 */

window.GAME_DATA = (function () {
  const INGREDIENTS = {
    grain: {
      id: 'grain',
      name: '五穀雜糧',
      short: '穀',
      shortEn: 'GR',
      rottenName: '腐壞五穀',
      rottenEn: 'Rotten Grain',
      en: 'RICE / FLOUR',
      color: '#8e949c',
      light: '#c4c9d0',
      dark: '#525860',
      icon: 'fa-solid fa-wheat-awn',
      total: 12,
      rottenCount: 1
    },
    soup: {
      id: 'soup',
      name: '湯',
      short: '湯',
      shortEn: 'SP',
      rottenName: '酸掉的湯',
      rottenEn: 'Rotten Soup',
      en: 'SOUP',
      color: '#e6b422',
      light: '#fae078',
      dark: '#9c730a',
      icon: 'fa-solid fa-mug-hot',
      total: 12,
      rottenCount: 1
    },
    veg: {
      id: 'veg',
      name: '菜',
      short: '菜',
      shortEn: 'VG',
      rottenName: '爛菜',
      rottenEn: 'Rotten Veg',
      en: 'VEGETABLE',
      color: '#63a63e',
      light: '#a3db84',
      dark: '#35661d',
      icon: 'fa-solid fa-leaf',
      total: 8,
      rottenCount: 1
    },
    seafood: {
      id: 'seafood',
      name: '海鮮',
      short: '海',
      shortEn: 'SF',
      rottenName: '變質海鮮',
      rottenEn: 'Rotten Seafood',
      en: 'SEAFOOD',
      color: '#2c80b8',
      light: '#7cc2ed',
      dark: '#184b6e',
      icon: 'fa-solid fa-fish-fins',
      total: 8,
      rottenCount: 1
    },
    meat: {
      id: 'meat',
      name: '肉',
      short: '肉',
      shortEn: 'MT',
      rottenName: '壞肉',
      rottenEn: 'Rotten Meat',
      en: 'MEAT',
      color: '#e0583c',
      light: '#f59c89',
      dark: '#8a2b18',
      icon: 'fa-solid fa-drumstick-bite',
      total: 4,
      rottenCount: 1
    },
    ginseng: {
      id: 'ginseng',
      name: '人蔘',
      short: '蔘',
      shortEn: 'GS',
      rottenName: '人蔘',
      rottenEn: 'GINSENG',
      en: 'GINSENG',
      color: '#202229',
      light: '#e6c167',
      dark: '#101217',
      icon: 'fa-solid fa-seedling',
      total: 2,
      rottenCount: 0,
      special: true
    }
  };

  // 26 道臺灣小吃餐點牌（100% 依實體牌卡半圓食材標示校正，附中英雙語典故）
  const ORDERS = [
    // === 1 元餐點 (12 張) ===
    {
      id: 'ord_01', name: '蛤蜊湯', pinyin: 'gé-lí-tāng', en: 'Clam Soup',
      taiwanese: false, price: 1, ingredients: ['soup', 'seafood'],
      icon: 'fa-solid fa-bowl-food', accent: '#2c80b8',
      desc: '臺灣隨處可見的清爽湯品。清水煮滾放入蛤蜊、薑絲、米酒與九層塔提味，鮮甜開胃。',
      descEn: 'A popular refreshing soup in Taiwan made with fresh clams, shredded ginger, basil, and a splash of rice wine.'
    },
    {
      id: 'ord_02', name: '魷魚羹', pinyin: 'yóu-yú-gēng', en: 'Cuttlefish Thick Soup',
      taiwanese: false, price: 1, ingredients: ['soup', 'seafood'],
      icon: 'fa-solid fa-bowl-food', accent: '#b8682c',
      desc: '勾芡並以重口味為主的湯品，結合魚漿、魷魚、九層塔與烏醋香菜，層次豐富。',
      descEn: 'A savory thickened soup featuring crunchy cuttlefish, fish paste, basil, bamboo shoots, and black vinegar.'
    },
    {
      id: 'ord_03', name: '青菜湯', pinyin: 'qīng-cài-tāng', en: 'Vegetable Soup',
      taiwanese: false, price: 1, ingredients: ['soup', 'veg'],
      icon: 'fa-solid fa-leaf', accent: '#63a63e',
      desc: '作法簡單清爽的小湯品，常使用青江菜或俗稱「A菜」的萵苣，鮮嫩爽口。',
      descEn: 'A simple, light soup typically cooked with seasonal leafy greens like bok choy or Taiwanese lettuce.'
    },
    {
      id: 'ord_04', name: '麻薏湯', pinyin: 'muâ-ínn-thng', en: 'Jute Soup',
      taiwanese: true, price: 1, ingredients: ['soup', 'veg'],
      icon: 'fa-solid fa-seedling', accent: '#2f7d44',
      desc: '臺灣中部夏季限定名產，以黃麻嫩芽搓揉去苦後搭配地瓜與吻仔魚熬煮，清肝降火。',
      descEn: 'A jade-green summer delicacy from central Taiwan made with tender jute leaves and sweet potato cubes.'
    },
    {
      id: 'ord_05', name: '浮水魚羹', pinyin: 'fú-shuǐ-yú-gēng', en: 'Milkfish Thick Soup',
      taiwanese: false, price: 1, ingredients: ['soup', 'seafood'],
      icon: 'fa-solid fa-fish', accent: '#3a7ca5',
      desc: '將虱目魚肉包覆於魚漿中，投入滾水煮熟後會浮起，故稱「浮水魚羹」，佐薑絲黑醋最對味。',
      descEn: 'Milkfish strips wrapped in fish paste that float when cooked, served in a rich thickened broth with vinegar.'
    },
    {
      id: 'ord_06', name: '蛋花湯', pinyin: 'dàn-huā-tāng', en: 'Egg Drop Soup',
      taiwanese: false, price: 1, ingredients: ['soup', 'veg'],
      icon: 'fa-solid fa-egg', accent: '#e6b422',
      desc: '臺灣最經典的家常湯品，滾燙高湯畫圓倒入蛋液成雲狀蛋花，撒上蔥花與白胡椒即完成。',
      descEn: 'The simplest home-style soup in Taiwan: wispy egg ribbons swirled into hot broth with chopped scallions.'
    },
    {
      id: 'ord_07', name: '蚵仔煎', pinyin: 'ô-á-tsian', en: 'Oyster Omelet',
      taiwanese: true, price: 1, ingredients: ['grain', 'seafood'],
      icon: 'fa-solid fa-fire-burner', accent: '#d15a36',
      desc: '平底鍋煎香蚵仔、蛋液與小白菜，淋上太白粉水勾芡並佐特製甜辣醬，夜市必吃人氣王。',
      descEn: 'Night market icon: plump oysters, egg, greens, and chewy starch batter topped with sweet-and-savory sauce.'
    },
    {
      id: 'ord_08', name: '臭豆腐', pinyin: 'chòu-dòu-fǔ', en: 'Stinky Tofu',
      taiwanese: false, price: 1, ingredients: ['grain', 'veg'],
      icon: 'fa-solid fa-cubes', accent: '#c9882c',
      desc: '經發酵製成的豆腐酥炸至金黃，佐以酸甜爽脆的臺式泡菜，聞起來臭、吃起來奇香無比。',
      descEn: 'Deep-fried fermented tofu with a bold aroma and crispy golden crust, paired with sweet pickled cabbage.'
    },
    {
      id: 'ord_09', name: '花枝丸', pinyin: 'huā-zhī-wán', en: 'Fried Squid Balls',
      taiwanese: false, price: 1, ingredients: ['grain', 'seafood'],
      icon: 'fa-solid fa-circle-dot', accent: '#d4822a',
      desc: '新鮮花枝切塊絞泥揉成球狀油炸，脆口彈牙、海味十足，煎煮炒炸皆百搭。',
      descEn: 'Bouncy, crispy deep-fried squid paste balls packed with fresh ocean flavor, beloved by all ages.'
    },
    {
      id: 'ord_10', name: '水煎包', pinyin: 'shuǐ-jiān-bāo', en: 'Pan-Fried Bun',
      taiwanese: false, price: 1, ingredients: ['grain', 'veg'],
      icon: 'fa-solid fa-bread-slice', accent: '#a87d43',
      desc: '薄麵皮包覆韭菜、高麗菜與冬粉，於平底圓鍋半蒸半煎，外皮焦香酥脆、內餡清甜。',
      descEn: 'Crispy-bottomed steamed-and-fried buns stuffed with sweet cabbage, chives, and glass noodles.'
    },
    {
      id: 'ord_11', name: '蚵仔麵線', pinyin: 'ô-á-mī-suànn', en: 'Oyster Thin Noodles',
      taiwanese: true, price: 1, ingredients: ['grain', 'seafood'],
      icon: 'fa-solid fa-bowl-rice', accent: '#9e5430',
      desc: '烘烤紅麵線加入柴魚高湯勾芡，放入鮮美蚵仔、蒜泥、烏醋與香菜，暖胃又道地。',
      descEn: 'Fragrant roasted vermicelli simmered in thick bonito broth with fresh oysters, garlic, and black vinegar.'
    },
    {
      id: 'ord_12', name: '潤餅', pinyin: 'rùn-bǐng', en: 'Steamed Spring Roll',
      taiwanese: false, price: 1, ingredients: ['grain', 'veg'],
      icon: 'fa-solid fa-scroll', accent: '#6d944e',
      desc: '薄如紙且具彈性的麵皮包覆豆乾、豆芽菜、高麗菜等配料，撒上花生糖粉，清爽順口。',
      descEn: 'Paper-thin wheat crepe wrapped around crisp vegetables, dried tofu, and sweet peanut sugar powder.'
    },

    // === 2 元餐點 (8 張) ===
    {
      id: 'ord_13', name: '蔥油餅', pinyin: 'cōng-yóu-bǐng', en: 'Scallion Pancake',
      taiwanese: false, price: 2, ingredients: ['grain', 'grain', 'veg'],
      icon: 'fa-solid fa-stroopwafel', accent: '#5f8f3d',
      desc: '麵皮鋪滿宜蘭三星蔥花煎至兩面金黃酥脆，臺式吃法更常加蛋加辣，香氣四溢。',
      descEn: 'Flaky golden pan-fried dough folded with fragrant Yilan scallions; often enjoyed with a fried egg.'
    },
    {
      id: 'ord_14', name: '鹹湯圓', pinyin: 'xián-tāng-yuán', en: 'Savory Rice Balls',
      taiwanese: false, price: 2, ingredients: ['soup', 'veg'],
      icon: 'fa-solid fa-bowling-ball', accent: '#c7684e',
      desc: '糯米粉製成象徵團圓的湯圓，搭配紅蔥頭、香菇與茼蒿熬煮鹹香高湯，客家經典風味。',
      descEn: 'Chewy glutinous rice balls symbolizing reunion, served in savory Hakka broth with mushrooms and greens.'
    },
    {
      id: 'ord_15', name: '鼎邊趖', pinyin: 'dǐng-biān-cuò', en: 'Potside Sticker Soup',
      taiwanese: false, price: 2, ingredients: ['soup', 'meat'],
      icon: 'fa-solid fa-kitchen-set', accent: '#4d7ea8',
      desc: '基隆廟口招牌小吃，米漿沿熱鍋邊受熱凝固成滑嫩米片，搭配蝦米、香菇與肉羹高湯。',
      descEn: 'Keelung Miaokow specialty: silky rice-paste noodles steamed along a hot wok rim in rich meat broth.'
    },
    {
      id: 'ord_16', name: '下水湯', pinyin: 'xià-shuǐ-tāng', en: 'Gizzard & Liver Soup',
      taiwanese: false, price: 2, ingredients: ['soup', 'meat'],
      icon: 'fa-solid fa-mug-hot', accent: '#a84432',
      desc: '以雞心、雞胗、雞肝等家禽內臟搭配薑絲煮成清湯，爽脆不腥，充滿古早惜食文化。',
      descEn: 'A traditional clear ginger broth featuring tender poultry hearts, gizzards, and livers.'
    },
    {
      id: 'ord_17', name: '鱔魚意麵', pinyin: 'shàn-yú-yì-miàn', en: 'Eel Noodles',
      taiwanese: false, price: 2, ingredients: ['grain', 'grain', 'seafood'],
      icon: 'fa-solid fa-utensils', accent: '#8c4220',
      desc: '臺南經典美食，大火快炒脆口鱔魚與酸甜勾芡燴汁，淋在金黃意麵上非常開胃。',
      descEn: 'Tainan classic: high-heat stir-fried crispy eel in tangy sweet-and-sour sauce over golden egg noodles.'
    },
    {
      id: 'ord_18', name: '棺材板', pinyin: 'guān-cái-bǎn', en: 'Coffin Bread',
      taiwanese: false, price: 2, ingredients: ['soup', 'grain', 'seafood'],
      icon: 'fa-solid fa-box-open', accent: '#c79238',
      desc: '臺南獨創名點，厚片吐司酥炸掏空後填入蔬菜、海鮮與濃郁奶油白醬，外酥內滑。',
      descEn: 'Tainan original: hollowed-out golden fried thick toast filled with creamy seafood and vegetable chowder.'
    },
    {
      id: 'ord_19', name: '爌肉飯', pinyin: 'kuàng-ròu-fàn', en: 'Soy-Stewed Pork Rice',
      taiwanese: false, price: 2, ingredients: ['grain', 'meat'],
      icon: 'fa-solid fa-bowl-rice', accent: '#993b2c',
      desc: '五花肉塊爆香後以醬油、米酒與冰糖慢火滷至軟爛入味，配飯與酸菜、筍絲堪稱一絕。',
      descEn: 'Melt-in-your-mouth braised pork belly simmered in soy sauce and rock sugar over steaming white rice.'
    },
    {
      id: 'ord_20', name: '大腸包小腸', pinyin: 'dà-cháng-bāo-xiǎo-cháng', en: 'Taiwanese Hot Dog',
      taiwanese: false, price: 2, ingredients: ['grain', 'meat'],
      icon: 'fa-solid fa-hotdog', accent: '#bd4035',
      desc: '俗稱「臺灣熱狗」，炭烤糯米腸切開夾入多汁臺式香腸與蒜片香菜，口感層次滿點。',
      descEn: 'Grilled sweet Taiwanese pork sausage tucked inside a sliced glutinous rice sausage with garlic and herbs.'
    },

    // === 3 元餐點 (4 張) ===
    {
      id: 'ord_21', name: '刈包', pinyin: 'guà-bāo', en: 'Steamed Sandwich',
      taiwanese: true, price: 3, ingredients: ['grain', 'veg', 'meat'],
      icon: 'fa-solid fa-burger', accent: '#a84e32',
      desc: '有「臺灣漢堡」美稱，又名「虎咬豬」。鬆軟麵皮夾入滷五花肉、酸菜、香菜與花生粉。',
      descEn: 'Known as "Tiger Bites Pig": fluffy folded steamed bun filled with braised pork belly, pickled greens, and peanut powder.'
    },
    {
      id: 'ord_22', name: '鹹酥雞', pinyin: 'xián-sū-jī', en: 'Taiwanese Fried Chicken',
      taiwanese: false, price: 3, ingredients: ['grain', 'seafood', 'meat'],
      icon: 'fa-solid fa-drumstick-bite', accent: '#cf6f23',
      desc: '臺灣宵夜首選！雞肉與多樣配料搭九層塔酥炸，灑上胡椒鹽與辣椒粉，香酥涮嘴。',
      descEn: 'Taiwan\'s ultimate late-night snack: crispy fried chicken and street treats tossed with fried basil and pepper salt.'
    },
    {
      id: 'ord_23', name: '蝦仁肉圓', pinyin: 'xiā-rén-ròu-yuán', en: 'Shrimp Meatballs',
      taiwanese: false, price: 3, ingredients: ['soup', 'seafood', 'meat'],
      icon: 'fa-solid fa-shrimp', accent: '#c94c38',
      desc: '南臺灣清蒸軟嫩肉圓，外皮軟糯 Q 彈，包覆鮮甜火燒蝦仁與豬肉餡，佐蒜蓉醬膏。',
      descEn: 'Southern-style steamed translucent rice dumplings stuffed with fresh shrimp and savory pork in garlic soy glaze.'
    },
    {
      id: 'ord_24', name: '甜不辣', pinyin: 'tián-bú-là', en: 'Tempura Combination',
      taiwanese: false, price: 3, ingredients: ['soup', 'veg', 'seafood', 'meat'],
      icon: 'fa-solid fa-plate-wheat', accent: '#b85c2e',
      desc: '魚漿炸物與丸子、米血糕、白蘿蔔於高湯慢煮，淋上特製甜辣醬，吃完還能免費加湯！',
      descEn: 'Assorted fish cakes, meatballs, blood rice cake, and radish simmered in broth with signature sweet chili sauce.'
    },

    // === 4 元餐點 (2 張) ===
    {
      id: 'ord_25', name: '海陸雙拼', pinyin: 'hǎi-lù-shuāng-pīn', en: 'Surf & Turf Teppanyaki',
      taiwanese: false, price: 4, ingredients: ['grain', 'veg', 'seafood', 'meat'],
      icon: 'fa-solid fa-bacon', accent: '#b52f2f',
      desc: '夜市鐵板料理的豪華大餐！高溫鐵板滋滋作響，肉排、鮮蝦、麵條與荷包蛋淋上濃郁醬汁。',
      descEn: 'Luxury sizzling iron-plate feast combining juicy steak, shrimp, noodles, egg, and rich black pepper sauce.'
    },
    {
      id: 'ord_26', name: '臭臭鍋', pinyin: 'chòu-chòu-guō', en: 'Stinky Hot Pot',
      taiwanese: false, price: 4, ingredients: ['grain', 'soup', 'veg', 'seafood', 'meat'],
      icon: 'fa-solid fa-fire-flame-curved', accent: '#9c2424',
      desc: '集結臭豆腐、大腸、鴨血、高湯、肉片、海鮮與時蔬的終極五味鍋物，夜市之王！',
      descEn: 'The ultimate 5-ingredient personal hot pot packed with stinky tofu, pork intestine, duck blood, seafood, and greens.'
    }
  ];

  // 27 張攻防牌定義（攻擊18張、輔助5張、防禦4張）
  const SPECIALS = [
    // === 攻擊用 (18 張) ===
    {
      id: 'hygiene', name: '衛生稽查', pinyin: 'wèi-shēng-jī-chá', en: 'Hygiene Inspection',
      type: 'attack', count: 1, icon: 'fa-solid fa-clipboard-list', code: '全清', codeEn: 'WIPE',
      targetMode: 'all', unblockable: true,
      desc: '所有防禦牌無效！全場玩家（包括自己）丟棄手上所有食材牌，放回棄牌堆。',
      descEn: 'Unblockable! ALL players (including yourself) must discard ALL Ingredient cards.'
    },
    {
      id: 'police', name: '警察', pinyin: 'jǐng-chá', en: 'Police',
      type: 'attack', count: 2, icon: 'fa-solid fa-shield-halved', code: '-2/清', codeEn: '-$2/X',
      targetMode: 'single',
      desc: '被檢舉之玩家選擇罰款 2 元或丟棄所有食材牌（不足 2 元須棄牌，放回牌堆）。',
      descEn: 'Chosen player must either pay a $2 fine to bank or discard all Ingredient cards.'
    },
    {
      id: 'picky', name: '奧客', pinyin: 'àu-kheh', en: 'Picky Customer',
      type: 'attack', count: 2, icon: 'fa-solid fa-hand-point-right', code: '-1/2', codeEn: '-1/2',
      targetMode: 'single',
      desc: '使目標玩家捨棄一半的食材牌（無條件進位，例如 3 張棄 2 張），放回牌堆。',
      descEn: 'Target player loses half of their Ingredient cards (rounded up).'
    },
    {
      id: 'steal_card', name: '偷牌', pinyin: 'tōu-pái', en: 'Card Pilferer',
      type: 'attack', count: 3, icon: 'fa-solid fa-mask', code: '-1攻', codeEn: '-1 SP',
      targetMode: 'single',
      desc: '隨機奪取目標玩家手上的攻防牌 1 張。',
      descEn: 'Steal 1 random Special card from an opponent.'
    },
    {
      id: 'poison', name: '食物中毒', pinyin: 'shí-wù-zhōng-dú', en: 'Food Poisoning',
      type: 'attack', count: 2, icon: 'fa-solid fa-skull-crossbones', code: '-1元', codeEn: '-$1/?',
      targetMode: 'single', needsIngredientChoice: true,
      desc: '向被投訴玩家求償醫藥費 1 元，並喊出 1 種食材請對方全部丟棄；若無該食材則無損失。',
      descEn: 'Take $1 from target and name 1 Ingredient type; they discard all cards of that type.'
    },
    {
      id: 'cockroach', name: '蟑螂', pinyin: 'zhāng-láng', en: 'Cockroach',
      type: 'attack', count: 2, icon: 'fa-solid fa-bug', code: '暫停', codeEn: 'SKIP',
      targetMode: 'single',
      desc: '目標玩家下回合暫停做菜一回合！但仍可取得食材牌 3 張及購買/使用攻防牌。',
      descEn: 'Target cannot cook any Orders on their next turn (can still draw & play Specials).'
    },
    {
      id: 'pickpocket', name: '扒手', pinyin: 'pá-shǒu', en: 'Pickpocket',
      type: 'attack', count: 3, icon: 'fa-solid fa-sack-dollar', code: '-2元', codeEn: '-$2',
      targetMode: 'single',
      desc: '奪取一名玩家 2 元（若對方只有 1 元則奪取 1 元）。',
      descEn: 'Steal $2 from an opponent (or $1 if they only have $1).'
    },
    {
      id: 'veg_thief', name: '偷菜賊', pinyin: 'tōu-cài-zéi', en: 'Ingredient Thief',
      type: 'attack', count: 3, icon: 'fa-solid fa-user-ninja', code: '-2材', codeEn: '-2 ING',
      targetMode: 'single',
      desc: '隨機奪取一名玩家食材牌 2 張（若對方只有 1 張則奪取 1 張）。',
      descEn: 'Steal 2 random Ingredient cards from an opponent.'
    },

    // === 輔助用 (5 張) ===
    {
      id: 'tv', name: '上電視', pinyin: 'shàng-diàn-shì', en: 'Press Interview',
      type: 'support', count: 1, icon: 'fa-solid fa-video', code: '+3', codeEn: '+3',
      targetMode: 'self',
      desc: '節目採訪爆紅！立即從食材牌堆抽取 3 張食材牌。',
      descEn: 'TV fame! Draw 3 Ingredient cards immediately.'
    },
    {
      id: 'direct_farm', name: '產地直送', pinyin: 'chǎn-dì-zhí-sòng', en: 'Store Delivery',
      type: 'support', count: 1, icon: 'fa-solid fa-truck-fast', code: '∞', codeEn: '∞',
      targetMode: 'self',
      desc: '可先抽 1 張食材牌，本回合每做完一道菜可再多抽 1 張食材牌！',
      descEn: 'Draw 1 Ingredient now, plus 1 extra Ingredient after every dish cooked this turn!'
    },
    {
      id: 'english', name: 'YES! WE SPEAK ENGLISH', pinyin: 'YES! WE SPEAK ENGLISH', en: 'YES! WE SPEAK ENGLISH',
      type: 'support', count: 1, icon: 'fa-solid fa-language', code: '+1菜', codeEn: '+1 ORD',
      targetMode: 'self',
      desc: '可多翻開餐點牌 1 張（橫向擺放），此牌結帳完不能續補。',
      descEn: 'Flip 1 extra Order card sideways on the table (not replaced once cooked).'
    },
    {
      id: 'buddha', name: '佛跳牆', pinyin: 'fó-tiào-qiáng', en: 'Ah-Meat-Tofu',
      type: 'support', count: 1, icon: 'fa-solid fa-hands-praying', code: '替代', codeEn: 'SWAP',
      targetMode: 'self',
      desc: '菜或五穀雜糧可代替肉或海鮮使用（本回合不限次數），需雙手合十唸出「阿彌陀佛」。',
      descEn: 'Say "Ah-Meat-Tofu!" to substitute Veg/Grain for Meat/Seafood this turn (unlimited).'
    },
    {
      id: 'scallion', name: '買菜抓把蔥', pinyin: 'mǎi-cài-zhuā-bǎ-cōng', en: 'Greedy Scallion',
      type: 'support', count: 1, icon: 'fa-solid fa-seedling', code: '+2', codeEn: '+2?',
      targetMode: 'self',
      desc: '可先抽食材牌 1 張，若該張為菜（含爛菜），則加抽食材牌 2 張！',
      descEn: 'Draw 1 Ingredient; if it is Vegetable (even rotten), draw 2 additional Ingredients!'
    },

    // === 防禦用 (4 張) ===
    {
      id: 'gangster', name: '黑社會', pinyin: 'hēi-shè-huì', en: 'Gangster',
      type: 'defense', count: 1, icon: 'fa-solid fa-user-secret', code: '反彈', codeEn: 'REFLECT',
      targetMode: 'reaction',
      desc: '攻擊效果返回至攻擊者！（「衛生稽查」以外之所有攻擊皆可反彈）',
      descEn: 'Reflect any attack (except Hygiene Inspection) right back at the attacker!'
    },
    {
      id: 'idol', name: '夜市之光', pinyin: 'yè-shì-zhī-guāng', en: 'Market Idol',
      type: 'defense', count: 2, icon: 'fa-solid fa-award', code: '抵擋', codeEn: 'BLOCK',
      targetMode: 'reaction',
      desc: '「衛生稽查」以外之所有攻擊牌皆可抵擋。',
      descEn: 'Cancel any opponent attack (except Hygiene Inspection).'
    },
    {
      id: 'transfer', name: '有關係沒關係', pinyin: 'yǒu-guān-xì-méi-guān-xì', en: 'Thank You For Saving Me',
      type: 'defense', count: 1, icon: 'fa-solid fa-arrows-turn-right', code: '轉移', codeEn: 'SHIFT',
      targetMode: 'reaction',
      desc: '隨意指定第三方承受攻擊（只有兩人時，才可返回攻擊者）。若第三方出黑社會，反彈給轉移者。',
      descEn: 'Redirect an attack to a third player (in 2P mode, reflects to attacker).'
    }
  ];

  // 5 位 AI 夜市攤販角色（支援 2~6 人局）
  const AI_PROFILES = [
    {
      name: '阿明師', nameEn: 'Chef Ming',
      title: '熱炒快手', titleEn: 'Wok Master',
      icon: 'fa-solid fa-fire-burner', color: '#e05a47', aggression: 0.65
    },
    {
      name: '美鳳姐', nameEn: 'Auntie Feng',
      title: '巷口麵線王', titleEn: 'Noodle Queen',
      icon: 'fa-solid fa-crown', color: '#e6b44c', aggression: 0.78
    },
    {
      name: '阿土伯', nameEn: 'Uncle Tu',
      title: '老字號湯頭', titleEn: 'Soup Veteran',
      icon: 'fa-solid fa-mug-hot', color: '#4ea3d1', aggression: 0.55
    },
    {
      name: '珍奶妹', nameEn: 'Boba Mei',
      title: '夜市人氣王', titleEn: 'Market Star',
      icon: 'fa-solid fa-star', color: '#b565d9', aggression: 0.62
    },
    {
      name: '鐵板哥', nameEn: 'Teppan Jay',
      title: '海陸霸主', titleEn: 'Grill King',
      icon: 'fa-solid fa-utensils', color: '#3ea87b', aggression: 0.72
    }
  ];

  // 真人玩家代表色（最多 6 位全真人）
  const HUMAN_COLORS = ['#f0b429', '#e05a47', '#4ea3d1', '#63a63e', '#b565d9', '#e87a3e'];

  // 雙語取值輔助
  function isEn() {
    return window.I18N && window.I18N.getLang() === 'en';
  }
  function ingName(card) {
    const m = INGREDIENTS[card.typeId];
    if (!m) return card.name;
    if (isEn()) return card.rotten ? m.rottenEn : m.en;
    return card.rotten ? m.rottenName : m.name;
  }
  function ingMetaName(typeId) {
    const m = INGREDIENTS[typeId];
    return isEn() ? m.en : m.name;
  }
  function orderName(order) {
    return isEn() ? order.en : order.name;
  }
  function orderDesc(order) {
    return isEn() ? order.descEn : order.desc;
  }
  function specialName(sp) {
    return isEn() ? sp.en : sp.name;
  }
  function specialDesc(sp) {
    return isEn() ? sp.descEn : sp.desc;
  }
  function specialCode(sp) {
    return isEn() ? (sp.codeEn || '') : (sp.code || '');
  }
  function playerName(p) {
    if (!p) return '';
    return isEn() ? (p.nameEn || p.name) : p.name;
  }

  function createIngredientDeck() {
    const deck = [];
    let uid = 1;
    Object.values(INGREDIENTS).forEach((ing) => {
      for (let i = 0; i < ing.total; i++) {
        const isRotten = i < ing.rottenCount;
        deck.push({
          uid: `ing_${uid++}`,
          kind: 'ingredient',
          typeId: ing.id,
          name: isRotten ? ing.rottenName : ing.name,
          rotten: isRotten,
          special: !!ing.special
        });
      }
    });
    return shuffle(deck);
  }

  function createOrderDeck() {
    const deck = ORDERS.map((o) => ({
      ...o,
      uid: o.id,
      kind: 'order',
      ingredients: [...o.ingredients]
    }));
    return shuffle(deck);
  }

  function createSpecialDeck() {
    const deck = [];
    let uid = 1;
    SPECIALS.forEach((sp) => {
      for (let i = 0; i < sp.count; i++) {
        deck.push({
          ...sp,
          uid: `sp_${uid++}`,
          kind: 'special'
        });
      }
    });
    return shuffle(deck);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return {
    INGREDIENTS,
    ORDERS,
    SPECIALS,
    AI_PROFILES,
    HUMAN_COLORS,
    ingName,
    ingMetaName,
    orderName,
    orderDesc,
    specialName,
    specialDesc,
    specialCode,
    playerName,
    createIngredientDeck,
    createOrderDeck,
    createSpecialDeck,
    shuffle
  };
})();
