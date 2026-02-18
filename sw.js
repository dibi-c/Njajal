const CACHE_NAME = 'bms-cache-v6.0'; // Naikkan versi ini setiap kali Anda update kode di GitHub
const assetsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Tahap Install: Menyimpan file ke cache
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Memaksa Service Worker baru langsung aktif
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Tahap Activate: Menghapus cache lama agar tidak memenuhi memori
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Tahap Fetch: Strategi Stale-While-Revalidate
// Memberikan respon cepat dari cache, tapi tetap memperbarui cache dari network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Simpan hasil terbaru ke cache untuk penggunaan berikutnya
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Jika offline dan tidak ada di cache, bisa arahkan ke halaman offline jika perlu
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Mendengarkan perintah dari tombol 'Update' di index.html
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
