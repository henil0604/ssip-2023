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
        await Translator.loadManualDataSet(true);
        if (Translator.ManualDataSet === null) return null;

        return Translator.ManualDataSet[input] || null;
    }

    public static async fromGoogleAPI(input: string) {
        return (await translate(input, {
            to: 'gu'
        })).text
    }

    public static async parseGoogleTranslation(text: string) {
        await Translator.loadReplacerDataset(true);
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

    public static async translate(input: string) {
        await Translator.loadManualDataSet()
        input = input.toLocaleLowerCase();

        const manualTranslation = await Translator.fromManualDataSet(input);

        console.log("manualTranslation?", manualTranslation);

        if (manualTranslation !== null) {
            return manualTranslation;
        }

        const googleTranslation = await Translator.fromGoogleAPI(input);
        console.log("googleTranslation?", googleTranslation);

        const parsedTranslation = await Translator.parseGoogleTranslation(googleTranslation);
        console.log("parsedTranslation?", parsedTranslation);

        return parsedTranslation;
    }

}

export default Translator;