/**
 * 《夜市人蔘 YES! GINSENG》完整三語遊戲與文化資料庫（繁體中文 / English / 한국어）
 * 100% 依據實體桌遊牌卡與《夜市人蔘》官方規則書校正，
 * 完整收錄 26 道臺灣夜市小吃的文化典故、傳統作法、點餐撇步與中英韓三語疊加資料。
 */

window.GAME_DATA = (function () {
  const INGREDIENTS = {
    grain: {
      id: 'grain',
      name: '五穀雜糧',
      short: '穀',
      shortEn: 'GR',
      shortKo: '곡',
      rottenName: '腐壞五穀',
      rottenEn: 'Rotten Grain',
      rottenKo: '상한 곡물',
      en: 'RICE / FLOUR',
      ko: '곡물/면',
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
      shortKo: '국',
      rottenName: '酸掉的湯',
      rottenEn: 'Rotten Soup',
      rottenKo: '쉰 국물',
      en: 'SOUP',
      ko: '국물',
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
      shortKo: '채',
      rottenName: '爛菜',
      rottenEn: 'Rotten Veg',
      rottenKo: '상한 채소',
      en: 'VEGETABLE',
      ko: '채소',
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
      shortKo: '해',
      rottenName: '變質海鮮',
      rottenEn: 'Rotten Seafood',
      rottenKo: '상한 해물',
      en: 'SEAFOOD',
      ko: '해산물',
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
      shortKo: '육',
      rottenName: '壞肉',
      rottenEn: 'Rotten Meat',
      rottenKo: '상한 고기',
      en: 'MEAT',
      ko: '고기',
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
      shortKo: '삼',
      rottenName: '人蔘',
      rottenEn: 'GINSENG',
      rottenKo: '흑인삼',
      en: 'GINSENG',
      ko: '흑인삼',
      color: '#202229',
      light: '#e6c167',
      dark: '#101217',
      icon: 'fa-solid fa-seedling',
      total: 2,
      rottenCount: 0,
      special: true
    }
  };

  // 26 道臺灣小吃餐點牌（100% 依原版《夜市人蔘》規則書第 24–49 頁編撰三語文化資料）
  const ORDERS = [
    // === 1 元餐點 (12 張) ===
    {
      id: 'ord_01', name: '蛤蜊湯', pinyin: 'gé-lí-tāng', en: 'Clam Soup', ko: '바지락국',
      taiwanese: false, price: 1, ingredients: ['soup', 'seafood'],
      icon: 'fa-solid fa-bowl-food', accent: '#2c80b8',
      region: '全臺家常', regionEn: 'Nationwide', regionKo: '대만 전역',
      desc: '臺灣隨處可見的清爽湯品，蛤蜊搭配薑絲、米酒與九層塔提味，鮮甜開胃。',
      descEn: 'A popular refreshing soup in Taiwan made with fresh clams, ginger, basil, and rice wine.',
      descKo: '대만 어디서나 쉽게 볼 수 있는 시원한 바지락국으로, 생강채와 바질, 미주로 풍미를 살립니다.',
      story: '蛤蜊湯是臺灣小吃攤與熱炒店最受歡迎的清爽湯品。臺灣沿海養殖文蛤肥美鮮甜，不需繁複調味，單靠食材本身的海味便能煮出澄澈甘甜的湯頭。',
      storyEn: 'Clam Soup is a beloved everyday soup found across Taiwan. Thanks to fresh coastal clams, it needs minimal seasoning to achieve a naturally sweet, ocean-fresh broth.',
      storyKo: '대만 야시장과 식당에서 가장 사랑받는 깔끔한 국물 요리입니다. 신선한 바지락 본연의 감칠맛이 살아 있어 자극적이지 않고 시원합니다.',
      recipe: '基本材料是蛤蜊、鹽、薑切絲、九層塔與少許米酒。清水煮滾後放入蛤蜊，待蛤蜊打開加鹽關火，加入米酒提味，再沖入備好的薑絲與九層塔碗中即完成。',
      recipeEn: 'Add clams to boiling water until most shells open, season with salt and rice wine, turn off heat, and pour into a bowl with shredded ginger and fresh basil.',
      recipeKo: '끓는 물에 바지락을 넣고 입이 벌어지면 소금과 미주로 간을 한 뒤 불을 끄고, 생강채와 타이완 바질이 담긴 그릇에 부어 완성합니다.',
      tip: '趁熱喝最能品嚐九層塔與米酒的清香；在夜市常與滷肉飯、蚵仔煎一起搭配享用。',
      tipEn: 'Best enjoyed piping hot to savor the basil aroma; pairs wonderfully with braised pork rice or oyster omelet.',
      tipKo: '뜨거울 때 마셔야 바질 향과 시원한 국물 맛이 최고입니다. 루로우판이나 굴전과 찰떡궁합!'
    },
    {
      id: 'ord_02', name: '魷魚羹', pinyin: 'yóu-yú-gēng', en: 'Cuttlefish Thick Soup', ko: '오징어 걸쭉국',
      taiwanese: false, price: 1, ingredients: ['soup', 'seafood'],
      icon: 'fa-solid fa-bowl-food', accent: '#b8682c',
      region: '全臺夜市', regionEn: 'Night Market Classic', regionKo: '야시장 대표',
      desc: '勾芡重口味湯品，結合魚漿、脆口魷魚、九層塔、烏醋與香菜，層次豐富。',
      descEn: 'A savory thickened soup featuring crunchy cuttlefish, fish paste, basil, bamboo shoots, and black vinegar.',
      descKo: '전분으로 걸쭉하게 끓인 진한 국물에 어묵 반죽, 쫄깃한 오징어, 흑식초와 고수를 곁들입니다.',
      story: '「羹」是臺灣特有的勾芡重口味湯品文化，能長時間保溫並讓湯汁緊密包裹食材。臺灣人享用羹湯時，總習慣依個人喜好再加白胡椒、烏醋與香菜提升層次。',
      storyEn: 'Thickened "geng" soups are a hallmark of Taiwanese street dining. Locals love customizing every bowl with extra white pepper, black vinegar, and cilantro.',
      storyKo: '대만의 "겅(羹)"은 전분을 풀어 진하고 따뜻하게 먹는 걸쭉한 국물 문화입니다. 취향에 따라 백후추, 흑식초, 고수를 듬뿍 넣어 먹습니다.',
      recipe: '基本材料為魚漿、魷魚、九層塔、蒜末、紅蘿蔔絲、黑木耳絲、筍絲、雞高湯與太白粉水。高湯煮滾配料後勾芡，加入裹漿魷魚煮熟起鍋。',
      recipeEn: 'Simmer shredded carrots, black fungus, bamboo shoots, and garlic in chicken stock, thicken with starch water, and cook fish-paste-coated cuttlefish with basil.',
      recipeKo: '닭 육수에 당근, 목이버섯, 죽순채, 다진 마늘을 넣고 끓이다 전분물로 농도를 맞춘 뒤 어묵을 입힌 오징어와 바질을 넣어 완성합니다.',
      tip: '桌上的烏醋與辣椒醬是靈魂！加一小匙烏醋能讓鮮甜湯頭瞬間提味不膩口。',
      tipEn: 'Add a splash of black vinegar from the stall table—it brightens the savory broth instantly!',
      tipKo: '테이블에 놓인 대만 흑식초(우추)를 한 스푼 넣으면 감칠맛이 확 살아납니다.'
    },
    {
      id: 'ord_03', name: '青菜湯', pinyin: 'qīng-cài-tāng', en: 'Vegetable Soup', ko: '청경채 야채국',
      taiwanese: false, price: 1, ingredients: ['soup', 'veg'],
      icon: 'fa-solid fa-leaf', accent: '#63a63e',
      region: '全臺小吃攤', regionEn: 'Everyday Stall', regionKo: '대만 분식집',
      desc: '作法簡單清爽的小湯品，常使用青江菜或俗稱「A菜」的臺灣萵苣。',
      descEn: 'A simple, light soup typically cooked with seasonal leafy greens like bok choy or Taiwanese lettuce.',
      descKo: '청경채나 대만 상추(A채)로 담백하고 깔끔하게 끓여낸 소박한 채소국입니다.',
      story: '店家最常使用青江菜或「A菜」。「A菜」名稱來自臺語「萵仔菜（e-á-tshài）」的諧音，因為好寫好記，在臺灣便成為本土萵苣的趣味代稱。',
      storyEn: 'Often made with bok choy or "A-tsai"—a playful local nickname derived from the Taiwanese pronunciation "e-a-tshai" for Taiwanese leafy lettuce.',
      storyKo: '대만 식당에서 흔히 쓰는 "A채"는 대만어 발음(e-a-tshai)에서 유래한 애칭으로, 적기 쉽고 부르기 편해 대만 상추의 대명사가 되었습니다.',
      recipe: '作法簡單清爽：先熱鍋將香菇炒香，倒入高湯煮滾，接著放入新鮮青菜燙熟，再加入適量鹽巴調味即可上桌。',
      recipeEn: 'Stir-fry mushrooms in a hot oiled pan until fragrant, pour in boiling broth, blanch fresh leafy greens briefly, season with salt, and serve.',
      recipeKo: '달군 팬에 표고버섯을 볶아 향을 낸 뒤 육수를 붓고 끓여, 신선한 채소를 살짝 데치고 소금으로 간해 완성합니다.',
      tip: '吃多了油炸或重口味夜市小吃，來一碗熱呼呼的青菜湯最能解膩清爽！',
      tipEn: 'The ideal palate cleanser after indulging in crispy fried night market snacks.',
      tipKo: '기름진 야시장 튀김 요리를 먹은 뒤 속을 깔끔하게 달래주는 최고의 국물입니다.'
    },
    {
      id: 'ord_04', name: '麻薏湯', pinyin: 'muâ-ínn-thng', en: 'Jute Soup', ko: '황마 잎국 (마이탕)',
      taiwanese: true, price: 1, ingredients: ['soup', 'veg'],
      icon: 'fa-solid fa-seedling', accent: '#2f7d44',
      region: '臺灣中部・臺中', regionEn: 'Central Taiwan', regionKo: '대만 중부 특산',
      desc: '臺灣中部夏季限定翡翠綠名產，以黃麻嫩芽搓揉去苦後搭地瓜熬煮，清肝降火。',
      descEn: 'A jade-green summer delicacy from central Taiwan made with tender jute leaves and sweet potato cubes.',
      descKo: '대만 중부 여름 한정 별미로, 어린 황마 잎의 쓴맛을 빼고 고구마와 함께 끓인 비취빛 국입니다.',
      story: '臺灣中部（尤其是臺中）極具代表性的夏季地方小吃，也寫作「麻芛」或「蔴薏」。早期麻薏略帶苦味，經品種改良後口感較為甘甜，富含營養且清肝降火。',
      storyEn: 'A treasured jade-green summer specialty of central Taiwan (especially Taichung). Made from young jute shoots, it is famed for cooling the body and aiding liver health.',
      storyKo: '대만 중부(특히 타이중)의 여름철 대표 향토 음식입니다. 황마의 어린 싹으로 만들며 열을 내리고 영양가가 풍부한 건강식입니다.',
      recipe: '取黃麻嫩葉在水中搓揉 3 到 4 次洗去苦味備用；鍋內將柴魚高湯煮滾，放入地瓜塊煮軟後加入麻薏與鹽調味，最後以太白粉水勾芡至滑順濃稠即可。',
      recipeEn: 'Rub tender jute leaves in water 3–4 times to wash away bitterness. Boil sweet potato cubes in bonito broth until soft, add jute leaves and salt, then lightly thicken.',
      recipeKo: '어린 황마 잎을 물에 3~4번 비벼 쓴맛을 뺀 뒤, 가쓰오부시 육수에 고구마를 삶아 황마 잎과 소금을 넣고 전분으로 부드럽게 걸쭉하게 끓입니다.',
      tip: '這道菜常用臺語點餐（muâ-ínn-thng）！夏天冰涼著喝再拌入白飯，是老臺中人的銷魂吃法。',
      tipEn: 'Usually ordered in Taiwanese (mua-inn-thng). Locals love chilling it in summer and pouring it over rice!',
      tipKo: '대만어(무아인틍)로 주문하는 현지 음식! 여름에는 차갑게 식혀 밥에 말아 먹는 것이 타이중 현지인의 별미입니다.'
    },
    {
      id: 'ord_05', name: '浮水魚羹', pinyin: 'fú-shuǐ-yú-gēng', en: 'Milkfish Thick Soup', ko: '밀크피시 어묵국',
      taiwanese: false, price: 1, ingredients: ['soup', 'seafood'],
      icon: 'fa-solid fa-fish', accent: '#3a7ca5',
      region: '臺南府城', regionEn: 'Tainan Specialty', regionKo: '타이난 명물',
      desc: '將虱目魚肉包覆於魚漿中，投入滾水煮熟後會浮起，故稱「浮水魚羹」。',
      descEn: 'Milkfish strips wrapped in fish paste that float when cooked, served in a rich thickened broth with vinegar.',
      descKo: '밀크피시(사목어) 살을 어묵 반죽으로 감싸 끓는 물에 삶으면 둥둥 떠오른다고 해서 붙은 이름입니다.',
      story: '臺南府城最具代表性的傳統小吃之一。因魚漿包覆塊狀虱目魚肉捏成條狀後丟入滾水，煮熟便會自然浮上水面，因而得名「浮水魚羹」。',
      storyEn: 'A celebrated Tainan classic. Fish paste wrapped around chunks of fresh milkfish floats to the surface of boiling water once perfectly cooked—hence "floating fish" soup.',
      storyKo: '타이난을 대표하는 전통 미식입니다. 생선살을 감싼 어묵을 끓는 물에 넣었을 때 익으면 물 위로 떠오르는 모습에서 유래했습니다.',
      recipe: '以虱目魚肉切塊包入魚漿煮熟；湯底用虱目魚骨熬煮高湯，加鹽與少許糖調味後以地瓜粉勾芡，起鍋佐香菜、薑絲與黑醋伴食。',
      recipeEn: 'Shape milkfish chunks inside fish paste and boil until floating. Thicken milkfish-bone broth with sweet potato starch, season with salt and sugar, and top with ginger, cilantro, and black vinegar.',
      recipeKo: '밀크피시 뼈로 우린 육수에 소금과 설탕으로 간을 하고 고구마 전분으로 농도를 낸 뒤, 익힌 어묵과 생강채, 고수, 흑식초를 곁들입니다.',
      tip: '南臺灣口味偏甘甜，淋上一點黑醋與薑絲能完美平衡甜鮮風味！',
      tipEn: 'Tainan broth carries a signature gentle sweetness—add ginger strips and black vinegar for perfect balance.',
      tipKo: '타이난 특유의 달짝지근한 국물에 생강채와 흑식초를 곁들이면 환상적인 조화를 이룹니다.'
    },
    {
      id: 'ord_06', name: '蛋花湯', pinyin: 'dàn-huā-tāng', en: 'Egg Drop Soup', ko: '계란국',
      taiwanese: false, price: 1, ingredients: ['soup', 'veg'],
      icon: 'fa-solid fa-egg', accent: '#e6b422',
      region: '全臺家常', regionEn: 'Home-Style Classic', regionKo: '대만 가정식',
      desc: '臺灣最經典的家常湯品，滾燙高湯畫圓倒入蛋液成雲狀蛋花，撒上蔥花即完成。',
      descEn: 'The simplest home-style soup in Taiwan: wispy egg ribbons swirled into hot broth with chopped scallions.',
      descKo: '가장 친숙한 대만 가정식 국물로, 끓는 육수에 계란을 둥글게 풀어 구름 같은 계란꽃을 만듭니다.',
      story: '蛋花湯是臺灣每個家庭與麵攤都少不了的國民湯品，簡單樸實卻溫暖人心。只要高湯鮮、火候對，一碗金黃飄逸的蛋花湯便能讓人瞬間滿足。',
      storyEn: 'The most comforting, quintessential home-style soup in Taiwan. Found in every noodle stall and family kitchen, it turns humble eggs into silky golden ribbons.',
      storyKo: '대만의 모든 가정과 국숫집에서 빠지지 않는 소울 푸드입니다. 소박하지만 부드러운 계란꽃과 파 향이 마음을 따뜻하게 해줍니다.',
      recipe: '基本材料為雞蛋、蔥花、雞高湯、白胡椒與鹽。高湯煮開後一手畫圓緩慢倒入蛋液、一手順時針攪動成雲狀蛋花，調味後關火下蔥花即完成。',
      recipeEn: 'Bring chicken broth to a boil, slowly swirl in beaten eggs while stirring clockwise to form delicate clouds, season with salt and white pepper, and top with green onions.',
      recipeKo: '닭 육수가 끓으면 풀어둔 계란을 원을 그리며 천천히 붓고 시계 방향으로 저어 계란꽃을 만든 뒤, 소금·백후추로 간하고 파를 뿌립니다.',
      tip: '點碗蛋花湯時常可加點「貢丸」升級成貢丸蛋花湯，是臺灣麵攤隱藏人氣點法！',
      tipEn: 'At Taiwanese noodle stalls, try ordering it with pork meatballs ("Gongwan Egg Drop Soup") for an instant upgrade!',
      tipKo: '대만 국숫집에서는 어묵이나 고기 완자(공완)를 추가해 먹는 것이 현지인들의 인기 조합입니다.'
    },
    {
      id: 'ord_07', name: '蚵仔煎', pinyin: 'ô-á-tsian', en: 'Oyster Omelet', ko: '굴전 (오아젠)',
      taiwanese: true, price: 1, ingredients: ['grain', 'seafood'],
      icon: 'fa-solid fa-fire-burner', accent: '#d15a36',
      region: '全臺夜市人氣王', regionEn: 'Night Market Icon', regionKo: '야시장 대표 메뉴',
      desc: '平底鍋煎香蚵仔、蛋液與小白菜，淋太白粉水勾芡並佐特製甜辣醬，外酥內 Q。',
      descEn: 'Night market icon: plump oysters, egg, greens, and chewy starch batter topped with sweet-and-savory sauce.',
      descKo: '신선한 굴과 달걀, 청경채에 전분물을 부어 겉바속촉으로 부친 뒤 특제 달콤매콤 소스를 뿌린 야시장 명물!',
      story: '源於中國東南沿海地區的小吃，香港稱「蠔餅」、星馬寫作「蠔煎」，臺灣則以臺語稱之為「蚵仔煎（ô-á-tsian）」，是外國旅客造訪臺灣夜市票選必吃的經典代表。',
      storyEn: 'Originating from the Southeast coast (known as oyster cake in Hong Kong and Singapore), Taiwan\'s version stands out for its chewy starch crust and signature rosy sweet-savory glaze.',
      storyKo: '동남 연안에서 유래해 대만에서 독자적으로 발전한 대표 야시장 요리입니다. 쫀득한 전분 반죽과 분홍빛 특제 소스의 조화가 일품입니다.',
      recipe: '先用平底鐵板把油燒熱，放入鮮蚵、蛋液與時蔬（小白菜或茼蒿），再淋上地瓜粉／太白粉水勾芡煎至微焦定型，盛盤淋上特製海山甜辣醬即可食用。',
      recipeEn: 'Sizzle fresh oysters, eggs, and leafy greens on an oiled griddle, pour in starch batter until glossy and crisp-edged, and finish generously with sweet-and-spicy sauce.',
      recipeKo: '달군 철판에 굴, 달걀, 채소를 볶다가 전분물을 부어 가장자리가 바삭하게 익으면 접시에 담아 특제 달콤매콤 소스를 듬뿍 뿌립니다.',
      tip: '點餐請直接唸臺語「ô-á-tsian」！不吃蚵仔也可以點蝦仁煎或蛋煎喔。',
      tipEn: 'Order it in Taiwanese as "o-a-tsian"! Not into oysters? Most stalls also offer shrimp or plain egg versions.',
      tipKo: '대만어로 "오아젠"이라고 주문하세요! 굴을 못 드신다면 새우전(샤런젠)으로 주문할 수도 있습니다.'
    },
    {
      id: 'ord_08', name: '臭豆腐', pinyin: 'chòu-dòu-fǔ', en: 'Stinky Tofu', ko: '취두부',
      taiwanese: false, price: 1, ingredients: ['grain', 'veg'],
      icon: 'fa-solid fa-cubes', accent: '#c9882c',
      region: '全臺夜市靈魂', regionEn: 'Night Market Soul', regionKo: '야시장의 영혼',
      desc: '經發酵的豆腐酥炸至金黃，佐以酸甜爽脆臺式泡菜，聞起來臭、吃起來奇香無比。',
      descEn: 'Deep-fried fermented tofu with a bold aroma and crispy golden crust, paired with sweet pickled cabbage.',
      descKo: '발효 두부를 바삭하게 튀겨 새콤달콤한 대만식 김치와 함께 먹는 요리. 냄새는 강하지만 맛은 고소합니다.',
      story: '一般作法是將較老的莧菜浸泡在洗米水中，於常溫下發酵產生獨特氣味再浸泡豆腐。相傳臺灣臭豆腐由湖南籍老兵李名於 1949 年帶入，如今演變出酥炸、炭烤、清蒸、麻辣等豐富吃法。',
      storyEn: 'Fermented in a brine of rice water and Chinese spinach, Stinky Tofu was reportedly brought to Taiwan in 1949 by veteran Ming Lee from Hunan. Today it comes fried, grilled, steamed, or in spicy hot pot.',
      storyKo: '쌀뜨물과 채소로 발효시킨 두부로, 1949년 대만에 전해져 현지화되었습니다. 튀김 외에도 숯불구이, 찜, 마라탕 등 다양한 형태로 즐깁니다.',
      recipe: '將發酵臭豆腐入油鍋炸至外皮金黃酥脆，剪開或戳洞填入蒜蓉醬油膏與辣椒，旁佐酸甜不辣的臺式高麗菜泡菜以解油膩。',
      recipeEn: 'Deep-fry fermented tofu until airy and golden-crisp, drizzle with garlic soy glaze and chili, and serve alongside crunchy sweet-and-sour Taiwanese pickled cabbage.',
      recipeKo: '발효 두부를 황금빛으로 바삭하게 튀긴 뒤 마늘 간장 소스를 뿌리고, 느끼함을 잡아주는 새콤한 대만식 양배추 절임을 곁들입니다.',
      tip: '最道地的吃法是把臺式泡菜直接「塞進」酥脆的臭豆腐洞裡，一口咬下外酥內嫩超驚豔！',
      tipEn: 'Pro move: stuff the crisp pickled cabbage directly inside the hole of the fried tofu and eat it in one glorious bite!',
      tipKo: '꿀팁: 바삭한 취두부 가운데 구멍에 대만식 양배추 절임을 쏙 넣어 한입에 먹으면 냄새는 줄고 풍미가 폭발합니다!'
    },
    {
      id: 'ord_09', name: '花枝丸', pinyin: 'huā-zhī-wán', en: 'Fried Squid Balls', ko: '오징어 볼 튀김',
      taiwanese: false, price: 1, ingredients: ['grain', 'seafood'],
      icon: 'fa-solid fa-circle-dot', accent: '#d4822a',
      region: '澎湖・全臺夜市', regionEn: 'Penghu & Night Markets', regionKo: '펑후·야시장 인기',
      desc: '新鮮花枝切塊絞泥揉成球狀油炸，脆口彈牙、海味十足，煎煮炒炸皆百搭。',
      descEn: 'Bouncy, crispy deep-fried squid paste balls packed with fresh ocean flavor, beloved by all ages.',
      descKo: '신선한 갑오징어 살을 다져 둥글게 빚어 튀긴 완자로, 탱글탱글한 식감과 진한 바다 향이 일품입니다.',
      story: '花枝丸脆口彈牙又帶著鮮甜海味，是臺灣大人小孩都愛的經典美食，其中又以澎湖手工現打、咬得到大塊花枝丁的花枝丸最負盛名。',
      storyEn: 'Bouncy, crisp, and bursting with ocean sweetness, squid balls are loved by every generation in Taiwan—especially Penghu\'s hand-beaten balls studded with real squid chunks.',
      storyKo: '남녀노소 누구나 좋아하는 대만 대표 간식으로, 특히 펑후(Penghu) 지역의 큼직한 오징어 살이 씹히는 수제 오징어 볼이 유명합니다.',
      recipe: '將新鮮花枝切塊絞成泥狀，拌入少許豬油、胡椒粉、糖、米酒與鹽調味，以 OK 手勢掐出圓球定型。煎、煮、炒、炸、燒烤、滷味幾乎無所不能。',
      recipeEn: 'Blend fresh squid into paste with a touch of lard, pepper, sugar, rice wine, and salt; squeeze into balls and deep-fry, grill, or simmer in soup.',
      recipeKo: '신선한 갑오징어를 다져 소금, 설탕, 후추, 미주로 간한 뒤 동그랗게 빚어 튀기거나 구이·탕 등 다양한 요리에 활용합니다.',
      tip: '夜市現炸花枝丸串起來灑上白胡椒鹽，邊走邊吃最對味！小心剛起鍋非常燙口。',
      tipEn: 'Enjoy them skewered fresh from the fryer dusted with pepper salt—watch out, they are piping hot inside!',
      tipKo: '갓 튀겨낸 꼬치에 후추소금을 솔솔 뿌려 길거리에서 먹으면 최고! 속이 뜨거우니 조심하세요.'
    },
    {
      id: 'ord_10', name: '水煎包', pinyin: 'shuǐ-jiān-bāo', en: 'Pan-Fried Bun', ko: '물군만두 (수이전바오)',
      taiwanese: false, price: 1, ingredients: ['grain', 'veg'],
      icon: 'fa-solid fa-bread-slice', accent: '#a87d43',
      region: '全臺街頭巷尾', regionEn: 'Street Corner Favorite', regionKo: '대만 길거리 간식',
      desc: '薄麵皮包覆韭菜、高麗菜與冬粉，於平底圓鍋半蒸半煎，底部焦香酥脆、內餡清甜。',
      descEn: 'Crispy-bottomed steamed-and-fried buns stuffed with sweet cabbage, chives, and glass noodles.',
      descKo: '얇은 피에 부추, 양배추, 당면을 가득 채워 팬에 물을 붓고 찌듯 구워 바닥은 바삭하고 속은 촉촉합니다.',
      story: '臺灣水煎包常見於下午茶點心攤與夜市入口，特色在於「半蒸半煎」的工法：上方麵皮鬆軟、底部焦脆，冬粉完美鎖住高麗菜與韭菜的鮮甜湯汁。',
      storyEn: 'A beloved afternoon and night market snack cooked half-steamed, half-pan-fried so the top stays fluffy while the bottom turns golden-crisp and glass noodles soak up all the savory juices.',
      storyKo: '오후 간식이나 야시장 입구에서 흔히 볼 수 있는 메뉴로, 윗면은 부드럽고 바닥은 바삭하게 익혀 당면이 채소 육즙을 가득 머금고 있습니다.',
      recipe: '內餡以韭菜、高麗菜為主，加入冬粉、炒蛋皮與蝦米提味。排入平底圓鍋後加水至包子一半高度、加蓋以中小火燜煎至收乾，煎出金黃脆底即大功告成。',
      recipeEn: 'Stuff thin dough with cabbage, chives, glass noodles, egg strips, and dried shrimp. Arrange in a round pan, add water halfway up, cover, and cook until dry and crisp on the bottom.',
      recipeKo: '양배추, 부추, 당면, 지단, 건새우 소를 채워 팬에 담고 물이 절반쯤 차게 부어 뚜껑을 덮고 물이 다 증발해 바닥이 노릇해질 때까지 굽습니다.',
      tip: '老闆常在攤前擺著甜辣醬與蒜蓉醬油，敢吃辣的話把尖嘴瓶直接「戳進」包子擠一點醬汁超內行！',
      tipEn: 'Locals insert the squeeze-bottle nozzle right into the bun to inject sweet chili or garlic soy sauce inside!',
      tipKo: '소스 통의 뾰족한 입구를 만두 속에 살짝 찔러 달콤매콤 소스를 넣어 먹는 것이 대만 현지인 스타일!'
    },
    {
      id: 'ord_11', name: '蚵仔麵線', pinyin: 'ô-á-mī-suànn', en: 'Oyster Thin Noodles', ko: '굴 곱창국수 (오아미엔센)',
      taiwanese: true, price: 1, ingredients: ['grain', 'seafood'],
      icon: 'fa-solid fa-bowl-rice', accent: '#9e5430',
      region: '全臺經典必吃', regionEn: 'Taiwanese Signature', regionKo: '대만 필수 미식',
      desc: '烘烤紅麵線加入柴魚高湯勾芡，放入鮮美蚵仔、蒜泥、烏醋與香菜，暖胃又道地。',
      descEn: 'Fragrant roasted vermicelli simmered in thick bonito broth with fresh oysters, garlic, and black vinegar.',
      descKo: '구운 붉은 소면을 가쓰오부시 육수에 걸쭉하게 끓여 신선한 굴, 마늘, 흑식초, 고수를 얹은 대만 대표 국수!',
      story: '蚵仔麵線使用經乾燥與高溫烘烤製成的「紅麵線」，久煮不爛且香氣獨特。早年臺灣沿海盛產蚵仔，農婦就地取材煮給耕農當點心，後來演變出加入滷大腸、肉羹的「綜合麵線」。',
      storyEn: 'Made with roasted red vermicelli that stays silky without turning mushy. Born in coastal farming towns as a hearty snack for workers, it later evolved to include braised pork intestine as well.',
      storyKo: '오래 끓여도 퍼지지 않는 붉은 소면을 사용합니다. 옛날 해안가 농부들의 새참에서 유래했으며, 오늘날에는 굴과 쫄깃한 곱창을 함께 넣는 조합이 인기입니다.',
      recipe: '紅麵線泡水備用；柴魚高湯煮滾後放入麵線並以澱粉勾芡，加入蒜泥、醬油、烏醋及香油提香，最後放入汆燙裹粉的鮮蚵與滷大腸，撒上香菜完成。',
      recipeEn: 'Simmer soaked red vermicelli in bonito stock, thicken with starch, season with mashed garlic, soy sauce, black vinegar, and sesame oil, and top with poached oysters and cilantro.',
      recipeKo: '가쓰오부시 육수에 붉은 소면을 넣고 걸쭉하게 끓인 뒤, 다진 마늘·간장·흑식초·참기름으로 간하고 데친 굴과 고수를 얹어 완성합니다.',
      tip: '臺灣人吃蚵仔麵線習慣用「湯匙」舀著吃，不用筷子！點餐可唸臺語「ô-á-mī-suànn」。',
      tipEn: 'Eat it with a spoon, not chopsticks! Order in Taiwanese as "o-a-mi-suann" and add chili oil if you like heat.',
      tipKo: '젓가락이 아니라 숟가락으로 떠먹는 것이 정석! 고수를 못 드시면 "부야오 샹차이(不要香菜)"라고 말하세요.'
    },
    {
      id: 'ord_12', name: '潤餅', pinyin: 'rùn-bǐng', en: 'Steamed Spring Roll', ko: '대만식 춘권 (룬빙)',
      taiwanese: false, price: 1, ingredients: ['grain', 'veg'],
      icon: 'fa-solid fa-scroll', accent: '#6d944e',
      region: '清明節・傳統市場', regionEn: 'Qingming Heritage', regionKo: '전통 절기 별미',
      desc: '薄如紙且具彈性的麵皮包覆豆乾、豆芽菜、高麗菜等配料，撒上花生糖粉，清爽順口。',
      descEn: 'Paper-thin wheat crepe wrapped around crisp vegetables, dried tofu, and sweet peanut sugar powder.',
      descKo: '종이처럼 얇고 쫄깃한 밀전병에 아삭한 채소, 건두부, 달콤한 땅콩가루를 듬뿍 말아낸 건강한 롤입니다.',
      story: '「清明」是二十四節氣之一，臺灣傳統習俗在清明節全家團聚吃潤餅（又稱春捲）。因為內餡滿載爽脆蔬菜且不經油炸，清爽無負擔，在夜市也非常受女性與養生族歡迎。',
      storyEn: 'Traditionally eaten during the Qingming Festival, Taiwanese spring rolls are un-fried and packed with fresh crisp vegetables—making them a light, refreshing favorite at night markets.',
      storyKo: '청명절에 온 가족이 모여 먹는 전통 음식이자 야시장의 인기 건강식입니다. 튀기지 않고 신선한 채소를 가득 넣어 담백합니다.',
      recipe: '以濕麵團在熱鐵盤上快速「擦」出薄如紙卻富彈性的餅皮；依序鋪上汆燙放涼的高麗菜、豆芽菜、紅蘿蔔絲、豆乾、蛋酥與紅糟肉，最後灑滿香甜花生糖粉捲起即成。',
      recipeEn: 'Brush wheat batter onto a hot griddle to make paper-thin elastic crepes, layer with blanched cabbage, bean sprouts, carrots, dried tofu, and sweet peanut powder, then roll tightly.',
      recipeKo: '뜨거운 철판에 얇게 구운 밀전병 위에 데친 양배추, 숙주, 당근, 건두부, 달콤한 땅콩 설탕가루를 듬뿍 올려 돌돌 말아 완성합니다.',
      tip: '花生糖粉的甜度都可以客製化（無糖／半糖／正常），拿到後趁餅皮還沒被菜汁浸濕前快吃最棒！',
      tipEn: 'You can customize the peanut sugar level! Eat it fresh before the crisp vegetable juices soften the delicate wrapper.',
      tipKo: '땅콩 설탕가루의 당도를 조절할 수 있습니다. 채소 물기가 피를 적시기 전에 바로 드시는 것이 가장 맛있습니다!'
    },

    // === 2 元餐點 (8 張) ===
    {
      id: 'ord_13', name: '蔥油餅', pinyin: 'cōng-yóu-bǐng', en: 'Scallion Pancake', ko: '파전병 (총유빙)',
      taiwanese: false, price: 2, ingredients: ['grain', 'grain', 'veg'],
      icon: 'fa-solid fa-stroopwafel', accent: '#5f8f3d',
      region: '宜蘭三星・全臺', regionEn: 'Yilan Sanxing & Beyond', regionKo: '이란 삼성파 명물',
      desc: '麵皮鋪滿宜蘭三星蔥花煎至兩面金黃酥脆，臺式吃法常加蛋加辣，外酥內層次分明。',
      descEn: 'Flaky golden pan-fried dough folded with fragrant Yilan scallions; often enjoyed with a fried egg.',
      descKo: '향긋한 대만 삼성파를 듬뿍 넣어 겹겹이 바삭하게 구워낸 전병으로, 달걀과 매콤한 소스를 추가해 먹습니다.',
      story: '起源於北方麵食，傳入臺灣後結合在地特產「宜蘭三星蔥」（蔥白長、鮮甜多汁），發展出酥脆層次豐富的臺式街頭蔥油餅與炸彈蔥油餅。',
      storyEn: 'Originally from northern China, Taiwan elevated Scallion Pancakes using world-famous sweet, juicy scallions from Sanxing in Yilan, creating flaky street-food perfection.',
      storyKo: '북방 면 요리에서 유래해 대만 이란(Yilan)의 특산물인 달콤하고 아삭한 "삼성파"와 만나 대만식 길거리 별미로 재탄생했습니다.',
      recipe: '將細蔥切成蔥花，麵團等分擀開鋪平，抹油撒鹽與滿滿蔥花後捲起盤成圓餅，熱油鍋煎至兩面金黃焦香即可上桌。臺式吃法最常「加蛋加九層塔加辣」。',
      recipeEn: 'Fold oil, salt, and minced scallions into layered dough, pan-fry in hot oil until flaky and golden brown, and optionally top with a crispy fried egg and chili sauce.',
      recipeKo: '반죽에 기름, 소금, 다진 파를 듬뿍 넣어 돌돌 말아 납작하게 편 뒤, 달군 팬에 앞뒤로 노릇하고 바삭하게 구워냅니다.',
      tip: '一定要點「加蛋（jiā dàn）」！酥脆餅皮夾著半熟蛋與蒜蓉醬油膏，香氣逼人。',
      tipEn: 'Always ask for "jia dan" (add egg)—the crispy layers hugging a runny egg and garlic soy glaze are unbeatable!',
      tipKo: '주문할 때 "지아단(加蛋, 계란 추가)"을 외치세요! 바삭한 전병과 촉촉한 계란의 궁합이 예술입니다.'
    },
    {
      id: 'ord_14', name: '鹹湯圓', pinyin: 'xián-tāng-yuán', en: 'Savory Rice Balls', ko: '짭짤한 새알심국 (셴탕위안)',
      taiwanese: false, price: 2, ingredients: ['soup', 'veg'],
      icon: 'fa-solid fa-bowling-ball', accent: '#c7684e',
      region: '臺灣客家風味', regionEn: 'Taiwanese Hakka', regionKo: '대만 객가 전통',
      desc: '糯米粉製成象徵團圓的湯圓，搭紅蔥頭、香菇、蝦米與茼蒿熬煮鹹香高湯。',
      descEn: 'Chewy glutinous rice balls symbolizing reunion, served in savory Hakka broth with mushrooms and greens.',
      descKo: '단란함과 행복을 상징하는 쫀득한 찹쌀 새알심을 샬롯, 표고버섯, 쑥갓이 어우러진 깊은 육수에 끓여냅니다.',
      story: '湯圓由糯米粉製成，口感細膩略帶嚼勁，象徵「團圓美滿」，是冬至與喜宴必吃的傳統點心。而「鹹湯圓」更是臺灣客家地區極具代表性的古早味料理。',
      storyEn: 'Glutinous rice balls symbolize "reunion" and "happiness" during Winter Solstice and weddings. Savory Rice Balls are a cherished specialty developed in Taiwan\'s Hakka communities.',
      storyKo: '찹쌀 새알심은 동지나 잔칫날 먹는 "가족의 단합과 행복"의 상징입니다. 그중 짭짤한 탕위안은 대만 객가(Hakka) 문화의 대표 별미입니다.',
      recipe: '先將小湯圓於滾水中煮熟備用；熱油鍋爆香紅蔥頭、蝦米、香菇絲與肉絲，倒入大骨高湯煮滾，最後放入茼蒿菜與湯圓，起鍋前點綴香菜與白胡椒。',
      recipeEn: 'Boil glutinous rice balls until floating. Stir-fry shallots, dried shrimp, mushrooms, and pork strips until aromatic, pour in broth, simmer with garland chrysanthemum greens, and combine.',
      recipeKo: '새알심을 먼저 삶아두고, 샬롯·건새우·표고버섯·돼지고기 채를 볶아 육수를 부은 뒤 쑥갓과 새알심을 넣어 끓여냅니다.',
      tip: '除了無餡小湯圓，臺灣夜市也很流行包著鮮肉餡的「大顆鮮肉鹹湯圓」，咬開會爆汁！',
      tipEn: 'Look out for giant pork-filled savory rice balls too—bite carefully as the hot savory juice bursts inside!',
      tipKo: '속이 꽉 찬 대왕 고기 탕위안도 인기입니다. 한입 베어 물면 육즙이 터지니 천천히 드세요!'
    },
    {
      id: 'ord_15', name: '鼎邊趖', pinyin: 'dǐng-biān-cuò', en: 'Potside Sticker Soup', ko: '딩볜춰 (솥가장자리 쌀국수)',
      taiwanese: false, price: 2, ingredients: ['soup', 'meat'],
      icon: 'fa-solid fa-kitchen-set', accent: '#4d7ea8',
      region: '基隆廟口招牌', regionEn: 'Keelung Miaokow', regionKo: '지룽 야시장 명물',
      desc: '基隆廟口招牌小吃，米漿沿熱鍋邊受熱凝固成滑嫩米片，搭蝦米、香菇與肉羹高湯。',
      descEn: 'Keelung Miaokow specialty: silky rice-paste noodles steamed along a hot wok rim in rich meat broth.',
      descKo: '지룽 묘구 야시장의 대표 메뉴로, 뜨거운 솥 가장자리에 쌀 반죽을 흘려 익힌 쫄깃한 쌀면과 진한 육수의 조화!',
      story: '以基隆廟口夜市最負盛名。「鼎」指大鍋子，「趖（剉）」是閩南語中「顫動、滑動」的意態，生動形容白色米漿沿著滾燙大鍋邊受熱翻滾凝固的模樣。',
      storyEn: 'Famed at Keelung Miaokow Night Market. "Ding" means big wok and "cuo" is a Taiwanese word describing the rice batter trembling and sliding down the sizzling wok rim into silky sheets.',
      storyKo: '지룽 야시장의 상징적인 음식입니다. "딩(鼎)"은 큰 솥을, "춰(趖)"는 쌀 반죽이 뜨거운 솥 벽을 타고 흘러내리며 익는 모습을 뜻하는 대만어입니다.',
      recipe: '將米漿淋在滾燙大鼎邊緣，遇蒸氣迅速凝固成類似粄條的Ｑ彈米片；高湯中加入蝦米、香菇、金針、魷魚乾、肉羹與高麗菜同煮，鮮甜豐富。',
      recipeEn: 'Pour rice paste along a steaming wok rim until it sets into chewy sheets, then serve in a rich broth loaded with dried shrimp, mushrooms, squid, cabbage, and meat-paste bites.',
      recipeKo: '뜨거운 솥 벽면에 쌀 반죽을 부어 쫄깃한 면을 만든 뒤, 건새우·표고버섯·건오징어·양배추·고기완자가 든 진한 육수에 말아냅니다.',
      tip: '看師傅現場在煙霧繚繞的大鼎邊「刷米漿」本身就是一場視覺饗宴！',
      tipEn: 'Watching the chef swirl fresh rice batter around the giant steaming wok is half the fun of visiting Keelung!',
      tipKo: '커다란 솥 가장자리에 셰프가 직접 쌀 반죽을 붓고 떼어내는 퍼포먼스를 구경하는 재미가 쏠쏠합니다!'
    },
    {
      id: 'ord_16', name: '下水湯', pinyin: 'xià-shuǐ-tāng', en: 'Gizzard & Liver Soup', ko: '닭내장 생강국 (샤수이탕)',
      taiwanese: false, price: 2, ingredients: ['soup', 'meat'],
      icon: 'fa-solid fa-mug-hot', accent: '#a84432',
      region: '古早惜食文化', regionEn: 'Traditional Heritage', regionKo: '대만 전통 보양식',
      desc: '以雞心、雞胗、雞肝等家禽內臟搭薑絲煮成清湯，爽脆不腥，充滿古早惜食智慧。',
      descEn: 'A traditional clear ginger broth featuring tender poultry hearts, gizzards, and livers.',
      descKo: '닭 모래집(똥집), 염통, 간 등 내장을 생강채와 함께 깔끔하게 끓여낸 쫄깃하고 담백한 국물입니다.',
      story: '「下水」兩字常令外國旅客誤以為是污水而卻步，其實它指家禽內臟（一說詞源來自英文 haslet）。早期臺灣物資缺乏，雞鴨內臟便宜甚至免費贈送，遂發展出這道爽脆暖身的庶民美味。',
      storyEn: 'Though literally translating to "down water," it actually refers to poultry giblets (possibly from English "haslet"). Born in thrifty early times when meat was scarce, it turns humble offal into a crisp delicacy.',
      storyKo: '글자 그대로는 "하수"처럼 보이지만 실제로는 가금류 내장을 뜻합니다. 옛날 고기가 귀하던 시절 내장을 알뜰하게 요리해 먹던 지혜에서 탄생했습니다.',
      recipe: '選用新鮮雞心、雞胗、雞肝洗淨切片汆燙去雜質，與大量嫩薑絲、米酒及清高湯快火煮熟，保留雞胗的爽脆與雞肝的粉嫩，佐九層塔更香。',
      recipeEn: 'Clean and slice fresh chicken hearts, gizzards, and livers; simmer quickly in clear ginger broth with rice wine so the gizzards stay crisp and the broth stays clean.',
      recipeKo: '신선한 닭 염통, 모래집, 간을 깨끗이 손질해 생강채와 미주를 넣은 맑은 육수에 빠르게 끓여내 잡내 없이 쫄깃합니다.',
      tip: '沾一點攤位附的「薑絲醬油膏」或豆瓣醬一起吃，口感爽脆完全沒有腥味！',
      tipEn: 'Dip the tender gizzards into ginger soy paste—crunchy, savory, and completely game-free!',
      tipKo: '함께 나오는 마늘 간장 소스에 찍어 먹으면 잡내 하나 없이 아삭하고 고소합니다!'
    },
    {
      id: 'ord_17', name: '鱔魚意麵', pinyin: 'shàn-yú-yì-miàn', en: 'Eel Noodles', ko: '장어 이몐 볶음국수',
      taiwanese: false, price: 2, ingredients: ['grain', 'grain', 'seafood'],
      icon: 'fa-solid fa-utensils', accent: '#8c4220',
      region: '臺南府城名菜', regionEn: 'Tainan Classic', regionKo: '타이난 대표 요리',
      desc: '臺南經典美食，大火快炒脆口鱔魚與酸甜勾芡燴汁，淋在金黃油炸意麵上非常開胃。',
      descEn: 'Tainan classic: high-heat stir-fried crispy eel in tangy sweet-and-sour sauce over golden egg noodles.',
      descKo: '타이난 명물! 센 불에 빠르게 볶아 아삭한 장어와 새콤달콤한 걸쭉 소스를 바삭한 달걀면 위에 얹은 요리입니다.',
      story: '來自臺南的指標性小吃！所謂「意麵」是以雞蛋與麵粉揉製後油炸定型的金黃麵條，能完美吸附酸甜濃郁的鑊氣燴汁，配上猛火 27 秒快炒出的脆口鱔魚，堪稱絕響。',
      storyEn: 'An iconic Tainan dish. "Yi-mian" are crispy deep-fried egg noodles that soak up the smoky, tangy-sweet glaze of flash-seared crunchy swamp eel.',
      storyKo: '타이난의 자부심이라 불리는 요리입니다. 달걀 반죽을 튀겨낸 "이몐"이 센 불에 볶은 불향 가득한 새콤달콤 장어 소스를 쏙 흡수합니다.',
      recipe: '鱔魚洗淨切片加米酒去腥、熱鍋快炒取出；另起油鍋爆香蒜末、洋蔥絲、高麗菜，加入烏醋、白醋、砂糖與醬油，放回鱔魚大火快炒並以太白粉水勾芡，淋在意麵上即完成。',
      recipeEn: 'Flash-sear rice-wine-marinated eel slices; stir-fry garlic, onion, and cabbage with black & white vinegar, sugar, and soy sauce, toss eel back on high heat, thicken, and pour over egg noodles.',
      recipeKo: '손질한 장어를 미주에 재워 센 불에 살짝 볶아두고, 마늘·양파·양배추에 흑식초·백식초·설탕·간장을 넣고 장어와 함께 센 불에 볶아 전분으로 걸쭉하게 만들어 면 위에 붓습니다.',
      tip: '喜歡鑊氣更重的人，可以點「乾炒鱔魚意麵」（不勾芡），焦香撲鼻超迷人！',
      tipEn: 'Craving extra smoky "wok hei"? Ask for the dry stir-fried version ("Gan-chao") without starch glaze!',
      tipKo: '진한 불향을 원하신다면 전분 없이 볶는 "건초(乾炒)" 스타일을 주문해 보세요!'
    },
    {
      id: 'ord_18', name: '棺材板', pinyin: 'guān-cái-bǎn', en: 'Coffin Bread', ko: '관재판 (크림스튜 토스트)',
      taiwanese: false, price: 2, ingredients: ['soup', 'grain', 'seafood'],
      icon: 'fa-solid fa-box-open', accent: '#c79238',
      region: '臺南獨創名點', regionEn: 'Tainan Original', regionKo: '타이난 독창 별미',
      desc: '臺南獨創名點，厚片吐司酥炸掏空後填入蔬菜、海鮮與濃郁奶油白醬，外酥內滑。',
      descEn: 'Tainan original: hollowed-out golden fried thick toast filled with creamy seafood and vegetable chowder.',
      descKo: '두툼한 식빵을 바삭하게 튀겨 속을 파낸 뒤, 해산물과 채소가 가득한 진한 크림스튜를 채우고 뚜껑을 덮은 타이난 명물!',
      story: '起源自臺南康樂市場（沙卡里巴），因外型方正帶蓋神似棺材，由當年一位考古學教授打趣命名為「棺材板」，並取臺語諧音「升官發財」的好兆頭。早期以西式酥皮搭雞肝，今日則改用厚片吐司。',
      storyEn: 'Invented in Tainan and playfully named for its lidded coffin shape (which also puns with "promotion and wealth" in Chinese!). Evolved from western pastry with chicken liver into today\'s golden fried toast bowl.',
      storyKo: '모양이 관을 닮아 붙은 유쾌한 이름이지만, 중국어 발음상 "승진과 재물(升官發財)"을 상징하는 길조의 음식입니다. 바삭한 식빵 그릇 속에 부드러운 크림 스튜가 가득합니다.',
      recipe: '將厚片白吐司入鍋酥炸至金黃，切開上方三邊掀成蓋子並掏空內部；填入以奶油白醬燉煮的雞肉、花枝、蝦仁、紅蘿蔔與豌豆濃湯，蓋上吐司蓋趁熱享用。',
      recipeEn: 'Deep-fry a thick block of white bread until golden, slice open a hinged lid and hollow out the center, then ladle in rich creamy chowder of seafood, meat, and veggies.',
      recipeKo: '두꺼운 식빵을 황금빛으로 튀겨 윗면을 뚜껑처럼 잘라 속을 파낸 뒤, 해산물과 채소를 넣은 진한 크림 스튜를 가득 채워 뚜껑을 덮어냅니다.',
      tip: '先吃沾滿濃湯的吐司蓋，再用刀叉切開酥脆吐司壁沾著白醬吃，外脆內濃超邪惡！',
      tipEn: 'Start by dipping the crispy bread lid into the hot creamy chowder, then slice through the crunchy walls!',
      tipKo: '먼저 바삭한 식빵 뚜껑을 크림 스튜에 푹 찍어 먹고, 남은 식빵 벽면을 잘라 함께 드세요!'
    },
    {
      id: 'ord_19', name: '爌肉飯', pinyin: 'kuàng-ròu-fàn', en: 'Soy-Stewed Pork Rice', ko: '대만식 삼겹살 조림덮밥 (쾅로우판)',
      taiwanese: false, price: 2, ingredients: ['grain', 'meat'],
      icon: 'fa-solid fa-bowl-rice', accent: '#993b2c',
      region: '彰化・全臺庶民', regionEn: 'Changhua & Nationwide', regionKo: '장화·대만 국민덮밥',
      desc: '五花肉塊爆香後以醬油、米酒與冰糖慢火滷至軟爛入味，配飯與酸菜、筍絲堪稱一絕。',
      descEn: 'Melt-in-your-mouth braised pork belly simmered in soy sauce and rock sugar over steaming white rice.',
      descKo: '두툼한 삼겹살을 간장, 미주, 얼음설탕에 오랜 시간 부드럽게 조려 흰 쌀밥 위에 얹고 갓절임·죽순을 곁들인 덮밥!',
      story: '也寫作「焢肉飯」，「焢」指將肥瘦相間的五花肉塊長時間小火慢滷的烹調工法。在彰化甚至從早餐、午餐、晚餐到宵夜 24 小時都吃得到，是臺灣最具飽足感的庶民靈魂料理。',
      storyEn: 'Slow-braised ("kong") for hours until the pork belly melts on the tongue. Especially legendary in Changhua, where locals eat it for breakfast, lunch, dinner, and midnight snacks!',
      storyKo: '비계와 살코기가 조화로운 삼겹살을 약불에 오래 조려 입안에서 사르르 녹습니다. 특히 장화(Changhua) 지역에서는 아침부터 야식까지 24시간 사랑받는 소울 푸드입니다.',
      recipe: '熱油鍋爆香蒜頭與紅蔥頭，放入五花肉塊煎至表面焦黃定型，倒入米酒與淹過肉塊的清水，加入冰糖、醬油與五香滷包，中小火慢燉至軟爛油亮，配白飯、酸菜、筍絲與滷蛋。',
      recipeEn: 'Sauté garlic until aromatic, sear pork belly slices until golden, add rice wine, water, rock sugar, and soy sauce, and braise gently for hours until glossy and tender. Serve over rice with pickles and bamboo.',
      recipeKo: '마늘을 볶아 향을 내고 삼겹살을 노릇하게 지진 뒤, 미주·물·얼음설탕·간장을 넣고 약불에 푹 조려 흰 쌀밥과 죽순, 절임 채소를 곁들입니다.',
      tip: '在店家點餐可以指定要「偏瘦」、「偏肥」或「中段（肥瘦均勻）」，加顆半熟荷包蛋更銷魂！',
      tipEn: 'You can ask the chef for lean, fatty, or balanced pork belly—and add a runny fried egg on top!',
      tipKo: '주문 시 살코기 위주나 비계 비율을 고를 수 있고, 반숙 계란프라이를 추가하면 밥도둑이 따로 없습니다!'
    },
    {
      id: 'ord_20', name: '大腸包小腸', pinyin: 'dà-cháng-bāo-xiǎo-cháng', en: 'Taiwanese Hot Dog', ko: '대만식 핫도그 (다창바오샤오창)',
      taiwanese: false, price: 2, ingredients: ['grain', 'meat'],
      icon: 'fa-solid fa-hotdog', accent: '#bd4035',
      region: '逢甲・全臺夜市', regionEn: 'Fengjia & Night Markets', regionKo: '펑자·야시장 인기',
      desc: '俗稱「臺灣熱狗」，炭烤糯米腸切開夾入多汁臺式香腸與蒜片香菜，口感層次滿點。',
      descEn: 'Grilled sweet Taiwanese pork sausage tucked inside a sliced glutinous rice sausage with garlic and herbs.',
      descKo: '숯불에 구운 찹쌀 순대(대장)를 갈라 그 속에 달콤하고 육즙 가득한 대만식 소시지(소장)와 마늘, 절임 채소를 끼워 넣은 대만식 핫도그!',
      story: '「大腸」即糯米腸（蒸熟糯米灌入腸衣），「小腸」即帶甜味的臺式香腸。這道被外國旅客戲稱為「臺灣熱狗」的創意小吃於 1990 年代在夜市爆紅，如今已衍生出蒜味、黑胡椒、蜂蜜、哇沙米等數十種口味。',
      storyEn: 'Affectionately called the "Taiwanese Hot Dog": a charcoal-grilled glutinous rice sausage ("big sausage") cradles a juicy sweet pork sausage ("small sausage"), customized with endless toppings.',
      storyKo: '"대만식 핫도그"로 불리는 야시장 대표 간식입니다. 쫀득한 찹쌀 순대가 겉빵 역할을 하고, 육즙 팡팡 터지는 대만 소시지가 속을 채웁니다.',
      recipe: '將糯米腸與臺式香腸於炭火上烤至外皮微焦噴香；糯米腸縱向切開，鋪入酸菜、菜脯、小黃瓜、薑片與蒜片，夾入香腸並擠上蒜蓉膏或甜辣醬即可大口享用。',
      recipeEn: 'Charcoal-grill both sausages until fragrant and slightly charred; slice the sticky rice sausage open, layer with pickled greens, garlic slices, and herbs, tuck in the pork sausage, and drizzle with sauce.',
      recipeKo: '찹쌀 순대와 대만 소시지를 숯불에 노릇하게 구운 뒤, 순대 가운데를 갈라 갓절임·오이·마늘 슬라이스를 깔고 소시지를 끼워 소스를 뿌립니다.',
      tip: '敢吃生蒜頭的話一定要加「新鮮蒜片」，一口香腸配一口蒜片是臺灣最經典的靈魂吃法！',
      tipEn: 'If you love bold flavor, don\'t skip the raw garlic slices—pork sausage + fresh garlic is Taiwan\'s ultimate duo!',
      tipKo: '생마늘 슬라이스를 꼭 추가해 보세요! 달콤한 대만 소시지와 알싸한 마늘의 조화가 환상적입니다.'
    },

    // === 3 元餐點 (4 張) ===
    {
      id: 'ord_21', name: '刈包', pinyin: 'guà-bāo', en: 'Steamed Sandwich', ko: '대만식 햄버거 (꽈바오)',
      taiwanese: true, price: 3, ingredients: ['grain', 'veg', 'meat'],
      icon: 'fa-solid fa-burger', accent: '#a84e32',
      region: '尾牙必吃・全臺', regionEn: 'Taiwanese Burger', regionKo: '대만식 수제버거',
      desc: '有「臺灣漢堡」美稱，又名「虎咬豬」。鬆軟麵皮夾入滷五花肉、酸菜、香菜與花生粉。',
      descEn: 'Known as "Tiger Bites Pig": fluffy folded steamed bun filled with braised pork belly, pickled greens, and peanut powder.',
      descKo: '"대만식 햄버거"이자 "호랑이가 돼지를 문 모양(호교저)"으로 불리며, 폭신한 찐빵 속에 삼겹살 조림·갓절임·땅콩가루가 가득합니다.',
      story: '有「臺灣漢堡」的可愛暱稱！因對折的白色麵皮夾著滿滿滷五花肉，外觀神似張開大口的老虎咬著豬肉，故臺語又稱「虎咬豬（hóo-kā-ti）」，形似飽滿錢包，是臺灣歲末「尾牙」祈求發財的必吃料理。',
      storyEn: 'Nicknamed the "Taiwanese Burger" and "Tiger Bites Pig" (ho-ka-ti) for its folded white bun chomping on rich pork belly. Resembling a stuffed wallet, it is eaten at year-end banquets for good fortune!',
      storyKo: '하얀 찐빵이 삼겹살을 물고 있는 모습이 호랑이가 돼지를 문 것 같아 "호교저"라 불립니다. 꽉 찬 지갑을 닮아 연말에 재물운을 기원하며 먹습니다.',
      recipe: '將鬆軟蒸熟的半月形白麵皮掀開，先鋪上香甜花生糖粉與炒酸菜，夾入滷至入口即化的五花爌肉，最後點綴新鮮香菜即可享用。',
      recipeEn: 'Open a fluffy folded steamed bun, layer with sweet peanut powder, tangy pickled mustard greens, tender soy-braised pork belly, and fresh coriander.',
      recipeKo: '따뜻하게 찐 반달 모양 찐빵 속에 달콤한 땅콩 설탕가루, 볶은 갓절임, 부드러운 삼겹살 조림, 고수를 푸짐하게 채워 완성합니다.',
      tip: '臺語唸「guà-bāo」！肥瘦各半的「半肥瘦」配上酸菜與花生粉最能吃出鹹甜交織的絕妙平衡。',
      tipEn: 'Pronounced "gua-bao" in Taiwanese! Ask for half-fat, half-lean pork—it balances the sweet peanut powder and tart pickles.',
      tipKo: '대만어로 "꽈바오"라고 발음합니다. 살코기와 비계가 반반 섞인 고기가 땅콩가루·갓절임과 가장 잘 어울립니다.'
    },
    {
      id: 'ord_22', name: '鹹酥雞', pinyin: 'xián-sū-jī', en: 'Taiwanese Fried Chicken', ko: '대만식 순살치킨 (셴수지)',
      taiwanese: false, price: 3, ingredients: ['grain', 'seafood', 'meat'],
      icon: 'fa-solid fa-drumstick-bite', accent: '#cf6f23',
      region: '臺灣宵夜霸主', regionEn: 'Late-Night King', regionKo: '대만 야식의 제왕',
      desc: '臺灣宵夜首選！雞肉與數十種配料搭九層塔酥炸，灑上胡椒鹽與辣椒粉，香酥涮嘴。',
      descEn: 'Taiwan\'s ultimate late-night snack: crispy fried chicken and street treats tossed with fried basil and pepper salt.',
      descKo: '대만 야식의 절대 강자! 바삭한 순살 치킨과 수십 가지 재료를 타이완 바질과 함께 튀겨 후추소금을 솔솔 뿌립니다.',
      story: '鹹酥雞其實是一座「炸物綜合樂園」！攤位前數十種食材一字排開——無骨雞塊、魷魚腳、甜不辣、米血糕、四季豆、百頁豆腐任君挑選，最後抓一大把九層塔下鍋炸出靈魂香氣，是臺灣人宵夜無可取代的第一名。',
      storyEn: 'More than just fried chicken, it is a customizable fried-food paradise! Pick from dozens of meats, squid, veggies, and tofu—all flash-fried with crispy basil leaves and tossed in aromatic pepper salt.',
      storyKo: '단순한 치킨을 넘어 튀김 천국입니다! 매대에 진열된 수십 가지 재료(오징어, 어묵, 두부, 껍질콩 등)를 골라 바질과 함께 튀겨 먹는 최고의 야식입니다.',
      recipe: '雞肉以五香、蒜泥與醬油醃漬後裹地瓜粉入熱油炸至金黃酥脆；起鍋前放入新鮮九層塔爆香，脫油後灑上特製中藥胡椒鹽與辣椒粉，裝入紙袋以長竹籤享用。',
      recipeEn: 'Marinate bite-sized chicken in five-spice and garlic, coat in sweet potato starch, deep-fry with fresh basil leaves, toss with pepper salt and chili powder, and serve in a paper bag with bamboo skewers.',
      recipeKo: '오향과 마늘에 재운 닭고기에 고구마 전분을 입혀 바삭하게 튀긴 뒤, 막판에 바질을 함께 튀겨 특제 후추소금과 고춧가루를 뿌려 종이봉투에 담아냅니다.',
      tip: '除了雞肉，必點「魷魚、甜不辣、四季豆、蒜片」，配上一杯冰涼珍奶或啤酒就是滿分臺灣夜生活！',
      tipEn: 'Don\'t just get chicken—add crispy squid, tempura strips, green beans, and garlic chips! Best paired with bubble tea or cold beer.',
      tipKo: '치킨과 함께 오징어 튀김, 어묵 튀김, 마늘 슬라이스를 꼭 추가해 시원한 버블티나 맥주와 즐겨보세요!'
    },
    {
      id: 'ord_23', name: '蝦仁肉圓', pinyin: 'xiā-rén-ròu-yuán', en: 'Shrimp Meatballs', ko: '새우 찐 완자 (샤런로우위안)',
      taiwanese: false, price: 3, ingredients: ['soup', 'seafood', 'meat'],
      icon: 'fa-solid fa-shrimp', accent: '#c94c38',
      region: '南臺灣清蒸派', regionEn: 'Southern Taiwan Style', regionKo: '남부 타이완 찜 스타일',
      desc: '南臺灣清蒸軟嫩肉圓，外皮軟糯 Q 彈，包覆鮮甜蝦仁與豬肉餡，佐蒜蓉醬膏。',
      descEn: 'Southern-style steamed translucent rice dumplings stuffed with fresh shrimp and savory pork in garlic soy glaze.',
      descKo: '기름에 튀기지 않고 쪄내는 남부 대만식 로우위안! 보드랍고 쫀득한 쌀피 속에 탱글한 새우와 돼지고기 소가 들어있습니다.',
      story: '臺灣肉圓分為中北部的「低溫油泡派」與南臺灣的「清蒸派」。蝦仁肉圓正是臺南最具代表性的清蒸派名點，清爽不油膩，強調火燒蝦的鮮甜與軟糯米皮的溫潤口感。',
      storyEn: 'Unlike central Taiwan\'s oil-poached version, Southern Taiwan\'s Shrimp Meatballs are gently steamed—delivering a silky-soft rice wrapper bursting with sweet local shrimp and savory pork.',
      storyKo: '대만 중북부의 튀김 스타일과 달리, 타이난 등 남부 지역은 쪄서 만들어 담백하고 부드럽습니다. 달콤한 새우와 고기 소의 조화가 일품입니다.',
      recipe: '外皮由在來米粉、地瓜粉與太白粉混合調漿，填入鮮甜蝦仁與調味豬肉燥餡入籠清蒸至半透明軟嫩；上桌前淋上甘甜蝦湯醬膏，佐蒜泥、哇沙米與香菜。',
      recipeEn: 'Steam a translucent wrapper of rice flour and starches around fresh shrimp and seasoned pork, then glaze with sweet shrimp-broth soy sauce, mashed garlic, and coriander.',
      recipeKo: '쌀가루와 전분을 섞은 반죽에 새우와 양념한 돼지고기를 넣어 투명하고 보드랍게 쪄낸 뒤, 달콤한 마늘 간장 소스와 고수를 얹어냅니다.',
      tip: '在臺南吃蝦仁肉圓常會附上一小坨「芥末（哇沙米）」與蒜泥，微嗆提鮮超特別！',
      tipEn: 'In Tainan, try adding a tiny dab of wasabi alongside the garlic soy glaze—a surprisingly delicious local twist!',
      tipKo: '타이난 현지에서는 마늘 소스에 와사비를 살짝 곁들여 먹는 것이 별미입니다!'
    },
    {
      id: 'ord_24', name: '甜不辣', pinyin: 'tián-bú-là', en: 'Tempura Combination', ko: '대만식 오뎅 모둠 (톈부라)',
      taiwanese: false, price: 3, ingredients: ['soup', 'veg', 'seafood', 'meat'],
      icon: 'fa-solid fa-plate-wheat', accent: '#b85c2e',
      region: '萬華・全臺夜市', regionEn: 'Wanhua & Night Markets', regionKo: '완화·야시장 스테디셀러',
      desc: '魚漿炸物與丸子、米血糕、白蘿蔔於高湯慢煮，淋上特製甜辣醬，吃完還能免費加湯！',
      descEn: 'Assorted fish cakes, meatballs, blood rice cake, and radish simmered in broth with signature sweet chili sauce.',
      descKo: '어묵, 완자, 무, 찹쌀선지 등을 육수에 푹 끓여 특제 달콤매콤 소스를 얹어 먹는 요리. 다 먹은 뒤 남은 소스에 무료 육수를 부어 마십니다!',
      story: '字面上看起來像「甜而不辣」，其實音譯自日本炸物料理「天婦羅（Tempura）」，在臺灣演變成類似關東煮的魚漿慢煮綜合碗，靈魂在於每家獨門秘製的味噌甜辣醬。',
      storyEn: 'Literally "sweet not spicy," the name comes from Japanese "tempura." Taiwan transformed it into a comforting simmered bowl of fish cakes, radish, and meatballs drenched in secret miso-chili sauce.',
      storyKo: '이름은 "달고 맵지 않다"는 뜻처럼 보이지만 일본어 "덴푸라"에서 유래했습니다. 대만에서는 어묵과 무를 육수에 삶아 특제 된장 소스에 비벼 먹는 독자적 요리로 발전했습니다.',
      recipe: '將油炸魚漿片、黑輪、丸子、高麗菜捲、油豆腐、豬血糕與白蘿蔔放入柴魚蘿蔔高湯中慢火熬煮入味，瀝乾盛碗淋上濃郁特製甜辣醬。',
      recipeEn: 'Simmer fried fish cakes, meatballs, cabbage rolls, tofu, rice blood cake, and daikon radish in sweet bonito-radish broth, drain into a bowl, and coat generously with sweet chili miso sauce.',
      recipeKo: '어묵, 완자, 양배추롤, 유부, 찹쌀선지, 무를 가쓰오부시 무 육수에 푹 끓인 뒤, 국물을 빼고 그릇에 담아 특제 달콤매콤 소스를 듬뿍 얹습니다.',
      tip: '行家必做儀式：吃完碗裡所有料後，拿著沾有殘餘甜辣醬的空碗找老闆「加湯（免費）」，甘甜暖胃超滿足！',
      tipEn: 'Essential ritual: after finishing the toppings, hand your sauce-coated bowl back to the vendor for FREE hot broth—mixing the leftover sauce with soup is pure bliss!',
      tipKo: '필수 코스! 건더기를 다 먹은 뒤 소스가 묻은 빈 그릇을 사장님께 드리면 무료로 뜨거운 육수를 부어주십니다. 국물 맛이 끝내줍니다!'
    },

    // === 4 元餐點 (2 張) ===
    {
      id: 'ord_25', name: '海陸雙拼', pinyin: 'hǎi-lù-shuāng-pīn', en: 'Surf & Turf Teppanyaki', ko: '해륙 철판 스테이크 (하이루솽핀)',
      taiwanese: false, price: 4, ingredients: ['grain', 'veg', 'seafood', 'meat'],
      icon: 'fa-solid fa-bacon', accent: '#b52f2f',
      region: '臺灣夜市牛排', regionEn: 'Night Market Teppanyaki', regionKo: '야시장 철판 호화식',
      desc: '夜市鐵板料理的豪華大餐！高溫鐵板滋滋作響，肉排、鮮蝦、麵條與荷包蛋淋上濃郁醬汁。',
      descEn: 'Luxury sizzling iron-plate feast combining juicy steak, shrimp, noodles, egg, and rich black pepper sauce.',
      descKo: '지글지글 뜨거운 철판 위에 육즙 가득한 스테이크, 왕새우, 철판면, 계란을 올리고 진한 소스를 부어 먹는 야시장 최고급 만찬!',
      story: '臺灣夜市牛排與鐵板燒是日式鐵板燒的在地街邊版，自 1980 年代風靡全臺。點一份「海陸雙拼」一次擁有牛／雞排與鮮蝦／花枝，端上桌時鐵板滋滋作響、白煙四起，堪稱夜市最氣派的享受！',
      storyEn: 'Born in the 1980s as Taiwan\'s vibrant street-food take on Japanese teppanyaki. Ordering "Surf & Turf" brings sizzling steak, shrimp, noodles, and a sunny egg straight to your table in a cloud of savory steam!',
      storyKo: '1980년대부터 유행한 대만식 길거리 철판 스테이크의 끝판왕입니다. 고기와 해산물을 한 번에 즐기며 철판 위에서 지글거리는 소리와 향기가 일품입니다.',
      recipe: '在高溫燒熱的鑄鐵盤上先鋪油麵與三色蔬菜，放上煎烤至香氣四溢的肉排與大尾鮮蝦，旁邊打一顆荷包蛋，最後豪邁淋上黑胡椒或蘑菇牛排醬直接連鐵板熱騰騰上桌。',
      recipeEn: 'Sear steak and jumbo shrimp on a scorching griddle, lay over sizzling iron-plate noodles, veggies, and a fried egg, and drench in black pepper or mushroom steak sauce.',
      recipeKo: '뜨겁게 달군 무쇠 철판에 면과 채소, 구운 스테이크와 왕새우, 달걀을 올린 뒤 흑후추 소스나 버섯 소스를 듬뿍 부어 지글거리는 상태로 서빙합니다.',
      tip: '點醬汁時可以喊「綜合醬（黑胡椒＋蘑菇）」，上桌瞬間記得拿起餐巾紙擋住噴濺的熱醬汁喔！',
      tipEn: 'Ask for "Mixed Sauce" (black pepper + mushroom) and hold up your napkin as the sizzling sauce hits the hot plate!',
      tipKo: '소스는 "종합(흑후추+버섯)"으로 주문하세요! 서빙될 때 소스가 튈 수 있으니 냅킨을 살짝 들어 가리는 게 포인트!'
    },
    {
      id: 'ord_26', name: '臭臭鍋', pinyin: 'chòu-chòu-guō', en: 'Stinky Hot Pot', ko: '취두부 곱창 전골 (초우초우궈)',
      taiwanese: false, price: 4, ingredients: ['grain', 'soup', 'veg', 'seafood', 'meat'],
      icon: 'fa-solid fa-fire-flame-curved', accent: '#9c2424',
      region: '臺灣個人小火鍋之王', regionEn: 'Ultimate Personal Hot Pot', regionKo: '대만 1인 전골의 제왕',
      desc: '集結臭豆腐、大腸、鴨血、高湯、肉片、海鮮與時蔬的終極五味鍋物，夜市之王！',
      descEn: 'The ultimate 5-ingredient personal hot pot packed with stinky tofu, pork intestine, duck blood, seafood, and greens.',
      descKo: '취두부, 돼지곱창, 오리선지, 고기, 해산물, 채소까지 5가지 식재료가 모두 모인 대만 야시장 최강의 1인 전골!',
      story: '「臭臭鍋」的兩個「臭」分別來自「臭豆腐」與「大腸」！雖然聞起來香氣濃郁奔放，但實際入口湯頭鮮辣溫潤，反而不會過於強烈，深受「臭味相投」的臺灣食客與深夜老饕熱愛，是 5 大食材全集結的終極大菜。',
      storyEn: 'Named "Double Stinky" for its twin stars: fermented stinky tofu and braised pork intestine. Bold on the nose yet surprisingly mellow, savory, and addictive on the palate—it unites all 5 ingredient types in one glorious pot!',
      storyKo: '취두부와 돼지곱창 두 가지의 강렬한 향에서 유래한 이름입니다. 냄새는 독특하지만 국물은 깊고 감칠맛이 넘쳐 한 번 빠지면 헤어나올 수 없는 5대 식재료 총집합 끝판왕 요리입니다.',
      recipe: '將臭豆腐、滷大腸與滑嫩鴨血洗淨汆燙去腥，放入大骨高湯中搭配沙茶醬與豆瓣醬燉煮，再堆滿高麗菜、金針菇、豬肉片、蛤蜊與各式火鍋料，配白飯與冬粉享用。',
      recipeEn: 'Blanch stinky tofu, pork intestine, and duck blood, then simmer in savory shacha broth piled high with cabbage, mushrooms, pork slices, clams, and hot pot favorites.',
      recipeKo: '취두부, 곱창, 오리선지를 데쳐 잡내를 잡은 뒤 사차 소스를 푼 육수에 배추, 팽이버섯, 고기, 바지락, 어묵 등을 푸짐하게 담아 보글보글 끓여냅니다.',
      tip: '點臭臭鍋通常附白飯、飲料與冰淇淋吃到飽，沾上臺式沙茶醬＋蒜泥＋生辣椒是滿分吃法！',
      tipEn: 'Dip the tender tofu and meat into Taiwanese shacha sauce mixed with fresh garlic and chili for the ultimate feast!',
      tipKo: '대만식 사차(沙茶) 소스에 다진 마늘과 고추를 섞어 찍어 먹으면 천국의 맛을 경험할 수 있습니다!'
    }
  ];

  // 26 道臺灣小吃真實美食照片檔名對照表（位於 night-market-img/ 資料夾）
  const ORDER_PHOTOS = {
    ord_01: '1. 蛤蜊湯（gé-lí-tāng）.jpg',
    ord_02: '2. 魷魚羹（yóu-yú-gēng）.jpg',
    ord_03: '3. 青菜湯（qīng-cài-tāng）.jpg',
    ord_04: '4. 麻薏湯（muâ-ìnn-thng）.jpg',
    ord_05: '5. 浮水魚羹（fú-shuǐ-yú-gēng）.jpg',
    ord_06: '6. 蛋花湯（dàn-huā-tāng）.jpg',
    ord_07: '7. 蚵仔煎（ô-á-tsian）.jpg',
    ord_08: '8. 臭豆腐（chòu-dòu-fǔ）.jpg',
    ord_09: '9. 花枝丸（huā-zhī-wán）.jpg',
    ord_10: '10. 水煎包（shuǐ-jiān-bāo）.jpg',
    ord_11: '11. 蚵仔麵線（ô-á-mī-suànn）.jpg',
    ord_12: '12. 潤餅（rùn-bǐng）.jpg',
    ord_13: '13. 蔥油餅（cōng-yóu-bǐng）.jpg',
    ord_14: '14. 鹹湯圓（xián-tāng-yuán）.jpg',
    ord_15: '15. 鼎邊趖（dǐng-biān-cuò）.jpg',
    ord_16: '16. 下水湯（xià-shuǐ-tāng）.jpg',
    ord_17: '17. 鱔魚意麵（shàn-yú-yì-miàn）.jpg',
    ord_18: '18. 棺材板（guān-cái-bǎn）.jpg',
    ord_19: '19. 爌肉飯（kuàng-ròu-fàn）.jpg',
    ord_20: '20. 大腸包小腸（dà-cháng-bāo-xiǎo-cháng）.jpg',
    ord_21: '21. 刈包（guà-bāo）.jpg',
    ord_22: '22. 鹹酥雞（xián-sū-jī）.jpg',
    ord_23: '23. 蝦仁肉圓（xiā-rén-ròu-yuán）.jpg',
    ord_24: '24. 甜不辣（tián-bù-là）.jpg',
    ord_25: '25. 海陸雙拼（hǎi-lù-shuāng-pīn）.jpg',
    ord_26: '26. 臭臭鍋（chòu-chòu-guō）.jpg'
  };

  ORDERS.forEach((o) => {
    o.photo = ORDER_PHOTOS[o.id] || '';
  });

  function orderPhotoUrl(order) {
    if (!order || !order.photo) return '';
    return `night-market-img/${encodeURIComponent(order.photo)}`;
  }

  // 27 張攻防牌定義（攻擊 18 張、輔助 5 張、防禦 4 張，含中英韓三語）
  const SPECIALS = [
    // === 攻擊用 (18 張) ===
    {
      id: 'hygiene', name: '衛生稽查', pinyin: 'wèi-shēng-jī-chá', en: 'Hygiene Inspection', ko: '위생 점검',
      type: 'attack', count: 1, icon: 'fa-solid fa-clipboard-list', code: '全清', codeEn: 'WIPE', codeKo: '전멸',
      targetMode: 'all', unblockable: true,
      desc: '所有防禦牌無效！全場玩家（包括自己）丟棄手上所有食材牌，放回棄牌堆。',
      descEn: 'Unblockable! ALL players (including yourself) must discard ALL Ingredient cards.',
      descKo: '모든 방어 불가! 자신을 포함한 전원 손안의 식재료 카드를 전부 버립니다.'
    },
    {
      id: 'police', name: '警察', pinyin: 'jǐng-chá', en: 'Police', ko: '경찰 단속',
      type: 'attack', count: 2, icon: 'fa-solid fa-shield-halved', code: '-2/清', codeEn: '-$2/X', codeKo: '-2/전부',
      targetMode: 'single',
      desc: '檢舉一名玩家，目標可選擇罰款 2 元或丟棄所有食材牌（不足 2 元須棄牌，放回棄牌堆）。',
      descEn: 'Chosen player must either pay a $2 fine to bank or discard all Ingredient cards.',
      descKo: '대상 1명에게 벌금 2원 납부 또는 모든 식재료 포기 중 하나를 강제합니다.'
    },
    {
      id: 'picky', name: '奧客', pinyin: 'àu-kheh', en: 'Picky Customer', ko: '진상 손님',
      type: 'attack', count: 2, icon: 'fa-solid fa-hand-point-right', code: '-1/2', codeEn: '-1/2', codeKo: '-절반',
      targetMode: 'single',
      desc: '使目標玩家捨棄一半的食材牌（無條件進位，例如 3 張棄 2 張），放回棄牌堆。',
      descEn: 'Target player loses half of their Ingredient cards (rounded up).',
      descKo: '대상의 식재료 카드 절반을 버리게 합니다 (소수점 올림, 예: 3장 중 2장).'
    },
    {
      id: 'steal_card', name: '偷牌', pinyin: 'tōu-pái', en: 'Card Pilferer', ko: '카드 훔치기',
      type: 'attack', count: 3, icon: 'fa-solid fa-mask', code: '-1攻', codeEn: '-1 SP', codeKo: '-1특수',
      targetMode: 'single',
      desc: '隨機奪取目標玩家手上的攻防牌 1 張。',
      descEn: 'Steal 1 random Special card from an opponent.',
      descKo: '상대 손패에서 특수카드 1장을 무작위로 빼앗아 옵니다.'
    },
    {
      id: 'poison', name: '食物中毒', pinyin: 'shí-wù-zhōng-dú', en: 'Food Poisoning', ko: '식중독',
      type: 'attack', count: 2, icon: 'fa-solid fa-skull-crossbones', code: '-1元', codeEn: '-$1/?', codeKo: '-1원/?',
      targetMode: 'single', needsIngredientChoice: true,
      desc: '向被投訴玩家求償醫藥費 1 元，並喊出 1 種食材請對方全部丟棄；若無該食材則無損失。',
      descEn: 'Take $1 from target and name 1 Ingredient type; they discard all cards of that type.',
      descKo: '대상에게 치료비 1원을 받고 식재료 1종을 지목해 해당 카드를 모두 버리게 합니다.'
    },
    {
      id: 'cockroach', name: '蟑螂', pinyin: 'zhāng-láng', en: 'Cockroach', ko: '바퀴벌레',
      type: 'attack', count: 2, icon: 'fa-solid fa-bug', code: '暫停', codeEn: 'SKIP', codeKo: '정지',
      targetMode: 'single',
      desc: '目標玩家下回合暫停做菜一回合！但仍可抽取食材牌 3 張及購買／使用攻防牌。',
      descEn: 'Target cannot cook any Orders on their next turn (can still draw & play Specials).',
      descKo: '대상은 다음 턴 요리를 할 수 없습니다! (식재료 뽑기 및 특수카드 사용/구매는 가능)'
    },
    {
      id: 'pickpocket', name: '扒手', pinyin: 'pá-shǒu', en: 'Pickpocket', ko: '소매치기',
      type: 'attack', count: 3, icon: 'fa-solid fa-sack-dollar', code: '-2元', codeEn: '-$2', codeKo: '-2원',
      targetMode: 'single',
      desc: '奪取一名玩家 2 元（若對方只有 1 元則奪取 1 元）。',
      descEn: 'Steal $2 from an opponent (or $1 if they only have $1).',
      descKo: '상대 1명에게서 2원을 빼앗습니다 (1원만 있다면 1원만 획득).'
    },
    {
      id: 'veg_thief', name: '偷菜賊', pinyin: 'tōu-cài-zéi', en: 'Ingredient Thief', ko: '재료 도둑',
      type: 'attack', count: 3, icon: 'fa-solid fa-user-ninja', code: '-2材', codeEn: '-2 ING', codeKo: '-2재료',
      targetMode: 'single',
      desc: '隨機奪取一名玩家食材牌 2 張（若對方只有 1 張則奪取 1 張）。',
      descEn: 'Steal 2 random Ingredient cards from an opponent.',
      descKo: '상대 1명에게서 식재료 카드 2장을 무작위로 빼앗아 옵니다.'
    },

    // === 輔助用 (5 張) ===
    {
      id: 'tv', name: '上電視', pinyin: 'shàng-diàn-shì', en: 'Press Interview', ko: 'TV 출연',
      type: 'support', count: 1, icon: 'fa-solid fa-video', code: '+3', codeEn: '+3', codeKo: '+3장',
      targetMode: 'self',
      desc: '節目採訪爆紅！立即從食材牌堆抽取 3 張食材牌。',
      descEn: 'TV fame! Draw 3 Ingredient cards immediately.',
      descKo: '방송 출연 대박! 즉시 식재료 카드 3장을 뽑습니다.'
    },
    {
      id: 'direct_farm', name: '產地直送', pinyin: 'chǎn-dì-zhí-sòng', en: 'Store Delivery', ko: '산지 직송',
      type: 'support', count: 1, icon: 'fa-solid fa-truck-fast', code: '∞', codeEn: '∞', codeKo: '∞연쇄',
      targetMode: 'self',
      desc: '先抽 1 張食材牌到手牌，本回合每做完一道菜後可再多抽 1 張食材牌，直到無法續做為止！',
      descEn: 'Draw 1 Ingredient now, plus 1 extra Ingredient after every dish cooked this turn!',
      descKo: '식재료 1장을 뽑고, 이번 턴 요리를 1개 완성할 때마다 식재료 1장을 추가 획득합니다!'
    },
    {
      id: 'english', name: 'YES! WE SPEAK ENGLISH', pinyin: 'YES! WE SPEAK ENGLISH', en: 'YES! WE SPEAK ENGLISH', ko: 'YES! WE SPEAK ENGLISH',
      type: 'support', count: 1, icon: 'fa-solid fa-language', code: '+1菜', codeEn: '+1 ORD', codeKo: '+1요리',
      targetMode: 'self',
      desc: '可多翻開餐點牌 1 張（橫向擺放），此牌結帳完畢後不再續補。',
      descEn: 'Flip 1 extra Order card sideways on the table (not replaced once cooked).',
      descKo: '테이블에 요리 카드를 1장 추가로 가로로 펼칩니다 (완성 후 보충 없음).'
    },
    {
      id: 'buddha', name: '佛跳牆', pinyin: 'fó-tiào-qiáng', en: 'Ah-Meat-Tofu', ko: '불도장',
      type: 'support', count: 1, icon: 'fa-solid fa-hands-praying', code: '替代', codeEn: 'SWAP', codeKo: '대체',
      targetMode: 'self',
      desc: '菜或五穀雜糧可代替肉或海鮮使用（本回合不限次數），須雙手合十唸出「阿彌陀佛」才生效。',
      descEn: 'Say "Ah-Meat-Tofu!" to substitute Veg/Grain for Meat/Seafood this turn (unlimited).',
      descKo: '합장하고 "아미타불"을 외치면 이번 턴 채소/곡물로 고기/해산물을 무제한 대체합니다.'
    },
    {
      id: 'scallion', name: '買菜抓把蔥', pinyin: 'mǎi-cài-zhuā-bǎ-cōng', en: 'Greedy Scallion', ko: '장보다 파 한 줌 덤',
      type: 'support', count: 1, icon: 'fa-solid fa-seedling', code: '+2', codeEn: '+2?', codeKo: '+2?',
      targetMode: 'self',
      desc: '翻開食材牌堆第一張收進手牌，若該張為菜（含爛菜），則加抽食材牌 2 張！',
      descEn: 'Draw 1 Ingredient; if it is Vegetable (even rotten), draw 2 additional Ingredients!',
      descKo: '식재료 1장을 뽑아 채소(상한 채소 포함)라면 2장을 추가로 더 뽑습니다!'
    },

    // === 防禦用 (4 張) ===
    {
      id: 'gangster', name: '黑社會', pinyin: 'hēi-shè-huì', en: 'Gangster', ko: '흑사회',
      type: 'defense', count: 1, icon: 'fa-solid fa-user-secret', code: '反彈', codeEn: 'REFLECT', codeKo: '반사',
      targetMode: 'reaction',
      desc: '將攻擊效果直接返回至攻擊者！（除了「衛生稽查」以外之所有攻擊皆可反彈）',
      descEn: 'Reflect any attack (except Hygiene Inspection) right back at the attacker!',
      descKo: '위생 점검을 제외한 모든 공격을 공격자에게 그대로 되돌려줍니다!'
    },
    {
      id: 'idol', name: '夜市之光', pinyin: 'yè-shì-zhī-guāng', en: 'Market Idol', ko: '야시장의 빛',
      type: 'defense', count: 2, icon: 'fa-solid fa-award', code: '抵擋', codeEn: 'BLOCK', codeKo: '방어',
      targetMode: 'reaction',
      desc: '除了「衛生稽查」以外之所有攻擊牌皆可完全抵擋。',
      descEn: 'Cancel any opponent attack (except Hygiene Inspection).',
      descKo: '위생 점검을 제외한 상대의 모든 공격 카드를 무효화합니다.'
    },
    {
      id: 'transfer', name: '有關係沒關係', pinyin: 'yǒu-guān-xì-méi-guān-xì', en: 'Thank You For Saving Me', ko: '인맥 찬스',
      type: 'defense', count: 1, icon: 'fa-solid fa-arrows-turn-right', code: '轉移', codeEn: 'SHIFT', codeKo: '전가',
      targetMode: 'reaction',
      desc: '將攻擊轉移給指定的第三方承受（僅兩人局時可反彈回攻擊者）。若第三方出黑社會，將反彈給轉移者。',
      descEn: 'Redirect an attack to a third player (in 2P mode, reflects to attacker). If they play Gangster, it bounces back to you.',
      descKo: '공격을 제3자에게 떠넘깁니다 (2인 시 반사). 제3자가 흑사회를 쓰면 넘긴 사람에게 반사됩니다.'
    }
  ];

  // 5 位 AI 夜市攤販角色（支援 2~6 人局，三語名稱）
  const AI_PROFILES = [
    {
      name: '阿明師', nameEn: 'Chef Ming', nameKo: '아밍 셰프',
      title: '熱炒快手', titleEn: 'Wok Master', titleKo: '불쇼 고수',
      icon: 'fa-solid fa-fire-burner', color: '#e05a47', aggression: 0.65
    },
    {
      name: '美鳳姐', nameEn: 'Auntie Feng', nameKo: '메이펑 누님',
      title: '巷口麵線王', titleEn: 'Noodle Queen', titleKo: '국수 여왕',
      icon: 'fa-solid fa-crown', color: '#e6b44c', aggression: 0.78
    },
    {
      name: '阿土伯', nameEn: 'Uncle Tu', nameKo: '아투 아저씨',
      title: '老字號湯頭', titleEn: 'Soup Veteran', titleKo: '노포 육수장인',
      icon: 'fa-solid fa-mug-hot', color: '#4ea3d1', aggression: 0.55
    },
    {
      name: '珍奶妹', nameEn: 'Boba Mei', nameKo: '버블티 메이',
      title: '夜市人氣王', titleEn: 'Market Star', titleKo: '야시장 아이돌',
      icon: 'fa-solid fa-star', color: '#b565d9', aggression: 0.62
    },
    {
      name: '鐵板哥', nameEn: 'Teppan Jay', nameKo: '철판 제이',
      title: '海陸霸主', titleEn: 'Grill King', titleKo: '철판왕',
      icon: 'fa-solid fa-utensils', color: '#3ea87b', aggression: 0.72
    }
  ];

  // 真人玩家代表色（最多 6 位全真人）
  const HUMAN_COLORS = ['#f0b429', '#e05a47', '#4ea3d1', '#63a63e', '#b565d9', '#e87a3e'];

  // ==================== 三語取值與疊加輔助 ====================
  function primaryLang() {
    return window.I18N ? window.I18N.getLang() : 'zh';
  }
  function stack(map, opts) {
    if (window.I18N && window.I18N.stackValues) {
      return window.I18N.stackValues(map, opts);
    }
    return map.zh || map.en || map.ko || '';
  }

  function ingMap(card) {
    const m = INGREDIENTS[card.typeId];
    if (!m) return { zh: card.name, en: card.name, ko: card.name };
    return card.rotten
      ? { zh: m.rottenName, en: m.rottenEn, ko: m.rottenKo }
      : { zh: m.name, en: m.en, ko: m.ko };
  }
  function ingName(card, lang) {
    const m = ingMap(card);
    return m[lang || primaryLang()] || m.zh;
  }
  function ingNameStack(card, opts) {
    return stack(ingMap(card), opts);
  }

  function ingMetaMap(typeId) {
    const m = INGREDIENTS[typeId];
    if (!m) return { zh: typeId, en: typeId, ko: typeId };
    return { zh: m.name, en: m.en, ko: m.ko };
  }
  function ingMetaName(typeId, lang) {
    const m = ingMetaMap(typeId);
    return m[lang || primaryLang()] || m.zh;
  }
  function ingMetaNameStack(typeId, opts) {
    return stack(ingMetaMap(typeId), opts);
  }

  function orderName(order, lang) {
    const l = lang || primaryLang();
    if (l === 'en') return order.en;
    if (l === 'ko') return order.ko || order.en;
    return order.name;
  }
  function orderNameStack(order, opts) {
    return stack({ zh: order.name, en: order.en, ko: order.ko }, opts);
  }

  function orderDesc(order, lang) {
    const l = lang || primaryLang();
    if (l === 'en') return order.descEn;
    if (l === 'ko') return order.descKo || order.descEn;
    return order.desc;
  }
  function orderDescStack(order, opts) {
    return stack({ zh: order.desc, en: order.descEn, ko: order.descKo }, opts);
  }
  function orderRegionStack(order, opts) {
    return stack({ zh: order.region, en: order.regionEn, ko: order.regionKo }, opts);
  }
  function orderStoryStack(order, opts) {
    return stack({ zh: order.story, en: order.storyEn, ko: order.storyKo }, opts);
  }
  function orderRecipeStack(order, opts) {
    return stack({ zh: order.recipe, en: order.recipeEn, ko: order.recipeKo }, opts);
  }
  function orderTipStack(order, opts) {
    return stack({ zh: order.tip, en: order.tipEn, ko: order.tipKo }, opts);
  }

  function specialName(sp, lang) {
    const l = lang || primaryLang();
    if (l === 'en') return sp.en;
    if (l === 'ko') return sp.ko || sp.en;
    return sp.name;
  }
  function specialNameStack(sp, opts) {
    return stack({ zh: sp.name, en: sp.en, ko: sp.ko }, opts);
  }
  function specialDesc(sp, lang) {
    const l = lang || primaryLang();
    if (l === 'en') return sp.descEn;
    if (l === 'ko') return sp.descKo || sp.descEn;
    return sp.desc;
  }
  function specialDescStack(sp, opts) {
    return stack({ zh: sp.desc, en: sp.descEn, ko: sp.descKo }, opts);
  }
  function specialCode(sp, lang) {
    const l = lang || primaryLang();
    if (l === 'en') return sp.codeEn || '';
    if (l === 'ko') return sp.codeKo || sp.codeEn || '';
    return sp.code || '';
  }

  function playerName(p, lang) {
    if (!p) return '';
    const l = lang || primaryLang();
    if (l === 'en') return p.nameEn || p.name;
    if (l === 'ko') return p.nameKo || p.nameEn || p.name;
    return p.name;
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
    ingNameStack,
    ingMetaName,
    ingMetaNameStack,
    orderName,
    orderNameStack,
    orderDesc,
    orderDescStack,
    orderRegionStack,
    orderStoryStack,
    orderRecipeStack,
    orderTipStack,
    orderPhotoUrl,
    specialName,
    specialNameStack,
    specialDesc,
    specialDescStack,
    specialCode,
    playerName,
    createIngredientDeck,
    createOrderDeck,
    createSpecialDeck,
    shuffle
  };
})();
