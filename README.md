# Varnantar ([SSIP 2023](https://ssipgujarat.in/hackathon2023/))

> This project is a solution based prototype for government for providing better translation service for higher education students and their teachers.

Varnantar is a prototype version of a systematic approach to have a affective translator from English to Vernacular languages for Higher education students and their teachers.

## How it works?

Traditional translation services like, [Google Translator](https://translator.google.com) and [DeepL](https://deepl.com) use [Natural Language Processing](https://en.wikipedia.org/wiki/Natural_language_processing) to translate a sentence into target language. However, Varnantar does not use any kind of NLP rather uses a systematic approach towards refining input and output via a preset database. The idea is to have two refiner layers,

1. Pre-replacer refiner layer
It takes the input and replaces the pre-defined technical words using a preset database making it easy for the Google Translator API to translate.
2. Post-replacer refiner layer
It takes the output generated from Google Translator API and refined the technical and formal words to easy to understandable language.

This algorithm has proven to be most effective and eco-friendly approach to solve the problem. It does not require any High power GPUs to train a better Language model than Tech Giants like Google. However, better solutions can be worked upon in-collaboration with Government.

> The system/servers were not tested at scale of millions but guaranteed to be faster if worked on.

## Features

- [x] Translator
- [x] Text to Speech
    - [x] Multi Language Support
- [x] Speech Recognition
    - [x] Multi Language Support
- [x] Image Recognition
- [x] PDF text Recognition
- [x] Download translated output
- [x] Question Generator
    - [x] Custom Generator Instructions
- [x] AskBot (GPT in Selected Language)
- [x] Custom Replacer Database
- [x] Auto Summarize
- [x] Auto Bulletins
- [x] Domain specific translation (Proof of concept)

## Technologies

This project was made with [SvelteKit](https://kit.svelte.dev) with the help of [ShadcnSvelte](https://shadcn-svelte.com) as a Design System. The backend consists of a [tRPC](https://trpc.io) to communicate with the client providing better type safety across the system. Here are the technologies listed that were used in this Project:

- Framework: [SvelteKit](https://kit.svelte.dev)
- Design System: [Shadcn Svelte](https://shadcn-svelte.com)
- Client-Server Communication: [tRPC](https://trpc.io)
- Database: MongoDb


## How to setup Project?

### Prerequisites
- The project was built on NodeJs `v20.8.1`, however it was not tested on older versions. But using transpilers and loaders, older version support can be achieved easily.

To setup this project:

1. Clone the repository
```bash
git clone https://github.com/henil0604/ssip-2023
```
2. Install dependencies
```bash
npm install
```
3. Setup environment variables
- `DATABASE_URL`: MongoDb Database URI string
- `GOOGLE_CLIENT_ID`: Google OAuth Client Id
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `OPEN_AI_API_KEY`: OpenAI API key
- `OPEN_AI_ORGANIZATION_ID`: OpenAI Organization Id
4. Run in development
```bash
npm run dev
```

## Team Members

- **Jainil Vyas**:
    - **Role**: Project Lead
    - **Email**: jainilvyas320@gmail.com


- **Henil Malaviya**:
    - **Role**: Tech Lead & System Architecture
    - **Email**: [me@henil.xyz](mailto:me@henil.xyz)
    - **Website**: [henil.xyz](https://henil.xyz)

- **Kaushal Kathiriya**:
    - **Role**: Management & Core Idea
    - **Email**: kaushalkathiriya2005@gmail.com

- **Dhruv Talati**:
    - **Role**: Research & Dataset
    - **Email**: dhruvtalati640@gmail.com

- **Kirtan Chauhan**:
    - **Role**: Research & Dataset
    - **Email**: kirtan.chauhan905@gmail.com
