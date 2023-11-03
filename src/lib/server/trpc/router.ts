import { publicProcedure, t } from "$lib/server/trpc";
import { z } from 'zod';
import Translator from "$lib/server/modules/Translate";
import OpenAPI from "$lib/server/modules/OpenAPI";
import generateId from "$lib/server/modules/generateId";
import { prisma } from "$lib/server/db";

export const router = t.router({
    translate: publicProcedure.input(z.object({
        text: z.string(),
        autoSummarize: z.boolean(),
        pureGujarati: z.boolean(),
        autoBulletins: z.boolean()
    })).query(async ({ ctx, input }) => {

        const referenceId = generateId();

        console.log("referenceId?", referenceId);

        if (input.autoSummarize) {
            const summarizedContent = await OpenAPI.Summarize(input.text);
            if (!summarizedContent) {
                return {
                    error: true,
                    message: 'Invalid input',
                    data: null,
                    refId: null
                }
            }

            input.text = summarizedContent.trim();
        }

        let translation = await Translator.translate(input.text, {
            wordReplacementLayer: !input.pureGujarati,
            sentenceReplacementLayer: !input.pureGujarati,
        });


        if (input.autoBulletins) {
            const bulletinedContent = await OpenAPI.bulletins(translation);

            if (!bulletinedContent) {
                return {
                    error: true,
                    message: 'Invalid input',
                    data: null,
                    refId: null
                }
            }

            translation = bulletinedContent.trim();
        }

        // Store into history table
        if (!input.autoBulletins && !input.autoSummarize && !input.pureGujarati) {
            await prisma.history.create({
                data: {
                    id: referenceId,
                    input: input.text,
                    output: translation,
                    type: 'TRANSLTION'
                }
            })
        }

        return {
            error: false,
            message: null,
            data: translation,
            refId: referenceId
        };
    }),

    submitFeedback: publicProcedure.input(z.object({
        refId: z.string(),
        isPositive: z.boolean(),
        isTranslationError: z.boolean(),
        isGrammarError: z.boolean(),
        isSpellingError: z.boolean(),
    })).query(async ({ ctx, input }) => {

        return prisma.feedback.create({
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

    generateQuestions: publicProcedure.input(z.object({
        text: z.string()
    })).query(async ({ ctx, input }) => {

        const referenceId = generateId();

        console.log("referenceId?", referenceId);

        const questions = await OpenAPI.generateQuestions(input.text);

        console.log("questions?", questions);

        if (!questions) {
            return {
                error: true,
                message: 'Invalid input',
                data: null,
                refId: null
            }
        }

        const translation = await Translator.translate(questions, {
            sentenceReplacementLayer: true,
            wordReplacementLayer: true
        })

        await prisma.history.create({
            data: {
                id: referenceId,
                input: input.text,
                output: translation,
                type: 'QUESTION_GENERATOR'
            }
        })

        return {
            data: translation,
            error: false,
            message: null,
            refId: referenceId
        }
    }),


    generateSolution: publicProcedure.input(z.object({
        text: z.string()
    })).query(async ({ ctx, input }) => {

        const referenceId = generateId();

        console.log("referenceId?", referenceId);

        const solution = await Translator.fromSolutionDataSet(input.text);

        console.log("solution?", solution);

        if (!solution) {
            return {
                error: true,
                message: 'No Solution found',
                data: null,
                refId: null
            }
        }

        const translation = await Translator.translate(solution, {
            sentenceReplacementLayer: true,
            wordReplacementLayer: true
        })

        await prisma.history.create({
            data: {
                id: referenceId,
                input: input.text,
                output: translation,
                type: 'SOLUTION_GENERATOR'
            }
        })

        return {
            data: translation,
            error: false,
            message: null,
            refId: referenceId
        }
    }),

});

export type Router = typeof router;