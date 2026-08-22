/**
 * prestasi.js
 * Satu sumber data (data/prestasi.json) dipakai untuk:
 *  - Panel ringkas "Prestasi Sekolah" di index.html -> container [data-achievement-panels]
 *  - Grid lengkap + filter kategori di prestasi.html -> container [data-prestasi-grid]
 *
 * Cara pakai:
 *  1. Taruh file ini di assets/js/prestasi.js
 *  2. Taruh prestasi.json di data/prestasi.json (folder data di root project, sejajar index.html)
 *  3. Tambahkan <script src="assets/js/prestasi.js" defer></script>
 *     di index.html DAN prestasi.html
 *  4. Edit prestasi cukup di data/prestasi.json -> otomatis update di kedua halaman.
 */
(() => {
    const DATA_URL = 'data/prestasi.json';

    const CATEGORY_LABELS = {
        sekolah: 'Prestasi Sekolah',
        siswa: 'Prestasi Siswa',
        guru: 'Prestasi Guru',
    };
    const CATEGORY_ICONS = {
        sekolah: 'fa-school',
        siswa: 'fa-user-graduate',
        guru: 'fa-chalkboard-teacher',
    };
    const CATEGORY_TONES = {
        sekolah: 'gold',
        siswa: 'blue',
        guru: 'green',
    };
    const CATEGORY_ORDER = ['sekolah', 'siswa', 'guru'];

    const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));

    const detailUrl = (item) => `prestasi.html#prestasi-${escapeHtml(item.id)}`;
    const metaLabel = (item) => [item.level, item.year].filter(Boolean).join(' - ');

    const sortFeaturedFirst = (list) => [...list].sort((a, b) => Number(b.featured) - Number(a.featured));

    // ---- Panel ringkas di homepage (index.html) ----
    const renderHomePanels = (container, achievements) => {
        const groups = CATEGORY_ORDER
            .map((category) => ({ category, items: sortFeaturedFirst(achievements.filter((a) => a.category === category)) }))
            .filter((group) => group.items.length);

        if (!groups.length) {
            container.innerHTML = '<p class="section-subtitle">Belum ada data prestasi.</p>';
            return;
        }

        container.innerHTML = groups.map((group) => {
            const [featured, ...rest] = group.items;
            const miniItems = rest.slice(0, 3).map((item) => `
                <a href="${detailUrl(item)}" class="achievement-mini">
                    <span class="achievement-mini-thumb">
                        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
                    </span>
                    <div>
                        <h5>${escapeHtml(item.title)}</h5>
                        <span class="achievement-mini-meta">${escapeHtml(metaLabel(item))}</span>
                    </div>
                </a>
            `).join('');

            return `
                <article class="achievement-panel" data-tone="${CATEGORY_TONES[group.category] || 'blue'}">
                    <div class="achievement-panel-header">
                        <h3 class="achievement-panel-title">
                            <i class="fas ${CATEGORY_ICONS[group.category] || 'fa-trophy'}"></i>
                            ${escapeHtml(CATEGORY_LABELS[group.category] || group.category)}
                        </h3>
                        <span class="achievement-count">${group.items.length} data</span>
                    </div>

                    <a href="${detailUrl(featured)}" class="achievement-featured">
                        <div class="achievement-photo">
                            <img src="${escapeHtml(featured.image)}" alt="${escapeHtml(featured.title)}">
                        </div>
                        <div class="achievement-featured-body">
                            <h4>${escapeHtml(featured.title)}</h4>
                            <div class="achievement-meta-row">
                                <span class="achievement-pill">${escapeHtml(metaLabel(featured))}</span>
                                ${featured.awardee ? `<span class="achievement-pill">${escapeHtml(featured.awardee)}</span>` : ''}
                            </div>
                            ${featured.description ? `<p class="achievement-desc">${escapeHtml(featured.description)}</p>` : ''}
                        </div>
                    </a>

                    ${miniItems ? `<div class="achievement-mini-list">${miniItems}</div>` : ''}

                    <div class="achievement-panel-footer">
                        <a href="prestasi.html" class="achievement-panel-link">
                            Lihat ${escapeHtml(group.category)}
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    };

    // ---- Grid lengkap + filter kategori di prestasi.html ----
    const renderFullGallery = (container, achievements) => {
        const tabsWrap = document.querySelector('[data-prestasi-tabs]');
        const countWrap = document.querySelector('[data-prestasi-count]');
        const statsWrap = document.querySelector('[data-prestasi-stats]');

        if (statsWrap) {
            const counts = CATEGORY_ORDER.map((category) => ({
                category,
                total: achievements.filter((a) => a.category === category).length,
            }));
            statsWrap.innerHTML = counts.map((c) => `
                <span class="pr-stat"><strong>${c.total}</strong>&nbsp;${escapeHtml(CATEGORY_LABELS[c.category] || c.category)}</span>
            `).join('') + `<span class="pr-stat"><strong>${achievements.length}</strong>&nbsp;Total</span>`;
        }

        const cardHtml = (item) => `
            <article class="pr-card" id="prestasi-${escapeHtml(item.id)}" data-category="${escapeHtml(item.category)}">
                <div class="pr-card-media">
                    <span class="pr-card-chip">${escapeHtml(CATEGORY_LABELS[item.category] || item.category)}</span>
                    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div class="pr-card-body">
                    <h3 class="pr-card-title">${escapeHtml(item.title)}</h3>
                    ${item.awardee ? `<p class="pr-card-meta"><strong>Peraih:</strong> ${escapeHtml(item.awardee)}</p>` : ''}
                    ${item.description ? `<p class="pr-card-meta">${escapeHtml(item.description)}</p>` : ''}
                    <div class="pr-card-footer">
                        <span class="pr-card-level">Tingkat ${escapeHtml(item.level)}</span>
                        <span class="pr-card-link">${escapeHtml(item.year)}</span>
                    </div>
                </div>
            </article>
        `;

        const renderGrid = (category) => {
            const filtered = category === 'all' ? achievements : achievements.filter((a) => a.category === category);
            container.innerHTML = filtered.length
                ? filtered.map(cardHtml).join('')
                : '<p class="gallery-empty">Belum ada prestasi pada kategori ini.</p>';
            if (countWrap) countWrap.textContent = `${filtered.length} data`;
        };

        if (tabsWrap) {
            const tabButtons = ['<button type="button" class="gallery-tab is-active" data-filter="all">Semua Kategori</button>']
                .concat(CATEGORY_ORDER.filter((c) => achievements.some((a) => a.category === c)).map((category) => {
                    const total = achievements.filter((a) => a.category === category).length;
                    return `
                    <button type="button" class="gallery-tab" data-filter="${category}">
                        ${escapeHtml(CATEGORY_LABELS[category])} <span>(${total})</span>
                    </button>
                `;
                }));
            tabsWrap.innerHTML = tabButtons.join('');

            tabsWrap.addEventListener('click', (event) => {
                const button = event.target.closest('.gallery-tab');
                if (!button) return;
                tabsWrap.querySelectorAll('.gallery-tab').forEach((btn) => btn.classList.remove('is-active'));
                button.classList.add('is-active');
                renderGrid(button.dataset.filter);
            });
        }

        renderGrid('all');
    };

    document.addEventListener('DOMContentLoaded', () => {
        const homeContainer = document.querySelector('[data-achievement-panels]');
        const fullContainer = document.querySelector('[data-prestasi-grid]');
        if (!homeContainer && !fullContainer) return;

        fetch(DATA_URL)
            .then((response) => {
                if (!response.ok) throw new Error(`Gagal memuat ${DATA_URL}`);
                return response.json();
            })
            .then((data) => {
                const achievements = data.achievements || [];
                if (homeContainer) renderHomePanels(homeContainer, achievements);
                if (fullContainer) renderFullGallery(fullContainer, achievements);
            })
            .catch((error) => {
                console.error('prestasi.js:', error);
                if (homeContainer) homeContainer.innerHTML = '<p class="section-subtitle">Data prestasi belum bisa dimuat.</p>';
                if (fullContainer) fullContainer.innerHTML = '<p class="gallery-empty">Data prestasi belum bisa dimuat.</p>';
            });
    });
})();