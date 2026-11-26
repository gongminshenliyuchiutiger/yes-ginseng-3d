/**
 * 《夜市人蔘》Three.js 3D 桌遊場景引擎
 * 包含：
 * - 深胡桃木夜市牌桌與燙金桌墊
 * - 微風搖曳的 3D 臺灣夜市紅金燈籠與星夜光點
 * - 動態高度的 3D 牌堆（餐點 / 食材 / 攻防 / 棄牌區）
 * - 高解析 Canvas 紋理繪製的 3D 餐點牌（支援第 4 張橫向擺放、懸停抬升、可做菜金光）
 * - 3D 金幣堆、對手 3D 攤位與手牌扇形
 * - 3D 粒子特效（出菜金光、攻擊火球、人蔘光環）
 * - 完整滑鼠與觸控 Raycaster 互動 + 平滑視角控制
 */

window.NightMarket3D = (function () {
  let container = null;
  let scene, camera, renderer;
  let raycaster, mouse;
  let clock;
  let animId = null;

  // 視角球座標控制（不需額外 OrbitControls CDN，零相依且更平滑）
  const camControl = {
    targetTheta: 0,
    theta: 0,
    targetPhi: 0.78,
    phi: 0.78,
    targetRadius: 15.5,
    radius: 15.5,
    targetLookAt: new THREE.Vector3(0, 0.2, 0.8),
    lookAt: new THREE.Vector3(0, 0.2, 0.8),
    dragging: false,
    lastX: 0,
    lastY: 0,
    moved: false
  };

  // 場景動態物件群組
  const lanterns = [];
  const orderMeshes = [];
  const interactiveMeshes = [];
  const particles = [];
  const waveRings = [];
  let deckMeshes = {};
  let coinGroup = null;
  let opponentGroups = [];
  let hoveredMesh = null;

  // 事件回呼
  let callbacks = {
    onOrderClick: null,
    onBuySpecialClick: null,
    onDeckInfoClick: null
  };

  // 紋理快取
  const textureCache = new Map();

  function init(mountEl, cbs) {
    container = mountEl;
    callbacks = { ...callbacks, ...cbs };
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color('#131926');
    scene.fog = new THREE.FogExp2('#131926', 0.022);

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-99, -99);

    setupLights();
    buildEnvironment();
    buildTable();
    buildDecks();
    buildLanterns();

    coinGroup = new THREE.Group();
    coinGroup.position.set(4.8, 0.05, 3.3);
    scene.add(coinGroup);

    bindEvents();
    updateCameraImmediate();
    animate();
  }

  function setupLights() {
    const ambient = new THREE.AmbientLight('#c7d5f0', 0.72);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight('#ffe5b4', '#1b2236', 0.55);
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight('#fff2d6', 0.95);
    dirLight.position.set(6, 14, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 2;
    dirLight.shadow.camera.far = 35;
    const d = 11;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // 中央暖光聚焦桌面
    const spot = new THREE.PointLight('#ffaa55', 0.85, 22, 1.5);
    spot.position.set(0, 6.5, 1.5);
    scene.add(spot);
  }

  function buildEnvironment() {
    // 遠景夜市星點與光暈粒子
    const starGeo = new THREE.BufferGeometry();
    const count = 180;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color('#ffd36e'), new THREE.Color('#ff7052'), new THREE.Color('#8cb8ff')];
    for (let i = 0; i < count; i++) {
      const r = 18 + Math.random() * 25;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 2 + Math.random() * 14;
      positions[i * 3 + 2] = Math.sin(a) * r;
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.65
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
  }

  function createTableMatTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // 深藍靛青絨布桌墊（呼應原版規則書封面）
    const grad = ctx.createRadialGradient(512, 384, 80, 512, 384, 600);
    grad.addColorStop(0, '#2a354a');
    grad.addColorStop(1, '#182030');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 768);

    // 細緻織布紋理
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 768);
      ctx.stroke();
    }
    for (let y = 0; y < 768; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // 燙金雙層邊框
    ctx.strokeStyle = 'rgba(230, 193, 103, 0.72)';
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, 968, 712);
    ctx.strokeStyle = 'rgba(230, 193, 103, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, 940, 684);

    // 四角中式回紋裝飾
    const corners = [[42, 42, 1, 1], [982, 42, -1, 1], [42, 726, 1, -1], [982, 726, -1, -1]];
    ctx.strokeStyle = '#e6c167';
    ctx.lineWidth = 3;
    corners.forEach(([cx, cy, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + sy * 36);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + sx * 36, cy);
      ctx.stroke();
    });

    // 中央浮水印標題
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = '#e6c167';
    ctx.font = 'bold 68px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('夜 市 人 蔘', 512, 370);
    ctx.font = '600 26px sans-serif';
    ctx.fillText('YES! GINSENG  •  TAIWAN NIGHT MARKET', 512, 412);
    ctx.restore();

    // 區域虛線框（棄牌區 & 餐點區標示）
    ctx.strokeStyle = 'rgba(230, 193, 103, 0.28)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(140, 105, 744, 195); // 上排牌堆與棄牌區
    ctx.strokeRect(140, 330, 744, 295); // 下排餐點展示區
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(230, 193, 103, 0.55)';
    ctx.font = '600 18px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('牌堆與棄牌區', 155, 130);
    ctx.fillText('夜市餐點展示區（點擊 3D 餐點牌即可料理）', 155, 355);

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;
    return tex;
  }

  function buildTable() {
    // 實木外框桌板
    const woodMat = new THREE.MeshStandardMaterial({
      color: '#4e2f1d',
      roughness: 0.65,
      metalness: 0.08
    });
    const frameGeo = new THREE.BoxGeometry(15.2, 0.65, 11.4);
    const frameMesh = new THREE.Mesh(frameGeo, woodMat);
    frameMesh.position.y = -0.35;
    frameMesh.receiveShadow = true;
    scene.add(frameMesh);

    // 燙金金屬包邊
    const brassMat = new THREE.MeshStandardMaterial({
      color: '#d4a94a',
      roughness: 0.35,
      metalness: 0.75
    });
    const trimGeo = new THREE.BoxGeometry(15.35, 0.14, 11.55);
    const trimMesh = new THREE.Mesh(trimGeo, brassMat);
    trimMesh.position.y = -0.05;
    scene.add(trimMesh);

    // 絨布桌墊
    const matGeo = new THREE.PlaneGeometry(14.1, 10.3);
    const matMaterial = new THREE.MeshStandardMaterial({
      map: createTableMatTexture(),
      roughness: 0.85,
      metalness: 0.05
    });
    const matMesh = new THREE.Mesh(matGeo, matMaterial);
    matMesh.rotation.x = -Math.PI / 2;
    matMesh.position.y = 0.005;
    matMesh.receiveShadow = true;
    scene.add(matMesh);
  }

  function buildLanterns() {
    const positions = [
      [-6.8, 4.6, -4.6],
      [6.8, 4.6, -4.6],
      [-7.2, 4.4, 3.8],
      [7.2, 4.4, 3.8]
    ];
    positions.forEach((pos, idx) => {
      const group = new THREE.Group();
      group.position.set(pos[0], pos[1], pos[2]);

      // 懸繩
      const cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 2.2, 8),
        new THREE.MeshBasicMaterial({ color: '#d4a94a' })
      );
      cord.position.y = 1.6;
      group.add(cord);

      // 紅燈籠主體
      const bodyGeo = new THREE.SphereGeometry(0.62, 16, 12);
      bodyGeo.scale(1, 1.28, 1);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: '#c92a2a',
        emissive: '#e84118',
        emissiveIntensity: 0.72,
        roughness: 0.45
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      // 金色上下燈蓋
      const capMat = new THREE.MeshStandardMaterial({ color: '#e6c167', metalness: 0.7, roughness: 0.3 });
      const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.14, 14), capMat);
      topCap.position.y = 0.76;
      group.add(topCap);
      const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.14, 14), capMat);
      botCap.position.y = -0.76;
      group.add(botCap);

      // 紅金流蘇
      const tassel = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.55, 10),
        new THREE.MeshStandardMaterial({ color: '#e6c167', emissive: '#b57b1b', emissiveIntensity: 0.25 })
      );
      tassel.position.y = -1.1;
      tassel.rotation.x = Math.PI;
      group.add(tassel);

      // 燈籠暖光
      const light = new THREE.PointLight('#ff8438', 0.65, 11, 1.7);
      light.position.y = -0.1;
      group.add(light);

      scene.add(group);
      lanterns.push({ group, phase: idx * 1.4, baseY: pos[1] });
    });
  }

  function createCardBackTexture(title, subtitle, bgColor, borderColor) {
    const key = `back_${title}_${bgColor}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 256, 360);

    // 內紋
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    for (let i = -360; i < 620; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 360, 360);
      ctx.stroke();
    }

    // 外框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, 228, 332);
    ctx.lineWidth = 3;
    ctx.strokeRect(26, 26, 204, 308);

    // 中央牌匾
    ctx.fillStyle = 'rgba(18, 24, 38, 0.78)';
    ctx.fillRect(48, 102, 160, 156);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 102, 160, 156);

    ctx.fillStyle = '#fff5dc';
    ctx.font = 'bold 34px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 128, 174);

    ctx.fillStyle = borderColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(subtitle, 128, 214);

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    textureCache.set(key, tex);
    return tex;
  }

  function buildDecks() {
    const specs = [
      { key: 'ingDiscard', label: '食材棄牌', sub: 'DISCARD', x: -4.2, z: -2.2, color: '#243044', border: '#7ab4ed', interactive: false },
      { key: 'spDiscard', label: '攻防棄牌', sub: 'DISCARD', x: -2.2, z: -2.2, color: '#3b2024', border: '#f08686', interactive: false },
      { key: 'orderDeck', label: '餐點牌堆', sub: 'ORDER', x: 0.2, z: -2.2, color: '#2e6b46', border: '#e6c167', interactive: false },
      { key: 'ingDeck', label: '食材牌堆', sub: 'INGREDIENT', x: 2.2, z: -2.2, color: '#24528a', border: '#e6c167', interactive: false },
      { key: 'spDeck', label: '攻防牌堆', sub: '2元購買', x: 4.2, z: -2.2, color: '#a82c2c', border: '#ffd36e', interactive: true }
    ];

    specs.forEach((s) => {
      const topTex = createCardBackTexture(s.label, s.sub, s.color, s.border);
      const sideMat = new THREE.MeshStandardMaterial({ color: '#e8dec5', roughness: 0.7 });
      const topMat = new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.45 });
      const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];

      const geo = new THREE.BoxGeometry(1.5, 0.35, 2.15);
      const mesh = new THREE.Mesh(geo, materials);
      mesh.position.set(s.x, 0.18, s.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { kind: s.interactive ? 'buy_special' : 'deck', key: s.key, baseY: 0.18 };
      scene.add(mesh);
      deckMeshes[s.key] = mesh;
      if (s.interactive) {
        interactiveMeshes.push(mesh);
      }
    });
  }

  // 純程式繪製高解析 3D 餐點牌卡面（支援繁體中文 / English / 한국어 三語疊加即時切換）
  function createOrderCardTexture(order, canCook) {
    const activeLangs = window.I18N ? window.I18N.getActiveLangs() : ['zh'];
    const primary = activeLangs[0] || 'zh';
    const isEn = primary === 'en';
    const isKo = primary === 'ko';
    const hasZh = activeLangs.includes('zh');
    const hasEn = activeLangs.includes('en');
    const hasKo = activeLangs.includes('ko');
    const langKey = activeLangs.join('_');
    const key = `order_${order.id}_${canCook ? '1' : '0'}_${langKey}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 340;
    canvas.height = 510;
    const ctx = canvas.getContext('2d');

    const tierColors = {
      1: '#f0a680',
      2: '#f2d349',
      3: '#6a8248',
      4: '#485269'
    };
    const tierColor = tierColors[order.price] || '#e6c167';

    // 1. 宣紙暖白底色
    ctx.fillStyle = '#faf5ea';
    ctx.fillRect(0, 0, 340, 510);

    // 2. 底部典雅色帶
    ctx.fillStyle = tierColor;
    ctx.fillRect(0, 418, 340, 92);
    ctx.fillStyle = '#faf5ea';
    ctx.beginPath();
    ctx.arc(170, 392, 152, 0, Math.PI * 2);
    ctx.fill();

    // 淡金色中式裝飾線條
    ctx.save();
    ctx.strokeStyle = 'rgba(196, 160, 92, 0.22)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(220 + i * 24, 20);
      ctx.quadraticCurveTo(250 + i * 18, 120, 215 + i * 24, 220);
      ctx.stroke();
    }
    ctx.restore();

    // 3. 左上角餐點金額
    ctx.fillStyle = '#38342e';
    ctx.textAlign = 'left';
    if (isEn) {
      ctx.font = 'bold 52px "Noto Serif TC", serif';
      ctx.fillText(`$${order.price}`, 22, 74);
    } else if (isKo) {
      ctx.font = 'bold 52px "Noto Sans KR", sans-serif';
      ctx.fillText(String(order.price), 26, 74);
      ctx.font = 'bold 20px "Noto Sans KR", sans-serif';
      ctx.fillText('원', 64, 54);
    } else {
      ctx.font = 'bold 58px "Noto Serif TC", serif';
      ctx.fillText(String(order.price), 28, 76);
      ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
      ctx.fillText('元', 68, 52);
    }

    // 復古雙細線
    ctx.strokeStyle = '#4a4338';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(116, 30);
    ctx.lineTo(116, 178);
    ctx.moveTo(123, 30);
    ctx.lineTo(123, 178);
    ctx.stroke();

    // 4. 菜名與多語疊加 + 拼音
    if (hasZh) {
      const chars = Array.from(order.name);
      const nameSize = chars.length >= 5 ? 28 : chars.length === 4 ? 32 : 38;
      const stepY = chars.length >= 5 ? 31 : chars.length === 4 ? 36 : 44;
      ctx.fillStyle = '#24211d';
      ctx.font = `bold ${nameSize}px "Noto Serif TC", serif`;
      ctx.textAlign = 'center';
      chars.forEach((ch, idx) => {
        ctx.fillText(ch, 160, 58 + idx * stepY);
      });

      ctx.textAlign = 'left';
      let sideY = 54;
      ctx.fillStyle = '#6e6456';
      ctx.font = '600 14px sans-serif';
      const pinyinText = order.taiwanese ? `${order.pinyin} *` : order.pinyin;
      ctx.fillText(pinyinText, 190, sideY);
      sideY += 20;

      if (order.taiwanese) {
        ctx.fillStyle = '#b55638';
        ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
        ctx.fillText('臺語發音', 190, sideY);
        sideY += 20;
      }
      if (hasEn) {
        ctx.fillStyle = '#3c4a63';
        ctx.font = '700 13px sans-serif';
        const enParts = order.en.length > 16 ? [order.en.slice(0, 16), order.en.slice(16, 32)] : [order.en];
        enParts.forEach((line) => {
          ctx.fillText(line.trim(), 190, sideY);
          sideY += 16;
        });
        sideY += 4;
      }
      if (hasKo && order.ko) {
        ctx.fillStyle = '#7d3a5c';
        ctx.font = '700 13px "Noto Sans KR", sans-serif';
        ctx.fillText(order.ko.slice(0, 12), 190, sideY);
        if (order.ko.length > 12) {
          ctx.fillText(order.ko.slice(12, 24), 190, sideY + 16);
        }
      }
    } else if (isKo) {
      ctx.fillStyle = '#24211d';
      ctx.font = 'bold 21px "Noto Sans KR", sans-serif';
      ctx.textAlign = 'left';
      const koTitle = order.ko || order.en;
      ctx.fillText(koTitle.slice(0, 10), 136, 62);
      if (koTitle.length > 10) {
        ctx.fillText(koTitle.slice(10, 20), 136, 90);
      }
      let sideY = koTitle.length > 10 ? 118 : 96;
      if (hasEn) {
        ctx.fillStyle = '#3c4a63';
        ctx.font = '700 13px sans-serif';
        ctx.fillText(order.en.slice(0, 22), 136, sideY);
        sideY += 20;
      }
      ctx.fillStyle = '#6e6456';
      ctx.font = '600 14px sans-serif';
      ctx.fillText(`${order.name} · ${order.pinyin}`, 136, sideY);
    } else {
      ctx.fillStyle = '#24211d';
      ctx.font = 'bold 22px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'left';
      const words = order.en.split(' ');
      let line1 = words[0] || '';
      let line2 = words.slice(1).join(' ');
      if (words.length >= 3 && (words[0] + ' ' + words[1]).length <= 14) {
        line1 = words[0] + ' ' + words[1];
        line2 = words.slice(2).join(' ');
      }
      ctx.fillText(line1, 136, 62);
      if (line2) ctx.fillText(line2, 136, 90);

      let sideY = line2 ? 118 : 96;
      if (hasKo && order.ko) {
        ctx.fillStyle = '#7d3a5c';
        ctx.font = '700 14px "Noto Sans KR", sans-serif';
        ctx.fillText(order.ko.slice(0, 15), 136, sideY);
        sideY += 20;
      }
      ctx.fillStyle = '#6e6456';
      ctx.font = '600 14px sans-serif';
      ctx.fillText(`${order.name} · ${order.pinyin}`, 136, sideY);
      if (order.taiwanese) {
        ctx.fillStyle = '#b55638';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('* Taiwanese Pronunciation', 136, sideY + 18);
      }
    }

    // 5. 左側招牌「半圓扇形食材色塊」
    const pieX = 0;
    const pieY = 238;
    const pieR = 76;
    const ingList = order.ingredients;
    const total = ingList.length;

    ctx.beginPath();
    ctx.arc(pieX, pieY, pieR + 5, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = '#faf5ea';
    ctx.fill();

    const startBase = -Math.PI / 2;
    const sliceAng = Math.PI / total;
    ingList.forEach((ingId, idx) => {
      const meta = window.GAME_DATA.INGREDIENTS[ingId];
      const a0 = startBase + idx * sliceAng;
      const a1 = a0 + sliceAng;
      ctx.beginPath();
      ctx.moveTo(pieX, pieY);
      ctx.arc(pieX, pieY, pieR, a0, a1);
      ctx.closePath();
      ctx.fillStyle = meta.color;
      ctx.fill();
      ctx.strokeStyle = '#faf5ea';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const mid = (a0 + a1) / 2;
      const tx = pieX + Math.cos(mid) * (pieR * 0.64);
      const ty = pieY + Math.sin(mid) * (pieR * 0.64);
      ctx.fillStyle = '#ffffff';
      ctx.font = isEn ? 'bold 12px sans-serif' : 'bold 15px "Noto Sans TC", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortTxt = isEn ? meta.shortEn : isKo ? meta.shortKo : meta.short;
      ctx.fillText(shortTxt, tx, ty);
    });
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#5c5346';
    ctx.font = 'bold 13px "Noto Sans TC", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(window.I18N ? window.I18N.t('card3dIngLabel') : '食材', 12, pieY - pieR - 12);
    ctx.font = '600 11px sans-serif';
    ctx.fillText('INGREDIENT', 10, pieY + pieR + 20);

    // 6. 下半部程序化臺灣小吃碗盤藝術繪製
    const cx = 192;
    const cy = 368;

    ctx.beginPath();
    ctx.arc(cx, cy + 10, 102, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 24, 18, 0.16)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 98, 0, Math.PI * 2);
    ctx.fillStyle = '#253042';
    ctx.fill();
    ctx.strokeStyle = '#e6c167';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 82, 0, Math.PI * 2);
    ctx.fillStyle = order.accent || '#c45b33';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 250, 235, 0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ingList.forEach((ingId, idx) => {
      const ing = window.GAME_DATA.INGREDIENTS[ingId];
      const ang = (idx / total) * Math.PI * 2 - Math.PI / 3;
      const rad = total === 2 ? 28 : 36;
      const ix = cx + Math.cos(ang) * rad;
      const iy = cy + Math.sin(ang) * rad;

      ctx.beginPath();
      ctx.arc(ix, iy, 22, 0, Math.PI * 2);
      ctx.fillStyle = ing.light;
      ctx.fill();
      ctx.strokeStyle = '#fffaf0';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = ing.dark;
      ctx.font = isEn ? 'bold 12px sans-serif' : 'bold 14px "Noto Sans TC", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortTxt = isEn ? ing.shortEn : isKo ? ing.shortKo : ing.short;
      ctx.fillText(shortTxt, ix, iy);
    });
    ctx.textBaseline = 'alphabetic';

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = 3;
    [-22, 0, 22].forEach((ox) => {
      ctx.beginPath();
      ctx.moveTo(cx + ox, cy - 34);
      ctx.quadraticCurveTo(cx + ox - 8, cy - 52, cx + ox + 4, cy - 66);
      ctx.stroke();
    });

    // 7. 外框與「可做菜」發光橫幅
    if (canCook) {
      ctx.strokeStyle = '#ffd04d';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 326, 496);

      ctx.fillStyle = 'rgba(18, 24, 38, 0.92)';
      ctx.fillRect(16, 452, 308, 42);
      ctx.strokeStyle = '#ffd97d';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 452, 308, 42);

      ctx.fillStyle = '#ffd97d';
      ctx.font = 'bold 19px "Noto Sans TC", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(window.I18N ? window.I18N.t('card3dReady') : '食材充足！點擊立即出菜', 170, 480);
    } else {
      ctx.strokeStyle = '#d4c3a1';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 332, 502);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;
    textureCache.set(key, tex);
    return tex;
  }

  // 同步更新場上餐點牌 (3~4 張)
  function syncOrders(tableOrders, cookableMap) {
    // 清除舊的餐點網格
    orderMeshes.forEach((m) => {
      scene.remove(m);
      const idx = interactiveMeshes.indexOf(m);
      if (idx !== -1) interactiveMeshes.splice(idx, 1);
    });
    orderMeshes.length = 0;

    const count = tableOrders.length;
    const spacing = 2.65;
    const startX = -((Math.min(count, 3) - 1) * spacing) / 2;

    tableOrders.forEach((entry, idx) => {
      const order = entry.card;
      const isExtra = !!entry.isExtra;
      const canCook = !!(cookableMap && cookableMap[order.uid]);

      const tex = createOrderCardTexture(order, canCook);
      const topMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.4,
        emissive: canCook ? new THREE.Color('#ffaa22') : new THREE.Color('#000000'),
        emissiveIntensity: canCook ? 0.16 : 0
      });
      const sideMat = new THREE.MeshStandardMaterial({ color: canCook ? '#f0b429' : '#d8ccb2', roughness: 0.5 });
      const geo = new THREE.BoxGeometry(2.05, 0.09, 2.9);
      const mesh = new THREE.Mesh(geo, [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);

      let x = startX + idx * spacing;
      let z = 1.45;
      let rotY = 0;
      if (isExtra) {
        // 依據原版規則：YES! WE SPEAK ENGLISH 翻出的第 4 張餐點牌需橫向擺放
        x = startX + 3 * spacing + 0.35;
        z = 1.45;
        rotY = Math.PI / 2;
      }

      mesh.position.set(x, canCook ? 0.14 : 0.06, z);
      mesh.rotation.y = rotY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        kind: 'order',
        orderUid: order.uid,
        baseY: canCook ? 0.14 : 0.06,
        canCook,
        baseRotY: rotY
      };

      scene.add(mesh);
      orderMeshes.push(mesh);
      interactiveMeshes.push(mesh);
    });
  }

  // 同步牌堆高度
  function syncDecks(counts) {
    const map = {
      orderDeck: counts.orderDeck,
      ingDeck: counts.ingDeck,
      spDeck: counts.spDeck,
      ingDiscard: counts.ingDiscard,
      spDiscard: counts.spDiscard
    };
    Object.entries(map).forEach(([k, n]) => {
      const mesh = deckMeshes[k];
      if (!mesh) return;
      const visible = n > 0;
      mesh.visible = visible;
      if (visible) {
        const scaleY = Math.max(0.18, Math.min(2.2, n * 0.055));
        mesh.scale.y = scaleY;
        const h = 0.35 * scaleY;
        mesh.position.y = h / 2 + 0.01;
        mesh.userData.baseY = mesh.position.y;
      }
    });
  }

  // 同步玩家 3D 金幣堆
  function syncPlayerCoins(money) {
    while (coinGroup.children.length > 0) {
      coinGroup.remove(coinGroup.children[0]);
    }
    const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 20);
    const coinMat = new THREE.MeshStandardMaterial({
      color: '#f2c14e',
      metalness: 0.78,
      roughness: 0.25,
      emissive: '#6e4900',
      emissiveIntensity: 0.18
    });
    const maxCoins = Math.min(money, 24);
    for (let i = 0; i < maxCoins; i++) {
      const stack = Math.floor(i / 6);
      const level = i % 6;
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(stack * 0.72, level * 0.09 + 0.04, (stack % 2) * 0.35);
      coin.castShadow = true;
      coinGroup.add(coin);
    }
  }

  // 同步對手 3D 攤位與手牌扇形
  function syncOpponents(opponents, activePlayerIndex) {
    opponentGroups.forEach((g) => scene.remove(g));
    opponentGroups = [];

    // 依照對手數量安排桌邊座位：支援 2~6 人局（1~5 位對手）
    const layouts = {
      1: [{ x: 0, z: -5.3, rotY: 0 }],
      2: [{ x: -4.2, z: -5.1, rotY: 0.32 }, { x: 4.2, z: -5.1, rotY: -0.32 }],
      3: [
        { x: -6.9, z: -0.4, rotY: Math.PI / 2 },
        { x: 0, z: -5.4, rotY: 0 },
        { x: 6.9, z: -0.4, rotY: -Math.PI / 2 }
      ],
      4: [
        { x: -6.9, z: -0.4, rotY: Math.PI / 2 },
        { x: -3.2, z: -5.4, rotY: 0.16 },
        { x: 3.2, z: -5.4, rotY: -0.16 },
        { x: 6.9, z: -0.4, rotY: -Math.PI / 2 }
      ],
      5: [
        { x: -6.9, z: 0.9, rotY: Math.PI / 2 },
        { x: -5.4, z: -4.8, rotY: 0.45 },
        { x: 0, z: -5.5, rotY: 0 },
        { x: 5.4, z: -4.8, rotY: -0.45 },
        { x: 6.9, z: 0.9, rotY: -Math.PI / 2 }
      ]
    };
    const seats = layouts[opponents.length] || layouts[5];

    opponents.forEach((op, idx) => {
      const seat = seats[idx];
      if (!seat) return;
      const g = new THREE.Group();
      g.position.set(seat.x, 0.05, seat.z);
      g.rotation.y = seat.rotY;

      const isActive = op.index === activePlayerIndex;

      // 攤位底座
      const baseMat = new THREE.MeshStandardMaterial({
        color: isActive ? '#e6c167' : '#2b3347',
        emissive: isActive ? '#c9881a' : '#000000',
        emissiveIntensity: isActive ? 0.45 : 0,
        roughness: 0.45
      });
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 1.25), baseMat);
      base.castShadow = true;
      g.add(base);

      // 對手手牌立體扇形
      const cardCount = Math.min(op.hand.length, 10);
      const cardGeo = new THREE.BoxGeometry(0.46, 0.68, 0.04);
      const ingMat = new THREE.MeshStandardMaterial({ color: '#2b5ea3', roughness: 0.5 });
      const spMat = new THREE.MeshStandardMaterial({ color: '#b83232', roughness: 0.5 });

      for (let c = 0; c < cardCount; c++) {
        const card = op.hand[c];
        const m = new THREE.Mesh(cardGeo, card.kind === 'special' ? spMat : ingMat);
        const offset = c - (cardCount - 1) / 2;
        m.position.set(offset * 0.28, 0.46, 0.15);
        m.rotation.z = -offset * 0.08;
        m.rotation.x = -0.2;
        m.castShadow = true;
        g.add(m);
      }

      // 蟑螂狀態指示紅光環
      if (op.skipCookTurns > 0) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.55, 0.72, 24),
          new THREE.MeshBasicMaterial({ color: '#ff4757', side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 0.12, 0.9);
        g.add(ring);
      }

      scene.add(g);
      opponentGroups.push(g);
    });
  }

  // 特效：出菜金色粒子噴發（美食小當家「揭蓋發光！」雙重光環與上升金芒）
  function burstCookEffect(orderUid) {
    const target = orderMeshes.find((m) => m.userData.orderUid === orderUid);
    const origin = target ? target.position.clone() : new THREE.Vector3(0, 0.5, 1.4);
    spawnParticles(origin, '#ffd36e', 38, 4.4);
    spawnParticles(origin, '#fff5cc', 18, 5.6);
    spawnWaveRing(origin, '#ffd36e');
    setTimeout(() => spawnWaveRing(origin, '#fff0a8'), 120);
  }

  // 特效：攻防紅色衝擊粒子
  function burstAttackEffect() {
    const origin = new THREE.Vector3(0, 0.7, 0);
    spawnParticles(origin, '#ff4d4d', 36, 4.8);
    spawnParticles(origin, '#ff9f43', 16, 3.8);
    spawnWaveRing(origin, '#ff4d4d');
  }

  // 特效：防禦金鐘罩藍色波紋
  function burstDefenseEffect() {
    const origin = new THREE.Vector3(0, 0.55, 0.6);
    spawnParticles(origin, '#5aa3e8', 32, 4.2);
    spawnParticles(origin, '#bfe2ff', 16, 3.6);
    spawnWaveRing(origin, '#5aa3e8');
    setTimeout(() => spawnWaveRing(origin, '#bfe2ff'), 110);
  }

  // 特效：人蔘 / 佛跳牆金色大波紋與閃耀金龍捲
  function burstGinsengEffect() {
    const origin = new THREE.Vector3(0, 0.4, 0.8);
    spawnParticles(origin, '#ffe17d', 56, 5.8);
    spawnParticles(origin, '#ffaa22', 28, 4.5);
    spawnWaveRing(origin, '#ffe17d');
    setTimeout(() => spawnWaveRing(origin, '#ffaa22'), 110);
    setTimeout(() => spawnWaveRing(origin, '#fff6cc'), 220);
  }

  function spawnParticles(origin, colorHex, count, speed) {
    const geo = new THREE.OctahedronGeometry(0.11, 0);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.position.copy(origin);
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.4 + Math.random() * 0.8) * speed;
      const vel = new THREE.Vector3(
        Math.cos(angle) * spd * 0.6,
        1.8 + Math.random() * speed * 0.75,
        Math.sin(angle) * spd * 0.6
      );
      scene.add(mesh);
      particles.push({ mesh, vel, life: 1.0 });
    }
  }

  function spawnWaveRing(origin, colorHex) {
    const geo = new THREE.RingGeometry(0.3, 0.52, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(origin.x, 0.15, origin.z);
    scene.add(mesh);
    waveRings.push({ mesh, life: 1.0 });
  }

  // 視角預設切換
  function setCameraPreset(preset) {
    if (preset === 'top') {
      camControl.targetTheta = 0;
      camControl.targetPhi = 0.22;
      camControl.targetRadius = 15.8;
      camControl.targetLookAt.set(0, 0, 0.3);
    } else if (preset === 'cinema') {
      camControl.targetTheta = 0.36;
      camControl.targetPhi = 1.05;
      camControl.targetRadius = 14.8;
      camControl.targetLookAt.set(0, 0.4, 0.6);
    } else {
      camControl.targetTheta = 0;
      camControl.targetPhi = 0.78;
      camControl.targetRadius = 15.5;
      camControl.targetLookAt.set(0, 0.2, 0.8);
    }
  }

  function updateCameraImmediate() {
    const x = camControl.lookAt.x + camControl.radius * Math.sin(camControl.phi) * Math.sin(camControl.theta);
    const y = camControl.lookAt.y + camControl.radius * Math.cos(camControl.phi);
    const z = camControl.lookAt.z + camControl.radius * Math.sin(camControl.phi) * Math.cos(camControl.theta);
    camera.position.set(x, y, z);
    camera.lookAt(camControl.lookAt);
  }

  function bindEvents() {
    const dom = renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      camControl.dragging = true;
      camControl.moved = false;
      camControl.lastX = e.clientX;
      camControl.lastY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (camControl.dragging) {
        const dx = e.clientX - camControl.lastX;
        const dy = e.clientY - camControl.lastY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) camControl.moved = true;
        camControl.targetTheta -= dx * 0.0065;
        camControl.targetPhi = Math.max(0.2, Math.min(1.18, camControl.targetPhi - dy * 0.006));
        camControl.lastX = e.clientX;
        camControl.lastY = e.clientY;
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (!camControl.dragging) return;
      camControl.dragging = false;
      if (!camControl.moved) {
        handleTap(e);
      }
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      camControl.targetRadius = Math.max(10, Math.min(22, camControl.targetRadius + e.deltaY * 0.01));
    }, { passive: false });

    window.addEventListener('resize', onResize);
  }

  function handleTap(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      return;
    }
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    if (hits.length > 0) {
      const obj = hits[0].object;
      if (obj.userData.kind === 'order' && callbacks.onOrderClick) {
        callbacks.onOrderClick(obj.userData.orderUid);
      } else if (obj.userData.kind === 'buy_special' && callbacks.onBuySpecialClick) {
        callbacks.onBuySpecialClick();
      }
    }
  }

  function onResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    animId = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();

    // 平滑視角插值
    camControl.theta += (camControl.targetTheta - camControl.theta) * 0.09;
    camControl.phi += (camControl.targetPhi - camControl.phi) * 0.09;
    camControl.radius += (camControl.targetRadius - camControl.radius) * 0.09;
    camControl.lookAt.lerp(camControl.targetLookAt, 0.09);
    updateCameraImmediate();

    // 紅燈籠微風搖曳
    lanterns.forEach((l) => {
      l.group.rotation.z = Math.sin(elapsed * 1.3 + l.phase) * 0.08;
      l.group.rotation.x = Math.cos(elapsed * 1.0 + l.phase) * 0.05;
    });

    // Raycaster 懸停偵測
    if (!camControl.dragging) {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      hoveredMesh = hits.length > 0 ? hits[0].object : null;
      renderer.domElement.style.cursor = hoveredMesh ? 'pointer' : 'grab';
    } else {
      renderer.domElement.style.cursor = 'grabbing';
    }

    // 餐點牌懸停與可做菜呼吸浮動
    orderMeshes.forEach((m, idx) => {
      const isHover = m === hoveredMesh;
      const floatY = m.userData.canCook ? Math.sin(elapsed * 3.2 + idx) * 0.06 : 0;
      const targetY = m.userData.baseY + (isHover ? 0.38 : 0) + floatY;
      m.position.y += (targetY - m.position.y) * 0.16;
      const targetRotX = isHover ? 0.16 : 0;
      m.rotation.x += (targetRotX - m.rotation.x) * 0.16;
    });

    // 攻防牌堆懸停抬起提示
    if (deckMeshes.spDeck) {
      const sp = deckMeshes.spDeck;
      const isHover = sp === hoveredMesh;
      const targetY = sp.userData.baseY + (isHover ? 0.18 : 0);
      sp.position.y += (targetY - sp.position.y) * 0.15;
    }

    // 粒子更新
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt * 1.15;
      if (p.life <= 0) {
        scene.remove(p.mesh);
        particles.splice(i, 1);
      } else {
        p.vel.y -= 6.5 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += dt * 4;
        p.mesh.rotation.y += dt * 5;
        p.mesh.scale.setScalar(Math.max(0.01, p.life));
      }
    }

    // 光環波紋更新
    for (let i = waveRings.length - 1; i >= 0; i--) {
      const w = waveRings[i];
      w.life -= dt * 1.3;
      if (w.life <= 0) {
        scene.remove(w.mesh);
        waveRings.splice(i, 1);
      } else {
        const s = 1 + (1 - w.life) * 8.5;
        w.mesh.scale.setScalar(s);
        w.mesh.material.opacity = w.life * 0.85;
      }
    }

    renderer.render(scene, camera);
  }

  function refreshLanguage() {
    const t = window.I18N ? window.I18N.t : (k) => k;
    const deckLabels = {
      ingDiscard: [t('deck3dIngDiscard'), 'DISCARD', '#243044', '#7ab4ed'],
      spDiscard: [t('deck3dSpDiscard'), 'DISCARD', '#3b2024', '#f08686'],
      orderDeck: [t('deck3dOrder'), 'ORDER', '#2e6b46', '#e6c167'],
      ingDeck: [t('deck3dIng'), 'INGREDIENT', '#24528a', '#e6c167'],
      spDeck: [t('deck3dSp'), t('deck3dSpSub'), '#a82c2c', '#ffd36e']
    };
    Object.entries(deckLabels).forEach(([k, [title, sub, bg, border]]) => {
      const mesh = deckMeshes[k];
      if (!mesh) return;
      const tex = createCardBackTexture(title, sub, bg, border);
      mesh.material[2].map = tex;
      mesh.material[2].needsUpdate = true;
    });
  }

  return {
    init,
    syncOrders,
    syncDecks,
    syncPlayerCoins,
    syncOpponents,
    setCameraPreset,
    refreshLanguage,
    burstCookEffect,
    burstAttackEffect,
    burstDefenseEffect,
    burstGinsengEffect
  };
})();
