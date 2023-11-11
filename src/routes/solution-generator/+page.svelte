<script lang="ts">
	import BasicFeedbackBlock from '$lib/components/BasicFeedbackBlock.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import DownloadButton from '$lib/components/DownloadButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { debounce } from 'lodash-es';
	import { fly } from 'svelte/transition';
	import { tippy } from 'svelte-tippy';
	import UploadButton from '$lib/components/UploadButton.svelte';

	let textareaHeight = 200;

	let input = '';
	let output = ``;
	let responseOutput = '';
	let loading = false;
	let refId: string | null = null;
	let isFileBeingImported = false;
	let loadingStatus = '';

	function autoResize(event?: Event, target?: HTMLTextAreaElement) {
		const t = target || (event?.target as HTMLTextAreaElement);

		if (t.value === '') {
			t.style.height = `100px`;
		} else {
			t.style.height = `${t.scrollHeight}px`;
		}
	}

	async function generateSolution() {
		if (input.trim() === '') {
			responseOutput = '';
			return;
		}
		if (loading) return;
		responseOutput = '';
		loading = true;

		console.log('solving...');
		const response = await trpc().generateSolution.query({
			text: input
		});

		console.log('response?', response);

		loading = false;
		if (response.data === null || response.error) {
			responseOutput = response.message!;
			console.error(response.message);
			return;
		}

		responseOutput = response.data;
		refId = response.refId || null;
	}

	$: output = loading === true ? 'Solving...' : responseOutput;
</script>

<div class="w-full min-h-full flex flex-col gap-6">
	<div class="container">
		<div class="text-muted-foreground font-semibold">
			Enter question in English and get Solution in Gujarati...
		</div>
		<div class="my-7" />
		<!-- translator wrapper -->

		<div class="flex flex-col gap-4 items-stretch">
			<!-- question -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>Question</Label>
				<div class="relative">
					{#if isFileBeingImported}
						<div
							class="absolute top-0 left-0 w-full h-full flex justify-center items-center backdrop-blur-sm z-[3] cursor-wait"
						>
							<Icon icon="eos-icons:bubble-loading" class="text-3xl" />
						</div>
					{/if}
					<Textarea
						on:keydown={(e) => {
							if (e.keyCode === 13) {
								e.preventDefault();
								generateSolution();
							}
						}}
						on:input={autoResize}
						style="height: {textareaHeight}px;"
						class="min-h-[200px] border-black dark:border-white text-xl resize-none"
						bind:value={input}
						placeholder="Enter a question..."
					/>

					<div class="absolute bottom-0.5 right-1 flex gap-1">
						<UploadButton bind:input bind:isFileBeingImported bind:loadingStatus />
						<CopyButton bind:input />
					</div>
				</div>
			</div>

			<div class="w-full flex items-center justify-center">
				<Button on:click={generateSolution} size="sm" class="rounded-full">Generate Solution</Button
				>
			</div>

			<!-- solution -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>Solution</Label>
				<div class="relative">
					<Textarea
						on:input={autoResize}
						bind:value={output}
						readonly
						style="height: {textareaHeight}px; color: #000;"
						class="min-h-[200px] border-black text-xl bg-gray-100 dark:bg-transparent dark:border-white dark:!text-white resize-none"
					/>
					<div class="absolute bottom-0.5 right-1 flex gap-1">
						<DownloadButton bind:text={output} />
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
