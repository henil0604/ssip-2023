<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Editor from '$lib/components/Editor.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let inputLanguage: LanguagesInCodeKeys = 'auto';
	let outputLanguage: LanguagesInCodeKeys = 'guj';

	let input = '';
	let output = '';

	let editorHeight: number;

	function swapLanguages() {
		if (inputLanguage === 'auto') {
			return false;
		}

		let t = inputLanguage;
		inputLanguage = outputLanguage;
		outputLanguage = t;
		return true;
	}

	$: if (input) {
		goto(`#${inputLanguage}/${outputLanguage}/${encodeURIComponent(input)}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	onMount(() => {
		let hash = $page.url.hash;

		if (hash) {
			hash = hash.slice(1);
			const [inputLanguageFromHash, outputLanguageFromHash, content] = hash.split('/');

			inputLanguage = inputLanguageFromHash as LanguagesInCodeKeys;
			outputLanguage = outputLanguageFromHash as LanguagesInCodeKeys;

			input = decodeURIComponent(content);
		}
	});
</script>

<!-- translate box wrapper -->
<div
	class="bg-white rounded transition-all shadow focus-within:shadow-xl min-h-fit p-0 flex flex-col overflow-auto"
>
	<!-- head -->
	<div class="w-full flex justify-center items-center gap-3 px-4 py-1 border-b">
		<!-- input side -->
		<div class="flex-grow">
			<LanguageSelector bind:value={inputLanguage} />
		</div>
		<!-- middle -->
		<div class="">
			<!--  -->
			<Button variant="outline" class="h-fit p-2" on:click={swapLanguages}>
				<Icon icon="eva:swap-fill" />
			</Button>
		</div>
		<!-- output side -->
		<div class="flex-grow">
			<LanguageSelector bind:value={outputLanguage} />
		</div>
	</div>

	<!-- body -->
	<div class="w-full flex-grow min-h-fit grid grid-cols-2 gap-0">
		<Editor
			bind:value={input}
			bind:height={editorHeight}
			class="border border-t-0 border-l-0 border-b-0 border-r border-r-gray-300"
		>
			<div slot="placeholder" class="">
				<h1 class="text-xl">Type to translate...</h1>
			</div>
		</Editor>
		<Editor bind:value={output} bind:height={editorHeight}>
			<div slot="placeholder" />
		</Editor>
	</div>

	<!-- footer -->
	<div class="w-full grow-0 min-h-fit grid grid-cols-2 gap-0">
		<!-- left -->
		<div
			class="border border-t-0 border-l-0 border-b-0 border-r border-r-gray-300 p-3 flex justify-end"
		>
			<!--  -->
		</div>
		<!-- right -->
		<div class="p-3 flex justify-end">
			<!--  -->
		</div>
	</div>
</div>
