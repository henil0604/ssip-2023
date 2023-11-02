<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import * as Card from '$lib/components/ui/card';
	import { debounce } from 'lodash-es';
	import { Switch } from '$lib/components/ui/switch';
	import FeedbackBlock from '$lib/components/FeedbackBlock.svelte';
	import { copyTextToClipboard } from '$lib/utils';
	import CopyButton from '$lib/components/CopyButton.svelte';

	// input field binder
	let input = '';
	// output field binder
	let output = '';
	// the response coming from RPC call
	let responseOutput = '';
	// if the translation function is on-going
	let loading = false;
	// history block reference id
	let refId: string | null = null;

	// options binder
	let options = {
		autoSummarize: false,
		pureGujarati: false,
		autoBulletins: false
	};

	// textarea height binder
	let textareaHeight = 100;

	/**
	 * this function is called when on:input method is called in textarea
	 */
	function autoResize(event: Event) {
		// extract the target element
		const target = event.target as HTMLTextAreaElement;

		// if the value is null, go to default
		if (target.value === '') {
			textareaHeight = 100;
		} else {
			// find exact minimum height of textarea
			textareaHeight = target.scrollHeight;
		}
	}

	/**
	 * The function is responsible for handling RPC
	 */
	async function translate() {
		// if the input is empty, responseOutput is set to empty string
		if (input.trim() === '') {
			responseOutput = '';
			return;
		}
		// if already loading, don't do anything
		if (loading) return;

		responseOutput = '';

		// set loading to true
		loading = true;

		// RPC
		const response = await trpc().translate.query({
			text: input,
			autoSummarize: options.autoSummarize,
			pureGujarati: options.pureGujarati,
			autoBulletins: options.autoBulletins
		});

		loading = false;

		// if the response has error as `true` or the data is null
		if (response.data === null || response.error) {
			// console the error
			console.error(response.message);
			// return immediately from function
			return;
		}

		responseOutput = response.data;
		refId = response.refId || null;
	}

	// this debounce is responsible for managing all the on:input events in input textarea
	const deboundedTranslate = debounce(translate, 1000 /* 1 second */);

	// observing loading and responseOutput
	$: output = loading === true ? 'Translating...' : responseOutput;
</script>

<div class="w-full min-h-full flex flex-col items-center gap-6">
	<div class="container py-10">
		<!-- translator wrapper -->

		<div class="flex max-md:flex-col gap-7 items-stretch">
			<!-- english -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>English</Label>
				<div class="relative">
					<Textarea
						on:input={autoResize}
						on:keydown={(e) => {
							if (e.keyCode === 13) {
								e.preventDefault();
								translate();
							}
						}}
						on:input={() => deboundedTranslate()}
						bind:value={input}
						style="height: {textareaHeight}px;"
						class="min-h-[200px] border-black dark:border-white text-xl resize-none"
						placeholder="Start typing..."
					/>

					<div class="absolute bottom-2 right-1">
						<CopyButton bind:input />
					</div>
				</div>
				<div class="my-2" />
				<!-- options card -->
				<Card.Root class="border-black dark:border-white p-0">
					<Card.Content class="py-5">
						<!-- auto bulletins -->
						<div
							class="flex max-md:flex-col justify-between w-full gap-1 bg-gray-100 dark:bg-zinc-700 px-1 py-1 rounded-md"
						>
							<Button
								variant="outline"
								class="flex-grow border-gray-800 {options.pureGujarati === false
									? 'bg-gray-900 text-white hover:bg-gray-900 hover:text-white dark:bg-background dark:border-none'
									: 'bg-transparent text-muted-foreground hover:bg-white dark:border-none dark:hover:bg-zinc-600'}"
								on:click={() => (options.pureGujarati = false)}
								size="sm">Educational Translation</Button
							>
							<Button
								variant="outline"
								class="flex-grow border-gray-800 {options.pureGujarati === true
									? 'bg-gray-900 text-white hover:bg-gray-900 hover:text-white dark:bg-background dark:border-none'
									: 'bg-transparent text-muted-foreground hover:bg-white dark:border-none dark:hover:bg-zinc-600'}"
								on:click={() => (options.pureGujarati = true)}
								size="sm">Pure Gujarati Translation</Button
							>
						</div>
						<hr class="my-3" />

						<!-- auto summarize -->
						<div class="flex justify-between items-center">
							<div class="flex flex-col flex-grow gap-0.5">
								<h1>Auto Summarize</h1>
								<p class="text-muted-foreground text-sm font-medium">
									Tries to present given text in summarized format
								</p>
							</div>
							<Switch bind:checked={options.autoSummarize} />
						</div>
						<hr class="my-3" />

						<!-- auto bulletins -->
						<div class="flex justify-between items-center">
							<div class="flex flex-col flex-grow gap-0.5">
								<h1>Auto Bulletins</h1>
								<p class="text-muted-foreground text-sm font-medium">
									Tries to present given text in bulletin format
								</p>
							</div>
							<Switch bind:checked={options.autoBulletins} />
						</div>

						<hr class="my-3" />
					</Card.Content>
				</Card.Root>
			</div>

			<!-- gujarati -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>Gujarati</Label>
				<div class="relative">
					<Textarea
						on:input={autoResize}
						readonly
						bind:value={output}
						style="height: {textareaHeight}px; color: #000;"
						class="min-h-[200px] border-black text-xl bg-gray-100 dark:bg-transparent dark:border-white dark:!text-white resize-none"
					/>
					<div class="absolute bottom-2 right-1">
						<CopyButton bind:input={output} />
					</div>
				</div>
				<div class="my-2" />
				{#if responseOutput && !loading && refId}
					<FeedbackBlock {refId} />
				{/if}
			</div>
		</div>
	</div>
</div>
