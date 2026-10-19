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
