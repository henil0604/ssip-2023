import translate from '@iamtraction/google-translate';

class Translator {
    public static ManualDataSet: {
        [key: string]: string
    } | null = null
    public static ReplacerDataSet: {
        [key: string]: string
    } | null = null

    private constructor() { }

    public static async loadManualDataSet(force: boolean = false) {
        if (Translator.ManualDataSet === null || force) {
            Translator.ManualDataSet = (await import("$lib/server/sentence-dataset.json")).default;
        }
    }

    public static async loadReplacerDataset(force: boolean = false) {
        if (Translator.ReplacerDataSet === null || force) {
            Translator.ReplacerDataSet = (await import("$lib/server/replacer-dataset.json")).default;
        }
    }

    public static async fromManualDataSet(input: string) {
        await Translator.loadManualDataSet();
        if (Translator.ManualDataSet === null) return null;

        return Translator.ManualDataSet[input] || null;
    }

    public static async fromGoogleAPI(input: string) {
        return (await translate(input, {
            to: 'gu'
        })).text
    }

    public static sentenceGeneratorFromParagraph(input: string) {
        return input.split(/(?<=[.!?])\s+/);
    }

    public static isParagraph(input: string) {
        const sentences = Translator.sentenceGeneratorFromParagraph(input);
        console.log("sentences?", sentences)

        return sentences.length > 1 ? true : false;
    }

    public static async parseResult(text: string) {
        await Translator.loadReplacerDataset();
        if (Translator.ReplacerDataSet === null) return text;

        const tokens = text.split(" ");

        const newTokens = tokens.map(e => {
            if (Translator.ReplacerDataSet![e]) {
                return Translator.ReplacerDataSet![e];
            }
            return e;
        })

        return newTokens.join(' ');
    }

    public static simplifyText(text: string) {
        text = text.toLocaleLowerCase().trim();
        return text[text.length - 1] === '.' ? text.slice(0, text.length - 1) : text;
    }

    public static async translate(input: string, options?: {
        wordReplacementLayer: boolean,
        sentenceReplacementLayer: boolean
    }) {
        options = {
            wordReplacementLayer: true,
            sentenceReplacementLayer: true,
            ...(options || {}),
        }

        console.log('--------------------');
        console.log("input?", input);
        // 1. Load the model
        await Translator.loadManualDataSet()
        const originalInput = input;

        // 2. convert input to lowercase (fine tune)
        let refinedInput = input.toLocaleLowerCase();
        console.log("refinedInput?", refinedInput);

        // 3. check if input is paragraph or not
        const isParagraph = Translator.isParagraph(refinedInput);

        console.log("isParagraph?", isParagraph);

        // 4. if the input is not paragraph that means input is sentence, check if the sentence exists in sentence-database, if yes just return it
        if (!isParagraph) {

            const endWithDot = refinedInput[refinedInput.length - 1] === ".";

            if (options.sentenceReplacementLayer) {
                const manualTranslation = await Translator.fromManualDataSet(Translator.simplifyText(refinedInput));

                console.log("manualTranslation?", manualTranslation);
                if (manualTranslation) {
                    return manualTranslation + (endWithDot ? '.' : '');
                }
            }

            // if not found in manual translation, translate it from google API
            const googleTranslated = await Translator.fromGoogleAPI(refinedInput);

            console.log("googleTranslated?", googleTranslated);

            if (options.wordReplacementLayer) {
                const parsedResult = await Translator.parseResult(googleTranslated);

                console.log("parsedResult?", parsedResult);

                return parsedResult + (endWithDot ? '.' : '');
            } else {
                return googleTranslated + (endWithDot ? '.' : '');
            }

        }

        const sentences = Translator.sentenceGeneratorFromParagraph(refinedInput);

        const sentencesReplaced = await Promise.all(sentences.map(async sentence => {
            sentence = Translator.simplifyText(sentence);
            return [sentence, await Translator.fromManualDataSet(sentence)];
        }))

        let allTheSentencesIsInManualDatabase = false;

        for (const replacement of sentencesReplaced) {
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
            const googleTranslated = await Translator.fromGoogleAPI(refinedInput);

            console.log("googleTranslated?", googleTranslated);

            if (options.wordReplacementLayer) {
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