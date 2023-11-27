import type { LanguagesInCodeKeys } from '$lib/const';

export async function getDefaultPostReplacerDatabase(
	language: LanguagesInCodeKeys
): Promise<Record<string, string>> {
	try {
		return (await import(`$lib/server/database/post/${language}.json`)).default;
	} catch {
		return {};
	}
}
