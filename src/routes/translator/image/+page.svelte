<script lang="ts">
	import LanguageSelectorHeader from '$lib/components/LanguageSelectorHeader.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import Icon from '@iconify/svelte';
	import { writable } from 'svelte/store';

	let sourceLanguage = writable<LanguagesInCodeKeys>('en');
	let targetLanguage = writable<LanguagesInCodeKeys>('gu');
</script>

<div class="flex flex-col">
	<!-- header -->
	<LanguageSelectorHeader
		bind:sourceLanguage={$sourceLanguage}
		bind:targetLanguage={$targetLanguage}
	/>

	<div class="border shadow-md rounded p-4 py-32 flex justify-center items-center">
		<!--  -->
		<div class="flex flex-col items-center gap-2">
			<div class="flex justify-center items-center gap-0">
				<Icon icon="ant-design:file-gif-outlined" class="text-theme-600 mr-2" width={70} />
				<Icon icon="uiw:file-jpg" class="text-theme-600" width={70} />
				<Icon icon="iwwa:file-png" class="text-theme-600" width={90} />
			</div>
			<h1 class="text-2xl">Drag your .PNG, .JPG, or .GIF file here</h1>
			<p class="text-muted-foreground">OR</p>
			<Button variant="default" size="lg" class="text-lg">Upload from your computer</Button>
		</div>
	</div>
</div>
