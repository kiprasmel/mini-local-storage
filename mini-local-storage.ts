/* eslint-disable indent */

export type OnParsingFailCtx<KV> = {
	error: unknown; //
	key: keyof KV;
};

export type OnParsingFail<KV> = ({}: OnParsingFailCtx<KV>) => void;

export type CreateLSOptions<KV> = {
	onParsingFail?: OnParsingFail<KV>;
};

export type Modifier<
	KV, //
	T extends KV = KV,
	K extends keyof T & string = keyof T & string,
	V extends T[K] = T[K]
> = (currValue: V) => V;

export type LS<KV extends Record<string, any>> = {
	readonly set: <T extends KV, K extends keyof T & string>(key: K, value: T[K]) => T[K];
	readonly has: (key: string) => boolean;
	readonly get: <T extends KV, K extends keyof T & string>(key: K, defaultValue: T[K]) => T[K];
	readonly getOr: <T extends KV, K extends keyof T & string>(key: K, or: () => T[K]) => T[K];
	readonly appendToArray: <Ts extends KV, K extends keyof Ts & string, V extends Ts[K] & any[]>(
		key: K, //
		value: V
	) => Ts[K];
	readonly modify: <T extends KV, K extends keyof T & string>(
		key: K, //
		defaultValue: T[K],
		modifier: Modifier<KV, T, K, T[K]>
	) => T[K];
};

export const createLocalStorage = <KV extends Record<string, any>>(
	opts: CreateLSOptions<KV> = {} //
): LS<KV> => {
	const set: LS<KV>["set"] = <T extends KV, K extends keyof T & string>(key: K, value: T[K]): T[K] => {
		localStorage.setItem(key, JSON.stringify(value));
		return value;
	};

	const has: LS<KV>["has"] = (key: string): boolean => localStorage.getItem(key) !== null;

	const get: LS<KV>["get"] = <T extends KV, K extends keyof T & string>(key: K, defaultValue: T[K]): T[K] => {
		if (!has(key)) {
			return defaultValue;
		}

		const item = localStorage.getItem(key)!;

		try {
			return JSON.parse(item);
		} catch (error) {
			opts.onParsingFail?.({ error, key });
			return defaultValue;
		}
	};

	const getOr: LS<KV>["getOr"] = <T extends KV, K extends keyof T & string>(key: K, or: () => T[K]): T[K] => {
		if (!has(key)) {
			return or();
		}

		const item = localStorage.getItem(key)!;

		try {
			return JSON.parse(item);
		} catch (error) {
			opts.onParsingFail?.({ error, key });
			return or();
		}
	};

	const appendToArray: LS<KV>["appendToArray"] = <
		Ts extends KV, //
		K extends keyof Ts & string,
		V extends Ts[K] & any[]
	>(
		key: K, //
		value: V
	): Ts[K] => {
		if (!has(key)) {
			return set<Ts, K>(key, value);
		}

		const existing: V = get<Ts, K>(key, value);
		const appended: V = Array.isArray(existing)
			? existing.concat(value) //
			: [existing].concat(value);

		return set<Ts, K>(key, appended);
	};

	const modify: LS<KV>["modify"] = <T extends KV, K extends keyof T & string>(
		key: K, //
		defaultValue: T[K],
		modifier: (currValue: T[K]) => T[K]
	): T[K] => {
		const currValue = get<T, K>(key, defaultValue);
		const newValue = modifier(currValue);
		return set<T, K>(key, newValue);
	};

	const storage: LS<KV> = {
		set,
		has,
		get,
		getOr,
		appendToArray,
		modify,
	};

	return storage;
};
