// Offline-Cache: Start IMMER aus dem Cache (schnell, offline),
// im Hintergrund die frische Fassung fuer den NAECHSTEN Start.
// DER NAME TRAEGT DEN STAND. Ein Browser installiert einen Service-
// Worker nur neu, wenn sich SEIN SKRIPT aendert - mit einem festen
// Namen blieb der Cache vom Tag der ersten Installation stehen, und
// die App startete monatelang aus der alten Kopie (Daniels Befund
// 15.09.2026: 'immer noch der Stand vom 12.09.'). Jetzt aendert jede
// Veroeffentlichung diese Zeile, der Worker installiert neu und holt
// alle Dateien frisch.
const STAND='15.09.2026 21:40 (113468df)';
const CACHE='dzcam-'+STAND.replace(/[^0-9a-f]/gi,'');
// KEIN './' in der Vorcache-Liste: nicht jeder Server liefert einen
// Verzeichnis-Index, und EIN Fehlschlag laesst addAll die GANZE
// Installation verwerfen (lokal genau so passiert). Navigationen
// fallen unten auf index.html zurueck.
const DATEIEN=['./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./fraesen.html','./manifest-fraesen.webmanifest'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(DATEIEN)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  // Die alten Staende wegraeumen - sonst waechst der Speicher mit
  // jeder Veroeffentlichung, und der alte Cache koennte wieder
  // ausgeliefert werden.
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  // stand.txt geht AM CACHE VORBEI - sie ist die Datei, an der die App
  // erkennt, ob sie selbst alt ist.
  if(/stand\.txt/.test(e.request.url)) return;
  if(e.request.method!=='GET') return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    let alt=await c.match(e.request, {ignoreSearch:true});
    if(!alt && e.request.mode==='navigate') alt=await c.match('./index.html');
    const frisch=fetch(e.request).then(r=>{ if(r && r.ok) c.put(e.request, r.clone()); return r; }).catch(()=>null);
    return alt || (await frisch) || new Response('offline', {status:503});
  }));
});
