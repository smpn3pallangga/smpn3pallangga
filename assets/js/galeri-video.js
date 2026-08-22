// assets/js/galeri-video.js
// Memuat data dari galeri-video.json dan merender tab kategori + grid video YouTube
// ke dalam galerivideo.html (elemen [data-galeri-video-tabs] & [data-galeri-video-grid]).
// Klik kartu video akan membuka lightbox (elemen [data-video-lightbox] di galerivideo.html).

(() => {
    const tabsEl = document.querySelector('[data-galeri-video-tabs]');
    const gridEl = document.querySelector('[data-galeri-video-grid]');
    const countEl = document.querySelector('[data-galeri-video-count]');
    if (!tabsEl || !gridEl) return;

    // Coba beberapa lokasi umum untuk file data, supaya fleksibel di berbagai struktur folder.
    const DATA_URLS = [
        'galeri-video.json',
        './galeri-video.json',
        'assets/data/galeri-video.json',
        'data/galeri-video.json'
    ];

    const state = { categories: [], activeCategory: 'all' };

    const thumbUrl = (youtubeId) => `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    const embedUrl = (youtubeId) => `https://www.youtube-nocookie.com/embed/${youtubeId}`;

    const flattenVideos = (categories) => {
        const list = [];
        categories.forEach((cat) => {
            (cat.videos || []).forEach((video) => {
                list.push({
                    ...video,
                    categoryId: cat.id,
                    categoryTitle: cat.title
                });
            });
        });
        // Video "featured" ditampilkan lebih dulu.
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        return list;
    };

    const totalVideos = (categories) => categories.reduce((sum, c) => sum + (c.videos ? c.videos.length : 0), 0);

    const buildTabs = (categories) => {
        tabsEl.innerHTML = '';

        const allTab = document.createElement('button');
        allTab.type = 'button';
        allTab.className = 'gallery-tab is-active';
        allTab.dataset.categoryId = 'all';
        allTab.innerHTML = `Semua Video <span>(${totalVideos(categories)})</span>`;
        tabsEl.appendChild(allTab);

        categories.forEach((cat) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'gallery-tab';
            tab.dataset.categoryId = cat.id;
            const count = cat.videos ? cat.videos.length : 0;
            tab.innerHTML = `${cat.title} <span>(${count})</span>`;
            tabsEl.appendChild(tab);
        });

        tabsEl.addEventListener('click', (event) => {
            const tab = event.target.closest('.gallery-tab');
            if (!tab) return;
            state.activeCategory = tab.dataset.categoryId;
            tabsEl.querySelectorAll('.gallery-tab').forEach((btn) => {
                btn.classList.toggle('is-active', btn === tab);
            });
            renderGrid();
        });
    };

    const createVideoCard = (video) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'gallery-video-card';
        card.setAttribute('data-video-lightbox-trigger', '');
        card.dataset.videoSrc = embedUrl(video.youtubeId);
        card.dataset.videoTitle = video.title || '';
        card.dataset.videoCategory = video.categoryTitle || '';
        card.dataset.videoDescription = video.description || '';

        const media = document.createElement('div');
        media.className = 'gallery-video-media';

        const img = document.createElement('img');
        img.src = thumbUrl(video.youtubeId);
        img.alt = video.title || 'Thumbnail video';
        img.loading = 'lazy';
        img.addEventListener('error', () => {
            // Fallback jika hqdefault tidak tersedia.
            img.src = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
        }, { once: true });

        const play = document.createElement('span');
        play.className = 'gallery-video-play';
        play.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>';

        media.appendChild(img);
        media.appendChild(play);

        const body = document.createElement('div');
        body.className = 'gallery-video-body';

        const category = document.createElement('span');
        category.className = 'gallery-video-category';
        category.textContent = video.categoryTitle || '';

        const title = document.createElement('span');
        title.className = 'gallery-video-title';
        title.textContent = video.title || '';

        body.appendChild(category);
        body.appendChild(title);

        card.appendChild(media);
        card.appendChild(body);
        return card;
    };

    const renderGrid = () => {
        const allVideos = flattenVideos(state.categories);
        const filtered = state.activeCategory === 'all'
            ? allVideos
            : allVideos.filter((video) => video.categoryId === state.activeCategory);

        gridEl.innerHTML = '';

        if (!filtered.length) {
            const empty = document.createElement('div');
            empty.className = 'gallery-empty';
            empty.textContent = 'Belum ada video pada kategori ini.';
            gridEl.appendChild(empty);
        } else {
            const fragment = document.createDocumentFragment();
            filtered.forEach((video) => fragment.appendChild(createVideoCard(video)));
            gridEl.appendChild(fragment);
        }

        if (countEl) {
            countEl.textContent = `${filtered.length} Video`;
        }
    };

    const loadData = async () => {
        for (const url of DATA_URLS) {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) continue;
                const json = await res.json();
                if (json && Array.isArray(json.categories)) return json.categories;
            } catch (err) {
                // Coba URL berikutnya.
            }
        }
        return null;
    };

    (async () => {
        if (countEl) countEl.textContent = 'Memuat...';
        const categories = await loadData();

        if (!categories || !categories.length) {
            if (countEl) countEl.textContent = 'Video tidak tersedia';
            tabsEl.innerHTML = '';
            gridEl.innerHTML = '<div class="gallery-empty">Galeri video belum tersedia saat ini.</div>';
            return;
        }

        state.categories = categories;
        buildTabs(categories);
        renderGrid();
    })();
})();
