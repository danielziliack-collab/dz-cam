// Offline-Cache: Start IMMER aus dem Cache (schnell, offline),
// im Hintergrund die frische Fassung fuer den NAECHSTEN Start.
const CACHE='dzcam-v1';
// KEIN './' in der Vorcache-Liste: nicht jeder Server liefert einen
// Verzeichnis-Index, und EIN Fehlschlag laesst addAll die GANZE
// Installation verwerfen (lokal genau so passiert). Navigationen
// fallen unten auf index.html zurueck.
const DATEIEN=['./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(DATEIEN)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    let alt=await c.match(e.request, {ignoreSearch:true});
    if(!alt && e.request.mode==='navigate') alt=await c.match('./index.html');
    const frisch=fetch(e.request).then(r=>{ if(r && r.ok) c.put(e.request, r.clone()); return r; }).catch(()=>null);
    return alt || (await frisch) || new Response('offline', {status:503});
  }));
});
