import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

const AdminAccounts = ["henilmalaviya06@gmail.com"];

export const load: LayoutServerLoad = async (event) => {
    const { locals } = event;

    const session = await locals.getSession();

    if (session && session.user && AdminAccounts.includes(session?.user?.email || '') === false) {
        // user is not admin
        throw redirect(301, '/');
    }
};