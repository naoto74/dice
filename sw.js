const version = "SimpleDiceVer.4.5";
self.addEventListener("install",e=>{
	e.waitUntil(
		caches.open(version).then(cache=>{
			return cache.addAll([
				"./index.html",
				"./diceAudio.mp3",
				"./sample.wav",
				"./main.css",
				"./main.js",
				"./sw.js",
				"./dice-QRcode.png",
			]);
		})
	);
});
self.addEventListener("fetch",e=>{
	e.respondWith(
		caches.match(e.request).then(response=>{
			return response || fetch(e.request);
		})
	);
});
self.addEventListener("activate",e=>{
	e.waitUntil(
		caches.keys().then(cache=>{
			cache.map(name=>{
				if(version !== name) caches.delete(name);
			})
		})
	);
});