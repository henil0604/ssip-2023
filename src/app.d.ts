import type pdfJs from 'pdfjs-dist'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
	interface Window {
		pdfjsLib: pdfJs
	}
}

export declare module '@auth/core/types' {
	// User coming from database
	interface User {
		id?: string;
	}
	interface Session {
		// user that will be set to session
		user: {
			id?: string;
		} & DefaultSession['user'];
	}
}

export { };
