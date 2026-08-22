// headline-slider.js
// Mengisi otomatis slider "Sorotan Berita Utama" di beranda
// (<div data-headline-slider data-limit="6">) berdasarkan data/berita.json.
//
// Pakai file JSON yang sama dengan berita.js, jadi cukup edit/tambah
// entri di data/berita.json sekali saja — slider di beranda dan daftar
// "Berita Terkini" akan ikut otomatis ter-update.
//
// Field yang dipakai per item di berita.json:
//   title    (wajib)
//   url      (wajib)
//   image    (opsional, dipakai sebagai gambar utama slide)
//   category (opsional, ditampilkan sebagai chip)
//   excerpt  (opsional, ringkasan singkat di bawah judul)
//   date     (tidak dipakai di slider ini, dipakai di berita.js)

(function () {
  async function loadHeadlineSlider() {
    var slider = document.querySelector('[data-headline-slider]');
    if (!slider) return;

    var track = slider.querySelector('[data-headline-track]');
    var dotsWrap = slider.querySelector('[data-headline-dots]');
    if (!track) return;

    var limitAttr = slider.getAttribute('data-limit');
    var limit = limitAttr ? parseInt(limitAttr, 10) : 6;

    var data;
    try {
      var res = await fetch('data/berita.json');
      data = await res.json();
    } catch (err) {
      console.error('Gagal memuat data/berita.json untuk headline slider:', err);
      return;
    }

    var items = data.slice(0, limit);

    if (!items.length) {
      track.innerHTML = '<p class="latest-news-empty">Belum ada berita.</p>';
      if (dotsWrap) dotsWrap.innerHTML = '';
      return;
    }

    track.innerHTML = items.map(renderSlide).join('');
    dotsWrap && (dotsWrap.innerHTML = items.length > 1 ? items.map(renderDot).join('') : '');

    initSliderBehavior(slider);
  }

  function renderSlide(item, index) {
    var activeClass = index === 0 ? ' is-active' : '';
    var chip = item.category
      ? '<span class="chip">' + escapeHtml(item.category) + '</span>'
      : '';
    var excerpt = item.excerpt || item.description || '';

    return (
      '<article class="headline-slide' + activeClass + '" data-headline-slide="">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
        '<div class="headline-overlay">' +
          chip +
          '<h3>' +
            '<a href="' + item.url + '" class="headline-title-link">' + escapeHtml(item.title) + '</a>' +
          '</h3>' +
          (excerpt ? '<p>' + escapeHtml(excerpt) + '</p>' : '') +
        '</div>' +
      '</article>'
    );
  }

  function renderDot(item, index) {
    var activeClass = index === 0 ? ' is-active' : '';
    var isActive = index === 0 ? 'true' : 'false';
    return (
      '<button type="button" class="headline-dot' + activeClass + '" data-headline-dot="" ' +
        'data-index="' + index + '" aria-label="Slide ' + (index + 1) + '" aria-selected="' + isActive + '">' +
      '</button>'
    );
  }

  function initSliderBehavior(slider) {
    var slides = Array.from(slider.querySelectorAll('[data-headline-slide]'));
    var dots = Array.from(slider.querySelectorAll('[data-headline-dot]'));
    var autoplayMs = Number(slider.dataset.autoplay || 5000);
    if (slides.length <= 1) return;

    var index = 0;
    var timer = null;

    function render() {
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }

    function goTo(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      render();
    }

    function start() {
      stop();
      timer = setInterval(function () { goTo(index + 1); }, autoplayMs);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = Number(dot.dataset.index || 0);
        goTo(target);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    render();
    start();
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', loadHeadlineSlider);
})();
