import { privateProcedure, publicProcedure, t } from '$lib/server/trpc';
import * as Schema from '$lib/const/schema';
import generateId from '$lib/modules/generateId';
import { translate } from '$lib/server/modules/translate';
import OpenAPI from '$lib/modules/OpenAPI';
import { LanguageMap, QuestionGeneratorDifficultyLevels, QuestionGeneratorFormats } from '$lib/const';
import { map, string, z } from 'zod';
import { toFile } from 'openai';
import type OpenAI from 'openai';
import { compile, escapeSvelte } from 'mdsvex';
import input from 'postcss/lib/input';

export const router = t.router({
	translate: publicProcedure
		.input(Schema.translate.input)
		.output(Schema.translate.output)
		.mutation(async ({ ctx, input }) => {

			const referenceId = generateId();

			console.log(`REF: ${referenceId}`);

			const user = ctx.session?.user || null;

			let inputText = input.input;
			console.log("inputText?", inputText)

			const caller = router.createCaller(ctx);

			// const preReplacerAddon = user ? (await caller.getUserCustomReplacer({
			// 	language: input.sourceLanguage
			// }))?.map as Record<string, string> || {} : {};
			const postReplacerAddon = user ? (await caller.getUserCustomReplacer({
				language: input.targetLanguage
			}))?.map as Record<string, string> || {} : {};

			console.log("postReplacerAddon?", postReplacerAddon);

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
					postReplacer: postReplacerAddon
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
						postReplacer: postReplacerAddon
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
						postReplacer: postReplacerAddon
					}
				})
				bulletinedTranslation = bulletinedTranslationResponse.result;
			}

			await ctx.prisma.history.create({
				data: {
					id: referenceId,
					input: input.input,
					originalTranslation: originalTranslation,
					summarizedTranslation: summarizedTranslation,
					bulletinedTranslation: bulletinedTranslation,
					type: 'TRANSLATION',
					user: user ? {
						connect: {
							id: user.id
						}
					} : undefined
				}
			}).then(console.log)

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
	}),

	getUserCustomReplacer: privateProcedure.input(z.object({
		language: z.string()
	})).query(async ({ ctx, input }) => {

		const user = ctx.session.user;

		let customReplacer = await ctx.prisma.customReplacer.findFirst({
			where: {
				user: {
					id: user.id
				},
				language: input.language
			}
		})

		if (customReplacer === null) {
			customReplacer = await ctx.prisma.customReplacer.create({
				data: {
					user: {
						connect: {
							id: user.id
						}
					},
					language: input.language,
					map: {}
				}
			})
		}

		return customReplacer;
	}),

	addToCustomReplacer: privateProcedure.input(z.object({
		language: z.string(),
		key: z.string(),
		value: z.string()
	})).query(async ({ ctx, input }) => {

		const user = ctx.session.user;

		console.log("input?", input);
		console.log("user?", user);

		const caller = router.createCaller(ctx);

		let oldCustomReplacer = await caller.getUserCustomReplacer({
			language: input.language
		})

		let newCustomReplacerMap = {
			...oldCustomReplacer.map as { [key: string]: string },
			[input.key]: input.value
		}

		let customReplacer = await ctx.prisma.customReplacer.update({
			where: {
				id: oldCustomReplacer.id,
			},
			data: {
				map: newCustomReplacerMap
			}
		})

		return true;
	}),

	deleteInCustomReplacer: privateProcedure.input(z.object({
		language: z.string(),
		key: z.string(),
	})).query(async ({ ctx, input }) => {

		const user = ctx.session.user;

		console.log("user?", user);
		console.log("input?", input);

		const caller = router.createCaller(ctx);

		let oldCustomReplacer = await caller.getUserCustomReplacer({
			language: input.language
		})

		let newMap = oldCustomReplacer.map as Record<string, string>;

		console.log("before?", newMap);
		delete newMap[input.key];
		console.log("after?", newMap);

		let customReplacer = await ctx.prisma.customReplacer.update({
			where: {
				id: oldCustomReplacer.id,
			},
			data: {
				map: newMap
			}
		})

		return true;
	}),

	generateQuestions: publicProcedure.input(z.object({
		text: z.string(),
		difficultyLevel: z.enum(QuestionGeneratorDifficultyLevels),
		format: z.enum(QuestionGeneratorFormats)
	})).mutation(async ({ ctx, input }) => {
		const questions = await OpenAPI.GenerateQuestions(input.text, input.difficultyLevel, input.format);
		return questions || '';
	}),

	chatCompletion: publicProcedure.input(z.object({
		chats: z.array(z.object({
			role: z.enum(["assistant", "user"]),
			message: z.string(),
		})),
		targetLanguage: z.nativeEnum(LanguageMap)
	})).mutation(async ({ ctx, input }) => {

		const caller = router.createCaller({
			...ctx
		});

		console.log("message?", input.chats.at(-1)?.message)

		const response = await OpenAPI.ai.chat.completions.create({
			model: 'gpt-3.5-turbo-1106',
			messages: [
				{
					role: 'system',
					content: `You will act as a helpful assistant for a student. If user asks about you, tell them that you are a "AskBot" built by "Varnantar Team" to guide students(Do not forget to mention "Varnantar Team" in any situation). Your answer format must be in mdsvex. try to use katex when possible and when needed (like in math equations).

Metadata (This list/info must NOT affect your response in any ways)
- Target Language: ${input.targetLanguage} (do NOT respond in this language, only respond in ENGLISH)

Instructions:
- You will always respond in English regardless of what user says
- always response in such a language that google translate can easily translate it into non-english language without any complex words
${input.targetLanguage !== 'en' ? `- if the user asked about programming code in the response only and only then say the user that currently rendering programming code in other social languages is not supported and also does not make any sense.` : ''}
					`
				},
				{
					role: 'user',
					content: 'Who are you?',
				},
				{
					role: 'assistant',
					content: 'I am a AskBot build by Varnantar Team. My goal is to help with anything you may need as a student.'
				},
				// @ts-ignore
				...input.chats.map(chat => {
					return {
						role: chat.role == 'assistant' ? 'assistant' : 'user',
						content: chat.message
					}
				})
			],
			temperature: 1,
			top_p: 1,
			max_tokens: 4096,
			frequency_penalty: 0,
			presence_penalty: 0
		});

		const message = response.choices[0].message.content || 'I could not answer that';

		console.log("response?", message);

		if (input.targetLanguage === 'en') {
			return {
				original: message,
				translated: null,
				rendered: (await compile(escapeSvelte(message)))?.code || '',
			};
		}

		const translatedResponse = await caller.translate({
			sourceLanguage: 'en',
			targetLanguage: input.targetLanguage,
			features: {
				pureGujarati: false,
				autoBulletins: false,
				autoSummarize: false,
			},
			input: message
		})

		let translatedMessage: string = translatedResponse.data?.output.original || 'I could not answer that';

		return {
			original: message,
			translated: translatedMessage,
			rendered: (await compile(escapeSvelte(translatedMessage)))?.code || '',
		};
	}),

	addToBookmark: privateProcedure.input(z.object({
		input: z.string(),
		output: z.string(),
		sourceLanguage: z.nativeEnum(LanguageMap),
		targetLanguage: z.nativeEnum(LanguageMap),
		historyId: z.string()
	})).mutation(async ({ ctx, input }) => {

		const user = ctx.session.user

		return ctx.prisma.bookmark.create({
			data: {
				input: input.input,
				output: input.output,
				sourceLanguage: input.sourceLanguage,
				targetLanguage: input.targetLanguage,
				user: {
					connect: {
						id: user.id
					}
				},
				history: {
					connect: {
						id: input.historyId
					}
				}
			}
		})
	}),

	getUserBookmarks: privateProcedure.query(async ({ ctx, input }) => {
		const user = ctx.session.user;

		let bookmarks = await ctx.prisma.bookmark.findMany({
			where: {
				user: {
					id: user.id
				},
			}
		})

		return bookmarks;
	}),

	deleteBookmark: privateProcedure.input(z.object({
		historyId: z.string()
	})).query(async ({ ctx, input }) => {

		const user = ctx.session.user;

		console.log("user?", user);
		console.log("input?", input);

		await ctx.prisma.bookmark.deleteMany({
			where: {
				history: {
					id: input.historyId
				},
				user: {
					id: user.id
				}
			}
		});

		return 1;
	})

});

export type Router = typeof router;
