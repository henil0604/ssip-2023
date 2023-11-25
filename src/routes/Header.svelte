<script lang="ts">
	import { page } from '$app/stores';
	import AccountDropdown from '$lib/components/AccountDropdown.svelte';
	import LoginDialog from '$lib/components/LoginDialog.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	const links = [
		{
			name: 'Translator',
			href: '/translator',
			activeForChildren: true
		},
		{
			name: 'Question Generator',
			href: '/question-generator'
		},
		{
			name: 'AskBot',
			href: '/askbot'
		}
	];

	function isChildrenOfParent(parent: string) {
		return $page.url.pathname.startsWith(parent);
	}

	let loginDialogOpen: boolean = false;
	let accountDropdownOpen: boolean = false;
</script>

<div class="w-full bg-white h-fit px-4 py-3 shadow flex items-center justify-center z-[10]">
	<!-- head -->
	<div class="">
		<a href="/">
			<Logo size={50} />
		</a>
	</div>

	<!-- content -->
	<div class="flex-grow flex justify-end gap-3" />

	<!-- tail -->
	<div class="flex justify-end items-center gap-5">
		{#each links as link}
			{@const isActive =
				link.href === $page.url.pathname ||
				(link.activeForChildren && isChildrenOfParent(link.href))}
			<a
				href={link.href}
				class="text-lg underline-offset-2"
				class:text-theme-600={isActive}
				class:underline={isActive}
			>
				{link.name}
			</a>
		{/each}

		<!-- Login -->
		<!-- {#if !$page.data.session}
			<Button
				size="sm"
				on:click={() => {
					loginDialogOpen = true;
				}}
				class="bg-theme-600 hover:bg-theme-500 text-theme-foreground">Login</Button
			>
			<LoginDialog bind:open={loginDialogOpen} />
		{/if} -->

		<!-- {#if $page.data.session && $page.data.session.user}
			<AccountDropdown bind:open={accountDropdownOpen} />
		{/if} -->
	</div>
</div>
