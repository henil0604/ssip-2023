import { publicProcedure, t } from "$lib/server/trpc";
import { z } from 'zod';
import Translator from "$lib/server/modules/Translate";
import OpenAPI from "$lib/server/modules/OpenAPI";

export const router = t.router({
    translate: publicProcedure.input(z.object({
        text: z.string(),
        autoSummarize: z.boolean(),
        pureGujarati: z.boolean(),
        autoBulletins: z.boolean()
    })).query(async ({ ctx, input }) => {

        if (input.autoSummarize) {
            const summarizedContent = await OpenAPI.Summarize(input.text);
            if (!summarizedContent) {
                return {
                    error: true,
                    message: 'Invalid input',
                    data: null
                }
            }

            input.text = summarizedContent.trim();
        }

        let translation = await Translator.translate(input.text, {
            wordReplacementLayer: !input.pureGujarati
        });


        if (input.autoBulletins) {
            const bulletinedContent = await OpenAPI.bulletins(translation);

            if (!bulletinedContent) {
                return {
                    error: true,
                    message: 'Invalid input',
                    data: null
                }
            }

            translation = bulletinedContent.trim();
        }


        return {
            error: false,
            message: null,
            data: translation
        };
    })
});

export type Router = typeof router;