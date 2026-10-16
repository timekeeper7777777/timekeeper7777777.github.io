/* CYBER —— 视觉特效层
   数字雨 / 鼠标光晕 / HUD / 故障字 / 终端代码块 / 进度条 / 入场 / 复制 */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* 1 鼠标光晕 */
    if (!reduce && window.innerWidth > 767) {
      var glow = document.createElement('div');
      glow.id = 'cyber-glow';
      document.body.appendChild(glow);
      window.addEventListener('mousemove', function (e) {
        glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      }, { passive: true });
    }

    /* 2 数字雨 */
    var banner = document.querySelector('.banner');
    if (banner && !reduce) {
      var cv = document.createElement('canvas');
      cv.id = 'rain-canvas';
      banner.insertBefore(cv, banner.firstChild);
      var ctx = cv.getContext('2d');
      var chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEF<>{}[]/\\$#@%&*';
      var fontSize = 14, cols = 0, drops = [], w = 0, h = 0;

      function sizeCanvas() {
        w = cv.clientWidth; h = cv.clientHeight;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = w * dpr; cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.floor(w / fontSize);
        drops = [];
        for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
      }
      sizeCanvas();
      window.addEventListener('resize', sizeCanvas);

      var last = 0;
      function draw(ts) {
        requestAnimationFrame(draw);
        if (ts - last < 55) return;
        last = ts;
        ctx.fillStyle = 'rgba(4, 6, 11, 0.14)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = fontSize + 'px monospace';
        for (var i = 0; i < drops.length; i++) {
          var ch = chars.charAt(Math.floor(Math.random() * chars.length));
          var y = drops[i] * fontSize;
          if (y > 0 && y < h) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
            ctx.fillText(ch, i * fontSize, y);
            if (Math.random() > 0.985) {
              ctx.fillStyle = 'rgba(255, 46, 151, 0.9)';
              ctx.fillText(ch, i * fontSize, y);
            }
          }
          drops[i]++;
          if (y > h && Math.random() > 0.975) drops[i] = 0;
        }
      }
      requestAnimationFrame(draw);
    }

    /* 3 HUD 装饰 */
    if (banner) {
      var hud = document.createElement('div');
      hud.className = 'cyber-hud';
      hud.innerHTML =
        '<span class="hud-corner tl"></span><span class="hud-corner tr"></span>' +
        '<span class="hud-corner bl"></span><span class="hud-corner br"></span>' +
        '<div class="hud-status"><span class="dot"></span>NODE_ONLINE // <span id="hud-clock">--:--:--</span></div>';
      banner.appendChild(hud);
      var clock = hud.querySelector('#hud-clock');
      function tick() {
        var d = new Date();
        function p(n) { return n < 10 ? '0' + n : '' + n; }
        clock.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
      }
      tick(); setInterval(tick, 1000);
    }

    /* 4 故障字标题 */
    var title = document.querySelector('.banner-text h1, .banner-text .h1');
    if (title) title.setAttribute('data-text', (title.textContent || '').trim());

    /* 5 终端风格代码块顶栏 */
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

    /* 6 卡片序号 */
    document.querySelectorAll('.index-card').forEach(function (el, i) {
      var s = document.createElement('span');
      s.className = 'cyber-idx';
      s.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
      el.appendChild(s);
    });

    /* 7 阅读进度条 */
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

    /* 8 卡片入场 */
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

    /* 9 代码复制 */
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
          btn.textContent = 'OK';
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

    /* 10 偶发故障闪烁 */
    if (!reduce) {
      setInterval(function () {
        document.body.classList.add('glitching');
        setTimeout(function () { document.body.classList.remove('glitching'); }, 300);
      }, 21000);
    }
  });
})();
