/**
 * 左下角可自由拖曳吉祥物（image/LiyuChillGuy.svg）
 * 支援滑鼠與觸控拖曳至畫面任何位置，懸停霓虹彩色發光抖動，支援中／英／韓三語疊加提示
 */
(function () {
  const QUOTES = [
    {
      zh: '大喊「夜市人蔘」就可以用人蔘替代任意 2 張食材喔！',
      en: 'Shout "YES! GINSENG!" to substitute ANY 2 ingredients with Ginseng!',
      ko: '"야시장 인삼!"을 외치면 흑인삼으로 원하는 식재료 2장을 대체해요!'
    },
    {
      zh: '點右上角音符按鈕，就能開啟美食小當家風格熱血配樂！',
      en: 'Click the music icon above to toggle the Cooking Master BGM!',
      ko: '오른쪽 위 음표 버튼으로 요리왕 비룡 스타일 열혈 BGM을 켜보세요!'
    },
    {
      zh: '中 / EN / 한 可以複選疊加，一次學臺灣小吃三國說法！',
      en: 'Toggle ZH / EN / KO together to overlay multiple languages at once!',
      ko: '중 / EN / 한 버튼을 복수 선택하면 3개 국어를 동시에 볼 수 있어요!'
    },
    {
      zh: '花 2 元買張攻防牌，關鍵時刻反制對手超爽快！',
      en: 'Spend $2 to buy a Special card and surprise your rival stalls!',
      ko: '2원으로 특수카드를 구매해 결정적 순간에 라이벌을 견제하세요!'
    },
    {
      zh: '小心「腐壞食材」，它不能用來做菜，記得優先捨棄喔！',
      en: 'Watch out for Rotten ingredients—they cannot be cooked. Discard them first!',
      ko: '상한 식재료는 요리할 수 없으니 손패를 버릴 때 최우선으로 버리세요!'
    },
    {
      zh: '「佛跳牆」唸出阿彌陀佛，菜和五穀也能變肉與海鮮！',
      en: 'Say "AH-MEAT-TOFU!" to turn Veg or Grain into Meat or Seafood!',
      ko: '"아미타불!"을 외치면 채소와 곡물이 고기·해산물로 변신해요!'
    },
    {
      zh: '打開「小吃圖鑑」點擊任何料理，都能展開完整文化故事與作法！',
      en: 'Open the Food Guide and click any dish to expand its cultural story!',
      ko: '야시장 도감에서 요리를 클릭하면 문화 이야기와 레시피가 펼쳐집니다!'
    }
  ];

  function initMascot() {
    const widget = document.getElementById('mascot-widget');
    const bubble = document.getElementById('mascot-bubble');
    if (!widget) return;

    let isDragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;
    let quoteIdx = 0;
    let bubbleTimer = null;

    function clampPosition(left, top) {
      const rect = widget.getBoundingClientRect();
      const maxX = Math.max(8, window.innerWidth - rect.width - 8);
      const maxY = Math.max(8, window.innerHeight - rect.height - 8);
      return {
        x: Math.min(Math.max(8, left), maxX),
        y: Math.min(Math.max(8, top), maxY)
      };
    }

    widget.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      isDragging = true;
      moved = false;
      const rect = widget.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeft = rect.left;
      origTop = rect.top;

      widget.style.left = `${rect.left}px`;
      widget.style.top = `${rect.top}px`;
      widget.style.bottom = 'auto';
      widget.style.right = 'auto';
      widget.classList.add('is-dragging');
      widget.setPointerCapture(e.pointerId);
    });

    widget.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        moved = true;
      }
      const pos = clampPosition(origLeft + dx, origTop + dy);
      widget.style.left = `${pos.x}px`;
      widget.style.top = `${pos.y}px`;
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      widget.classList.remove('is-dragging');
      try {
        widget.releasePointerCapture(e.pointerId);
      } catch (_) {}

      if (!moved && bubble) {
        if (window.SOUND) window.SOUND.click();
        const item = QUOTES[quoteIdx % QUOTES.length];
        quoteIdx++;
        if (window.I18N && window.I18N.stackValues) {
          bubble.innerHTML = window.I18N.stackValues(item);
        } else {
          bubble.textContent = item.zh;
        }
        bubble.classList.add('show');
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => {
          bubble.classList.remove('show');
        }, 4500);
      }
    }

    widget.addEventListener('pointerup', endDrag);
    widget.addEventListener('pointercancel', endDrag);

    window.addEventListener('resize', () => {
      if (widget.style.top && widget.style.top !== 'auto') {
        const rect = widget.getBoundingClientRect();
        const pos = clampPosition(rect.left, rect.top);
        widget.style.left = `${pos.x}px`;
        widget.style.top = `${pos.y}px`;
      }
    });
  }

  window.addEventListener('DOMContentLoaded', initMascot);
})();
