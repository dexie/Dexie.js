# live() and useLive()

A final implementation of native suspense support in Dexie. The ideas have been cooking for years but as [useSuspendingLiveQuery()](https://github.com/dexie/Dexie.js/pull/2205) got attention, I'll try to fix this. 

The purpose is a new hook `useLive()` and a new version of liveQuery, `live()`. Their names are shorter than their predecessors as they could supercede `liveQuery()` and `useLiveQuery()` by offering a synchronous API in dexie that suspends internally and uses a cache to accomplish native suspense support.

`live()` is the new version of `liveQuery()` and is not react-specifik, but uses suspense and cache but can be consumed as a non-suspending observable, just like `liveQuery()`.

The feature was developed with React in mind, but might have advantages in other frameworks as well since the returned observable will resolve synchronously on second render. A consumer of a `live()` observable should be prepared for the situation that the observable resolves synchronously, which will be the case when the queried results were found in the cache.

# TODO

 - [ ] Make Collection store non-obscure information about the query. Unlike now, where algorithms are stored as functions that are not inspectable, we need the entire state of the collection to be described in keys that can be used for the cache.
 - [ ] Create a global cache from a Map. Key is a string and value is an object with properties `refCount`, `promise`, `timeout`.
 - [ ] Add method `.read()` to Collection. Let it check the cache for a result or else call toArray() and cache the promise with the query key. If promise is pending, throw, else return its value. The cache is global but every entry has a refcount and a timeout. If no context, the timeout is updated on cache visit. If contex (specific PSD property), communicate the collected cache key to the context so it can collect visited cache entries. Let the context implementation increment refcount and decrement it on unsubscribe.
 - [ ] Add a a SuspendablePromise interface that extends PromiseExtended. Let all Promise-returning methods in Collection and Table return it in the public interface.
 - [ ] Add a helper method `suspendable(p, key)` that adds the read() method to p by looking for the key in cache or else 