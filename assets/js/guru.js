// guru.js
// Sumber data tunggal untuk semua tampilan Guru & Tenaga Kependidikan:
//   1. Slider "Guru dan Tenaga Pendidik" di beranda
//      -> <div data-guru-list data-limit="10"></div>
//   2. Direktori lengkap di guru.html
//      -> <div id="guruGridTeaching" data-guru-grid="guru"></div>
//      -> <div id="guruGridAdmin" data-guru-grid="admin"></div>
//      -> angka ringkasan: [data-guru-stat="total|guru|admin"]
//
// Cukup edit/tambah/hapus entri di data/guru.json — beranda, direktori, dan
// angka ringkasannya otomatis ikut berubah di semua halaman yang memuat
// guru.js. Field per orang:
//   name     (wajib)  - boleh menyertakan gelar, mis. "SYAMSUL BACHRI, S.Pd, M.Pd"
//   jabatan  (wajib)  - mis. "Kepala Sekolah", "Guru Mapel", "Tenaga Adminitrasi"
//   mapel    (opsional) - mata pelajaran / bidang tugas
//   status   (opsional) - mis. "PNS", "PPPK", "PPPK Paruh Waktu", "Honor (SK Sekolah)"
//   group    ("guru" atau "admin") - menentukan masuk direktori yang mana
//   photo    (opsional) - path/URL foto. Kalau kosong, dipakai inisial nama.

(function () {
  var AVATAR_COLORS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
  var STATUS_CLASS = {
    'PNS': 'st-pns',
    'PPPK': 'st-pppk'
  };
  var DEFAULT_STATUS_CLASS = 'st-honor';

  function statusClass(status) {
    return STATUS_CLASS[status] || DEFAULT_STATUS_CLASS;
  }

  function initials(name) {
    if (!name) return '?';
    var cleanName = name.split(',')[0].trim();
    var parts = cleanName.split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    var first = parts[0].charAt(0);
    var second = parts.length > 1 ? parts[1].charAt(0) : '';
    return (first + second).toUpperCase();
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function avatarMarkup(item, colorClass, avatarClass, photoClass) {
    if (item.photo) {
      return '<div class="' + avatarClass + '"><img class="' + photoClass + '" src="' + item.photo + '" alt="' + escapeHtml(item.name) + '"></div>';
    }
    return '<div class="' + avatarClass + ' ' + colorClass + '"><span>' + escapeHtml(initials(item.name)) + '</span></div>';
  }

  // ---- 1. Slider ringkas di beranda ("people-slider-card") ----

  function renderSliderCard(item, index) {
    var colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
    var visual = item.photo
      ? '<img class="people-slider-photo" src="' + item.photo + '" alt="' + escapeHtml(item.name) + '">'
      : '<div class="people-slider-initial ' + colorClass + '"><span>' + escapeHtml(initials(item.name)) + '</span></div>';

    var role = item.jabatan || '';
    if (item.mapel) {
      role += (role ? ' &middot; ' : '') + escapeHtml(item.mapel);
    } else {
      role = escapeHtml(role);
    }

    return (
      '<article class="people-slider-card">' +
        '<div class="people-slider-visual">' + visual + '</div>' +
        '<div class="people-slider-body">' +
          '<h3 class="people-slider-name">' + escapeHtml(item.name) + '</h3>' +
          '<p class="people-slider-role">' + role + '</p>' +
        '</div>' +
      '</article>'
    );
  }

  async function loadGuruSlider(data) {
    var containers = document.querySelectorAll('[data-guru-list]');
    if (!containers.length) return;

    containers.forEach(function (container) {
      var limitAttr = container.getAttribute('data-limit');
      var limit = limitAttr ? parseInt(limitAttr, 10) : 10;
      var items = data.slice(0, limit);

      if (!items.length) {
        container.innerHTML = '<p class="latest-news-empty">Belum ada data guru.</p>';
        return;
      }

      container.innerHTML = items.map(renderSliderCard).join('');
    });
  }

  // ---- 2. Direktori lengkap di guru.html ("guru-card") ----

  function renderDirectoryCard(item, index) {
    var colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
    var avatar = avatarMarkup(item, colorClass, 'guru-avatar', 'guru-avatar-photo');

    var mapelTag = item.mapel
      ? '<span class="guru-tag guru-tag-mapel">' + escapeHtml(item.mapel) + '</span>'
      : '';
    var statusTag = item.status
      ? '<span class="guru-tag guru-status ' + statusClass(item.status) + '">' + escapeHtml(item.status) + '</span>'
      : '';

    return (
      '<article class="guru-card">' +
        avatar +
        '<h3 class="guru-name">' + escapeHtml(item.name) + '</h3>' +
        '<p class="guru-jabatan">' + escapeHtml(item.jabatan || '') + '</p>' +
        '<div class="guru-meta">' + mapelTag + statusTag + '</div>' +
      '</article>'
    );
  }

  function loadGuruDirectory(data) {
    var grids = document.querySelectorAll('[data-guru-grid]');
    if (!grids.length) return;

    grids.forEach(function (grid) {
      var group = grid.getAttribute('data-guru-grid');
      var items = data.filter(function (item) { return item.group === group; });

      if (!items.length) {
        grid.innerHTML = '<p class="latest-news-empty">Belum ada data.</p>';
        return;
      }

      grid.innerHTML = items.map(renderDirectoryCard).join('');
    });

    // Angka ringkasan (Total Personil / Guru-Pendidik / Tenaga Administrasi),
    // dihitung otomatis supaya selalu sinkron dengan isi guru.json.
    var totalEl = document.querySelector('[data-guru-stat="total"]');
    var guruEl = document.querySelector('[data-guru-stat="guru"]');
    var adminEl = document.querySelector('[data-guru-stat="admin"]');
    var guruCount = data.filter(function (item) { return item.group === 'guru'; }).length;
    var adminCount = data.filter(function (item) { return item.group === 'admin'; }).length;
    if (totalEl) totalEl.textContent = data.length;
    if (guruEl) guruEl.textContent = guruCount;
    if (adminEl) adminEl.textContent = adminCount;

    // Beritahu bagian lain (mis. kotak pencarian) kalau kartu sudah siap,
    // karena kartu ini baru ada di DOM setelah fetch selesai (async).
    document.dispatchEvent(new CustomEvent('guru-directory-ready'));
  }

  async function init() {
    var needsSlider = document.querySelector('[data-guru-list]');
    var needsDirectory = document.querySelector('[data-guru-grid]');
    if (!needsSlider && !needsDirectory) return;

    var data;
    try {
      var res = await fetch('data/guru.json');
      data = await res.json();
    } catch (err) {
      console.error('Gagal memuat data/guru.json:', err);
      return;
    }

    if (needsSlider) loadGuruSlider(data);
    if (needsDirectory) loadGuruDirectory(data);
  }

  document.addEventListener('DOMContentLoaded', init);
})();