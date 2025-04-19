// @ts-ignore
import React, { createContext, useEffect } from "react";

const QueryContext = createContext(null);

export function MiniQueryClientProvider({ children, queryClient }) {
	return (
		<QueryContext.Provider value={queryClient}>
			{children}
		</QueryContext.Provider>
	);
}

export class MiniQueryClient {
	constructor() {
		this.queries = [];
	}

	getQuery(options) {
		const queryHash = JSON.stringify(options.queryKey);
		let query = this.queries.find((query) => query.queryHash === queryHash);

		if (!query) {
			query = createQuery(this, options);
			this.queries.push(query);
		}

		return query;
	}
}

export function useQuery({ queryFn, queryKey, staleTime }) {
	const client = React.useContext(QueryContext);

	const [, rerender] = React.useReducer((i) => i + 1, 0);

	const observerRef = React.useRef(null);
	if (!observerRef.current) {
		observerRef.current = createQueryObserver(client, {
			queryKey,
			queryFn,
			staleTime,
		});
	}

	useEffect(() => {
		observerRef.current.subscribe(rerender);
	}, []);

	return observerRef.current.getResults();
}

function createQuery(client, { queryKey, queryFn }) {
	const query = {
		queryHash: JSON.stringify(queryKey),
		state: { status: "loading", data: undefined, error: undefined },
		setState: (updater) => {
			query.state = updater(query.state);
			// biome-ignore lint/complexity/noForEach: <explanation>
			query.subscribers.forEach((subscriber) => subscriber.notify());
		},
		subscribers: [],
		subscribe: (subscriber) => {
			query.subscribers.push(subscriber);
			return () => {
				query.subscribers = query.subscribers.filter((s) => s !== subscriber);
			};
		},
		promise: null,
		fetch: () => {
			if (!query.promise) {
				query.promise = (async () => {
					query.setState((old) => ({
						...old,
						lastUpdate: Date.now(),
						status: "loading",
						error: undefined,
					}));

					try {
						const data = await queryFn();
						query.setState((old) => ({
							...old,
							status: "success",
							data,
						}));
					} catch (error) {
						query.setState((old) => ({
							...old,
							status: "error",
							error,
						}));
					} finally {
						query.promise = null;
					}

					return query.promise;
				})();
			}
		},
	};

	return query;
}

function createQueryObserver(client, { queryFn, queryKey, staleTime = 0 }) {
	const query = client.getQuery({ queryFn, queryKey, staleTime });

	const observer = {
		notify: () => {},
		getResults: () => query.state,
		subscribe: (callback) => {
			observer.notify = callback;
			const unsubscribe = query.subscribe(observer);

			observer.fetch();

			return unsubscribe;
		},
		fetch: () => {
			if (
				!query.state.lastUpdate ||
				Date.now() - query.state.lastUpdate > staleTime
			) {
				query.fetch();
			}
		},
	};

	return observer;
}
