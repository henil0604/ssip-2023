import type { LanguagesInCodeKeys } from '$lib/const';
import translate from '@iamtraction/google-translate';

export async function googleTranslate(
	text: string,
	sourceLanguage: LanguagesInCodeKeys,
	targetLanguage: LanguagesInCodeKeys
) {
	console.log(`Google Translating ${text}...`);
	return (
		await translate(text, {
			from: sourceLanguage,
			to: targetLanguage
		})
	).text;
}
