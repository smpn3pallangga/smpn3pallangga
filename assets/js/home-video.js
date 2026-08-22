// assets/js/home-video.js
// Mengisi seksi "Galeri Video" di HOMEPAGE (index.html) dari galeri-video.json,
// supaya video di homepage otomatis ikut berubah saat galeri-video.json diperbarui.
// Butuh markup dengan hook: [data-home-video-gallery], [data-home-video-feature],
// [data-home-video-feature-img], [data-home-video-feature-title],
// [data-home-video-feature-category], [data-home-video-feature-desc],
// [data-home-video-list]. Lihat catatan pemasangan di bawah/di chat.

(() => {
    const gallery = document.querySelector('[data-home-video-gallery]');
    if (!gallery) return;

    const featureBtn = gallery.querySelector('[data-home-video-feature]');
    const featureImg = gallery.querySelector('[data-home-video-feature-img]');
    const featureTitle = gallery.querySelector('[data-home-video-feature-title]');
    const featureCategory = gallery.querySelector('[data-home-video-feature-category]');
    const featureDesc = gallery.querySelector('[data-home-video-feature-desc]');
    const listEl = gallery.querySelector('[data-home-video-list]');
    if (!featureBtn || !listEl) return;

    const DATA_URLS = [
        'galeri-video.json',
        './galeri-video.json',
        'assets/data/galeri-video.json',
        'data/galeri-video.json'
    ];
    const LIST_LIMIT = 4;

    const thumbUrl = (youtubeId) => `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    const embedUrl = (youtubeId) => `https://www.youtube.com/embed/${youtubeId}`;

    const flattenVideos = (categories) => {
        const list = [];
        categories.forEach((cat) => {
            (cat.videos || []).forEach((video) => {
                list.push({ ...video, categoryTitle: cat.title });
            });
        });
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        return list;
    };

    const fillTrigger = (el, video) => {
        el.setAttribute('data-video-lightbox-trigger', '');
        el.dataset.videoSrc = embedUrl(video.youtubeId);
        el.dataset.videoTitle = video.title || '';
        el.dataset.videoCategory = video.categoryTitle || '';
        el.dataset.videoDescription = video.description || '';
    };

    const renderFeature = (video) => {
        fillTrigger(featureBtn, video);
        if (featureImg) {
            featureImg.src = thumbUrl(video.youtubeId);
            featureImg.alt = video.title || '';
        }
        if (featureTitle) featureTitle.textContent = video.title || '';
        if (featureCategory) featureCategory.textContent = video.categoryTitle || '';
        if (featureDesc) featureDesc.textContent = video.description || '';
        featureBtn.hidden = false;
    };

    const createListItem = (video) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'home-video-item video-lightbox-trigger';
        fillTrigger(item, video);

        const media = document.createElement('span');
        media.className = 'home-video-media';
        const img = document.createElement('img');
        img.src = thumbUrl(video.youtubeId);
        img.alt = video.title || '';
        img.loading = 'lazy';
        const play = document.createElement('span');
        play.className = 'home-video-play';
        play.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>';
        media.appendChild(img);
        media.appendChild(play);

        const copy = document.createElement('span');
        copy.className = 'home-video-item-copy';
        const badge = document.createElement('span');
        badge.className = 'theme-badge theme-badge-accent';
        badge.textContent = video.categoryTitle || '';
        const h4 = document.createElement('h4');
        h4.textContent = video.title || '';
        const p = document.createElement('p');
        p.textContent = video.description || '';
        copy.appendChild(badge);
        copy.appendChild(h4);
        copy.appendChild(p);

        item.appendChild(media);
        item.appendChild(copy);
        return item;
    };

    const renderList = (videos) => {
        listEl.innerHTML = '';
        listEl.style.setProperty('--home-video-list-count', String(videos.length || 1));
        videos.forEach((video) => listEl.appendChild(createListItem(video)));
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
        const categories = await loadData();
        if (!categories || !categories.length) return;

        const videos = flattenVideos(categories);
        if (!videos.length) return;

        const [feature, ...rest] = videos;
        renderFeature(feature);
        renderList(rest.slice(0, LIST_LIMIT));
    })();
})();
