# mini-local-storage

simple window.localStorage, with type safety

## Example 1

Regular usage:

```ts
// localStorage.ts

import { createLocalStorage, OnParsingFail } from "mini-local-storage";

import { FeedbackRating, FeedbackSource, FeedbackTrigger } from "../entities/feedback";

export type FeedbackLS = {
	"foo:bar:all-submitted-feedbacks": {
		date: Date;
		rating?: FeedbackRating;
		source: FeedbackSource;
		trigger: FeedbackTrigger;
	}[];
	"foo:bar:related-variable-count": number;
};

const onParsingFail: OnParsingFail<FeedbackLS> = ({ error, key }) => 
	console.error(
		`Tried JSON.parse'ing item from localStorage (${key}), but caught error:`,
		error,
	);

export const feedbackLS = createLocalStorage<FeedbackLS>({
	onParsingFail,
});
```

```ts
// foo.ts

import { feedbackLS } from "../localStorage";

// all type-safe:
feedbackLS.set()
feedbackLS.has()
feedbackLS.get()
feedbackLS.appendToArray()
feedbackLS.modify()
```

## Example 2

Providing a different `storageInstance`, e.g. `sessionStorage` (instead of the default `localStorage`):

```ts
type Project = {
	uid: string;
	// <...>
};

export type FooBarLS = {
	"foo:bar:projects": Project[];
};

export type FooBarSS = {
	// we want session storage, because we want the currently selected project *per tab*.
	"foo:bar:projects:current": Project["uid"];
};

export const fooBarLS = createLocalStorage<FooBarLS>({
	// localStorage by default
});

export const fooBarSS = createLocalStorage<FooBarSS>({
	storageInstance: sessionStorage,
});

```

and, if you're using our `createUseLocalStorage` for react, the custom provided `storageInstance` will be automatically there.

```ts
// the custom `storageInstance` works out of the box.
export const useFooBarSessionStorage = createUseLocalStorage(fooBarSS);
```

## License

[MIT](./LICENSE) (c) 2022 Kipras Melnikovas
