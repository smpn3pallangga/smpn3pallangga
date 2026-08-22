// download.js
// Sumber data tunggal untuk Pusat Download (download.html), dan bisa dipakai
// ulang di halaman lain (mis. cuplikan file terbaru) dengan menaruh elemen
// data-download-list di halaman tersebut lalu memuat download.js juga.
//
// Cukup edit/tambah/hapus entri di data/download.json — semua tampilan yang
// memuat download.js otomatis ikut berubah (termasuk index.html).
//
// Tampilan kartu otomatis menyesuaikan kontainernya:
//   - Kontainer dengan class "school-download-grid" (mis. section Download
//     di index.html) -> kartu ringkas 1 baris (icon - judul/meta - tombol),
//     memakai CSS .school-download-card yang sudah ada di halaman tsb.
//   - Kontainer lain (mis. [data-download-grid] di download.html) -> kartu
//     penuh (.dl-card) dengan deskripsi, kategori, dan tombol Unduh.
//
// Field per file:
//   id          (wajib)   - slug unik
//   title       (wajib)   - judul dokumen
//   category    (wajib)   - kategori, mis. "Kalender Akademik", "Formulir"
//   description (opsional)- deskripsi singkat isi dokumen
//   filetype    (opsional)- label jenis file, mis. "PDF", "DOCX", "XLSX", "ZIP"
//   filesize    (opsional)- ukuran file, mis. "240 KB"
//   filename    (opsional)- nama file asli, ditampilkan di samping ukuran
//   url         (wajib untuk bisa diunduh) - link file (bisa path lokal atau URL eksternal)
//
// Elemen yang dikenali:
//   [data-download-list] / [data-download-grid] - daftar kartu file
//   [data-download-stat="total|pdf|kategori"]    - angka ringkasan
//   [data-download-filter="semua|<Kategori>"]    - tombol filter kategori (dibuat otomatis dari data)
//   [data-download-filter-bar]                   - kontainer tempat tombol filter dirender
//   [data-download-count]                        - teks "n file ditemukan"
//   #downloadSearchInput                         - kotak pencarian (opsional, dikenali lewat id)

