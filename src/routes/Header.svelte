<script lang="ts">
	import { page } from '$app/stores';
	import Logo from '$lib/components/Logo.svelte';

	const links = [
		{
			name: 'Translator',
			href: '/translator',
			activeForChildren: true
		},
		{
			name: 'Question Generator',
			href: '/question-generator'
		}
	];

	function isChildrenOfParent(parent: string) {
		return $page.url.pathname.startsWith(parent);
	}
</script>

<div class="w-full bg-white h-fit px-4 py-3 sticky top-0 shadow flex items-center justify-center">
	<!-- head -->
	<div class="">
		<a href="/">
			<Logo />
		</a>
	</div>

	<!-- content -->
	<div class="flex-grow flex justify-end gap-3">
		{#each links as link}
			{@const isActive =
				link.href === $page.url.pathname ||
				(link.activeForChildren && isChildrenOfParent(link.href))}
			<a
				href={link.href}
				class="underline-offset-2"
				class:text-orange-600={isActive}
				class:underline={isActive}
			>
				{link.name}
			</a>
		{/each}
	</div>

	<!-- tail -->
	<div class="">
		<!--  -->
	</div>
</div>
