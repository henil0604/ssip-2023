<script lang="ts">
	import BasicFeedbackBlock from '$lib/components/BasicFeedbackBlock.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';

	import { Textarea } from '$lib/components/ui/textarea';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { debounce } from 'lodash-es';
	import { fly } from 'svelte/transition';

	let textareaHeight = 200;

	let input = '';
	let output = '';
	let responseOutput = '';
	let loading = false;
	let refId: string | null = null;

	function autoResize(event?: Event, target?: HTMLTextAreaElement) {
		const t = target || (event?.target as HTMLTextAreaElement);

		if (t.value === '') {
			t.style.height = `100px`;
		} else {
			t.style.height = `${t.scrollHeight}px`;
		}
	}

	async function generateQuestion() {
		if (input.trim() === '') {
			responseOutput = '';
			return;
		}
		if (loading) return;
		responseOutput = '';
		loading = true;

		console.log('generating...');
		const response = await trpc().generateQuestions.query({
			text: input
		});

		console.log('response?', response);

		loading = false;
		if (response.data === null || response.error) {
			console.error(response.message);
			return;
		}

		responseOutput = response.data;
		refId = response.refId || null;
	}

	$: output = loading === true ? 'Generating...' : responseOutput;

	const deboundedGenerateQuestion = debounce(generateQuestion, 1000);
</script>

<div class="w-full min-h-full flex flex-col gap-6">
	<div class="container">
		<div class="text-muted-foreground font-semibold">
			Enter any text in English and get questions extracted in Gujarati...
		</div>
		<div class="my-7" />
		<!-- translator wrapper -->

		<div class="flex flex-col gap-4 items-stretch">
			<!-- text -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>Text</Label>
				<div class="relative">
					<Textarea
						on:keydown={(e) => {
							if (e.keyCode === 13) {
								e.preventDefault();
								generateQuestion();
							}
						}}
						on:input={autoResize}
						style="height: {textareaHeight}px;"
						class="min-h-[200px] border-black dark:border-white text-xl resize-none"
						placeholder="Enter text..."
						bind:value={input}
					/>

					<div class="absolute bottom-2 right-1">
						<CopyButton bind:input />
					</div>
				</div>
			</div>

			<div class="w-full flex items-center justify-center">
				<Button on:click={generateQuestion} size="sm" class="rounded-full"
					>Generate Questions</Button
				>
			</div>

			<!-- solution -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>Extracted questions</Label>
				<div class="relative">
					<Textarea
						on:input={autoResize}
						bind:value={output}
						readonly
						style="height: {textareaHeight}px; color: #000;"
						class="min-h-[200px] border-black text-xl bg-gray-100 dark:bg-transparent dark:border-white dark:!text-white resize-none"
					/>
					<div class="absolute bottom-2 right-1">
						<CopyButton bind:input={output} />
					</div>
				</div>
			</div>

			<!-- feedback -->
			{#if responseOutput && !loading && refId}
				<div class="w-full flex justify-end" in:fly={{ y: 40 }}>
					<BasicFeedbackBlock {refId} />
				</div>
			{/if}
		</div>
	</div>
</div>
