// berita.js
// Mengisi otomatis <div data-berita-list data-limit="6"></div> di index.html
// (dan halaman lain yang punya elemen sama) berdasarkan data/berita.json.
//
// Cukup edit/tambah entri di data/berita.json setiap kali ada berita baru,
// section "Berita Terkini" akan otomatis ikut berubah — tanpa perlu
// mengedit index.html satu per satu.

(function () {
  var ICONS = {
    'Berita Sekolah': 'fa-newspaper',
    'Kegiatan Siswa': 'fa-star',
    'Pendidikan': 'fa-graduation-cap'
  };
  var DEFAULT_ICON = 'fa-newspaper';

  async function loadBeritaList() {
    var listContainers = document.querySelectorAll('[data-berita-list]');
    var relatedContainers = document.querySelectorAll('[data-related-berita]');
    if (!listContainers.length && !relatedContainers.length) return;

    var data;
    try {
      var res = await fetch('data/berita.json');
      data = await res.json();
    } catch (err) {
      console.error('Gagal memuat data/berita.json:', err);
      return;
    }

    // Urutkan dari yang paling baru berdasar urutan di JSON (taruh berita
    // terbaru di paling atas array data/berita.json).
    listContainers.forEach(function (container) {
      var limitAttr = container.getAttribute('data-limit');
      var limit = limitAttr ? parseInt(limitAttr, 10) : 6;
      var items = data.slice(0, limit);

      if (!items.length) {
        container.innerHTML = '<p class="latest-news-empty">Belum ada berita.</p>';
        return;
      }

      container.innerHTML = items.map(renderCard).join('');
    });

    // "Berita Terkait" di sidebar: otomatis ambil berita lain dari JSON,
    // mengecualikan berita yang sedang dibuka (dicocokkan lewat nama file
    // pada URL saat ini).
    if (relatedContainers.length) {
      var currentFile = window.location.pathname.split('/').pop();

      relatedContainers.forEach(function (container) {
        var limitAttr = container.getAttribute('data-limit');
        var limit = limitAttr ? parseInt(limitAttr, 10) : 3;
        var items = data
          .filter(function (item) { return item.url !== currentFile; })
          .slice(0, limit);

        if (!items.length) {
          container.innerHTML = '';
          return;
        }

        container.innerHTML = items.map(renderRelatedItem).join('');
      });
    }
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

  function renderRelatedItem(item) {
    var icon = ICONS[item.category] || DEFAULT_ICON;
    var thumb = item.image
      ? '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">'
      : '<i class="fas ' + icon + '"></i>';

    return (
      '<a href="' + item.url + '" class="related-item">' +
        '<div class="related-thumb">' + thumb + '</div>' +
        '<div>' +
          '<p class="related-title">' + escapeHtml(item.title) + '</p>' +
          '<span class="related-date">' + escapeHtml(item.date || '') + '</span>' +
        '</div>' +
      '</a>'
    );
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', loadBeritaList);
})();