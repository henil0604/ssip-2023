<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { trpc } from '$lib/trpc/client';

	export let refId: string;
	let show = true;

	type Answer = 'positive' | 'negative' | null;

	let answer: Answer = null;

	let isTranslationError = false;
	let isGrammarError = false;
	let isSpellingError = false;
	let hasNegativeReviewSubmitted = false;

	function setAnswer(value: Answer) {
		answer = value;
		if (answer === 'positive') {
			setTimeout(() => {
				show = false;
			}, 1500);
		}
	}

	async function handleSubmit() {
		console.log(`refId: ${refId}`);

		const response = await trpc().submitFeedback.query({
			refId,
			isPositive: answer === 'positive',
			isGrammarError,
			isSpellingError,
			isTranslationError
		});

		console.log('response?', response);

		hasNegativeReviewSubmitted = true;
		setTimeout(() => {
			show = false;
		}, 1500);
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
					<h1 class="font-semibold">What do you think about this result?</h1>
				{/if}

				{#if !answer}
					<div class="grid grid-cols-2 w-full my-2 gap-2">
						<Button
							variant="outline"
							class="text-green-800 border-green-800 gap-2 hover:bg-green-100 dark:hover:bg-green-700"
							on:click={() => {
								setAnswer('positive');
								handleSubmit();
							}}
						>
							<Icon icon="octicon:thumbsup-16" />
							Good
						</Button>
						<Button
							variant="outline"
							on:click={() => {
								setAnswer('negative');
							}}
							class="text-red-800 border-red-800 gap-2 hover:bg-red-100 dark:hover:bg-red-700"
						>
							<Icon icon="octicon:thumbsdown-16" />
							Bad
						</Button>
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

						<div class="w-full flex justify-end">
							<Button on:click={handleSubmit} size="sm" class="rounded-full">Submit</Button>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
{/if}
