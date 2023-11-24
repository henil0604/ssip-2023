<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import Editor from '$lib/components/Editor.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { writable } from 'svelte/store';
	import '$lib/assets/prism.css';
	import '$lib/assets/prism.js';

	let message = writable('');
	let isLoading = false;
	let loadingChatIndex: number | null = null;
	let chatBlockRef: HTMLDivElement;
	let sourceLanguage = writable<LanguagesInCodeKeys>('en');

	type Chat = {
		role: 'assistant' | 'user';
		message: string;
		translated: string | null;
		show: boolean;
		send: boolean;
		rendered: string;
		ref?: HTMLDivElement;
	};

	let chats = writable<Chat[]>([
		{
			role: 'assistant',
			message:
				'Hey! AskBot here! I am here to assist you. You can select the output Language From the top right corner.',
			show: true,
			send: false,
			translated: null,
			rendered:
				'Hey! AskBot here! I am here to assist you. You can select the output Language From the top right corner.'
		}
	]);

	function addChat(chat: Chat) {
		$chats = [...$chats, chat];
		return $chats.length - 1;
	}

	$: user = $page.data.session?.user;

	$: userShortName = (
		(user?.name?.split(' ')[0][0] || '') + (user?.name?.split(' ')[1][0] || '')
	).toUpperCase();

	function constructChats() {
		return $chats.filter((chat) => {
			return chat.send;
		});
	}

	async function handleAddChat() {
		if (isLoading) return;

		addChat({
			message: $message,
			role: 'user',
			send: true,
			show: true,
			translated: null,
			rendered: $message
		});
		loadingChatIndex = addChat({
			message: '',
			role: 'assistant',
			send: false,
			show: true,
			translated: null,
			rendered: ''
		});

		isLoading = true;

		$message = '';

		let constructedChats = constructChats();

		const chatResponse = await trpc().chatCompletion.mutate({
			chats: constructedChats,
			targetLanguage: $sourceLanguage
		});

		console.log('chatResponse?', chatResponse);

		$chats[loadingChatIndex] = {
			...$chats[loadingChatIndex],
			message: chatResponse.original || 'No Response',
			translated: chatResponse.translated,
			send: true,
			show: true,
			rendered: chatResponse.rendered
				.replace(/>{@html `<code class="language-/g, '><code class="language-')
				.replace(/<\/code>`}<\/pre>/g, '</code></pre>')
		};

		let lastLoadingChatIndex = loadingChatIndex;

		setTimeout(() => {
			$chats[lastLoadingChatIndex]?.ref?.scrollIntoView();
		}, 100);

		loadingChatIndex = null;
		isLoading = false;
	}

	chats.subscribe(() => {
		if (!browser || !chatBlockRef) return;

		$chats[$chats.length - 1]?.ref?.scrollIntoView();
	});
</script>

<div class="grow min-w-full max-h-[880px] flex justify-center">
	<div
		style="width: 50%;"
		class="min-h-fit flex flex-col justify-between border-x border-theme-400"
	>
		<!--  -->
		<div
			class="grow-0 flex w-full justify-between items-center p-2 border-y border-y-theme-400 bg-theme-50"
		>
			<div class="flex gap-1 justify-center items-center">
				<Icon class="text-[40px] text-black" icon="fluent:bot-sparkle-20-regular" />
				<h1 class="font-semibold text-xl"><span class="text-theme-600">Ask</span>Bot</h1>
			</div>
			<LanguageSelector bind:value={$sourceLanguage} />
		</div>
		<div
			bind:this={chatBlockRef}
			class="grow flex flex-col overflow-y-auto fancy-scroll px-4 gap-3"
		>
			<div class="w-full min-h-[500px] flex justify-center items-center">
				<div class="flex gap-1 justify-center items-center">
					<Icon class="text-[100px] text-black" icon="fluent:bot-sparkle-20-regular" />
					<div class="text-[45px]"><span class="text-theme-600">Ask</span>Bot</div>
				</div>
			</div>
			{#each $chats as chat, index}
				{#if chat.show}
					{@const isUser = chat.role === 'user'}
					<div
						bind:this={chat.ref}
						class="w-full h-fit p-5 flex items-start gap-3 rounded-lg"
						class:bg-theme-100={!isUser}
					>
						<!-- avatar -->
						<div>
							{#if isUser && user}
								<Avatar.Root>
									<Avatar.Image src={user.image} alt="" />
									<Avatar.Fallback>{userShortName}</Avatar.Fallback>
								</Avatar.Root>
							{/if}
							{#if !isUser}
								<Avatar.Root>
									<Avatar.Fallback class="bg-theme-600 text-xl text-white">V</Avatar.Fallback>
								</Avatar.Root>
							{/if}
						</div>

						<!-- content -->
						<div class="grow flex flex-col gap-1">
							<!-- title -->
							<div class="text-base font-semibold">
								{isUser && user ? user.name : 'AskBot'}
							</div>
							<!-- message -->
							<div class="">
								{#if loadingChatIndex === index}
									<Icon icon="eos-icons:three-dots-loading" class="text-[30px]" />
								{:else if chat.rendered}
									{@html chat.rendered}
								{:else}
									{(chat.translated || chat.message).replaceAll('\n', '<br />')}
								{/if}
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
		<div class="grow-0 w-full p-3 flex items-end gap-2">
			<Editor
				defaultHeight={50}
				allowClearButton={false}
				wrapperClass="w-full border border-gray-400 rounded"
				inputClass="text-base fancy-scroll"
				maxEditorHeight={220}
				bind:value={$message}
				on:keydown={(e) => {
					if (e.keyCode === 13) {
						e.preventDefault();
						handleAddChat();
					}
				}}
			>
				<div slot="placeholder">Message AskBOT</div>
			</Editor>
			<Button bind:disabled={isLoading} class="h-fit p-3">
				<Icon icon="mingcute:send-fill" class="text-xl" />
			</Button>
		</div>
	</div>
</div>
