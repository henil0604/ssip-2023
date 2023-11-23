<script lang="ts">
	import CopyButton from '$lib/components/CopyButton.svelte';
	import DownloadButton from '$lib/components/DownloadButton.svelte';
	import type Editor from '$lib/components/Editor.svelte';
	import EditorBlockWrapper from '$lib/components/EditorBlockWrapper.svelte';
	import TextToSpeechButton from '$lib/components/TextToSpeechButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		LanguageMap,
		QuestionGeneratorDifficultyLevels,
		QuestionGeneratorFormats
	} from '$lib/const';
	import { redirectToTranslate } from '$lib/modules/redirectToTranslate';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { fly, scale } from 'svelte/transition';

	let DEFAULT_QUESTION_GENERATOR_HEIGHT = 300;
	let input = writable('');
	let output = writable('');
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
		format: (typeof QuestionGeneratorFormats)[number];
	}>({
		difficultyLevel: 'Medium',
		format: 'Short Questions'
	});
	let generating = false;
	let resizerInterval: NodeJS.Timeout;
	let showFeedback = false;

	$: isTranslateButtonDisabled = $output.trim() === '' ? true : false;

	$: console.log(isTranslateButtonDisabled);

	async function handleGenerate() {
		generating = true;

		const questionsOutput = await trpc().generateQuestions.mutate({
			text: $input,
			difficultyLevel: $options.difficultyLevel,
			format: $options.format
		});

		console.log('questionsOutput?', questionsOutput);
		$output = questionsOutput;

		$editorRefs.output?.resize();
		generating = false;
		showFeedback = true;
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

	function handleTranslate() {
		if ($output.trim() === '') return;

		redirectToTranslate($output, LanguageMap['English'], LanguageMap['Gujarati']);
	}
</script>

<div class="min-w-fit min-h-fit flex flex-col py-6 px-32">
	<!-- options -->
	<div class="p-4 px-0 rounded grid grid-cols-2">
		<div class="flex flex-col justify-start items-start gap-2">
			<h1 class="font-semibold">Question Format</h1>
			<div class="flex gap-0 border border-gray-400 rounded overflow-hidden">
				{#each QuestionGeneratorFormats as format}
					<Button
						variant="ghost"
						class="w-fit border-x h-fit rounded-none text-base flex-grow py-2 {$options.format ===
						format
							? 'bg-theme-600 text-white hover:bg-theme-600 hover:text-white dark:bg-background dark:border-none border-x-transparent'
							: 'bg-white hover:bg-white dark:border-none dark:hover:bg-zinc-600'}"
						on:click={() => ($options.format = format)}
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

	<div class="mt-3" />

	<div class="w-full grid grid-cols-2 gap-7">
		<!-- left -->
		<div class="grow flex flex-col max-h-fit">
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
				</svelte:fragment>
				<svelte:fragment slot="footerRight">
					<Button
						on:click={handleGenerate}
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
						on:click={handleTranslate}
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
