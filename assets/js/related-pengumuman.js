// related-pengumuman.js
// Cara pakai: taruh <div data-related-pengumuman data-limit="3"></div> di
// sidebar halaman detail pengumuman.
//
// Cukup edit data/pengumuman.json untuk update daftar "Pengumuman Terkait"
// di SEMUA halaman detail pengumuman sekaligus.

(function () {
  var ICONS = {
    'Tata Tertib': 'fa-ban',
    'Akademik': 'fa-graduation-cap',
    'Kegiatan': 'fa-star',
    'Kedisiplinan': 'fa-user-shield'
  };
  var DEFAULT_ICON = 'fa-bullhorn';

  // Ambil nama file saja (tanpa domain/folder), supaya perbandingan tetap
  // benar baik saat dibuka di 127.0.0.1:5500 (lokal) maupun di domain asli.
  function fileName(url) {
    if (!url) return '';
    return url.split('#')[0].split('?')[0].split('/').pop();
  }

  async function loadRelated() {
    var containers = document.querySelectorAll('[data-related-pengumuman]');
    if (!containers.length) return;

    var data;
    try {
      var res = await fetch('data/pengumuman.json');
      data = await res.json();
    } catch (err) {
      console.error('Gagal memuat data/pengumuman.json:', err);
      return;
    }

    var canonicalTag = document.querySelector('link[rel="canonical"]');
    var currentUrl = canonicalTag ? canonicalTag.getAttribute('href') : window.location.href;
    var currentFile = fileName(currentUrl);

    containers.forEach(function (container) {
      var limitAttr = container.getAttribute('data-limit');
      var limit = limitAttr ? parseInt(limitAttr, 10) : 3;

      var items = data
        .filter(function (item) { return fileName(item.url) !== currentFile; })
        .slice(0, limit);

      container.innerHTML = items.map(renderItem).join('');
    });
  }

  function renderItem(item) {
    var icon = ICONS[item.category] || DEFAULT_ICON;
    var thumb = item.image
      ? '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
      : '<i class="fas ' + icon + '"></i>';

    return (
      '<a href="' + item.url + '" class="related-item">' +
        '<span class="related-thumb">' + thumb + '</span>' +
        '<span>' +
          '<p class="related-title">' + escapeHtml(item.title) + '</p>' +
          '<span class="related-date">' + escapeHtml(item.date || '') + '</span>' +
        '</span>' +
      '</a>'
    );
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', loadRelated);
})();
