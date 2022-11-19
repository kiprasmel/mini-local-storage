# mini-local-storage

simple window.localStorage, with type safety

## example

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

## License

[MIT](./LICENSE) (c) 2022 Kipras Melnikovas
