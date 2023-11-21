/*
This module holds everything related to authentication
Read More: https://authjs.dev
*/

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { SvelteKitAuth } from '@auth/sveltekit';
import GoogleProvider from '@auth/core/providers/google';
import { prisma } from '$lib/server/db';

const authHandler = SvelteKitAuth({
	providers: [
		// Github Provider
		// @ts-ignore
		GoogleProvider({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		})
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
		}
	}
});

export default authHandler;
