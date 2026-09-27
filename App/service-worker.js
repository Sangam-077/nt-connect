const CACHE="remote-connectivity-v4";
const APP_SHELL=["./","./index.html","./style.css","./data.js","./app.js","./manifest.json","./data/mobile_locations.json","./data/black_spots.json","./data/nt_boundary.geojson"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r&&r.status===200){const copy=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,copy))}return r})))});
