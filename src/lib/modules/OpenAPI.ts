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
            model: 'gpt-3.5-turbo-instruct',
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
            model: 'gpt-3.5-turbo-instruct',
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
    public static async GenerateQuestions(
        text: string,
        level: (typeof QuestionGeneratorDifficultyLevels)[number] = 'Medium',
        format: (typeof QuestionGeneratorFormats[number][]) = ['Short Questions', 'True/False'],
        markingSystem: {
            section: typeof QuestionGeneratorFormats[number],
            markPerQuestion: number,
            numberOfQuestions: number
        }[],
        customPrompt?: string) {
        if (text.trim() === '') return null;

        const INSTRUCTIONS = `You are a question generator for question paper. You will generate question paper as a teacher would set a question paper. User can give you "format" for how to generate questions. You will follow that format and maintain the order and sequence of questions. You will not try to go beyond the given format by user. You will specify total marks of each section at the start of it (in the heading of section). You will not try to specify any other things except those which are given in format by user. You will specify When a page should start with the following pattern: [PAGE 1], [PAGE 2], etc..`;
        const PROMPT = `Format:
${format.map((element, index) => {
            const markingData = markingSystem.find(e => e.section === element);
            if (!markingData) return null;

            return `- Type of questions (Section name): ${element}
\t- This section contains ${markingData.numberOfQuestions} each with ${markingData.markPerQuestion} marks`
        }).filter(e => e !== null).join('\n')}


Input:
${text}
`

        const response = await OpenAPI.ai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: INSTRUCTIONS
                },
                {
                    role: 'user',
                    content: PROMPT
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