# Write async code dead easy using ES6 yield

With this addon, you can utilize the yield statement to simulate async/await for awaiting promises. 
This works already TODAY in Chrome, FF, opera without transpiling(!)
Support is also in latest MS Edge if turning on ES6 support.

## Example

```js

import Dexie from 'dexie';
import {async, spawn} from 'dexie-yield';

var db = new Dexie("myDB");
db.version(1).stores({
	friends: '++id, name, age'
});
db.open();

db.transaction('rw', db.friends, function*(){
	var friendId = yield db.friends.add({name: "Foo", age: 42});
	console.log("Got id: " + friendId);
	console.log("These are my friends: " + JSON.stringify(yield db.friends.toArray()));
	yield db.friends.delete(friendId);
	console.log ("Friend successfully deleted.");
}).catch(e => alert ("Oops: " + e));


```

## async

Marking a generator function as async() will make yield statements behave like ES7 await. This is not needed in transaction callbacks (as above sample shows) but can be used
whenever you need to do several transactions, or not use transactions at all.

```js
import Dexie from 'dexie';
import {async, spawn} from 'dexie-yield';

...

var listFriends = async(function*() {
	var friends = yield db.friends.toArray();
	return friends;
});

listFriends()
	.then(friends => console.log(JSON.stringify(friends)))
	.catch(e => console.error (e.stack));

```

## spawn

Another style is using spawn() instead of async(). Then you don't need to store your async functions in vars.

```js
import Dexie from 'dexie';
import {async, spawn} from 'dexie-yield';

...

function* listFriends () {
	var friends = yield db.friends.toArray();
	return friends;
});

spawn(listFriends)
	.then(friends => console.log(JSON.stringify(friends)))
	.catch(e => console.error (e.stack));

```

## Motivation

You can also find the spawn() and sync() helpers other libs like Q, Task.js etc. The reason why we need yet another one, is because those will all
return their specific types of Promises, which in some browsers are incompatible with indexedDB transactions. That's also the main reason Dexie
needs its own Promise implementation. Furthermore, Dexie Promises are capable of maintaining Promise-Specific Data (analogous to Thread-specific data)
and utilize that for maintaining transaction scopes and reentrant transaction locks.

However, the dexie-yield versions of async() and spawn() will adapt to any promise implementation by inspecting the first returned Promise instead of
always generating a Dexie Promise.

