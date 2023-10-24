import { publicProcedure, t } from "$lib/server/trpc";
import { z } from 'zod';
import Translator from "$lib/server/modules/Translate";

export const router = t.router({
    translate: publicProcedure.input(z.object({
        text: z.string()
    })).query(async ({ ctx, input }) => {
        const translation = Translator.translate(input.text);

        return translation;
    })
});

export type Router = typeof router;