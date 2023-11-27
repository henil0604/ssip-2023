import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// if someone comes to / send them to /translator
	throw redirect(301, '/translator');
};
