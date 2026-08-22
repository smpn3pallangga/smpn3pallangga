// ekskul.js
// Sumber data tunggal untuk semua tampilan Ekstrakurikuler:
//   1. Ringkasan kartu di beranda (index.html)
//      -> <div class="home-exkul-grid" data-ekskul-list data-limit="9"></div>
//   2. Direktori lengkap di ekstrakurikuler.html
//      -> <div id="ekskulGrid" data-ekskul-grid></div>
//      -> angka ringkasan: [data-ekskul-stat="total|aktif|nonaktif|pembina"]
//      -> tombol filter status: [data-ekskul-filter="semua|aktif|nonaktif"]
//   3. Daftar ringkas di halaman lain (mis. prestasi.html)
//      -> <div data-ekskul-list data-limit="9" data-compact="1"></div>
//
// Cukup edit/tambah/hapus entri di data/ekskul.json — beranda, direktori
// ekstrakurikuler, dan halaman lain yang memuat ekskul.js otomatis ikut
// berubah. Field per kegiatan:
//   id          (wajib)   - slug unik, mis. "pramuka"
//   name        (wajib)   - nama lengkap kegiatan
//   code        (opsional)- label singkat untuk badge kartu beranda
//   icon        (opsional)- kelas ikon Font Awesome 5, mis. "fa-flag"
//   status      (opsional)- "aktif" atau "nonaktif" (default "aktif")
//   category    (opsional)- mis. "Olahraga", "Seni & Budaya"
//   description (wajib)   - deskripsi kegiatan
//   pembina     (opsional)- array nama pembina
//   ketua       (opsional)- nama ketua/koordinator siswa
//   photo       (opsional)- path/URL foto sampul. Kalau kosong, dipakai ikon.

