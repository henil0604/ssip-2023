/*
This module holds everything related to authentication
Read More: https://authjs.dev
*/

import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_SECRET } from "$env/static/private";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { SvelteKitAuth } from "@auth/sveltekit";
import GithubProvider from '@auth/core/providers/github';
import { prisma } from "$lib/server/db";

const authHandler = SvelteKitAuth({
    providers: [
        // Github Provider
        GithubProvider({
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET
        }),
        /*
            Add More Providers like, google, discord
            Read More about it here:
            https://authjs.dev/reference/core/providers
        */
    ],
    secret: AUTH_SECRET,
    // Using prisma adapter
    adapter: PrismaAdapter(prisma),
    callbacks: {
        // this is called every time getSession() is called
        session: async ({
            session, // session that will be returned
            user // user in the database
        }) => {

            // if user exists into the session
            if (session.user) {
                // assigning properties to session user
                session.user.id = user.id;
            }

            return session;
        },
    },
});

export default authHandler;