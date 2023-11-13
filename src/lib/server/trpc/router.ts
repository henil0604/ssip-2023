import { privateProcedure, t } from "$lib/server/trpc";

export const router = t.router({
    greeting: privateProcedure.query(async ({ ctx }) => {
        return `Hello tRPC v10 @ ${new Date().toLocaleTimeString()}`;
    })
});

export type Router = typeof router;