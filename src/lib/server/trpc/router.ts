import { publicProcedure, t } from "$lib/server/trpc";
import { z } from 'zod';
import Translator from "$lib/server/modules/Translate";

export const router = t.router({
    translate: publicProcedure.input(z.object({
        text: z.string()
    })).query(async ({ ctx, input }) => {
        return await Translator.translate(input.text);
    })
});

export type Router = typeof router;