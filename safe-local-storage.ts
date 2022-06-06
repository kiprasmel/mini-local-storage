export type OnFailParseCtx<KV> = {
	error: unknown; //
	key: keyof KV;
};

export type OnFailParse<KV> = ({}: OnFailParseCtx<KV>) => void;

export type CreateLSOptions<KV> = {
	onFailParse?: OnFailParse<KV>;
};

export const createLocalStorage = <KV extends Record<string, any>>(
	opts: CreateLSOptions<KV> = {},
) => {
	const set = <T extends KV, K extends keyof T & string>(key: K, value: T[K]) => {
		return localStorage.setItem(key, JSON.stringify(value));
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
			opts.onFailParse?.({ error, key });
			return defaultValue;
		}
	};

	const appendToArray = <Ts extends KV, K extends keyof Ts & string, V extends Ts[K] & any[]>(
		key: K,
		value: V,
	) => {
		if (!has(key)) {
			set<Ts, K>(key, value);
			return;
		}

		const existing: V = get<Ts, K>(key, value) as V;
		const appended: V = existing.concat(value) as V;

		set<Ts, K>(key, appended);
	};

	const storage = {
		set,
		has,
		get,
		appendToArray,
	} as const;

	return storage;
};