(function () {
  var DATA_URL = 'data/ekskul.json';
  var dataPromise = null;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function statusLabel(status) {
    return status === 'nonaktif' ? 'Nonaktif' : 'Aktif';
  }

  function statusClass(status) {
    return status === 'nonaktif' ? 'ek-status-off' : 'ek-status-on';
  }

  function mediaMarkup(item, mediaClass, logoClass, codeClass) {
    var cover = item.photo
      ? '<img class="home-exkul-cover" src="' + item.photo + '" alt="' + escapeHtml(item.name) + '">'
      : '';
    var icon = '<span class="' + logoClass + '"><i class="fas ' + (item.icon || 'fa-star') + '"></i></span>';
    var badge = '<span class="' + codeClass + '">' + escapeHtml(item.code || item.name) + '</span>';
    return '<div class="' + mediaClass + '">' + cover + icon + badge + '</div>';
  }

  function peopleMarkup(item) {
    var rows = (item.pembina || []).map(function (name) {
      return (
        '<div class="home-exkul-person">' +
          '<span class="home-exkul-avatar"><i class="fas fa-user-graduate"></i></span>' +
          '<span><small>Pembina</small><strong>' + escapeHtml(name) + '</strong></span>' +
        '</div>'
      );
    });
    if (item.ketua) {
      rows.push(
        '<div class="home-exkul-person">' +
          '<span class="home-exkul-avatar"><i class="fas fa-user"></i></span>' +
          '<span><small>Ketua</small><strong>' + escapeHtml(item.ketua) + '</strong></span>' +
        '</div>'
      );
    }
    return '<div class="home-exkul-people">' + rows.join('') + '</div>';
  }

  // ---- 1 & 3. Kartu ringkas (dipakai di beranda & halaman lain seperti prestasi.html) ----

  function renderHomeCard(item) {
    return (
      '<article class="home-exkul-card">' +
        mediaMarkup(item, 'home-exkul-media', 'home-exkul-logo-fallback', 'home-exkul-code') +
        '<div class="home-exkul-body">' +
          '<h3 class="home-exkul-title">' + escapeHtml(item.name) + '</h3>' +
          '<p class="home-exkul-desc">' + escapeHtml(item.description || '') + '</p>' +
          peopleMarkup(item) +
        '</div>' +
      '</article>'
    );
  }

  function loadEkskulList(data) {
    var containers = document.querySelectorAll('[data-ekskul-list]');
    if (!containers.length) return;

    containers.forEach(function (container) {
      var limitAttr = container.getAttribute('data-limit');
      var limit = limitAttr ? parseInt(limitAttr, 10) : data.length;
      var onlyActive = container.getAttribute('data-only-active') === '1';
      var items = onlyActive ? data.filter(function (i) { return i.status !== 'nonaktif'; }) : data;
      items = items.slice(0, limit);

      if (!items.length) {
        container.innerHTML = '<p class="latest-news-empty">Belum ada data ekstrakurikuler.</p>';
        return;
      }

      container.innerHTML = items.map(renderHomeCard).join('');
    });

    document.dispatchEvent(new CustomEvent('ekskul-list-ready'));
  }

  // ---- 2. Direktori lengkap di ekstrakurikuler.html ("ek-card") ----

  function renderDirectoryCard(item) {
    var tagCategory = item.category
      ? '<span class="ek-tag ek-tag-category">' + escapeHtml(item.category) + '</span>'
      : '';
    var tagStatus = '<span class="ek-tag ek-status ' + statusClass(item.status) + '">' + statusLabel(item.status) + '</span>';

    var pembinaHtml = (item.pembina || []).map(function (name) {
      return '<span class="ek-person"><i class="fas fa-user-graduate"></i>' + escapeHtml(name) + '</span>';
    }).join('');
    var ketuaHtml = item.ketua
      ? '<span class="ek-person ek-person-ketua"><i class="fas fa-user"></i>' + escapeHtml(item.ketua) + '</span>'
      : '';

    return (
      '<article class="ek-card" data-ek-status="' + escapeHtml(item.status || 'aktif') + '">' +
        mediaMarkup(item, 'ek-media', 'ek-logo-fallback', 'ek-code') +
        '<div class="ek-body">' +
          '<div class="ek-tags">' + tagStatus + tagCategory + '</div>' +
          '<h3 class="ek-title">' + escapeHtml(item.name) + '</h3>' +
          '<p class="ek-desc">' + escapeHtml(item.description || '') + '</p>' +
          '<div class="ek-people">' + pembinaHtml + ketuaHtml + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function applyStatusFilter(status) {
    var cards = document.querySelectorAll('.ek-card');
    cards.forEach(function (card) {
      var match = status === 'semua' || card.getAttribute('data-ek-status') === status;
      card.style.display = match ? '' : 'none';
    });
    document.querySelectorAll('[data-ekskul-filter]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-ekskul-filter') === status);
    });
  }

  function wireFilters() {
    var filterButtons = document.querySelectorAll('[data-ekskul-filter]');
    if (!filterButtons.length) return;
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyStatusFilter(btn.getAttribute('data-ekskul-filter'));
      });
    });
  }

  function loadEkskulDirectory(data) {
    var grids = document.querySelectorAll('[data-ekskul-grid]');
    if (!grids.length) return;

    grids.forEach(function (grid) {
      if (!data.length) {
        grid.innerHTML = '<p class="latest-news-empty">Belum ada data ekstrakurikuler.</p>';
        return;
      }
      grid.innerHTML = data.map(renderDirectoryCard).join('');
    });

    var totalEl = document.querySelector('[data-ekskul-stat="total"]');
    var aktifEl = document.querySelector('[data-ekskul-stat="aktif"]');
    var nonaktifEl = document.querySelector('[data-ekskul-stat="nonaktif"]');
    var pembinaEl = document.querySelector('[data-ekskul-stat="pembina"]');

    var aktifCount = data.filter(function (i) { return i.status !== 'nonaktif'; }).length;
    var nonaktifCount = data.length - aktifCount;
    var pembinaCount = data.filter(function (i) { return (i.pembina || []).length > 0; }).length;

    if (totalEl) totalEl.textContent = data.length;
    if (aktifEl) aktifEl.textContent = aktifCount;
    if (nonaktifEl) nonaktifEl.textContent = nonaktifCount;
    if (pembinaEl) pembinaEl.textContent = pembinaCount;

    wireFilters();
    applyStatusFilter('semua');

    document.dispatchEvent(new CustomEvent('ekskul-directory-ready'));
  }

  function fetchEkskulData() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL)
        .then(function (res) { return res.json(); })
        .catch(function (err) {
          console.error('Gagal memuat ' + DATA_URL + ':', err);
          return [];
        });
    }
    return dataPromise;
  }

  async function init() {
    var needsList = document.querySelector('[data-ekskul-list]');
    var needsDirectory = document.querySelector('[data-ekskul-grid]');
    if (!needsList && !needsDirectory) return;

    var data = await fetchEkskulData();

    if (needsList) loadEkskulList(data);
    if (needsDirectory) loadEkskulDirectory(data);
  }

  document.addEventListener('DOMContentLoaded', init);
})();