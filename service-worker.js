const staticCacheName = 'v1';

//list of urls we want to cache
const allCacheURLs = [
'/',
'/restaurant.html',
'/index.html',
'/css/styles.css',
'/js/dbhelper.js',
'/js/main.js',
'/js/restaurant_info.js',
'/data/restaurants.json',
'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
'/img/1.jpg',
'/img/2.jpg',
'/img/3.jpg',
'/img/4.jpg',
'/img/5.jpg',
'/img/6.jpg',
'/img/7.jpg',
'/img/8.jpg',
'/img/9.jpg',
'/img/10.jpg',
];


/*Here you can see we call caches.open() with our desired cache name,
after which we call cache.addAll() and pass in our array of files.
This is a chain of promises (caches.open() and cache.addAll()).
The event.waitUntil() method takes a promise and uses it to know
how long installation takes, and whether it succeeded or not.

If all the files are successfully cached, then the service worker will be installed.
If any of the files fail to download, then the install step will fail.
This allows you to rely on having all the assets that you defined, but does mean you need to be careful with the list of
files you decide to cache in the install step. Defining a long list of files will increase the chance that one file may fail to cache,
leading to your service worker not getting installed. */
self.addEventListener('install', function(e){
	e.waitUntil(
		caches.open(staticCacheName).then((cache)=>{
			return cache.addAll(allCacheURLs);
		})
	);
});


//when our browser is making a url request
/*
Here we've defined our fetch event and within event.respondWith(), we pass in a promise from caches.match().
This method looks at the request and finds any cached results from any of the caches your service worker created.

If we have a matching response, we return the cached value, otherwise we return the result of a call to fetch,
which will make a network request and return the data if anything can be retrieved from the network.
This is a simple example and uses any cached assets we cached during the install step.

If we want to cache new requests cumulatively, we can do so by handling the response of the fetch request
and then adding it to the cache, like below.
*/
self.addEventListener('fetch', function(e){

	e.respondWith(
		caches.match(e.request).then((response)=>{ //we are looking whether the URL(which we are currently requesting) is available in our cache
			if(response){//if the url is available in cache - then the response evaluates to true
				return response;//then we return the url found in the cache
			}
				// IMPORTANT: Clone the request. A request is a stream and
		        // can only be consumed once. Since we are consuming this
		        // once by cache and once by the browser for fetch, we need
		        // to clone the response.
				const fetchRequest = e.request.clone();

				return fetch(fetchRequest).
				then((response)=>{
					if(!response || response.status !== 200 || response.type !== 'basic'){
						return response;
					}

					// IMPORTANT: Clone the response. A response is a stream
		            // and because we want the browser to consume the response
		            // as well as the cache consuming the response, we need
		            // to clone it so we have two streams.

            		var responseToCache = response.clone();

            		caches.open(staticCacheName)
            		.then((cache)=>{
            			cache.put(e.request, responseToCache);
            		});

            		return response;
					});
		})
	);
});



self.addEventListener('activate', function(e) {
  console.log('Activating new service worker');

		  e.waitUntil(
			    caches.keys().then(function(cacheNames) {
				      return Promise.all(
					        cacheNames.filter(function(cacheName) {
					          return cacheName.startsWith('') && cacheName !== staticCacheName;
					          }).map(function(cacheName){
					            return caches.delete(cacheName);
					          })
				        );
			    })
		  );
});