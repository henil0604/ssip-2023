import { LanguageMap } from '$lib/const';
import Zod, { z } from 'zod';
import _ from 'lodash-es';
import { getDefaultPostReplacerDatabase } from '$lib/server/modules/getDefaultPostReplacerDatabase';

export const changesSchema = z.array(z.object({
	from: z.string(),
	to: z.string(),
	old: z.object({
		startingIndex: z.number(),
		endIndex: z.number()
	}),
	new: z.object({
		startingIndex: z.number(),
		endIndex: z.number()
	})
}))

export const schema = {
	input: z.object({
		input: z.string(),

		language: z.nativeEnum(LanguageMap),

		databaseAddon: z.record(z.string(), z.string())
	}),

	output: z.object({
		result: z.string(),
		changes: changesSchema
	})
};

function findOccurrences(inputString: string, searchWord: string) {
	let result = [];
	let index = inputString.indexOf(searchWord);

	while (index !== -1) {
		result.push({ start: index, end: index + searchWord.length - 1 });
		index = inputString.indexOf(searchWord, index + 1);
	}

	return result;
}

type PostLayerOptions = Zod.infer<(typeof schema)['input']>;
type PostLayerOutput = Zod.infer<(typeof schema)['output']>;

export async function postReplacerLayer(options: PostLayerOptions): Promise<PostLayerOutput> {
	const database = {
		...(await getDefaultPostReplacerDatabase(options.language)),
		...(options.databaseAddon || {})
	};

	const totalChanges: PostLayerOutput["changes"] = [];

	for (const search in database) {
		const replacement = database[search];
		const expression = new RegExp(search, 'gi');
		const changes: PostLayerOutput["changes"][number] = {
			old: {
				startingIndex: -1,
				endIndex: -1,
			},
			new: {
				startingIndex: -1,
				endIndex: -1,
			},
			from: search,
			to: replacement
		}


		const isReplaceable = expression.test(options.input);

		if (isReplaceable) {
			const startingIndexOfOld = options.input.indexOf(search);
			const endIndexOfOld = startingIndexOfOld + search.length;

			changes.old.startingIndex = startingIndexOfOld;
			changes.old.endIndex = endIndexOfOld;
		}

		options.input = options.input.replace(expression, replacement);

		if (isReplaceable) {
			const startingIndexOfNew = options.input.indexOf(replacement);
			const endIndexOfNew = startingIndexOfNew + replacement.length;

			changes.new.startingIndex = startingIndexOfNew;
			changes.new.endIndex = endIndexOfNew;
		}

		if (isReplaceable) {
			totalChanges.push(changes);
		}

	}

	return {
		result: options.input,
		changes: totalChanges
	};
}
