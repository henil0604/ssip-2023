<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { copyTextToClipboard } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { tippy } from 'svelte-tippy';

	export let input = '';
	let copied = false;

	function handleCopy() {
		copyTextToClipboard(input);
		copied = true;

		setTimeout(() => {
			copied = false;
		}, 1500);
	}
</script>

<div use:tippy={{ content: 'Copy', placement: 'bottom' }}>
	<Button
		size="sm"
		variant="ghost"
		class="bg-transparent opacity-60 hover:opacity-100 transition-all flex justify-center items-center p-1"
		on:click={handleCopy}
	>
		{#if copied === false}
			<Icon icon="basil:copy-solid" class="text-xl" />
		{:else}
			<Icon icon="icon-park-solid:correct" class="text-xl" />
		{/if}
	</Button>
</div>
