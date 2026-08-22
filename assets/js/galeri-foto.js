/**
 * galeri-foto.js
 * Satu sumber data (data/galeri-foto.json) dipakai untuk:
 *  - Preview "Galeri Foto" di index.html  -> container [data-photo-tiles]
 *  - Grid lengkap di galerifoto.html      -> container [data-galeri-foto-grid]
 *
 * Cara pakai:
 *  1. Taruh file ini di assets/js/galeri-foto.js
 *  2. Taruh galeri-foto.json di data/galeri-foto.json (folder data di root project, sejajar index.html)
 *  3. Tambahkan <script src="assets/js/galeri-foto.js" defer></script>
 *     di index.html DAN galerifoto.html
 *  4. Edit foto cukup di galeri-foto.json -> otomatis update di kedua halaman.
 */
(() => {
    const DATA_URL = 'data/galeri-foto.json';

    const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));

    const flattenPhotos = (albums) => {
        const items = [];
        albums.forEach((album) => {
            (album.photos || []).forEach((photo, index) => {
                items.push({
                    key: `${album.id}-${index}`,
                    src: photo.src,
                    title: photo.title || album.title,
                    description: photo.description || album.description || '',
                    album: album.title,
                    albumId: album.id,
                    featured: !!photo.featured,
                });
            });
        });
        // Foto yang ditandai "featured" ditaruh paling depan (dipakai sebagai foto besar di homepage).
        return items.sort((a, b) => Number(b.featured) - Number(a.featured));
    };

    // Daftar registry dipakai oleh lightbox (index.html) supaya tombol prev/next
    // bisa berpindah antar foto dalam satu album, walau dirender lewat JS.
    const renderLightboxRegistry = (items) => {
        let holder = document.querySelector('[data-photo-lightbox-items]');
        if (!holder) {
            holder = document.createElement('script');
            holder.type = 'application/json';
            holder.setAttribute('data-photo-lightbox-items', '');
            document.body.appendChild(holder);
        }
        holder.textContent = JSON.stringify(items.map(({ key, src, title, description, album }) => ({
            key,
            image: src,
            title,
            album,
            album_description: description,
        })));
    };

    const triggerAttrs = (item) => `
        data-photo-lightbox-trigger
        data-photo-key="${escapeHtml(item.key)}"
        data-photo-src="${escapeHtml(item.src)}"
        data-photo-title="${escapeHtml(item.title)}"
        data-photo-category="${escapeHtml(item.album)}"
        data-photo-description="${escapeHtml(item.description)}"
    `;

    // ---- Preview di homepage (index.html) ----
    const renderHomeTiles = (container, items) => {
        const limit = parseInt(container.dataset.limit || '7', 10);
        const list = items.slice(0, limit);
        if (!list.length) {
            container.innerHTML = '<p class="section-subtitle">Belum ada foto pada galeri.</p>';
            return;
        }
        const [feature, ...rest] = list;
        const tiles = rest.slice(0, 6).map((item) => `
            <button type="button" class="home-photo-tile photo-lightbox-trigger" ${triggerAttrs(item)}>
                <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy">
                <span class="home-photo-tile-caption">${escapeHtml(item.title)}</span>
            </button>
        `).join('');

        container.innerHTML = `
            <button type="button" class="home-photo-feature photo-lightbox-trigger" ${triggerAttrs(feature)}>
                <img src="${escapeHtml(feature.src)}" alt="${escapeHtml(feature.title)}" loading="lazy">
                <div class="home-photo-overlay">
                    <span class="theme-badge theme-badge-primary">${escapeHtml(feature.album)}</span>
                    <h3>${escapeHtml(feature.title)}</h3>
                    <p>${escapeHtml(feature.description)}</p>
                </div>
            </button>
            <div class="home-photo-grid">${tiles}</div>
        `;
    };

    // ---- Grid lengkap di galerifoto.html ----
    const renderFullGallery = (container, albums, items) => {
        const tabsWrap = document.querySelector('[data-galeri-foto-tabs]');
        const countWrap = document.querySelector('[data-galeri-foto-count]');

        const renderGrid = (albumId) => {
            const filtered = albumId === 'all' ? items : items.filter((item) => item.albumId === albumId);
            container.innerHTML = filtered.length
                ? filtered.map((item) => `
                    <button type="button" class="gallery-photo-card photo-lightbox-trigger" ${triggerAttrs(item)}>
                        <span class="gallery-photo-media">
                            <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy">
                        </span>
                        <span class="gallery-photo-body">
                            <span class="gallery-photo-album">${escapeHtml(item.album)}</span>
                            <span class="gallery-photo-title">${escapeHtml(item.title)}</span>
                        </span>
                    </button>
                `).join('')
                : '<p class="gallery-empty">Belum ada foto pada kategori ini.</p>';

            if (countWrap) countWrap.textContent = `${filtered.length} foto`;
        };

        if (tabsWrap) {
            const tabButtons = ['<button type="button" class="gallery-tab is-active" data-album="all">Semua</button>']
                .concat(albums.map((album) => `
                    <button type="button" class="gallery-tab" data-album="${escapeHtml(album.id)}">
                        ${escapeHtml(album.title)} <span>(${(album.photos || []).length})</span>
                    </button>
                `));
            tabsWrap.innerHTML = tabButtons.join('');

            tabsWrap.addEventListener('click', (event) => {
                const button = event.target.closest('.gallery-tab');
                if (!button) return;
                tabsWrap.querySelectorAll('.gallery-tab').forEach((tab) => tab.classList.remove('is-active'));
                button.classList.add('is-active');
                renderGrid(button.dataset.album);
            });
        }

        renderGrid('all');
    };

    document.addEventListener('DOMContentLoaded', () => {
        const homeContainer = document.querySelector('[data-photo-tiles]');
        const fullContainer = document.querySelector('[data-galeri-foto-grid]');
        if (!homeContainer && !fullContainer) return;

        fetch(DATA_URL)
            .then((response) => {
                if (!response.ok) throw new Error(`Gagal memuat ${DATA_URL}`);
                return response.json();
            })
            .then((data) => {
                const albums = data.albums || [];
                const items = flattenPhotos(albums);
                renderLightboxRegistry(items);
                if (homeContainer) renderHomeTiles(homeContainer, items);
                if (fullContainer) renderFullGallery(fullContainer, albums, items);
            })
            .catch((error) => {
                console.error('galeri-foto.js:', error);
                if (homeContainer) homeContainer.innerHTML = '<p class="section-subtitle">Galeri foto belum bisa dimuat.</p>';
                if (fullContainer) fullContainer.innerHTML = '<p class="gallery-empty">Galeri foto belum bisa dimuat.</p>';
            });
    });
})();