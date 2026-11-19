/**
 * 左下角可自由拖曳吉祥物（image/LiyuChillGuy.svg）
 * 支援滑鼠與觸控拖曳至畫面任何位置，懸停霓虹彩色發光抖動，支援中英雙語提示
 */
(function () {
  const QUOTES = {
    zh: [
      '大喊「夜市人蔘」就可以用人蔘替代任意 2 張食材喔！',
      '花 2 元買張攻防牌，關鍵時刻反制對手超爽快！',
      '小心「腐壞食材」，它不能用來做菜，記得優先捨棄喔！',
      '點擊 3D 桌上的發光餐點牌，就能直接出菜賺錢！',
      '「佛跳牆」唸出阿彌陀佛，菜和五穀也能變肉與海鮮！',
      '手牌超過 8 張時，結束回合前記得棄掉多餘手牌喔！',
      '可以把我拖曳到畫面上任何你喜歡的地方！'
    ],
    en: [
      'Shout "YES! GINSENG!" to substitute ANY 2 ingredients with Ginseng!',
      'Spend $2 to buy a Special card and surprise your rival stalls!',
      'Watch out for Rotten ingredients—they cannot be cooked. Discard them first!',
      'Click any glowing 3D Order card on the table to cook and earn cash!',
      'Say "AH-MEAT-TOFU!" to turn Veg or Grain into Meat or Seafood!',
      'Remember: hand limit is 8 cards at the end of your turn!',
      'Drag me anywhere on the screen you like!'
    ]
  };

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
        const lang = window.I18N ? window.I18N.getLang() : 'zh';
        const list = QUOTES[lang] || QUOTES.zh;
        bubble.textContent = list[quoteIdx % list.length];
        quoteIdx++;
        bubble.classList.add('show');
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => {
          bubble.classList.remove('show');
        }, 3800);
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
