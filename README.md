# safe-local-storage

simple window.localStorage, with type safety

## example

```ts
// localStorage.ts

import { createLocalStorage } from "safe-local-storage";

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

const onFailParse: OnFailParse<FeedbackLS> = ({ error, key }) => 
	console.error(
		`Tried JSON.parse'ing item from localStorage (${key}), but caught error:`,
		error,
	);

export const feedbackLS = createLocalStorage<FeedbackLS>({
	onFailParse,
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
```

## License

[MIT](./LICENSE) (c) 2022 Kipras Melnikovas
