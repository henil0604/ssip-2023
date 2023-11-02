<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';

	let show = true;
	export let refId: string;

	// responsible for RPC
	async function submitFeedback(isPositive: boolean) {
		console.log(`refId: ${refId}`);
		show = false;

		const response = await trpc().submitFeedback.query({
			refId,
			isPositive: isPositive,
			isSpellingError: false,
			isTranslationError: false,
			isGrammarError: false
		});

		console.log('response?', response);
	}
</script>

{#if show}
	<div
		class="shadow-xl rounded-full border border-black dark:border-white px-5 py-1 flex gap-2 min-w-fit items-center"
		in:fly={{ y: 50 }}
		out:fly={{ y: 50 }}
		data-ref-id={refId}
	>
		<div class="min-w-fit">Is this result accurate?</div>
		<div class="grid grid-cols-2 w-full my-2">
			<Button
				variant="outline"
				class="text-green-800 border-green-800 gap-2 hover:bg-green-100 rounded-none rounded-tl-full rounded-bl-full border-r-black dark:border-r-gray-700 dark:hover:bg-green-700"
				on:click={() => {
					submitFeedback(true);
				}}
			>
				<Icon icon="octicon:thumbsup-16" />
			</Button>
			<Button
				variant="outline"
				on:click={() => {
					submitFeedback(false);
				}}
				class="text-red-800 border-red-800 gap-2 hover:bg-red-100 rounded-none rounded-tr-full rounded-br-full border-l-0 dark:hover:bg-red-700"
			>
				<Icon icon="octicon:thumbsdown-16" />
			</Button>
		</div>
	</div>
{/if}
