import { initTRPC } from '@trpc/server';
import type { RequestEvent } from '@sveltejs/kit';
import { TRPCError, type inferAsyncReturnType } from '@trpc/server';
import { prisma } from "$lib/server/db";

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

/*
    what ever you return from this function will be available in `ctx` param in t.query function
    we're not using the event parameter is this example,
    hence the eslint-disable rule
*/
export async function createContext(event: RequestEvent) {
    return {
        session: await event.locals.getSession(),
        prisma: prisma,
        event,
    };
}

/*
    This middleware ensures that user is properly authenticated 
    (Used for `privateProcedure`)
*/
const enforceUserAuthentication = t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            // infers the `session` as non-nullable
            session: { ...ctx.session, user: ctx.session.user },
        },
    });
});

// Public Procedure (Unauthenticated)
export const publicProcedure = t.procedure;
// Private Procedure (Authenticated)
export const privateProcedure = t.procedure.use(enforceUserAuthentication);