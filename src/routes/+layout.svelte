<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import '../app.postcss';
	import Header from './Header.svelte';
	import 'tippy.js/dist/tippy.css';
	import { tesseractWorker } from '$lib/store';
	import { createWorker } from 'tesseract.js';

	onMount(async () => {
		console.log('creating tesseract worker...');
		$tesseractWorker = await createWorker('eng');
		console.log('tesseract worker created...');
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@300;400&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@300;400&family=Poppins&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex flex-col min-h-full">
	<Header />
	<slot />
</div>
