/**
 * This module is responsible for handling all kind of process related to translation.
 */

// importing google translate API
import translate from '@iamtraction/google-translate';
import { text } from '@sveltejs/kit';
import { Regex } from 'lucide-svelte';

class Translator {
    // static manual dataset
    public static ManualDataSet: {
        [key: string]: string
    } | null = null
    // static replacer dataset
    public static ReplacerDataSet: {
        [key: string]: string
    } | null = null

    private constructor() { }

    // responsible for loading manual dataset into static `ManualDataSet`
    public static async loadManualDataSet(force: boolean = false) {
        if (Translator.ManualDataSet === null || force) {
            Translator.ManualDataSet = (await import("$lib/server/sentence-dataset.json")).default;
        }
    }

    // responsible for loading replacer dataset into static `ReplacerDataSet`
    public static async loadReplacerDataset(force: boolean = false) {
        if (Translator.ReplacerDataSet === null || force) {
            Translator.ReplacerDataSet = (await import("$lib/server/replacer-dataset.json")).default;
        }
    }

    /**
     * this method implements first layer (sentence replacer layer)
     * responsible for finding value of key in ManualDataSet, if found returns it, if not returns null
    */
    public static async fromManualDataSet(input: string) {
        await Translator.loadManualDataSet();
        if (Translator.ManualDataSet === null) return null;

        return Translator.ManualDataSet[input] || null;
    }

    // responsible for fetching translation from Google Translate API
    public static async fromGoogleAPI(input: string) {
        return (await translate(input, {
            to: 'gu' // target language
        })).text
    }

    // responsible for splitting paragraph into array of sentences
    public static sentenceGeneratorFromParagraph(input: string) {
        return input.split(/(?<=[.!?])\s+/);
    }

    /**
     * checks if the given string is paragraph
     * it basically uses `static sentenceGeneratorFromParagraph` method to get sentences from paragraph,
     * if the length of array is greater than 1, it returns true otherwise false.
    **/
    public static isParagraph(input: string) {
        const sentences = Translator.sentenceGeneratorFromParagraph(input);

        console.log("sentences?", sentences)

        return sentences.length > 1 ? true : false;
    }

    /**
     * this function basically implements replacer layer
     */
    public static async parseResult(text: string) {
        // loading the replacer-dataset
        await Translator.loadReplacerDataset();

        // some guard
        if (Translator.ReplacerDataSet === null) return text;

        for (const key in Translator.ReplacerDataSet!) {
            const replacedValue = Translator.ReplacerDataSet![key];

            text = text.replace(new RegExp(key, "g"), replacedValue);
        }

        return text;
    }

    // responsible for normalizing the text, it tries to remove dot from sentence, it lowercases the text and trims unwanted spaces.
    public static simplifyText(text: string) {
        text = text.toLocaleLowerCase().trim();
        return text[text.length - 1] === '.' ? text.slice(0, text.length - 1) : text;
    }

    // responsible for process of translation
    public static async translate(input: string, options?: {
        wordReplacementLayer: boolean,
        sentenceReplacementLayer: boolean
    }) {
        // defaults the options
        options = {
            wordReplacementLayer: true,
            sentenceReplacementLayer: true,
            ...(options || {}),
        }

        console.log('--------------------');
        console.log("input?", input);
        // 1. Load the model
        await Translator.loadManualDataSet()
        // copy the input to originalInput
        const originalInput = input;

        // 2. convert input to lowercase (fine tune)
        let refinedInput = input.toLocaleLowerCase();
        console.log("refinedInput?", refinedInput);

        // 3. check if input is paragraph or not
        const isParagraph = Translator.isParagraph(refinedInput);

        console.log("isParagraph?", isParagraph);

        // 4. if the input is not paragraph that means input is sentence, check if the sentence exists in sentence-database, if yes just return it
        if (!isParagraph) {

            // boolean, if the text has dot (.) at end, true otherwise false
            const endWithDot = refinedInput[refinedInput.length - 1] === ".";

            // if the sentence replacement layer is on
            if (options.sentenceReplacementLayer) {
                // call sentence replacer layer
                const manualTranslation = await Translator.fromManualDataSet(Translator.simplifyText(refinedInput));

                console.log("manualTranslation?", manualTranslation);
                // if found the translation
                if (manualTranslation) {
                    return manualTranslation + (endWithDot ? '.' : '');
                }
            }

            // if not found in manual translation, translate it from google API
            const googleTranslated = await Translator.fromGoogleAPI(refinedInput);

            console.log("googleTranslated?", googleTranslated);

            // if the word replacer layer is on
            if (options.wordReplacementLayer) {
                // call word replacer layer
                const parsedResult = await Translator.parseResult(googleTranslated);

                console.log("parsedResult?", parsedResult);

                return parsedResult + (endWithDot ? '.' : '');
            } else { // else return the result from Google API
                return googleTranslated + (endWithDot ? '.' : '');
            }

        }

        // calls the sentence generator
        const sentences = Translator.sentenceGeneratorFromParagraph(refinedInput);

        // sends each sentence to first layer (sentence replacer layer)
        const sentencesReplaced = await Promise.all(sentences.map(async sentence => {
            sentence = Translator.simplifyText(sentence);
            return [sentence, await Translator.fromManualDataSet(sentence)];
        }))

        // boolean, true if all the sentence are found from first layer
        let allTheSentencesIsInManualDatabase = false;

        // iterate through all the replaced sentences
        for (const replacement of sentencesReplaced) {
            // extract the sentence
            // replacement[1] is the replaced sentence
            // 0th index is original sentence
            if (replacement[1] === null) {
                allTheSentencesIsInManualDatabase = false;
                break;
            }
            allTheSentencesIsInManualDatabase = true;
        }

        console.log("allTheSentencesIsInManualDatabase?", allTheSentencesIsInManualDatabase);

        // 5. if the input is paragraph, and all the sentences is in the sentence-database, replace all of them.
        if (isParagraph && allTheSentencesIsInManualDatabase) {
            return sentencesReplaced.map(replacement => {
                return replacement[1];
            }).join(". ");
        }

        // 6. if the input is paragraph, and few sentences is not in sentence-database, just go to google API
        if (isParagraph && !allTheSentencesIsInManualDatabase) {
            // translate from google api 
            const googleTranslated = await Translator.fromGoogleAPI(refinedInput);

            console.log("googleTranslated?", googleTranslated);

            // if the word replacement layer
            if (options.wordReplacementLayer) {
                // call second layer (word replacer layer)
                const parsedResult = await Translator.parseResult(googleTranslated);

                console.log("parsedResult?", parsedResult);

                return parsedResult;
            }

            return googleTranslated;
        }

        return input;
    }

}

export default Translator;