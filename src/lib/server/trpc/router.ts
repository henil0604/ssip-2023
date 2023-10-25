import { publicProcedure, t } from "$lib/server/trpc";
import { z } from 'zod';
import Translator from "$lib/server/modules/Translate";

export const router = t.router({
    translate: publicProcedure.input(z.object({
        text: z.string()
    })).query(async ({ ctx, input }) => {
        const sentences = input.text.split("\n");
        const translation = (await Promise.all(sentences.map(Translator.translate))).join('\n');

        return translation;
    })
});

export type Router = typeof router;