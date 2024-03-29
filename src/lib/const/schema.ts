import { z } from 'zod';
import { LanguageMap, ResponseCodeMap } from '.';
import { changesSchema } from '$lib/server/modules/postReplacerLayer';

export const translate = {
	input: z.object({
		input: z.string(),
		features: z.object({
			pureGujarati: z.boolean(),
			autoSummarize: z.boolean(),
			autoBulletins: z.boolean()
		}),
		sourceLanguage: z.nativeEnum(LanguageMap),
		targetLanguage: z.nativeEnum(LanguageMap)
	}),
	output: z.object({
		error: z.boolean(),
		message: z.string(),
		code: z.enum(Object.keys(ResponseCodeMap) as [keyof typeof ResponseCodeMap]),
		data: z
			.object({
				referenceId: z.string(),
				output: z
					.object({
						summarized: z.string().optional(),
						bulletined: z.string().optional(),
						original: z.string()
					}),
				changes: z.object({
					postReplacer: changesSchema.optional()
				}).optional()
			})
			.optional()
	})
};
