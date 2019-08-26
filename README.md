# DNS Cache 
This module wraps the [dns](http://nodejs.org/api/dns.html) and caches all dns lookups using [appolo-cache](https://github.com/shmoop207/appolo-cache)
 
## Installation
```javascript
npm install appolo-cache
````

## Usage
wrap dns methods
```typescript
import dns = require('dns');
import {dnsCache} from "appolo-dns-cache";

dnsCache({override: true, ttl: 1000, maxItems: 10000});
  
    //will call the wrapped dns
    dns.lookup('www.yahoo.com', function(err, result) {
        //do something with result
    });
```
use dnsCache 
```typescript
import {dnsCache} from "appolo-dns-cache";

let dns = dnsCache({override: false, ttl: 1000, maxItems: 10000});

 //will call the wrapped dns
    dns.lookup('www.google.com', function(err, result) {
        //do something with result
    });
```
