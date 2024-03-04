<script lang="ts">
	import { fly } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { trpc } from '$lib/trpc/client';
	import { Input } from './ui/input';

	export let refId: string;

	let show = true;

	type Answer = 'positive' | 'negative' | null;

	let answer: Answer = null;

	// binders
	let isTranslationError = false;
	let isGrammarError = false;
	let isSpellingError = false;
	let hasNegativeReviewSubmitted = false;
	let otherSuggestionsInput = '';

	// responsible for setting answer
	function setAnswer(value: Answer) {
		answer = value;
		// if the value is 'positive', call the hide function
		if (answer === 'positive') {
			hide();
		}
	}

	// responsible for hiding the block after a delay
	function hide() {
		setTimeout(() => {
			show = false;
		}, 700);
	}

	// responsible for doing RPC for feedback
	async function handleSubmit() {
		console.log(`refId: ${refId}`);

		// RPC
		const response = await trpc().submitFeedback.query({
			refId,
			isPositive: answer === 'positive',
			isGrammarError,
			isSpellingError,
			isTranslationError,
			otherSuggestions: otherSuggestionsInput
		});

		// debugging response
		console.log('response?', response);

		hasNegativeReviewSubmitted = true;
		hide();
	}

	$: if (refId) {
		show = true;
		answer = null;
		isTranslationError = false;
		isGrammarError = false;
		isSpellingError = false;
		hasNegativeReviewSubmitted = false;
	}
</script>

{#if show && refId}
	<div in:fly={{ y: 50 }} out:fly={{ y: 50 }} data-ref-id={refId}>
		<Card.Root
			class="py-0 border-black {answer && answer === 'positive'
				? 'bg-green-100'
				: hasNegativeReviewSubmitted && answer === 'negative'
				? 'bg-gray-100'
				: ''}"
		>
			<Card.Content class="py-3">
				{#if !answer}
					<div class="flex justify-between items-center">
						<h1 class="font-semibold">What do you think about this result?</h1>
						<div class="grid grid-cols-2 w-fit my-2">
							<Button
								variant="outline"
								class="px-7 text-green-800 border-green-800 gap-2 hover:bg-green-100 rounded-none rounded-tl-full rounded-bl-full border-r-black dark:border-r-gray-700 dark:hover:bg-green-700"
								on:click={() => {
									setAnswer('positive');
									handleSubmit();
								}}
							>
								<Icon icon="octicon:thumbsup-16" />
							</Button>
							<Button
								variant="outline"
								on:click={() => {
									setAnswer('negative');
								}}
								class="px-7 text-red-800 border-red-800 gap-2 hover:bg-red-100 rounded-none rounded-tr-full rounded-br-full border-l-0 dark:hover:bg-red-700"
							>
								<Icon icon="octicon:thumbsdown-16" />
							</Button>
						</div>
					</div>
				{/if}

				{#if (answer && answer === 'positive') || hasNegativeReviewSubmitted}
					<div class="my-2 {answer === 'positive' ? 'text-green-800' : 'text-black'} font-semibold">
						Thanks for your feedback!
					</div>
				{/if}

				{#if answer && answer === 'negative' && !hasNegativeReviewSubmitted}
					<div class="flex flex-col w-full h-fit gap-2">
						<div class="font-semibold flex items-center gap-1">
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div
								on:click={() => {
									answer = null;
								}}
								class="cursor-pointer"
							>
								<Icon icon="mingcute:left-fill" class="text-lg" />
							</div>
							Describe the problem
						</div>
						<div class="my-1" />
						<div class="flex items-center space-x-2">
							<Checkbox id="isTranslationError" bind:checked={isTranslationError} />
							<Label
								for="isTranslationError"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Translation Error - <span class="text-muted-foreground"
									>Inappropriate/Unexpected Translation</span
								>
							</Label>
						</div>
						<div class="flex items-center space-x-2">
							<Checkbox id="isGrammarError" bind:checked={isGrammarError} />
							<Label
								for="isGrammarError"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Grammar Error - <span class="text-muted-foreground"
									>Incorrect Sequence of the words</span
								>
							</Label>
						</div>
						<div class="flex items-center space-x-2">
							<Checkbox id="isSpellingError" bind:checked={isSpellingError} />
							<Label
								for="isSpellingError"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Spelling Error - <span class="text-muted-foreground font-medium"
									>Inappropriate spelling/જોડણી</span
								>
							</Label>
						</div>
						<div class="my-2" />

						<div class="grid w-full max-w-sm items-center gap-1.5">
							<Label for="otherSuggestions">Other suggestions</Label>
							<Input
								bind:value={otherSuggestionsInput}
								type="text"
								id="otherSuggestions"
								placeholder="How can we improve this result?"
							/>
						</div>

						<div class="w-full flex justify-end">
							<Button
								on:click={handleSubmit}
								size="sm"
								class="rounded-full bg-theme-600 text-white hover:bg-theme-500">Submit</Button
							>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
{/if}