(function () {
  var DATA_URL = 'data/download.json';
  var activeCategory = 'semua';

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function fileIcon(filetype) {
    var t = (filetype || '').toUpperCase();
    if (t === 'PDF') return 'fa-file-pdf';
    if (t === 'DOC' || t === 'DOCX') return 'fa-file-word';
    if (t === 'XLS' || t === 'XLSX') return 'fa-file-excel';
    if (t === 'PPT' || t === 'PPTX') return 'fa-file-powerpoint';
    if (t === 'ZIP' || t === 'RAR') return 'fa-file-archive';
    if (t === 'JPG' || t === 'JPEG' || t === 'PNG') return 'fa-file-image';
    return 'fa-file-alt';
  }

  function renderCard(item) {
    var meta = [item.filesize, item.filename].filter(Boolean).map(escapeHtml).join(' &middot; ');
    var downloadAttr = item.url ? ' download' : '';
    var href = item.url || '#';
    var disabled = item.url ? '' : ' dl-card-disabled';

    return (
      '<article class="dl-card' + disabled + '" data-dl-category="' + escapeHtml(item.category || '') + '">' +
        '<div class="dl-card-top">' +
          '<span class="dl-filetype"><i class="fas ' + fileIcon(item.filetype) + '"></i>' + escapeHtml(item.filetype || 'FILE') + '</span>' +
          '<span class="dl-category">' + escapeHtml(item.category || '') + '</span>' +
        '</div>' +
        '<h3 class="dl-title">' + escapeHtml(item.title || '') + '</h3>' +
        (item.description ? '<p class="dl-desc">' + escapeHtml(item.description) + '</p>' : '') +
        '<div class="dl-card-bottom">' +
          '<span class="dl-meta">' + (meta || '&nbsp;') + '</span>' +
          (item.url
            ? '<a class="dl-btn" href="' + href + '"' + downloadAttr + ' target="_blank" rel="noopener"><i class="fas fa-download"></i> Unduh</a>'
            : '<span class="dl-btn dl-btn-disabled"><i class="fas fa-download"></i> Belum tersedia</span>') +
        '</div>' +
      '</article>'
    );
  }

  // Kartu ringkas bergaya baris (icon - judul/meta - tombol) dipakai saat
  // download.js dimuat di halaman lain (mis. index.html) yang sudah punya
  // CSS .school-download-grid / .school-download-card sendiri.
  function renderCompactCard(item) {
    var meta = [item.category, item.filesize, item.filename].filter(Boolean).map(escapeHtml).join(' &middot; ');
    var downloadAttr = item.url ? ' download' : '';
    var href = item.url || '#';
    var disabled = item.url ? '' : ' school-download-card-disabled';
    var tag = item.url ? 'a' : 'div';
    var linkAttrs = item.url ? ' href="' + href + '"' + downloadAttr + ' target="_blank" rel="noopener"' : '';

    return (
      '<' + tag + ' class="school-download-card' + disabled + '"' + linkAttrs + ' data-dl-category="' + escapeHtml(item.category || '') + '">' +
        '<span class="school-download-icon">' + escapeHtml((item.filetype || 'FILE').toUpperCase()) + '</span>' +
        '<div>' +
          '<h3 class="school-download-title">' + escapeHtml(item.title || '') + '</h3>' +
          '<div class="school-download-meta">' + (meta || '&nbsp;') + '</div>' +
        '</div>' +
        '<span class="school-download-action"><i class="fas ' + (item.url ? 'fa-download' : 'fa-lock') + '"></i></span>' +
      '</' + tag + '>'
    );
  }

  function renderFilterBar(data) {
    var bar = document.querySelector('[data-download-filter-bar]');
    if (!bar) return;

    var categories = [];
    data.forEach(function (item) {
      if (item.category && categories.indexOf(item.category) === -1) categories.push(item.category);
    });

    var buttons = ['<button type="button" class="dl-filter-btn is-active" data-download-filter="semua">Semua kategori</button>'];
    categories.forEach(function (cat) {
      buttons.push('<button type="button" class="dl-filter-btn" data-download-filter="' + escapeHtml(cat) + '">' + escapeHtml(cat) + '</button>');
    });
    bar.innerHTML = buttons.join('');

    bar.querySelectorAll('[data-download-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCategory = btn.getAttribute('data-download-filter');
        bar.querySelectorAll('[data-download-filter]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        applySearchAndFilter();
      });
    });
  }

  function applySearchAndFilter() {
    var input = document.getElementById('downloadSearchInput');
    var q = input ? input.value.trim().toLowerCase() : '';
    var cards = document.querySelectorAll('.dl-card');
    var visible = 0;

    cards.forEach(function (card) {
      var matchesCategory = activeCategory === 'semua' || card.getAttribute('data-dl-category') === activeCategory;
      var matchesQuery = card.textContent.toLowerCase().includes(q);
      var show = matchesCategory && matchesQuery;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    var countEl = document.querySelector('[data-download-count]');
    if (countEl) countEl.textContent = visible + ' file ditemukan';
  }

  function renderList(data) {
    var containers = document.querySelectorAll('[data-download-list], [data-download-grid]');
    if (!containers.length) return;

    containers.forEach(function (container) {
      var limitAttr = container.getAttribute('data-limit');
      var limit = limitAttr ? parseInt(limitAttr, 10) : data.length;
      var items = data.slice(0, limit);

      if (!items.length) {
        container.innerHTML = '<p class="latest-news-empty">Belum ada file yang tersedia.</p>';
        return;
      }

      var isCompact = container.classList.contains('school-download-grid');
      container.innerHTML = items.map(isCompact ? renderCompactCard : renderCard).join('');
    });
  }

  function renderStats(data) {
    var totalEl = document.querySelector('[data-download-stat="total"]');
    var pdfEl = document.querySelector('[data-download-stat="pdf"]');
    var kategoriEl = document.querySelector('[data-download-stat="kategori"]');

    var pdfCount = data.filter(function (i) { return (i.filetype || '').toUpperCase() === 'PDF'; }).length;
    var categories = [];
    data.forEach(function (i) {
      if (i.category && categories.indexOf(i.category) === -1) categories.push(i.category);
    });

    if (totalEl) totalEl.textContent = data.length;
    if (pdfEl) pdfEl.textContent = pdfCount;
    if (kategoriEl) kategoriEl.textContent = categories.length;
  }

  function wireSearch() {
    var input = document.getElementById('downloadSearchInput');
    if (!input) return;
    input.addEventListener('input', applySearchAndFilter);
  }

  async function init() {
    var needsDownload = document.querySelector(
      '[data-download-list],[data-download-grid],[data-download-stat],[data-download-filter-bar]'
    );
    if (!needsDownload) return;

    var data;
    try {
      var res = await fetch(DATA_URL);
      data = await res.json();
    } catch (err) {
      console.error('Gagal memuat ' + DATA_URL + ':', err);
      return;
    }

    renderStats(data);
    renderList(data);
    renderFilterBar(data);
    wireSearch();
    applySearchAndFilter();

    document.dispatchEvent(new CustomEvent('download-ready'));
  }

  document.addEventListener('DOMContentLoaded', init);
})();