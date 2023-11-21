<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
	import * as Avatar from '$lib/components/ui/avatar';

	export let open = false;

	$: user = $page.data.session?.user;

	$: userShortName = (
		(user?.name?.split(' ')[0][0] || '') + (user?.name?.split(' ')[1][0] || '')
	).toUpperCase();
</script>

{#if user}
	<DropdownMenu.Root bind:open>
		<DropdownMenu.Trigger>
			<Avatar.Root>
				<Avatar.Image src={user.image} alt="" />
				<Avatar.Fallback>{userShortName}</Avatar.Fallback>
			</Avatar.Root>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Group>
				<DropdownMenu.Label>Hey, {user.name}</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger>
						<span>Theme</span>
					</DropdownMenu.SubTrigger>
					<DropdownMenu.SubContent>
						<DropdownMenu.Item class="gap-2">
							<Icon icon="ph:moon" />
							<span>Dark</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item class="gap-2">
							<Icon icon="ph:sun" />
							<span>Light</span>
						</DropdownMenu.Item>
					</DropdownMenu.SubContent>
				</DropdownMenu.Sub>
				<DropdownMenu.Item on:click={() => signOut()} class="text-red-600 gap-2">
					<Icon icon="mdi:logout" />
					<span>Logout</span>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
