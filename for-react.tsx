/* eslint-disable indent */

/**
 * starting template adopted from:
 * https://usehooks.com/useLocalStorage/
 */

import { useState, useCallback, useMemo, useRef } from "react";

import { DefaultKV, LS, Modifier, createLocalStorage } from "./mini-local-storage";

export type CreateUseBasicLocalStorageOpts<KV extends DefaultKV> = {
	initialValues?: {
		[K in keyof KV]?: KV[K];
	};
	storageInstance?: LS<KV>["storageInstance"];
};

export const createUseBasicLocalStorage = <KV extends DefaultKV>(
	opts: CreateUseBasicLocalStorageOpts<KV> = {}
) =>
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	function useBasicLocalStorage<K extends keyof KV & string, V extends KV[K]>(
		key: K, //
		initialValue: V | undefined = opts.initialValues?.[key]
	) {
		const {
			storageInstance = localStorage, //
		} = opts;

		const [storedValue, setStoredValue] = useState<V>(() => {
			try {
				const item = storageInstance.getItem(key);
				return item ? JSON.parse(item) : initialValue;
			} catch (error) {
				// opts.onGetError?.({ error });
				return initialValue;
			}
		});

		const setValue = useCallback(
			(value: V | ((prevVal: V) => V)) => {
				try {
					const valueToStore = value instanceof Function ? value(storedValue) : value;
					setStoredValue(valueToStore);
					storageInstance.setItem(key, JSON.stringify(valueToStore));
					return valueToStore;
				} catch (error) {
					// opts.onSetError?.({ error });
					return storedValue;
				}
			},
			[key, storedValue]
		);

		return [storedValue, setValue] as const;
	};

export type CreateUseLocalStorageOpts<KV extends DefaultKV> = CreateUseBasicLocalStorageOpts<KV> & {
	//
};

export type LSHook<KV, T extends KV, K extends keyof T & string, V extends T[K]> = {
	readonly value: V;
	readonly get: () => V;
	readonly getOr: (or: () => V) => V;
	readonly set: (newValue: V | ((prevVal: V) => V)) => V | undefined;
	readonly has: () => boolean;
	readonly modify: (modifier: Modifier<KV, T, K, V>) => void;
	readonly appendToArray: (extraValue: V) => void;
};
// & (V extends any[]
// ? {
// 		appendToArray: (extraValue: V) => void;
//   }
// : {
// 		appendToArray?: never;
// 		// appendToArray?: null;
//   });

// } & {
// 	appendToArray: V extends any[] ? (extraValue: V) => void : never;
// };

/**
 * if you're using this,
 * you might find redux toolkit + persistance to local storage more useful.
 */
export const createUseLocalStorage =
	<KV extends DefaultKV>(
		ls: LS<KV> //
		// opts: CreateUseLocalStorageOpts<KV> = {}
	) =>
	<K extends keyof KV & (string & {})>(key: K, initialValue: KV[K]) =>
		useCreatedLocalStorage(ls, key, initialValue);

export function useCreatedLocalStorage<KV extends DefaultKV, K extends keyof KV & (string & {})>(
	ls: LS<KV>,
	key: K, //
	initialValue: KV[K] // = opts.initialValues?.[key]
): LSHook<KV, KV, K, KV[K]> {
	type V = KV[K];

	const [value, setValue] = useState<V>(() => ls.getOr(key, () => ls.set(key, initialValue)));

	const get = useCallback(() => value, [value]);

	const getOr = useCallback((or: () => KV[K]) => ls.getOr<KV, K>(key, or), []);

	const set = useCallback(
		(newValue: V | ((prevVal: V) => V)) => {
			try {
				const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
				setValue(valueToStore);
				ls.set(key, valueToStore);
				return valueToStore;
			} catch (error) {
				// opts.onSetError?.({ error });
				return value;
			}
		},
		[key, value]
	);

	const has = useCallback(() => ls.has(key), [key]);

	const appendToArray = useCallback((extraValue: V) => setValue(ls.appendToArray(key, extraValue)), [key]);

	const modify = useCallback(
		(
			modifier: Modifier<KV, KV, K, V> //
		) => {
			set(
				ls.modify(
					key, //
					get(),
					modifier
				)
			);
		},
		[key, get, set]
	);

	const LS = useMemo(() => ({
		value,
		get,
		getOr,
		set,
		has,
		appendToArray,
		modify,
	}), []);

	return LS;
}

export type UseLocalStorageOpts<KV extends DefaultKV> = Pick<CreateUseBasicLocalStorageOpts<KV>, "storageInstance"> & {
	//
};

export function useLocalStorage<KV extends DefaultKV, K extends keyof KV & (string & {})>(
	key: K,
	initialValue: KV[K],
	{ storageInstance }: UseLocalStorageOpts<KV>
) {
	const createdLS = useRef(createLocalStorage({ storageInstance }));

	const LS = useCreatedLocalStorage<KV, K>(createdLS.current, key, initialValue);

	return LS;
}
