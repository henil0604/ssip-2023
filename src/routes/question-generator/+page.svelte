<script lang="ts">
	import CopyButton from '$lib/components/CopyButton.svelte';
	import DownloadButton from '$lib/components/DownloadButton.svelte';
	import type Editor from '$lib/components/Editor.svelte';
	import EditorBlockWrapper from '$lib/components/EditorBlockWrapper.svelte';
	import TextToSpeechButton from '$lib/components/TextToSpeechButton.svelte';
	import UploadButton from '$lib/components/UploadButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import { toasts } from 'svelte-toasts';
	import { extractTextFromPdfFile } from '$lib/modules/extractTextFromPdfFile';
	import {
		LanguageMap,
		QuestionGeneratorDifficultyLevels,
		QuestionGeneratorFormats
	} from '$lib/const';
	import { redirectToTranslate } from '$lib/modules/redirectToTranslate';
	import { trpc } from '$lib/trpc/client';
	import * as Accordion from '$lib/components/ui/accordion';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { fly, scale } from 'svelte/transition';
	import { Input } from '$lib/components/ui/input';
	import tippy from 'tippy.js';

	let DEFAULT_QUESTION_GENERATOR_HEIGHT = 300;
	let input = writable('');
	let file = writable<File | null>(null);
	let output = writable('');
	let customPrompt = '';
	let editorRefs = writable<{
		input: Editor | null;
		output: Editor | null;
	}>({
		input: null,
		output: null
	});
	let editorHeights = writable({
		input: 400,
		output: 400
	});
	let options = writable<{
		difficultyLevel: (typeof QuestionGeneratorDifficultyLevels)[number];
		formats: (typeof QuestionGeneratorFormats)[number][];
	}>({
		difficultyLevel: 'Medium',
		formats: []
	});
	let markingSystem = writable<{
		[key: string]: {
			markPerQuestion: number;
			numberOfQuestions: number;
		};
	}>({});

	let generating = false;
	let readingFile = false;
	let fileProcessingStatus = 'Running';
	let resizerInterval: NodeJS.Timeout;
	let showFeedback = false;

	$: isTranslateButtonDisabled = $output.trim() === '' ? true : false;

	async function handleFile(file: File) {
		readingFile = true;
		const ocrResponse = await extractTextFromPdfFile(file, 'en', ({ code, index }) => {
			if (!index) {
				switch (code) {
					case 'CHECKING_FILE':
						fileProcessingStatus = 'Checking file';
						break;
					case 'READING_PDF':
						fileProcessingStatus = 'Reading PDF';
						break;
					case 'LOADING_PDF':
						fileProcessingStatus = 'Loading PDF';
						break;
					case 'TRANSFORMING_PDF':
						fileProcessingStatus = 'Transforming PDF';
						break;

					default:
						break;
				}
			}

			if (index) {
				switch (code) {
					case 'TRANSFORMING_PDF':
						fileProcessingStatus = `Transforming PDF (Page ${index})`;
						break;
					case 'CHECKING_FILE':
					case 'CREATING_WORKER':
					case 'INITIALIZING_WORKER':
					case 'GETTING_WORKER':
					case 'RECOGNIZING':
					case 'PARSING':
						fileProcessingStatus = `Recognizing (Page ${index})`;
						break;

					default:
						break;
				}
			}
		});

		console.log('ocrResponse?', ocrResponse);

		if (ocrResponse.code === 'UNSUPPORTED_FILE') {
			toasts.add({
				title: 'Oops!',
				description: 'Unsupported File',
				duration: 3000,
				type: 'error',
				theme: 'light'
			});
			readingFile = false;
			return;
		}

		if (ocrResponse.code === 'DONE') {
			fileProcessingStatus = 'Parsing...';
			let text = '';
			for (let i = 0; i < ocrResponse.data.length; i++) {
				let pageText = ocrResponse.data[i];
				pageText = pageText
					.replaceAll('\n\n', '[|[[ENTER]]|]')
					.replaceAll('\n', ' ')
					.replaceAll('[|[[ENTER]]|]', '\n\n');
				text += `[PAGE ${i + 1}]\n${pageText}\n\n`;
			}
			text = text.trimEnd();

			$input = text;
		}

		readingFile = false;
	}

	function getFile() {
		var inputElement = document.createElement('input');
		inputElement.type = 'file';
		inputElement.style.display = 'none';
		inputElement.style.position = 'absolute';
		inputElement.style.top = '0';
		inputElement.style.left = '0';
		document.body.appendChild(inputElement);
		inputElement.addEventListener('change', (e) => {
			$file = inputElement.files![0];
			inputElement.remove();
		});
		inputElement.click();
	}

	$: if ($file) {
		handleFile($file);
	}

	onMount(() => {
		resizerInterval = setInterval(() => {
			$editorRefs.input?.resize();
			$editorRefs.output?.resize();
		}, 100);
	});

	onDestroy(() => {
		if (resizerInterval) {
			clearInterval(resizerInterval);
		}
	});

	$: console.log($file);
