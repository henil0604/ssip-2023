<script>
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import '../app.postcss';
	import { getTheme, setTheme } from '$lib/utils';
	import Logo from '$lib/components/Logo.svelte';
	import 'tippy.js/dist/tippy.css';

	let theme = getTheme();
</script>

<div class="w-full h-fit px-5 py-3 flex">
	<!-- head -->
	<div>
		<Logo />
	</div>

	<!-- body -->
	<div class="flex-grow">
		<!--  -->
	</div>

	<!-- tail -->
	<div class="max-md:hidden">
		<Button variant="link" href="/" class={$page.url.pathname === '/' ? 'text-orange-600' : ''}
			>Translator</Button
		>

		<Button
			variant="link"
			href="/question-generator"
			class={$page.url.pathname === '/question-generator' ? 'text-orange-600' : ''}
			>Question Generator</Button
		>

		<Button
			variant="link"
			href="/solution-generator"
			class={$page.url.pathname === '/solution-generator' ? 'text-orange-600' : ''}
			>Solution Generator</Button
		>

		<Button
			class="h-fit py-2 text-lg"
			on:click={() => {
				theme === 'light' ? setTheme('dark') : setTheme('light');
				theme = getTheme();
			}}
			size="sm"
		>
			{#if theme === 'light'}
				<Icon icon="ion:moon" />
			{:else}
				<Icon icon="ph:sun" />
			{/if}
		</Button>
	</div>

	<div class="hidden max-md:block">
		<!--  -->
	</div>
</div>
<slot />
