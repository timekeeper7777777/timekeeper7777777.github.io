/* Quiet —— 交互增强：阅读进度、卡片入场、代码复制 */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* 阅读进度条 */
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

    /* 卡片滚动入场 */
    var cards = document.querySelectorAll('.index-card');
    if (cards.length && 'IntersectionObserver' in window) {
      cards.forEach(function (el) { el.classList.add('reveal'); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      cards.forEach(function (el) { io.observe(el); });
    }

    /* 代码块一键复制 */
    var blocks = document.querySelectorAll('.highlight, .markdown-body pre');
    blocks.forEach(function (block) {
      if (block.querySelector('.copy-btn')) return;
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = '复制';
      block.appendChild(btn);
      btn.addEventListener('click', function () {
        var codeEl = block.querySelector('code');
        var text = codeEl ? codeEl.innerText : block.innerText;
        var done = function () {
          btn.textContent = '已复制';
          setTimeout(function () { btn.textContent = '复制'; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {});
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
    });
  });
})();
