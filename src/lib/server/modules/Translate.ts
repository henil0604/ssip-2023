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

        console.log('--------------------------');
        console.log(`input: ${input}`)
        let hasDotAtEnd = input[input.length - 1] === "." ? true : false;

        if (hasDotAtEnd) {
            input = input.trim();
            input = input.slice(0, input.length - 1);
        }

        console.log(`has dot at end: ${hasDotAtEnd}`)
        console.log(`refined input: ${input}`)

        const manualTranslation = await Translator.fromManualDataSet(input);

        console.log("manualTranslation?", manualTranslation);

        if (manualTranslation !== null) {
            return manualTranslation + (hasDotAtEnd ? "." : '');
        }

        const googleTranslation = await Translator.fromGoogleAPI(input);
        console.log("googleTranslation?", googleTranslation);

        let parsedTranslation = await Translator.parseGoogleTranslation(googleTranslation);
        console.log("parsedTranslation?", parsedTranslation);

        console.log('--------------------------');
        return parsedTranslation + (hasDotAtEnd ? '.' : '');
    }

}

export default Translator;