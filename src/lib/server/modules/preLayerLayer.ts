import { LanguageMap } from '$lib/const';
import Zod, { z } from 'zod';
import _ from 'lodash-es';
import { getDefaultPreReplacerDatabase } from '$lib/server/modules/getDefaultPreReplacerDatabase';

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

type PreLayerOptions = Zod.infer<(typeof schema)['input']>;
type PreLayerOutput = Zod.infer<(typeof schema)['output']>;

export async function preReplacerLayer(options: PreLayerOptions): Promise<PreLayerOutput> {
	const database = {
		...(await getDefaultPreReplacerDatabase(options.language)),
		...(options.databaseAddon || {})
	};

	for (const search in database) {
		const replacement = database[search];

		options.input = options.input.replace(new RegExp(search, 'g'), replacement);
	}

	return {
		result: options.input
	};
}
