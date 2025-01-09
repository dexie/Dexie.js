import { liveQuery } from "dexie";

export function stateQuery<T>(
	querier: () => T | Promise<T>,
	dependencies?: () => unknown[]
): { current?: T } {
	const query = $state<{ current?: T }>({ current: undefined });
	$effect(() => {
		dependencies?.();
		return liveQuery(querier).subscribe((result) => {
			if (result !== undefined) {
				query.current = result;
			}
		}).unsubscribe;
	});
	return query;
}
