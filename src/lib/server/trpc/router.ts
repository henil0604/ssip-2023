import { publicProcedure, t } from '$lib/server/trpc';
import * as Schema from '$lib/const/schema';
import generateId from '$lib/modules/generateId';
import { translate } from '$lib/server/modules/translate';
import OpenAPI from '$lib/modules/OpenAPI';
import { LanguageMap } from '$lib/const';
import { string, z } from 'zod';
import { toFile } from 'openai';
import ISO6391 from 'iso-639-1';
import type OpenAI from 'openai';

export const router = t.router({
	translate: publicProcedure
		.input(Schema.translate.input)
		.output(Schema.translate.output)
		.mutation(async ({ ctx, input }) => {
			const referenceId = generateId();

			console.log(`REF: ${referenceId}`);

			let inputText = input.input;
			console.log("inputText?", inputText)
			if ((input.features.autoSummarize || input.features.autoBulletins) && input.sourceLanguage !== LanguageMap["English"]) {
				const translationResponse = await translate({
					input: input.input,
					sourceLanguage: input.sourceLanguage,
					targetLanguage: LanguageMap["English"],
					layers: {
						preReplacer: false,
						postReplacer: false,
					},
					databaseAddon: {
						preReplacer: {},
						postReplacer: {}
					}
				})
				inputText = translationResponse.result;
				console.log("inputText?", inputText)
			}

			let summarized: string = inputText;
			if (input.features.autoSummarize) {
				let summarizedResponse = await OpenAPI.Summarize(inputText);
				if (!summarizedResponse) {
					return {
						error: true,
						message: 'Failed to summarize',
						code: 'FAILED_TO_SUMMARIZE'
					}
				}
				summarized = summarizedResponse;
				console.log("summarized?", summarized)
			}

			let bulletined: string = summarized;
			if (input.features.autoBulletins) {
				let bulletinedResponse = await OpenAPI.Bulletins(summarized);
				if (!bulletinedResponse) {
					return {
						error: true,
						message: 'Failed to summarize',
						code: 'FAILED_TO_SUMMARIZE'
					}
				}
				bulletined = bulletinedResponse;
				console.log("bulletined?", bulletined)
			}

			// compute original translation
			const originalTranslationResponse = await translate({
				input: input.input,
				sourceLanguage: input.sourceLanguage,
				targetLanguage: input.targetLanguage,
				layers: {
					preReplacer: !input.features.pureGujarati,
					postReplacer: !input.features.pureGujarati
				},
				databaseAddon: {
					preReplacer: {},
					postReplacer: {}
				}
			});
			let originalTranslation = originalTranslationResponse.result
			console.log("originalTranslation?", originalTranslation)

			let summarizedTranslation: string | undefined = undefined;
			if (input.features.autoSummarize) {
				let summarizedTranslationResponse = await translate({
					input: summarized,
					sourceLanguage: input.sourceLanguage,
					targetLanguage: input.targetLanguage,
					layers: {
						preReplacer: !input.features.pureGujarati,
						postReplacer: !input.features.pureGujarati
					},
					databaseAddon: {
						preReplacer: {},
						postReplacer: {}
					}
				})
				summarizedTranslation = summarizedTranslationResponse.result;
			}

			let bulletinedTranslation: string | undefined = undefined;
			if (input.features.autoBulletins) {
				let bulletinedTranslationResponse = await translate({
					input: bulletined,
					sourceLanguage: input.sourceLanguage,
					targetLanguage: input.targetLanguage,
					layers: {
						preReplacer: !input.features.pureGujarati,
						postReplacer: !input.features.pureGujarati
					},
					databaseAddon: {
						preReplacer: {},
						postReplacer: {}
					}
				})
				bulletinedTranslation = bulletinedTranslationResponse.result;
			}

			ctx.prisma.history.create({
				data: {
					id: referenceId,
					input: input.input,
					originalTranslation: originalTranslation,
					summarizedTranslation: summarizedTranslation,
					bulletinedTranslation: bulletinedTranslation,
					type: 'TRANSLATION'
				}
			}).then(() => null)

			return {
				error: false,
				message: '',
				code: 'SUCCESS',
				data: {
					referenceId,
					output: {
						summarized: input.features.autoSummarize ? summarizedTranslation : undefined,
						bulletined: input.features.autoBulletins ? bulletinedTranslation : undefined,
						original: originalTranslation
					}
				}
			};
		}),

	submitFeedback: publicProcedure.input(z.object({
		refId: z.string(),
		isPositive: z.boolean(),
		isTranslationError: z.boolean(),
		isGrammarError: z.boolean(),
		isSpellingError: z.boolean(),
	})).query(async ({ ctx, input }) => {
		return ctx.prisma.feedback.create({
			data: {
				isGrammarError: !input.isPositive && input.isGrammarError,
				isSpellingError: !input.isPositive && input.isSpellingError,
				isTranslationError: !input.isPositive && input.isTranslationError,
				isPositive: input.isPositive,
				ref: {
					connect: {
						id: input.refId
					}
				}
			}
		})

	}),

	textToSpeech: publicProcedure.input(z.object({
		input: z.string()
	})).mutation(async ({ ctx, input }) => {

		let response = await OpenAPI.ai.audio.speech.create({
			input: input.input,
			model: 'tts-1',
			voice: 'alloy',
			response_format: 'mp3',
		}).asResponse()

		return await response.buffer();
	}),

	speechToText: publicProcedure.input(z.object({
		arrayBuffer: z.array(z.number()),
		type: z.string(),
		language: z.string()
	})).mutation(async ({ ctx, input }) => {

		console.log(input)

		const arrayUint8 = new Uint8Array(input.arrayBuffer);

		console.log(arrayUint8);

		let blob = new Blob([arrayUint8], {
			type: input.type
		});
		console.log(blob)

		const extension = input.type.split('/')[1]

		const file = await toFile(blob, `${Date.now().toString()}.${extension}`, {
			type: input.type
		})
		console.log(file)

		let response: OpenAI.Audio.Transcription;
		try {
			response = await OpenAPI.ai.audio.transcriptions.create({
				model: 'whisper-1',
				file: file,
				response_format: 'json',
				language: input.language
			})
			console.log("response?", response);

			return {
				code: 'DONE',
				message: "",
				response: response.text
			};
		} catch (error: any) {
			error = (JSON.parse(JSON.stringify(error)));

			if (error.code === 'unsupported_language') {
				return {
					code: error.code.toUpperCase(),
					message: 'Language is not Supported',
					response: null
				}
			}

			return {
				code: 'UNKNOWN_ERROR',
				message: 'Unknown error',
				response: null
			}

		}
	})
});

export type Router = typeof router;
