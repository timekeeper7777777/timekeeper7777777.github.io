/* JOJO7 —— Steel Ball Run 特效层
   星点 / 放射线(CSS) / 拟声词滚动带 / SBR 徽记 / 漫画终端条 / To Be Continued */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var banner = document.querySelector('.banner');

    /* 1 星点（五角星形，随机大小/位置/闪烁延迟） */
    if (banner) {
      var starBox = document.createElement('div');
      starBox.className = 'stars';
      banner.insertBefore(starBox, banner.firstChild);
      var n = window.innerWidth > 767 ? 42 : 22;
      for (var i = 0; i < n; i++) {
        var s = document.createElement('i');
        var size = 5 + Math.random() * 11;
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.left = (Math.random() * 96) + '%';
        s.style.top = (Math.random() * 62) + '%';
        s.style.animationDelay = (Math.random() * 3.2) + 's';
        s.style.animationDuration = (2.4 + Math.random() * 2.2) + 's';
        starBox.appendChild(s);
      }

      /* 2 SBR 徽记 */
      var badge = document.createElement('div');
      badge.className = 'sbr-badge';
      badge.innerHTML =
        '<span class="star">&#9733;</span>' +
        '<div class="txt">STEEL BALL RUN</div>' +
        '<div class="sub">第七部 飙马野郎</div>';
      banner.appendChild(badge);

      /* 2b 沙丘骑手剪影场景（SVG 自制剪影，非官方素材） */
      var scene = document.createElement('div');
      scene.className = 'sbr-scene';
      scene.innerHTML =
        '<svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" width="100%" height="100%">' +
        /* 远处骑手 */
        '<g class="gallop" opacity=".55" transform="translate(180,120) scale(.62)" fill="#060d18">' +
        '<ellipse cx="0" cy="70" rx="60" ry="28"/>' +
        '<polygon points="10,42 36,-8 56,-2 40,54"/>' +
        '<polygon points="52,-14 84,-28 88,-14 58,4"/>' +
        '<polygon points="-30,58 -56,88 -64,82 -36,50"/>' +
        '<polygon points="-12,62 -26,94 -34,90 -18,56"/>' +
        '<polygon points="42,60 72,86 64,94 34,64"/>' +
        '<polygon points="28,64 52,96 44,100 20,68"/>' +
        '<path d="M-56 40 q-30 -6 -46 14 q24 -4 46 -10 z"/>' +
        '<polygon points="4,36 30,-24 50,-16 26,42"/>' +
        '<circle cx="38" cy="-34" r="13"/>' +
        '<polygon points="22,-44 54,-44 50,-56 26,-56"/>' +
        '<polygon points="30,-20 66,-62 76,-54 42,-14"/>' +
        '</g>' +
        /* 近处骑手（投球姿态） */
        '<g class="gallop" transform="translate(760,86)" fill="#060d18">' +
        '<ellipse cx="0" cy="70" rx="66" ry="30"/>' +
        '<polygon points="12,42 40,-6 60,0 44,56"/>' +
        '<polygon points="56,-12 92,-26 96,-12 62,6"/>' +
        '<polygon points="-32,60 -60,92 -68,86 -38,52"/>' +
        '<polygon points="-14,64 -28,98 -36,94 -20,58"/>' +
        '<polygon points="44,62 76,90 68,98 36,66"/>' +
        '<polygon points="30,66 56,100 48,104 22,70"/>' +
        '<path d="M-62 42 q-34 -6 -52 16 q26 -4 52 -10 z"/>' +
        '<polygon points="6,38 34,-22 56,-12 28,44"/>' +
        '<circle cx="42" cy="-34" r="15"/>' +
        '<polygon points="24,-46 60,-46 56,-60 28,-60"/>' +
        '<polygon points="32,-18 74,-66 86,-56 44,-10"/>' +
        '<polygon points="-8,44 -26,84 -12,90 8,50"/>' +
        '</g>' +
        /* 铁球 + 螺旋 + 光环 + 轨迹 */
        '<g transform="translate(880,42)">' +
        '<circle class="ball-glow" r="34" fill="none" stroke="#f0c75e" stroke-width="2" opacity=".5"/>' +
        '<g class="ball">' +
        '<circle r="21" fill="#16263c" stroke="#f0c75e" stroke-width="2.5"/>' +
        '<path d="M0 -14 A14 14 0 1 1 -13 4" fill="none" stroke="#f0c75e" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M0 -7 A7 7 0 1 1 -6 2" fill="none" stroke="#f0c75e" stroke-width="2" stroke-linecap="round"/>' +
        '<circle r="2.4" fill="#f0c75e"/>' +
        '</g>' +
        '</g>' +
        '<path class="trail" d="M860 52 q-60 30 -110 70" fill="none" stroke="#f0c75e" stroke-width="2" opacity=".55"/>' +
        /* 马蹄印 */
        '<g fill="#0a1424" opacity=".8">' +
        '<ellipse cx="600" cy="286" rx="9" ry="5"/>' +
        '<ellipse cx="548" cy="278" rx="8" ry="4.5"/>' +
        '<ellipse cx="500" cy="270" rx="7" ry="4"/>' +
        '<ellipse cx="456" cy="264" rx="6" ry="3.5"/>' +
        '<ellipse cx="416" cy="259" rx="5" ry="3"/>' +
        '</g>' +
        /* 仙人掌 */
        '<g fill="#060d18">' +
        '<rect x="1108" y="176" width="16" height="86" rx="8"/>' +
        '<rect x="1088" y="204" width="22" height="12" rx="6"/>' +
        '<rect x="1088" y="204" width="12" height="30" rx="6"/>' +
        '<rect x="1124" y="222" width="22" height="12" rx="6"/>' +
        '<rect x="1134" y="222" width="12" height="26" rx="6"/>' +
        '</g>' +
        '</svg>';
      banner.appendChild(scene);

      /* 2c 动态头像（无图时显示自制铁球） */
      var av = document.createElement('div');
      av.className = 'sbr-avatar';
      av.innerHTML =
        '<div class="ring"></div>' +
        '<div class="frame"><img src="/img/avatar.png" alt="avatar"></div>' +
        '<span class="deco">&#9733;</span>';
      banner.appendChild(av);
      var aimg = av.querySelector('img');
      aimg.onerror = function () {
        var fb = document.createElement('div');
        fb.className = 'fallback';
        fb.innerHTML =
          '<svg viewBox="0 0 100 100" width="100%" height="100%">' +
          '<rect width="100" height="100" fill="#12233b"/>' +
          '<g class="ball" style="transform-origin:50px 50px">' +
          '<circle cx="50" cy="50" r="24" fill="#16263c" stroke="#f0c75e" stroke-width="3"/>' +
          '<path d="M50 26 A24 24 0 1 1 24 58" fill="none" stroke="#f0c75e" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M50 38 A12 12 0 1 1 38 50" fill="none" stroke="#f0c75e" stroke-width="2.6" stroke-linecap="round"/>' +
          '<circle cx="50" cy="50" r="3" fill="#f0c75e"/>' +
          '</g></svg>';
        aimg.parentNode.replaceChild(fb, aimg);
      };

      /* 2d 作者署名 */
      var bt = document.querySelector('.banner-text');
      if (bt && !bt.querySelector('.hero-author')) {
        var au = document.createElement('div');
        au.className = 'hero-author';
        au.innerHTML = '<span class="line"></span><span class="name">BY TIMEKEEPER</span>';
        bt.appendChild(au);
      }
    }

    /* 3 拟声词滚动带（内容重复两遍以无缝循环） */
    if (!document.querySelector('.onomatopoeia')) {
      var words = ['ゴゴゴゴ', 'メメタ', 'ドドドド', 'ゴゴゴ', 'ドッドッ', 'ズズウン',
                   'ドクン', 'メメメ', 'キィーン', 'ゴォオ'];
      var wrap = document.createElement('div');
      wrap.className = 'onomatopoeia';
      wrap.innerHTML = '<div class="onomatopoeia-track">' +
        '<span>' + words.join('</span><span>') + '</span>' +
        '<span>' + words.join('</span><span>') + '</span>' +
        '</div>';
      var anchor = document.querySelector('.banner');
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
      } else {
        document.body.appendChild(wrap);
      }
    }

    /* 4 漫画风终端条 */
    document.querySelectorAll('.highlight').forEach(function (el) {
      if (el.querySelector('.term-bar')) return;
      var m = (el.className || '').match(/highlight\s+([\w+-]+)/);
      var lang = m ? m[1] : 'code';
      var bar = document.createElement('div');
      bar.className = 'term-bar';
      bar.innerHTML =
        '<span class="term-dot d1"></span><span class="term-dot d2"></span><span class="term-dot d3"></span>' +
        '<span class="term-lang"></span>';
      bar.querySelector('.term-lang').textContent = lang;
      el.insertBefore(bar, el.firstChild);
    });

    /* 5 To Be Continued */
    var footer = document.querySelector('.footer-inner');
    if (footer && !footer.querySelector('.to-be-continued')) {
      var tbc = document.createElement('div');
      tbc.className = 'to-be-continued';
      tbc.innerHTML = 'TO BE CONTINUED<span class="arrow">&#10142;</span>';
      footer.appendChild(tbc);
    }

    /* 6 阅读进度条 */
    var bar = document.createElement('div');
    bar.id = 'read-progress';
    document.body.appendChild(bar);
    function updateProgress() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();

    /* 7 卡片入场 */
    var cards = document.querySelectorAll('.index-card');
    if (cards.length && 'IntersectionObserver' in window && !reduce) {
      cards.forEach(function (el) { el.classList.add('reveal'); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      cards.forEach(function (el) { io.observe(el); });
    }

    /* 8 代码复制 */
    document.querySelectorAll('.highlight').forEach(function (block) {
      if (block.querySelector('.copy-btn')) return;
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = 'COPY';
      block.appendChild(btn);
      btn.addEventListener('click', function () {
        var codeEl = block.querySelector('code');
        var text = codeEl ? codeEl.innerText : block.innerText;
        var done = function () {
          btn.textContent = 'COPIED';
          setTimeout(function () { btn.textContent = 'COPY'; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {});
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
    });
  });
})();
