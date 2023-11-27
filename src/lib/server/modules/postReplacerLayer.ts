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
		result: z.string()
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

		options.input = options.input.replace(new RegExp(search, 'gi'), replacement);
	}

	return {
		result: options.input
	};
}
