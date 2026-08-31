// ============================================================
// CARADDE Virtual Class - SMP Negeri 3 Pallangga
// Data kelas & mata pelajaran + logic untuk 3 layar:
// 1) Pilih Kelas  2) Pilih Mata Pelajaran  3) Tombol ke YouTube
// ============================================================

const CARADDE_DATA = [
  {
    "kelas": 7,
    "mapel": [
      { "nama": "Matematika", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" },
      { "nama": "Bahasa Indonesia", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" },
      { "nama": "Bahasa Inggris", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" },
      { "nama": "Ilmu Pengetahuan Alam (IPA)", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" },
      { "nama": "Ilmu Pengetahuan Sosial (IPS)", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" },
      { "nama": "Pendidikan Pancasila", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" },
      { "nama": "Seni Budaya", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" },
      { "nama": "Pendidikan Jasmani (PJOK)", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" },
      { "nama": "Prakarya", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" },
      { "nama": "Pendidikan Agama", "url": "https://youtu.be/j3-vxTMQlXM?si=uvnVC3YkqvYbNCqq" }
    ]
  },
  {
    "kelas": 8,
    "mapel": [
      { "nama": "Matematika", "url": "" },
      { "nama": "Bahasa Indonesia", "url": "" },
      { "nama": "Bahasa Inggris", "url": "" },
      { "nama": "Ilmu Pengetahuan Alam (IPA)", "url": "" },
      { "nama": "Ilmu Pengetahuan Sosial (IPS)", "url": "" },
      { "nama": "Pendidikan Pancasila", "url": "" },
      { "nama": "Seni Budaya", "url": "" },
      { "nama": "Pendidikan Jasmani (PJOK)", "url": "" },
      { "nama": "Prakarya", "url": "" },
      { "nama": "Pendidikan Agama", "url": "" }
    ]
  },
  {
    "kelas": 9,
    "mapel": [
      { "nama": "Matematika", "url": "" },
      { "nama": "Bahasa Indonesia", "url": "" },
      { "nama": "Bahasa Inggris", "url": "" },
      { "nama": "Ilmu Pengetahuan Alam (IPA)", "url": "" },
      { "nama": "Ilmu Pengetahuan Sosial (IPS)", "url": "" },
      { "nama": "Pendidikan Pancasila", "url": "" },
      { "nama": "Seni Budaya", "url": "" },
      { "nama": "Pendidikan Jasmani (PJOK)", "url": "" },
      { "nama": "Prakarya", "url": "" },
      { "nama": "Pendidikan Agama", "url": "" }
    ]
  }
];

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const crumbEl = document.querySelector("[data-caradde-crumb]");
    const kelasGrid = document.querySelector("[data-caradde-kelas-grid]");
    const mapelGrid = document.querySelector("[data-caradde-mapel-grid]");
    const judulMapelEl = document.querySelector("[data-caradde-judul-mapel]");
    const judulVideoEl = document.querySelector("[data-caradde-judul-video]");
    const subVideoEl = document.querySelector("[data-caradde-sub-video]");
    const linkVideoEl = document.querySelector("[data-caradde-link-video]");
    const backKelasBtn = document.querySelector("[data-caradde-back-kelas]");
    const backMapelBtn = document.querySelector("[data-caradde-back-mapel]");

    if (!kelasGrid) return; // halaman ini tidak punya widget CARADDE

    let kelasAktif = null;

    function tampilkanLayar(nama) {
      document.querySelectorAll("[data-caradde-screen]").forEach(function (el) {
        el.classList.toggle("is-active", el.getAttribute("data-caradde-screen") === nama);
      });
      if (crumbEl) {
        if (nama === "kelas") crumbEl.textContent = "Pilih kelas";
        else if (nama === "mapel") crumbEl.textContent = "Pilih kelas / Kelas " + kelasAktif + " / Pilih mata pelajaran";
        else if (nama === "video") crumbEl.textContent = "Pilih kelas / Kelas " + kelasAktif + " / Menuju YouTube";
      }
    }

    function renderKelas() {
      kelasGrid.innerHTML = "";
      CARADDE_DATA.forEach(function (item) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "caradde-kelas-card";
        btn.innerHTML =
          '<span class="caradde-kelas-angka">' + item.kelas + '</span>' +
          '<span class="caradde-kelas-label">Kelas ' + item.kelas + '</span>';
        btn.addEventListener("click", function () {
          kelasAktif = item.kelas;
          renderMapel(item);
          tampilkanLayar("mapel");
        });
        kelasGrid.appendChild(btn);
      });
    }

    function renderMapel(item) {
      if (judulMapelEl) judulMapelEl.textContent = "Mata Pelajaran Kelas " + item.kelas;
      mapelGrid.innerHTML = "";

      if (!item.mapel || item.mapel.length === 0) {
        mapelGrid.innerHTML = '<p class="caradde-empty">Belum ada mata pelajaran untuk kelas ini.</p>';
        return;
      }

      item.mapel.forEach(function (mp) {
        const ada = !!(mp.url && mp.url.trim());
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "caradde-mapel-btn";
        if (!ada) btn.style.opacity = "0.55";
        btn.innerHTML =
          '<span class="caradde-mapel-ikon">' + mp.nama.charAt(0) + '</span>' +
          '<span>' + mp.nama + (ada ? '' : ' <em style="font-weight:400;opacity:.75;">(segera hadir)</em>') + '</span>';

        btn.addEventListener("click", function () {
          if (!ada) return;
          if (judulVideoEl) judulVideoEl.textContent = mp.nama + " - Kelas " + item.kelas;
          if (subVideoEl) subVideoEl.textContent = "Video pembelajaran akan terbuka di tab baru";
          if (linkVideoEl) linkVideoEl.href = mp.url;
          tampilkanLayar("video");
        });

        mapelGrid.appendChild(btn);
      });
    }

    if (backKelasBtn) {
      backKelasBtn.addEventListener("click", function () {
        tampilkanLayar("kelas");
      });
    }
    if (backMapelBtn) {
      backMapelBtn.addEventListener("click", function () {
        tampilkanLayar("mapel");
      });
    }

    renderKelas();
    tampilkanLayar("kelas");
  });
})();