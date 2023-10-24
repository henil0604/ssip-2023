import { initTRPC } from '@trpc/server';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

/*
    what ever you return from this function will be available in `ctx` param in t.query function
    we're not using the event parameter is this example,
    hence the eslint-disable rule
*/
export async function createContext(event: RequestEvent) {
    return {
        event,
    };
}

// Public Procedure (Unauthenticated)
export const publicProcedure = t.procedure;