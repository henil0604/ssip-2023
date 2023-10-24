import { router } from "$lib/server/trpc/router";
import { createTRPCHandle } from "trpc-sveltekit";
import { createContext } from "$lib/server/trpc";

/*
    This is for sveltekit hook
*/
export default createTRPCHandle({
    router,
    createContext
});