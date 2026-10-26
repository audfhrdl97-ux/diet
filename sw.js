const C='diet-v2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname.endsWith('googleapis.com')||u.hostname.endsWith('firebaseio.com'))return; // 동기화 통신은 건드리지 않음
  const store=res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res};
  if(u.origin===location.origin){ // 내 파일: 네트워크 우선(업데이트 즉시 반영), 오프라인이면 캐시
    e.respondWith(fetch(r).then(store).catch(()=>caches.match(r)));
  }else{ // 외부 라이브러리: 캐시 우선
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(store)));
  }
});
