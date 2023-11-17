import { publicProcedure, t } from '$lib/server/trpc';
import * as Schema from '$lib/const/schema';
import generateId from '$lib/modules/generateId';
import { translate } from '$lib/server/modules/translate';

export const router = t.router({
	translate: publicProcedure
		.input(Schema.translate.input)
		.output(Schema.translate.output)
		.mutation(async ({ ctx, input }) => {
			const referenceId = generateId();

			console.log(`REF: ${referenceId}`);

			const translationResponse = await translate({
				input: input.input,
				sourceLanguage: input.sourceLanguage,
				targetLanguage: input.targetLanguage,
				layers: {
					preReplacer: true,
					postReplacer: true
				},
				databaseAddon: {
					preReplacer: {},
					postReplacer: {}
				}
			});

			return {
				error: false,
				message: '',
				code: 'SUCCESS',
				data: {
					referenceId,
					result: translationResponse.result
				}
			};
		})
});

export type Router = typeof router;
