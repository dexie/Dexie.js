# Dexie.js Svelte Query

Svelte reactive state query for fetching using Dexie.js

## Usage

```svelte
<script lang="ts">
	import { stateQuery } from 'dexie-svelte-query';
	import { db } from './db';

	let minAge = $state(18);
	let maxAge = $state(65);

	const friendsQuery = stateQuery(
		() => db.friends.where('age').between(minAge, maxAge).toArray(),
		() => [minAge, maxAge]
	);
	let friends = $derived(friendsQuery.current);
</script>

<div>
	<h2>Friends</h2>
	<ul>
		{#each friends ?? [] as friend (friend.id)}
			<li>{friend.name}, {friend.age}</li>
		{/each}
		</ul>
</div>
```
