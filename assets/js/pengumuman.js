// pengumuman.js
// Mengisi otomatis <div data-pengumuman-list></div> di pengumuman.html
// berdasarkan data/pengumuman.json.
//
// Kartu dibuat persis seperti kartu "Berita Terkini" (lihat berita.js),
// jadi pakai class latest-news-* yang sama supaya tampilannya identik.
//
// Cukup edit/tambah entri di data/pengumuman.json setiap kali ada
// pengumuman baru (dan buat file HTML halaman detailnya seperti
// pengumuman-larangan-makeup.html), grid pengumuman akan otomatis
// ikut berubah — tanpa perlu mengedit pengumuman.html satu per satu.

(function () {
  var ICONS = {
    'Tata Tertib': 'fa-ban',
    'Akademik': 'fa-graduation-cap',
    'Kegiatan': 'fa-star',
    'Kedisiplinan': 'fa-user-shield'
  };
  var DEFAULT_ICON = 'fa-bullhorn';

  async function loadPengumumanList() {
    var containers = document.querySelectorAll('[data-pengumuman-list]');
    if (!containers.length) return;

    var data;
    try {
      var res = await fetch('data/pengumuman.json');
      data = await res.json();
    } catch (err) {
      console.error('Gagal memuat data/pengumuman.json:', err);
      return;
    }

    // Urutkan dari yang paling baru berdasar urutan di JSON (taruh
    // pengumuman terbaru di paling atas array data/pengumuman.json).
    containers.forEach(function (container) {
      var limitAttr = container.getAttribute('data-limit');
      var limit = limitAttr ? parseInt(limitAttr, 10) : 0;
      var items = limit > 0 ? data.slice(0, limit) : data;

      if (!items.length) {
        container.innerHTML = '<p class="latest-news-empty">Belum ada pengumuman.</p>';
        return;
      }

      container.innerHTML = items.map(renderCard).join('');
    });
  }

  function renderCard(item) {
    var icon = ICONS[item.category] || DEFAULT_ICON;
    var thumb = item.image
      ? '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
      : '<span class="latest-news-thumb-placeholder"><i class="fas ' + icon + '"></i></span>';

    return (
      '<article class="latest-news-card">' +
        '<a href="' + item.url + '" class="latest-news-thumb">' + thumb + '</a>' +
        '<div class="latest-news-body">' +
          (item.category ? '<span class="chip">' + escapeHtml(item.category) + '</span>' : '') +
          '<h3 class="latest-news-title"><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<div class="latest-news-footer"><i class="fa-regular fa-calendar"></i> ' + escapeHtml(item.date || '') + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', loadPengumumanList);
})();
