<script lang="ts">
	import { cn } from '$lib/utils';

	let DEFAULT_HEIGHT = 250;

	export let value = '';
	export let height = DEFAULT_HEIGHT;

	let className = '';
	export { className as class };

	let editorRef: HTMLDivElement;

	// if the value is empty
	$: if (value.trim() === '') {
		height = DEFAULT_HEIGHT;
	} else {
		height = Math.max(DEFAULT_HEIGHT, editorRef.scrollHeight);
	}
</script>

<div class="relative" style="height: {height}px;">
	<div
		bind:this={editorRef}
		contenteditable="true"
		class={cn(
			'w-full h-full flex-grow outline-none px-4 py-3 z-[2] absolute top-0 left-0 bg-transparent',
			className
		)}
		bind:innerText={value}
	/>

	{#if $$slots.placeholder && value === ''}
		<div class="w-full h-full text-muted-foreground absolute top-0 z-[1] left-0 px-4 py-3">
			<slot name="placeholder" />
		</div>
	{/if}
</div>
