<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { DEFAULT_EDITOR_HEIGHT } from '$lib/const';
	import Icon from '@iconify/svelte';

	export let value = '';
	export let defaultHeight = DEFAULT_EDITOR_HEIGHT;
	export let height: number = defaultHeight;
	export let editor: Editor | null = null;
	export let readonly = true;
	export let allowEditButton = false;
	export let wrapperClass = '';
</script>

<div class="min-w-full grow-0 min-h-fit flex flex-col gap-0 border border-gray-400 rounded">
	<Editor
		bind:defaultHeight
		id="originalOutput"
		bind:readonly
		bind:wrapperClass
		bind:this={editor}
		bind:value
		bind:height
		allowClearButton={false}
	>
		<svelte:fragment slot="placeholder">
			<slot name="placeholder" />
		</svelte:fragment>
		<div class="absolute right-0 top-0 p-3 px-4 z-[2] flex flex-col h-full w-fit">
			<!--  -->
			{#if allowEditButton}
				<Button
					on:click={() => (readonly = !readonly)}
					variant="outline"
					class="w-fit h-fit p-2 rounded-full"
				>
					{#if readonly}
						<Icon class="text-lg" icon="mdi:pencil" />
					{:else}
						<Icon class="text-lg" icon="mdi:tick" />
					{/if}
				</Button>
			{/if}
		</div>
	</Editor>
	<div class="p-3 flex justify-between items-end gap-2">
		<div class="flex gap-1">
			<slot name="footerLeft" />
		</div>
		<div class="flex justify-end gap-1">
			<slot name="footerRight" />
		</div>
	</div>
</div>
