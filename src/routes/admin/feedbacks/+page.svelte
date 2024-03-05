<script lang="ts">
	import type { RouterOutput } from '$lib/server/trpc/router';
	import { trpc } from '$lib/trpc/client';
	import type { Feedback } from '@prisma/client';
	import { onMount } from 'svelte';

	let feedbacks: RouterOutput['admin']['fetchLatestFeedbacks'] = [];
	let loading = false;

	async function fetchLatestFeedback() {
		loading = true;

		const response = await trpc().admin.fetchLatestFeedbacks.query();

		// @ts-ignore
		feedbacks = (response || []).map((e) => {
			return {
				...e,
				createdAt: new Date(e.createdAt)
			};
		});

		loading = false;
	}

	onMount(fetchLatestFeedback);
</script>

<div class="flex flex-col">
	<h1 class="font-semibold">Recent feedbacks</h1>
	<div class="my-2" />
	{#if loading}
		<p>Loading...</p>
	{/if}
	<div class="flex flex-col gap-2">
		{#each feedbacks as feedback}
			{@const problem = [
				feedback.isGrammarError,
				feedback.isSpellingError,
				feedback.isTranslationError
			]}
			<div class="w-full h-fit flex flex-col border rounded p-2">
				<div class="flex gap-2 text-sm">
					<p>ID:</p>
					<p>{feedback.id}</p>
				</div>
				<div class="flex gap-2 text-sm">
					<p>Time:</p>
					<p>{feedback.createdAt.toLocaleString()}</p>
				</div>
				<div class="flex gap-2 text-sm">
					<p>Type:</p>
					<p
						class="font-semibold"
						class:text-green-600={feedback.isPositive}
						class:text-red-600={!feedback.isPositive}
					>
						{feedback.isPositive ? 'Positive' : 'Negative'}
					</p>
				</div>
				{#if feedback.isPositive === false}
					<div class="flex gap-2 text-sm">
						<p>Problem:</p>
						<p>
							{problem
								.map((e, index) => {
									if (index === 0 && e) {
										return 'Grammar Error';
									}
									if (index === 1 && e) {
										return 'Spelling Error';
									}
									if (index === 2 && e) {
										return 'Translation Error';
									}
									return null;
								})
								.filter((e) => e !== null)
								.join(',')}
						</p>
					</div>
				{/if}
				{#if feedback.otherSuggestions && feedback.otherSuggestions?.trim() !== ''}
					<div class="flex gap-2 text-sm">
						<p>Other suggestions:</p>
						<p>
							{feedback.otherSuggestions}
						</p>
					</div>
				{/if}

				<div class="my-2" />

				<div class="grid grid-cols-2 gap-6">
					<div class="flex flex-col">
						<p class="text-sm">Input:</p>
						<div>
							{feedback.ref.input}
						</div>
					</div>
					<div class="flex flex-col">
						<p class="text-sm">Translation:</p>
						<div>
							{feedback.ref.originalTranslation}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
