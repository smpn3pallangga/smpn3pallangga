// osis.js
// Sumber data tunggal untuk halaman OSIS (osis.html), dan bisa dipakai ulang
// di halaman lain (mis. cuplikan pengurus/proker di index.html) dengan
// menaruh elemen data-osis-* yang sama di halaman tersebut lalu memuat
// osis.js di sana juga.
//
// Cukup edit data/osis.json — semua tampilan yang memuat osis.js otomatis
// ikut berubah. Struktur file ada di komentar dalam osis.json itu sendiri;
// field yang diawali "(Isi ...)" adalah placeholder dan wajib diganti
// dengan data pengurus/kegiatan OSIS yang sebenarnya.
//
// Elemen yang dikenali osis.js:
//   [data-osis-hero-title]      - judul hero
//   [data-osis-hero-desc]       - deskripsi hero
//   [data-osis-stat="pengurus|proker|kegiatan|foto"] - angka ringkasan
//   [data-osis-periode]         - teks "Kepengurusan 20xx/20xx"
//   [data-osis-visi]            - paragraf visi
//   [data-osis-misi]            - <ol>/<ul> daftar misi (diisi <li>)
//   [data-osis-pembina]         - grid/daftar pembina
//   [data-osis-pengurus]        - grid pengurus
//   [data-osis-proker]          - grid program kerja
//   [data-osis-kegiatan]        - daftar kegiatan (timeline)
//   [data-osis-galeri]          - grid foto kegiatan
//   [data-osis-kontak]          - blok info kontak sekretariat

