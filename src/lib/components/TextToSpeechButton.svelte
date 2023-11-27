<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { tippy } from 'svelte-tippy';
	import { toasts } from 'svelte-toasts';

	export let input = '';
	let speaking = false;
	let processing = false;
	let history: {
		[key: string]: Blob;
	} = {};
	export let audio: HTMLAudioElement | null = null;
	export let disabled = false;

	async function handleSpeak() {
		speaking = !speaking;

		if (speaking) {
			await speak();
		}

		if (!speaking && audio) {
			audio.pause();
			audio.currentTime = 0;
		}
	}

	function toArrayBuffer(buffer: number[]) {
		const arrayBuffer = new ArrayBuffer(buffer.length);
		const view = new Uint8Array(arrayBuffer);
		for (let i = 0; i < buffer.length; ++i) {
			view[i] = buffer[i];
		}
		return arrayBuffer;
	}

	async function speak() {
		if (!input.trim()) {
			toasts.add({
				title: 'Oops!',
				description: 'Nothing to speak',
				type: 'error',
				duration: 2000
			});
			speaking = false;
			return;
		}

		let blob: Blob;
		if (history[input] === undefined) {
			processing = true;
			let response = await trpc().textToSpeech.mutate({
				input
			});
			console.log('response?', response);

			processing = false;

			blob = new Blob([toArrayBuffer(response.data)], { type: 'audio/mpeg' });
			history[input] = blob;
		}

		blob = history[input];
		let audioURL = window.URL.createObjectURL(blob);
		audio = new Audio();
		audio.src = audioURL;
		audio.onended = () => {
			speaking = false;
		};
		audio.play();
	}

	$: if (input.length >= 3000) {
		disabled = true;
	} else {
		disabled = false;
	}
</script>

<div
	use:tippy={{
		content: disabled ? 'Speak (Disabled)' : speaking ? 'Stop Speaking' : 'Speak',
		placement: 'bottom'
	}}
>
	<Button
		bind:disabled
		size="sm"
		variant="ghost"
		class="w-fit h-fit rounded-full bg-transparent opacity-90 hover:opacity-100 transition-all flex justify-center items-center p-2"
		on:click={handleSpeak}
	>
		{#if speaking === false}
			<Icon icon="fluent:speaker-2-28-filled" class="text-xl" />
		{:else if processing === true}
			<Icon icon="svg-spinners:270-ring-with-bg" class="text-xl" />
		{:else}
			<Icon icon="solar:stop-bold" class="text-xl" />
		{/if}
	</Button>
</div>
