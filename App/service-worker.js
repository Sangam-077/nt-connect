const VERSION = 'ntconnect-final-20260930-v4';
const SHELL = [
 './', './index.html','./style.css','./app.js','./data.js','./service_data.js','./cyclone_frequency_data.js','./cyclone_frequency_import.js','./manifest.json',
 './assets/icon.svg','./assets/nt_terrain.jpg','./assets/icon-192.png','./assets/icon-512.png',
 './data/mobile_locations_with_cyclones.json','./data/black_spots.json','./data/nt_boundary.geojson','./data/verified_local_services.json'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('ntconnect-')&&key!==VERSION).map(key=>caches.delete(key)))));
 self.clients.claim();
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 // The shareable BOM-derived file can be generated AFTER first installation.
 // Prefer the latest online version, but retain a cached offline copy.
 if(url.pathname.endsWith('/cyclone_frequency_data.js')){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(VERSION).then(cache=>cache.put(event.request,copy)));}
   return response;
  }).catch(()=>caches.match(event.request)));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(VERSION).then(cache=>cache.put(event.request,copy)));}
  return response;
 }).catch(()=>caches.match('./index.html'))));
});
