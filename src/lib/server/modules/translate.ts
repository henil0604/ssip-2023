import { LanguageMap } from '$lib/const';
import Zod, { z } from 'zod';
import _ from 'lodash-es';
import natural from 'natural';
import { googleTranslate } from './googleTranslate';
import { preReplacerLayer } from './preLayerLayer';
import { postReplacerLayer } from './postReplacerLayer';

const schema = {
	input: z.object({
		input: z.string(),

		layers: z.object({
			preReplacer: z.boolean(),
			postReplacer: z.boolean()
		}),

		sourceLanguage: z.nativeEnum(LanguageMap),

		targetLanguage: z.nativeEnum(LanguageMap),

		databaseAddon: z.object({
			preReplacer: z.record(z.string(), z.string()),
			postReplacer: z.record(z.string(), z.string())
		})
	}),

	output: z.object({
		result: z.string()
	})
};

type TranslateOptions = Zod.infer<(typeof schema)['input']>;
type TranslateOutput = Zod.infer<(typeof schema)['output']>;

export async function translate(options: TranslateOptions): Promise<TranslateOutput> {
	if (options.input.trim() === '') {
		return {
			result: ''
		};
	}

	options.input = options.input.trim();

	// apply pre-layer if enabled
	if (options.layers.preReplacer) {
		const PreLayerResponse = await preReplacerLayer({
			input: options.input,
			language: options.sourceLanguage,
			databaseAddon: options.databaseAddon.preReplacer
		});

		options.input = PreLayerResponse.result;
	}

	let translation = await googleTranslate(options.input, options.sourceLanguage, options.targetLanguage);

	// apply post-layer if enabled
	if (options.layers.postReplacer) {
		const PostLayerResponse = await postReplacerLayer({
			input: translation,
			language: options.targetLanguage,
			databaseAddon: options.databaseAddon.postReplacer
		});

		translation = PostLayerResponse.result;
	}

	return {
		result: translation
	};
}
