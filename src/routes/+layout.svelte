<script>
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import '../app.postcss';
</script>

<div class="w-full h-fit px-5 py-3 flex">
	<!-- head -->
	<div>
		<h1 class="text-xl font-extrabold">Varnantar</h1>
	</div>

	<!-- body -->
	<div class="flex-grow">
		<!--  -->
	</div>

	<!-- tail -->
	<div>
		<Button variant="link" href="/" class={$page.url.pathname === '/' ? 'text-orange-600' : ''}
			>Translator</Button
		>
		<Button
			variant="link"
			href="/solution-generator"
			class={$page.url.pathname === '/solution-generator' ? 'text-orange-600' : ''}
			>Solution Generator</Button
		>
	</div>
</div>
<slot />
