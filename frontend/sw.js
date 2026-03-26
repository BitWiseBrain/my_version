const CACHE_NAME = 'ankurah-flashlite-v1';
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll([
            '/torch/index.html',
            '/torch/torch.js',
            '/auth/login.html',
            '/auth/auth.js',
            '/victim/home.html',
            '/police/dashboard.html',
            '/police/dashboard.js'
        ]))
    );
});
self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(response => response || fetch(e.request)));
});
