import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const session = await locals.getSession();

    console.log("session?", session);

    return {
        session
    }
};