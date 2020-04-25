//content script for scraping user history during browsing session
function domReady(fn) {
    // If we're early to the party
    document.addEventListener("DOMContentLoaded", fn);
    // If late; I mean on time.
    if (document.readyState === "interactive" || document.readyState === "complete" ) {
      fn();
    }
}

domReady(() =>  {
    //check if recording is set as true
    chrome.storage.sync.get('recording', function(data) {
        if(data.recording === true) {
            record();
        }
    });    
});

const record = () => {
    //console.log("Recording is set to " + state.recording);

    //setting seed for murmur hash
    let seed = 32;
    let this_page = {
        title: document.title,
        href: document.location.href,
        next: [],
    };

    //alert(this_page.href.toString());
    let hash = murmurhash3_32_gc(this_page.href.toString(), seed);
    //alert("This page hash: " + hash);

    chrome.storage.sync.get('sHistory', function(data) {
        console.log(data)
        data.sHistory[hash] = this_page;
        console.log(data.sHistory);
        let newHist = data.sHistory;
        chrome.storage.sync.set({sHistory: newHist}, function() {
            console.log("Set new history in chrome storage");
        });
    });

    function callback(e: Event) {
        //var e = window.e || e;
        // if (e.target.tagName !== 'A') {
        //     alert("2");
        //     return;
        // }
        var addressValue = (<HTMLAnchorElement>e.target).href;
    
        //alert("here");
        //alert(addressValue.toString());
        var newhash = murmurhash3_32_gc(addressValue.toString(), seed);
        //alert(newhash);

        chrome.storage.sync.get('sHistory', function(data) {
    
            //pushing hash pointer to this page hist dict
            data.sHistory[hash].next.push(newhash.toString());
            
            chrome.storage.sync.set({sHistory: data.sHistory}, function() {
                console.log("Set new history in chrome storage");
            });
        });
    }

    if (document.addEventListener) {
        document.addEventListener('click', callback, false);
    }
    
}


//https://github.com/garycourt/murmurhash-js/blob/master/murmurhash3_gc.js
//"https://stackoverflow.com/questions/94037/convert-character-to-ascii-code-in-javascript"
function murmurhash3_32_gc(key, seed) {
	var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
	
	remainder = key.length & 3; // key.length % 4
	bytes = key.length - remainder;
	h1 = seed;
	c1 = 0xcc9e2d51;
	c2 = 0x1b873593;
	i = 0;
	
	while (i < bytes) {
	  	k1 = 
	  	  ((key.charCodeAt(i) & 0xff)) |
	  	  ((key.charCodeAt(++i) & 0xff) << 8) |
	  	  ((key.charCodeAt(++i) & 0xff) << 16) |
	  	  ((key.charCodeAt(++i) & 0xff) << 24);
		++i;
		
		k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

		h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
		h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
		h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
	}
	
	k1 = 0;
	
	switch (remainder) {
		case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
		case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
		case 1: k1 ^= (key.charCodeAt(i) & 0xff);
		
		k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
		h1 ^= k1;
	}
	
	h1 ^= key.length;

	h1 ^= h1 >>> 16;
	h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
	h1 ^= h1 >>> 13;
	h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
	h1 ^= h1 >>> 16;

	return h1 >>> 0;
}