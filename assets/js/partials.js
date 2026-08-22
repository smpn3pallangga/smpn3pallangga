/**
 * Loader partial header & footer terpusat.
 * Cukup edit assets/partials/header.html dan assets/partials/footer.html
 * untuk mengubah header/footer di SEMUA halaman (index, pengumuman, guru, berita, dll).
 *
 * Cara pakai di setiap halaman HTML:
 * 1. Ganti blok <header>...</header> + <div class="topbar-marquee">...</div>
 *    dengan: <div id="site-header"></div>
 * 2. Ganti blok <footer>...</footer> + <nav class="mobile-bottom-nav">...</nav>
 *    + <a class="wa-float">...</a>
 *    dengan: <div id="site-footer"></div>
 * 3. Tandai halaman aktif lewat atribut di <body>, contoh:
 *    <body data-page-key="pengumuman">
 * 4. Tambahkan sebelum tag </body>: <script src="assets/js/partials.js"></script>
 */
(async () => {
    const headerSlot = document.getElementById('site-header');
    const footerSlot = document.getElementById('site-footer');
    const pageKey = document.body.getAttribute('data-page-key') || '';

    const loadPartial = async (slot, url) => {
        if (!slot) return;
        try {
            const res = await fetch(url);
            slot.outerHTML = await res.text();
        } catch (err) {
            console.error(`Gagal memuat partial: ${url}`, err);
        }
    };

    await Promise.all([
        loadPartial(headerSlot, 'assets/partials/header.html'),
        loadPartial(footerSlot, 'assets/partials/footer.html'),
    ]);

    // Tandai menu aktif (desktop, mobile dropdown, dan bottom-nav mobile)
    if (pageKey) {
        document.querySelectorAll(`[data-nav-key="${pageKey}"]`).forEach((el) => {
            el.classList.add('active');
        });
    }

    // --- Logika interaktif header (offset tinggi, toggle menu mobile) ---
    const root = document.documentElement;
    const header = document.querySelector('.topbar');
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('publicNavLinks');

    const syncHeaderOffset = () => {
        if (!header) return;
        const height = Math.ceil(header.getBoundingClientRect().height);
        root.style.setProperty('--public-header-offset', `${height}px`);
    };

    syncHeaderOffset();
    window.addEventListener('load', syncHeaderOffset, { once: true });
    window.addEventListener('resize', syncHeaderOffset);

    if (toggle && nav) {
        const parentItems = Array.from(nav.querySelectorAll('.nav-item.nav-has-children'));

        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
            requestAnimationFrame(syncHeaderOffset);
        });

        parentItems.forEach((item) => {
            const btn = item.querySelector(':scope > [data-nav-toggle]');
            if (!btn) return;
            btn.addEventListener('click', () => {
                if (window.innerWidth > 980) return;
                const willOpen = !item.classList.contains('is-open');
                const siblingItems = item.parentElement ? Array.from(item.parentElement.children).filter((el) => el !== item) : [];
                siblingItems.forEach((sibling) => {
                    sibling.classList.remove('is-open');
                    const siblingBtn = sibling.querySelector(':scope > [data-nav-toggle]');
                    if (siblingBtn) siblingBtn.setAttribute('aria-expanded', 'false');
                });
                item.classList.toggle('is-open', willOpen);
                btn.setAttribute('aria-expanded', String(willOpen));
                requestAnimationFrame(syncHeaderOffset);
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 980) {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
            syncHeaderOffset();
        });
    }

    // Beritahu skrip lain (mis. related-pengumuman.js) bahwa partial siap
    document.dispatchEvent(new CustomEvent('partials:ready'));
})();