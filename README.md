Right Track Database (sql.js)
==============================

**node module:** [right-track-db-sqljs](https://www.npmjs.com/package/right-track-db-sqljs)  
**GitHub repo:** [right-track/right-track-db-sqljs](https://github.com/right-track/right-track-db-sqljs)

---

This Node module provides an implementation of the abstract [RightTrackDB](https://github.com/right-track/right-track-db) 
Class using the [sql.js](https://github.com/kripken/sql.js/) module. This 
Class is used to query the SQLite Right Track Database containing the GTFS and 
additional Right Track data.  The SQLite database is generated using the 
[right-track-db-build](https://github.com/right-track/right-track-db-build) module.

### Documentation

This module does not directly require the `sql.js` module.  However, the web-accessible path to the 
Web Worker version of `sql.js` must be provided to the Right Track Database import statement.

```javascript
const RightTrackDB = require("right-track-db-sqljs")("/js/worker.sql.js");
```

When creating a new instance of a `RightTrackDB`, the Right Track Agency configuration and a 
Uint8Array representing the database data must be passed to the constructor.

```javascript
let db = new RightTrackDB(agencyConfig, dataArray);
```

For documentation on this implementation of `RightTrackDB`, see the **/doc/** 
directory in this repository or online at [https://docs.righttrack.io/right-track-db-sqljs](https://docs.righttrack.io/right-track-db-sqljs).

For documentation on the abstract `RightTrackDB` Class, see the source code 
available at [https://github.com/right-track/right-track-db](https://github.com/right-track/right-track-db) 
or its documentation at [https://docs.righttrack.io/right-track-db](https://docs.righttrack.io/right-track-db).
 