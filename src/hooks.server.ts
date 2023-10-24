/*
    This file is about svelte hooks
    Read more about hooks: https://kit.svelte.dev/docs/hooks
*/

import trpcHandler from "$lib/server/trpc/handler";
import { sequence } from "@sveltejs/kit/hooks";

export const handle = sequence(trpcHandler);