(function () {
  var DATA_URL = 'data/osis.json';
  var AVATAR_COLORS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function initials(name) {
    if (!name) return '?';
    var clean = name.replace(/[()]/g, '').trim();
    var parts = clean.split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    var first = parts[0].charAt(0);
    var second = parts.length > 1 ? parts[1].charAt(0) : '';
    return (first + second).toUpperCase();
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    var bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  }

  function statusClass(status) {
    var s = (status || '').toLowerCase();
    if (s === 'selesai') return 'os-status-done';
    if (s === 'berjalan') return 'os-status-active';
    return 'os-status-planned';
  }

  // ---- Hero, statistik, periode ----

  function renderHero(data) {
    var titleEl = document.querySelector('[data-osis-hero-title]');
    var descEl = document.querySelector('[data-osis-hero-desc]');
    if (titleEl && data.hero && data.hero.title) titleEl.textContent = data.hero.title;
    if (descEl && data.hero && data.hero.desc) descEl.textContent = data.hero.desc;

    var pengurusEl = document.querySelector('[data-osis-stat="pengurus"]');
    var prokerEl = document.querySelector('[data-osis-stat="proker"]');
    var kegiatanEl = document.querySelector('[data-osis-stat="kegiatan"]');
    var fotoEl = document.querySelector('[data-osis-stat="foto"]');
    if (pengurusEl) pengurusEl.textContent = (data.pengurus || []).length + (data.pembina || []).length;
    if (prokerEl) prokerEl.textContent = (data.program_kerja || []).length;
    if (kegiatanEl) kegiatanEl.textContent = (data.kegiatan || []).length;
    if (fotoEl) fotoEl.textContent = (data.galeri || []).length;

    var periodeEl = document.querySelector('[data-osis-periode]');
    if (periodeEl) periodeEl.textContent = 'Kepengurusan ' + (data.periode || '-');
  }

  // ---- Visi & Misi ----

  function renderVisiMisi(data) {
    var visiEl = document.querySelector('[data-osis-visi]');
    if (visiEl) visiEl.textContent = data.visi || '';

    var misiEl = document.querySelector('[data-osis-misi]');
    if (misiEl) {
      var items = (data.misi || []).map(function (m) {
        return '<li>' + escapeHtml(m) + '</li>';
      });
      misiEl.innerHTML = items.join('');
    }
  }

  // ---- Pembina & Pengurus ----

  function personCard(item, index, extraClass) {
    var colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
    var avatar = item.photo
      ? '<div class="os-avatar"><img src="' + item.photo + '" alt="' + escapeHtml(item.name) + '"></div>'
      : '<div class="os-avatar ' + colorClass + '"><span>' + escapeHtml(initials(item.name)) + '</span></div>';
    var kelas = item.kelas
      ? '<span class="os-person-kelas">' + escapeHtml(item.kelas) + '</span>'
      : '';

    return (
      '<article class="os-person-card' + (extraClass ? ' ' + extraClass : '') + '">' +
        avatar +
        '<h4 class="os-person-name">' + escapeHtml(item.name) + '</h4>' +
        '<p class="os-person-role">' + escapeHtml(item.jabatan || '') + '</p>' +
        kelas +
      '</article>'
    );
  }

  function renderPembinaPengurus(data) {
    var pembinaEl = document.querySelector('[data-osis-pembina]');
    if (pembinaEl) {
      var pembina = data.pembina || [];
      pembinaEl.innerHTML = pembina.length
        ? pembina.map(function (p, i) { return personCard(p, i, 'os-person-card-pembina'); }).join('')
        : '<p class="latest-news-empty">Belum ada data pembina.</p>';
    }

    var pengurusEl = document.querySelector('[data-osis-pengurus]');
    if (pengurusEl) {
      var pengurus = data.pengurus || [];
      pengurusEl.innerHTML = pengurus.length
        ? pengurus.map(function (p, i) { return personCard(p, i); }).join('')
        : '<p class="latest-news-empty">Belum ada data pengurus.</p>';
    }
  }

  // ---- Program Kerja ----

  function prokerCard(item) {
    return (
      '<article class="os-proker-card">' +
        '<span class="os-tag">' + escapeHtml(item.sekbid || '') + '</span>' +
        '<h4 class="os-proker-title">' + escapeHtml(item.title || '') + '</h4>' +
        '<p class="os-proker-desc">' + escapeHtml(item.description || '') + '</p>' +
        '<span class="os-status ' + statusClass(item.status) + '">' + escapeHtml(item.status || '') + '</span>' +
      '</article>'
    );
  }

  function renderProker(data) {
    var el = document.querySelector('[data-osis-proker]');
    if (!el) return;
    var items = data.program_kerja || [];
    el.innerHTML = items.length
      ? items.map(prokerCard).join('')
      : '<p class="latest-news-empty">Belum ada program kerja.</p>';
  }

  // ---- Kegiatan ----

  function kegiatanItem(item) {
    var metaParts = [item.location, item.sekbid].filter(Boolean).map(escapeHtml);
    return (
      '<article class="os-kegiatan-item">' +
        '<div class="os-kegiatan-date">' + escapeHtml(formatDate(item.date)) + '</div>' +
        '<div class="os-kegiatan-body">' +
          '<span class="os-status ' + statusClass(item.status) + '">' + escapeHtml(item.status || '') + '</span>' +
          '<h4 class="os-kegiatan-title">' + escapeHtml(item.title || '') + '</h4>' +
          (metaParts.length ? '<p class="os-kegiatan-meta">' + metaParts.join(' &middot; ') + '</p>' : '') +
        '</div>' +
      '</article>'
    );
  }

  function renderKegiatan(data) {
    var el = document.querySelector('[data-osis-kegiatan]');
    if (!el) return;
    var items = (data.kegiatan || []).slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });
    el.innerHTML = items.length
      ? items.map(kegiatanItem).join('')
      : '<p class="latest-news-empty">Belum ada kegiatan tercatat.</p>';
  }

  // ---- Galeri ----

  function renderGaleri(data) {
    var el = document.querySelector('[data-osis-galeri]');
    if (!el) return;
    var items = data.galeri || [];
    if (!items.length) {
      el.innerHTML = '<p class="latest-news-empty">Foto kegiatan akan muncul setelah dokumentasi ditambahkan.</p>';
      return;
    }
    el.innerHTML = items.map(function (g) {
      return (
        '<figure class="os-galeri-item">' +
          '<img src="' + g.photo + '" alt="' + escapeHtml(g.caption || '') + '">' +
          (g.caption ? '<figcaption>' + escapeHtml(g.caption) + '</figcaption>' : '') +
        '</figure>'
      );
    }).join('');
  }

  // ---- Kontak ----

  function renderKontak(data) {
    var el = document.querySelector('[data-osis-kontak]');
    if (!el || !data.kontak) return;
    var k = data.kontak;
    var rows = [];
    if (k.sekretariat) rows.push('<p><strong>Sekretariat:</strong> ' + escapeHtml(k.sekretariat) + '</p>');
    if (k.email) rows.push('<p><strong>Email:</strong> ' + escapeHtml(k.email) + '</p>');
    var socials = [
      k.instagram ? '<a href="' + k.instagram + '" target="_blank" rel="noopener">Instagram</a>' : '',
      k.facebook ? '<a href="' + k.facebook + '" target="_blank" rel="noopener">Facebook</a>' : '',
      k.youtube ? '<a href="' + k.youtube + '" target="_blank" rel="noopener">YouTube</a>' : '',
      k.tiktok ? '<a href="' + k.tiktok + '" target="_blank" rel="noopener">TikTok</a>' : ''
    ].filter(Boolean);
    var socialHtml = socials.length ? '<div class="os-kontak-social">' + socials.join('') + '</div>' : '';
    el.innerHTML = rows.join('') + socialHtml;
  }

  async function init() {
    var needsOsis = document.querySelector(
      '[data-osis-hero-title],[data-osis-visi],[data-osis-pembina],[data-osis-pengurus],[data-osis-proker],[data-osis-kegiatan],[data-osis-galeri],[data-osis-kontak],[data-osis-stat]'
    );
    if (!needsOsis) return;

    var data;
    try {
      var res = await fetch(DATA_URL);
      data = await res.json();
    } catch (err) {
      console.error('Gagal memuat ' + DATA_URL + ':', err);
      return;
    }

    renderHero(data);
    renderVisiMisi(data);
    renderPembinaPengurus(data);
    renderProker(data);
    renderKegiatan(data);
    renderGaleri(data);
    renderKontak(data);

    document.dispatchEvent(new CustomEvent('osis-ready'));
  }

  document.addEventListener('DOMContentLoaded', init);
})();