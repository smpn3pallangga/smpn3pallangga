/**
 * site-includes.js
 * Memuat komponen header & footer yang sama (satu sumber) ke setiap halaman,
 * lalu menjalankan ulang interaksi header (menu mobile, submenu, tinggi header)
 * dan menandai menu aktif berdasarkan data-page-key pada <body>.
 *
 * Cara pakai di setiap halaman HTML:
 *   <body data-page-key="home"> ... </body>
 *   <div id="site-header"></div>   <!-- taruh di posisi header -->
 *   <div id="site-footer"></div>   <!-- taruh di posisi footer -->
 *   <script src="assets/js/site-includes.js"></script>
 *
 * Sumber partial: assets/partials/header.html & assets/partials/footer.html
 * Ubah kontak (Instagram, email, WA, dll) cukup di 2 file itu saja.
 */
(() => {
    const HEADER_URL = 'assets/partials/header.html';
    const FOOTER_URL = 'assets/partials/footer.html';

    const loadInclude = async (selector, url) => {
        const target = document.querySelector(selector);
        if (!target) return null;

        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Gagal memuat ${url} (${response.status})`);
            target.innerHTML = await response.text();
            return target;
        } catch (error) {
            console.error('[site-includes]', error);
            return null;
        }
    };

    const markActiveLinks = () => {
        const pageKey = document.body.getAttribute('data-page-key');
        if (!pageKey) return;

        document.querySelectorAll('[data-nav-key]').forEach((link) => {
            const isActive = link.getAttribute('data-nav-key') === pageKey;
            link.classList.toggle('active', isActive);
        });
    };

    const initHeaderInteractions = () => {
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

        if (!toggle || !nav) return;
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
                const siblingItems = item.parentElement
                    ? Array.from(item.parentElement.children).filter((el) => el !== item)
                    : [];

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
    };

    const init = async () => {
        await Promise.all([
            loadInclude('#site-header', HEADER_URL),
            loadInclude('#site-footer', FOOTER_URL),
        ]);

        markActiveLinks();
        initHeaderInteractions();

        document.dispatchEvent(new CustomEvent('site-includes:ready'));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();