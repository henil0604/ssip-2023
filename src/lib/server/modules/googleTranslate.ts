import type { LanguagesInCodeKeys } from '$lib/const';
import translate from '@iamtraction/google-translate';

export async function googleTranslate(
	text: string,
	sourceLanguage: LanguagesInCodeKeys,
	targetLanguage: LanguagesInCodeKeys
) {
	console.log(`Google Translating ${text.length} characters from ${sourceLanguage} to ${targetLanguage}...`);
	const response = (
		await translate(text, {
			from: sourceLanguage,
			to: targetLanguage,
		})
	).text;
	console.log(`Translation of ${text.length} completed`);
	return response;
}
