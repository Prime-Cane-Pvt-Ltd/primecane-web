// Share button for the digital business cards (public/card/<slug>/).
// Kept out of the page because the site CSP is script-src 'self'.
(function () {
  var btn = document.getElementById('share');
  var toast = document.getElementById('toast');
  if (!btn || !toast) return;
  var t;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(t);
    t = setTimeout(function () { toast.classList.remove('on'); }, 2200);
  }
  btn.addEventListener('click', function () {
    var url = btn.getAttribute('data-url') || location.href;
    var data = { title: btn.getAttribute('data-title') || document.title, url: url };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(function () { say('Link copied'); })
        .catch(function () { say('Could not copy link'); });
    } else {
      say('Copy this page URL to share');
    }
  });
})();
