<script lang="ts">
	import CopyButton from '$lib/components/CopyButton.svelte';
	import DownloadButton from '$lib/components/DownloadButton.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import TextToSpeechButton from '$lib/components/TextToSpeechButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	export let value = '';
	export let height: number;
	export let editor: Editor | null;
	export let isBeingTranslated: boolean;
	export let readonly = true;
</script>

<div class="w-full grow-0 min-h-fit flex flex-col gap-0 border border-black rounded">
	<Editor
		id="originalOutput"
		bind:readonly
		wrapperClass=""
		bind:this={editor}
		bind:value
		bind:height
		allowClearButton={false}
	>
		<div slot="placeholder" />
		<div class="absolute right-0 top-0 p-3 px-4 z-[2] flex flex-col h-full w-fit">
			<!--  -->
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
		</div>
	</Editor>
	<div class="p-3 flex justify-between items-center gap-2">
		<div class="flex gap-1">
			<slot name="footerLeft" />
		</div>
		<div class="flex justify-end gap-1">
			<slot name="footerRight" />
			<DownloadButton bind:text={value} />
			<TextToSpeechButton bind:input={value} />
			<CopyButton bind:input={value} />
		</div>
	</div>
</div>
