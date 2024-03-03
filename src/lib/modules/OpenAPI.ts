/**
 * this module is responsible for handling all methods related to OpenAI API
 */

// import OpenAI API key and Organization Id
import { OPEN_AI_API_KEY, OPEN_AI_ORGANIZATION_ID } from "$env/static/private";
import 'openai/shims/node'
// import OpenAI SDK
import OpenAI from "openai";
import type { QuestionGeneratorDifficultyLevels, QuestionGeneratorFormats } from "$lib/const";

class OpenAPI {

    // initiate OpenAI instance
    public static ai = new OpenAI({
        organization: OPEN_AI_ORGANIZATION_ID,
        apiKey: OPEN_AI_API_KEY
    })

    private constructor() { }

    /**
     * summarizes the given text
     */
    public static async Summarize(text: string): Promise<string | null> {
        if (text.trim() === '') return null;

        const response = await OpenAPI.ai.completions.create({
            model: 'text-davinci-003',
            prompt: `Summarize text plainly, without altering details or tone. text: ${text}\nSummary:`,
            temperature: 1,
            top_p: 1,
            max_tokens: 1024,
            best_of: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        })

        return response.choices[0].text;
    }

    /**
     * generates bulletins from input text
     */
    public static async Bulletins(text: string): Promise<string | null> {
        if (text.trim() === '') return null;

        const response = await OpenAPI.ai.completions.create({
            model: 'text-davinci-003',
            prompt: `Transform the text into bullet points without altering content, tone, or omitting/adding details. start with "•". \nText: ${text}\nAnswer:`,
            temperature: 1,
            top_p: 1,
            max_tokens: 2048,
            best_of: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        })

        return response.choices[0].text;
    }

    /*
        generates questions from given input
    */
    public static async GenerateQuestions(text: string, level: (typeof QuestionGeneratorDifficultyLevels)[number] = 'Medium', format: (typeof QuestionGeneratorFormats)[number] = 'Short Questions', customPrompt?: string) {
        if (text.trim() === '') return null;

        const response = await OpenAPI.ai.chat.completions.create({
            model: 'gpt-3.5-turbo-1106',
            messages: [
                {
                    role: 'system',
                    content: `From now on you will ONLY Generate questions from the paragraph without redundancy or duplication. Make sure to have index of each question. You will NOT act as assistance in any case. ${customPrompt ? `\nInstructions:${customPrompt}` : ''}\nDifficulty Level: ${level}\nQuestion Format:${format}`
                },
                {
                    role: 'user',
                    content: `${text}`
                }
            ],
            temperature: 1,
            top_p: 1,
            max_tokens: 4096,
            frequency_penalty: 0,
            presence_penalty: 0
        })

        return response.choices[0].message.content;
    }

}

export default OpenAPI;