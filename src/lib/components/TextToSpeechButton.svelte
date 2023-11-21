<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { tippy } from 'svelte-tippy';

	export let input = '';
	let speaking = false;

	function handleSpeak() {
		speaking = !speaking;
	}
</script>

<div use:tippy={{ content: speaking ? 'Stop Speaking' : 'Speak', placement: 'bottom' }}>
	<Button
		size="sm"
		variant="ghost"
		class="w-fit h-fit rounded-full bg-transparent opacity-90 hover:opacity-100 transition-all flex justify-center items-center p-2"
		on:click={handleSpeak}
	>
		{#if speaking === false}
			<Icon icon="fluent:speaker-2-28-filled" class="text-xl" />
		{:else}
			<Icon icon="solar:stop-bold" class="text-xl" />
		{/if}
	</Button>
</div>
