// Service Worker — minimal, no caching
// Unregisters old service workers and passes all requests to network

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Unregister this SW so no future interception
      await self.registration.unregister();
      await self.clients.claim();
    })()
  );
});

// No fetch handler — all requests go to network directly
