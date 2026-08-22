/**
 * sarana.js
 * Satu sumber data (data/sarana.json) dipakai untuk:
 *  - Ringkasan "Sarana Sekolah" di index.html -> slider [data-facility-slider]
 *  - Grid lengkap di sarana.html               -> [data-sarana-grid] + tabs [data-sarana-tabs]
 *
 * Cara pakai:
 *  1. Taruh file ini di assets/js/sarana.js
 *  2. Taruh sarana.json di data/sarana.json (folder data di root project, sejajar index.html)
 *  3. Tambahkan <script src="assets/js/sarana.js" defer></script> di index.html DAN sarana.html
 *  4. Edit sarana cukup di data/sarana.json -> otomatis update di kedua halaman.
 */
(() => {
    const DATA_URLS = [
        'data/sarana.json',
        './data/sarana.json',
        'sarana.json',
        'assets/data/sarana.json'
    ];

    const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));

    const flattenFacilities = (categories) => {
        const items = [];
        categories.forEach((cat) => {
            (cat.facilities || []).forEach((facility, index) => {
                items.push({
                    key: `${cat.id}-${index}`,
                    image: facility.image,
                    title: facility.title || '',
                    count: facility.count || '',
                    location: facility.location || '',
                    description: facility.description || '',
                    categoryId: cat.id,
                    categoryTitle: cat.title,
                    featured: !!facility.featured,
                });
            });
        });
        return items.sort((a, b) => Number(b.featured) - Number(a.featured));
    };

    const triggerAttrs = (item) => `
        data-photo-lightbox-trigger
        data-sarana-lightbox-trigger
        data-photo-src="${escapeHtml(item.image)}"
        data-photo-title="${escapeHtml(item.title)}"
        data-photo-category="${escapeHtml(item.categoryTitle)}"
        data-photo-description="${escapeHtml(item.description)}"
    `;

    const metaRow = (item) => `
        <div class="facility-showcase-meta">
            ${item.count ? `<span><i class="fas fa-cubes"></i> ${escapeHtml(item.count)}</span>` : ''}
            ${item.location ? `<span><i class="fas fa-location-dot"></i> ${escapeHtml(item.location)}</span>` : ''}
        </div>
    `;

    // ---- Ringkasan di homepage (index.html) ----
    const renderHomeTrack = (track, items) => {
        if (!items.length) {
            track.innerHTML = '<p class="section-subtitle">Belum ada data sarana.</p>';
            return;
        }
        track.innerHTML = items.map((item) => `
            <article class="facility-showcase-card">
                <button type="button" class="facility-showcase-photo photo-lightbox-trigger" ${triggerAttrs(item)}>
                    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
                </button>
                <div class="facility-showcase-body">
                    <span class="theme-badge theme-badge-primary">${escapeHtml(item.categoryTitle)}</span>
                    <h3 class="facility-showcase-title-card">${escapeHtml(item.title)}</h3>
                    ${metaRow(item)}
                </div>
            </article>
        `).join('');
    };

    // ---- Grid lengkap di sarana.html ----
    const renderFullGallery = (grid, categories, items) => {
        const tabsWrap = document.querySelector('[data-sarana-tabs]');
        const countWrap = document.querySelector('[data-sarana-count]');

        const renderGrid = (categoryId) => {
            const filtered = categoryId === 'all' ? items : items.filter((item) => item.categoryId === categoryId);
            grid.innerHTML = filtered.length
                ? filtered.map((item) => `
                    <button type="button" class="sarana-card photo-lightbox-trigger" ${triggerAttrs(item)}>
                        <span class="sarana-card-media">
                            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
                        </span>
                        <span class="sarana-card-body">
                            <span class="theme-badge theme-badge-primary">${escapeHtml(item.categoryTitle)}</span>
                            <span class="sarana-card-title">${escapeHtml(item.title)}</span>
                            <span class="sarana-card-meta">
                                ${item.count ? `<span><i class="fas fa-cubes"></i> ${escapeHtml(item.count)}</span>` : ''}
                                ${item.location ? `<span><i class="fas fa-location-dot"></i> ${escapeHtml(item.location)}</span>` : ''}
                            </span>
                        </span>
                    </button>
                `).join('')
                : '<p class="gallery-empty">Belum ada sarana pada kategori ini.</p>';

            if (countWrap) countWrap.textContent = `${filtered.length} sarana`;
        };

        if (tabsWrap) {
            const tabButtons = ['<button type="button" class="gallery-tab is-active" data-category="all">Semua</button>']
                .concat(categories.map((cat) => `
                    <button type="button" class="gallery-tab" data-category="${escapeHtml(cat.id)}">
                        ${escapeHtml(cat.title)} <span>(${(cat.facilities || []).length})</span>
                    </button>
                `));
            tabsWrap.innerHTML = tabButtons.join('');

            tabsWrap.addEventListener('click', (event) => {
                const button = event.target.closest('.gallery-tab');
                if (!button) return;
                tabsWrap.querySelectorAll('.gallery-tab').forEach((tab) => tab.classList.remove('is-active'));
                button.classList.add('is-active');
                renderGrid(button.dataset.category);
            });
        }

        renderGrid('all');
    };

    const loadData = async () => {
        for (const url of DATA_URLS) {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) continue;
                const json = await res.json();
                if (json && Array.isArray(json.categories)) return json.categories;
            } catch (err) {
                // coba URL berikutnya
            }
        }
        return null;
    };

    (async () => {
        const homeTrack = document.querySelector('[data-facility-slider]');
        const fullGrid = document.querySelector('[data-sarana-grid]');
        if (!homeTrack && !fullGrid) return;

        const categories = await loadData();
        if (!categories || !categories.length) return;

        const items = flattenFacilities(categories);
        if (!items.length) return;

        if (homeTrack) renderHomeTrack(homeTrack, items);
        if (fullGrid) renderFullGallery(fullGrid, categories, items);
    })();
})();
