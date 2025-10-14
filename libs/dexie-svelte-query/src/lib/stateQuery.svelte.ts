import { liveQuery } from "dexie";

export function stateQuery<T>(querier: () => T | Promise<T>, dependencies?: () => unknown[]) {
	const query = $state<{ current?: T; isLoading: boolean; error?: any }>({
		current: undefined,
		isLoading: true,
		error: undefined,
	});
	$effect(() => {
		dependencies?.();
		return liveQuery(querier).subscribe(
			(value) => {
				query.error = undefined;
				if (value !== undefined) {
					query.current = value;
					query.isLoading = false;
				} else {
					query.isLoading = true;
				}
			},
			(error) => {
				query.error = error;
				query.isLoading = false;
			}
		).unsubscribe;
	});
	return query;
}
