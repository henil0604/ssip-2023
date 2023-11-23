<script>
	import { page } from '$app/stores';
	import CustomReplacer from '$lib/components/CustomReplacer.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	const modes = [
		{
			name: 'Text',
			href: '/translator',
			icon: 'ion:text',
			description: 'Translation for 100+ Languages'
		},

		{
			name: 'Voice',
			href: '/translator/voice',
			icon: 'material-symbols:mic-outline',
			description: 'Translate through voice'
		},
		{
			name: 'Image',
			href: '/translator/image',
			icon: 'bx:image',
			description: '.png, .jpg, .gif'
		},
		{
			name: 'File',
			href: '/translator/file',
			icon: 'bx:file',
			description: 'Translate .pdf, .txt files'
		}
	];

	$: selectedDescription = modes.find((e) => e.href === $page.url.pathname)?.description || '';
</script>

<div class="w-full flex justify-between items-center">
	<div class="flex gap-2">
		{#each modes as mode}
			{@const isActive = mode.href === $page.url.pathname}
			<a
				class="w-[100px] border rounded flex justify-center py-2 px-3 gap-2 items-center shadow transition-all cursor-pointer {isActive
					? 'bg-theme-600 text-white'
					: 'bg-white hover:shadow-lg hover:-translate-y-1'}"
				href={mode.href}
			>
				<Icon
					icon={mode.icon}
					class="h-full {isActive ? 'text-white' : 'text-theme-700'}"
					width="20"
				/>
				<h1 class="h-fit p-0 {isActive ? 'font-semibold' : ''}">{mode.name}</h1>
			</a>
		{/each}
	</div>

	<div>
		<CustomReplacer />
	</div>
</div>

<!-- {#if selectedDescription}
	<h1 class="mt-3 text-muted-foreground">{selectedDescription}</h1>
{/if} -->
