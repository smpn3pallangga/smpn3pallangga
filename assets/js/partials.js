/**
 * Loader partial header & footer terpusat.
 * Cukup edit assets/partials/header.html dan assets/partials/footer.html
 * untuk mengubah header/footer di SEMUA halaman.
 */

(async () => {
    const headerSlot = document.getElementById('site-header');
    const footerSlot = document.getElementById('site-footer');
    const pageKey = document.body.getAttribute('data-page-key') || '';

    const loadPartial = async (slot, url) => {
        if (!slot) return;

        try {
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${url}`);
            }

            slot.outerHTML = await res.text();
        } catch (err) {
            console.error(`Gagal memuat partial: ${url}`, err);
        }
    };

    await Promise.all([
        loadPartial(headerSlot, 'assets/partials/header.html'),
        loadPartial(footerSlot, 'assets/partials/footer.html')
    ]);

    // Tandai menu aktif
    if (pageKey) {
        document.querySelectorAll(`[data-nav-key="${pageKey}"]`).forEach((el) => {
            el.classList.add('active');
        });
    }

    // Header
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

    // Menu utama dan dropdown
    if (nav) {

        const parentItems = Array.from(
            nav.querySelectorAll('.nav-item.nav-has-children')
        );

        // Tombol menu HP
        if (toggle) {
            toggle.addEventListener('click', () => {
                const isOpen = nav.classList.toggle('is-open');

                toggle.setAttribute(
                    'aria-expanded',
                    String(isOpen)
                );

                requestAnimationFrame(syncHeaderOffset);
            });
        }

        // Dropdown Profil, Akademik, Warga Sekolah, Galeri, Informasi
        parentItems.forEach((item) => {

            const btn = item.querySelector(':scope > [data-nav-toggle]');

            if (!btn) return;

            btn.addEventListener('click', (event) => {

                // Jangan pindah halaman karena tombol dropdown
                event.preventDefault();
                event.stopPropagation();

                const willOpen = !item.classList.contains('is-open');

                // Tutup dropdown lainnya
                const siblingItems = item.parentElement
                    ? Array.from(item.parentElement.children)
                        .filter((el) => el !== item)
                    : [];

                siblingItems.forEach((sibling) => {

                    sibling.classList.remove('is-open');

                    const siblingBtn =
                        sibling.querySelector(':scope > [data-nav-toggle]');

                    if (siblingBtn) {
                        siblingBtn.setAttribute(
                            'aria-expanded',
                            'false'
                        );
                    }
                });

                // Buka/tutup dropdown yang diklik
                item.classList.toggle('is-open', willOpen);

                btn.setAttribute(
                    'aria-expanded',
                    String(willOpen)
                );

                requestAnimationFrame(syncHeaderOffset);
            });
        });

        // Jika resize dari HP ke desktop
        window.addEventListener('resize', () => {

            if (window.innerWidth > 980) {

                nav.classList.remove('is-open');

                if (toggle) {
                    toggle.setAttribute(
                        'aria-expanded',
                        'false'
                    );
                }

            }

            syncHeaderOffset();
        });
    }

    // Beritahu script lain bahwa partial sudah siap
    document.dispatchEvent(
        new CustomEvent('partials:ready')
    );

})();