</script>

<div class="min-w-fit min-h-fit flex flex-col py-6 px-32">
	<!-- options -->
	<div class="p-4 py-2 px-0 rounded grid grid-cols-2">
		<div class="flex flex-col justify-start items-start gap-2">
			<h1 class="font-semibold">Question Format</h1>
			<div class="flex gap-0 border border-gray-400 rounded overflow-hidden">
				{#each QuestionGeneratorFormats as format}
					{@const isActive = $options.formats.includes(format)}
					<Button
						data-format={format}
						variant="ghost"
						class="w-fit border-x h-fit rounded-none text-base flex-grow py-2 {isActive
							? 'bg-theme-600 text-white hover:bg-theme-600 hover:text-white dark:bg-background dark:border-none border-x-transparent'
							: 'bg-white hover:bg-white dark:border-none dark:hover:bg-zinc-600'}"
						on:click={() => {
							if (isActive) {
								$options.formats = $options.formats.filter((e) => {
									return e !== format;
								});
								delete $markingSystem[format];
								return;
							}
							$options.formats = [...$options.formats.values(), format];
							$markingSystem = {
								...$markingSystem,
								[format]: {
									markPerQuestion: 0,
									numberOfQuestions: 0
								}
							};
						}}
						size="sm">{format}</Button
					>
				{/each}
			</div>
		</div>
		<!-- translation mode -->
		<div class="w-full flex flex-col items-end gap-2">
			<div class="w-fit flex flex-col gap-2">
				<h1 class="font-semibold">Difficulty Mode</h1>
				<div class="flex gap-0 border border-gray-400 rounded overflow-hidden">
					{#each QuestionGeneratorDifficultyLevels as level}
						<Button
							variant="ghost"
							class="w-[90px] border-x h-fit rounded-none text-base flex-grow py-2 {$options.difficultyLevel ===
							level
								? 'bg-theme-600 text-white hover:bg-theme-600 hover:text-white dark:bg-background dark:border-none border-x-transparent'
								: 'bg-white hover:bg-white dark:border-none dark:hover:bg-zinc-600'}"
							on:click={() => ($options.difficultyLevel = level)}
							size="sm">{level}</Button
						>
					{/each}
				</div>
			</div>
		</div>
	</div>

	{#if $options.formats.length > 0}
		<div class="flex flex-col w-full h-fit border border-gray-400 rounded p-2 px-4">
			<Accordion.Root>
				{#each $options.formats as format, index}
					<Accordion.Item value={format} data-state="open">
						<Accordion.Trigger>
							<div class="">
								<span class="font-semibold">Section {index + 1}: </span>
								<span>{format}</span>
							</div>
						</Accordion.Trigger>
						<Accordion.Content>
							<div class="flex justify-between w-full gap-5 text-base">
								<div class="flex items-center gap-5">
									<div class="min-w-fit">No. of Questions:</div>
									<Input
										type="number"
										bind:value={$markingSystem[format].numberOfQuestions}
										class="max-w-[100px] text-base"
									/>
								</div>
								<div class="flex items-center gap-5">
									<div class="min-w-fit">Mark per question:</div>
									<Input
										type="number"
										bind:value={$markingSystem[format].markPerQuestion}
										class="max-w-[100px] text-base"
									/>
								</div>
								<div class="flex items-center gap-5">
									<div class="min-w-fit">Total Marks:</div>
									<Input
										disabled
										type="number"
										value={$markingSystem[format].markPerQuestion *
											$markingSystem[format].numberOfQuestions}
										class="max-w-[100px] text-base"
									/>
								</div>
							</div>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</div>

		<div class="mt-4" />
	{/if}

	<div class="mt-2" />

	<div class="min-w-full">
		<EditorBlockWrapper bind:value={customPrompt} defaultHeight={60} readonly={false}>
			<div slot="placeholder">
				<h1 class="text-xl">Enter custom prompt to make questions more personalized...</h1>
			</div>
		</EditorBlockWrapper>
	</div>

	<div class="mt-3" />

	<div class="w-full grid grid-cols-2 gap-7">
		<!-- left -->
		<div class="grow flex flex-col max-h-fit">
			<div class="relative">
				{#if readingFile === true}
					<div class="absolute top-0 left-0 w-full h-full bg-white opacity-50 z-[99]" />
					<div
						class="z-[100] absolute flex justify-center items-center flex-col top-0 w-full h-full left-0"
					>
						<Icon icon="svg-spinners:blocks-wave" class="text-theme-600" width={100} />
						<h1 class="text-2xl">{fileProcessingStatus}</h1>
					</div>
				{/if}

				<!-- top -->
				<EditorBlockWrapper
					bind:defaultHeight={DEFAULT_QUESTION_GENERATOR_HEIGHT}
					bind:height={$editorHeights.input}
					readonly={false}
					bind:editor={$editorRefs.input}
					bind:value={$input}
				>
					<div slot="placeholder">
						<h1 class="text-xl">Enter a paragraph...</h1>
					</div>
					<svelte:fragment slot="footerLeft">
						<TextToSpeechButton bind:input={$input} />
						<CopyButton bind:input={$input} />
						<div use:tippy={{ content: 'Upload PDF', placement: 'bottom' }}>
							<Button
								class="w-fit font-semibold flex justify-center items-center gap-2 hover:opacity-100 transition-all"
								on:click={() => {
									getFile();
								}}
							>
								Upload PDF
							</Button>
						</div>
					</svelte:fragment>
					<svelte:fragment slot="footerRight">
						<Button
							bind:disabled={generating}
							class="gap-2 font-semibold transition-all {generating ? 'rounded-full p-3' : ''}"
						>
							{#if !generating}
								Generate <Icon class="text-lg" icon="iconoir:sparks" />
							{:else}
								<Icon icon="svg-spinners:270-ring-with-bg" class="text-lg" />
							{/if}
						</Button>
					</svelte:fragment>
				</EditorBlockWrapper>
			</div>
		</div>

		<!-- right -->
		<div class="grow flex flex-col gap-5 max-h-fit">
			<!--  -->
			<EditorBlockWrapper
				bind:defaultHeight={DEFAULT_QUESTION_GENERATOR_HEIGHT}
				bind:height={$editorHeights.output}
				allowEditButton={true}
				readonly={true}
				bind:editor={$editorRefs.output}
				bind:value={$output}
			>
				<svelte:fragment slot="footerLeft">
					<TextToSpeechButton bind:input={$output} />
					<CopyButton bind:input={$output} />
					<DownloadButton bind:text={$output} />
				</svelte:fragment>
				<svelte:fragment slot="footerRight">
					<Button
						bind:disabled={isTranslateButtonDisabled}
						class="gap-2 font-semibold transition-all [&>.icon]:hover:animate-[back-and-forth-from-left-to-right_0.5s_ease-in-out_infinite]"
					>
						Translate <Icon class="text-lg icon" icon="gg:arrow-right" />
					</Button>
				</svelte:fragment>
			</EditorBlockWrapper>

			{#if showFeedback}
				<div class="w-full flex justify-end">
					<div
						class="shadow-xl rounded-full border border-black dark:border-white px-5 py-1 flex gap-2 min-w-fit items-center"
						in:fly={{ y: 50 }}
						out:fly={{ y: 50 }}
					>
						<div class="min-w-fit">Is this result accurate?</div>
						<div class="grid grid-cols-2 w-full my-2">
							<Button
								variant="outline"
								class="text-green-800 border-green-800 gap-2 hover:bg-green-100 rounded-none rounded-tl-full rounded-bl-full border-r-black dark:border-r-gray-700 dark:hover:bg-green-700"
								on:click={() => {
									showFeedback = false;
								}}
							>
								<Icon icon="octicon:thumbsup-16" />
							</Button>
							<Button
								variant="outline"
								on:click={() => {
									showFeedback = false;
								}}
								class="text-red-800 border-red-800 gap-2 hover:bg-red-100 rounded-none rounded-tr-full rounded-br-full border-l-0 dark:hover:bg-red-700"
							>
								<Icon icon="octicon:thumbsdown-16" />
							</Button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	@keyframes back-and-forth-from-left-to-right {
		0%,
		100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(0.5rem); /* Adjust the distance as needed */
		}
	}
</style>
