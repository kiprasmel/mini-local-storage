export type OnParsingFailCtx<KV> = {
	error: unknown; //
	key: keyof KV;
};

export type OnParsingFail<KV> = ({}: OnParsingFailCtx<KV>) => void;

export type CreateLSOptions<KV> = {
	onParsingFail?: OnParsingFail<KV>;
};

export const createLocalStorage = <KV extends Record<string, any>>(
	opts: CreateLSOptions<KV> = {},
) => {
	const set = <T extends KV, K extends keyof T & string>(key: K, value: T[K]): T[K] => {
		localStorage.setItem(key, JSON.stringify(value));
		return value;
	};

	const has = (key: string): boolean => localStorage.getItem(key) !== null;

	const get = <T extends KV, K extends keyof T & string>(key: K, defaultValue: T[K]): T[K] => {
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

	const appendToArray = <Ts extends KV, K extends keyof Ts & string, V extends Ts[K] & any[]>(
		key: K,
		value: V,
	): Ts[K] => {
		if (!has(key)) {
			return set<Ts, K>(key, value);
		}

		const existing: V = get<Ts, K>(key, value);
		const appended: V = Array.isArray(existing)
			? (existing.concat(value))
			: ([existing].concat(value));

		return set<Ts, K>(key, appended);
	};

	const modify = <T extends KV, K extends keyof T & string>(key: K, defaultValue: T[K], modifier: (currValue: T[K]) => T[K]): T[K] => {
		const currValue = get<T, K>(key, defaultValue);
		const newValue = modifier(currValue);
		return set<T, K>(key, newValue);
	}

	const storage = {
		set,
		has,
		get,
		appendToArray,
		modify,
	} as const;

	return storage;
};

