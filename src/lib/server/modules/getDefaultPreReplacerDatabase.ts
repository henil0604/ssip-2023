import type { LanguagesInCodeKeys } from '$lib/const';

export async function getDefaultPreReplacerDatabase(
	language: LanguagesInCodeKeys
): Promise<Record<string, string>> {
	try {
		return (await import(`$lib/server/database/pre/${language}.json`)).default;
	} catch {
		return {};
	}
}
