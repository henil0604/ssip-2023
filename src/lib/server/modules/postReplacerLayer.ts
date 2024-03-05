import { LanguageMap } from '$lib/const';
import Zod, { z } from 'zod';
import _ from 'lodash-es';
import { getDefaultPostReplacerDatabase } from '$lib/server/modules/getDefaultPostReplacerDatabase';

const schema = {
	input: z.object({
		input: z.string(),

		language: z.nativeEnum(LanguageMap),

		databaseAddon: z.record(z.string(), z.string())
	}),

	output: z.object({
		result: z.string(),
		changes: z.array(z.object({

		}))
	})
};

type PostLayerOptions = Zod.infer<(typeof schema)['input']>;
type PostLayerOutput = Zod.infer<(typeof schema)['output']>;

export async function postReplacerLayer(options: PostLayerOptions): Promise<PostLayerOutput> {
	const database = {
		...(await getDefaultPostReplacerDatabase(options.language)),
		...(options.databaseAddon || {})
	};

	for (const search in database) {
		const replacement = database[search];
		const expression = new RegExp(search, 'gi');
		const changes = {
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
			console.log("changes?", changes);
		}

	}

	return {
		result: options.input,
		changes: []
	};
}
