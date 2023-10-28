<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';

	import { Textarea } from '$lib/components/ui/textarea';
	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';

	let textareaHeight = 200;

	function autoResize(event?: Event, target?: HTMLTextAreaElement) {
		const t = target || (event?.target as HTMLTextAreaElement);

		if (t.value === '') {
			t.style.height = `100px`;
		} else {
			t.style.height = `${t.scrollHeight}px`;
		}
	}

	function generateSolution() {}
</script>

<div class="w-full min-h-full flex flex-col gap-6">
	<div class="container">
		<div class="text-muted-foreground font-semibold">
			Enter any text in English and get questions extracted in Gujarati...
		</div>
		<div class="my-7" />
		<!-- translator wrapper -->

		<div class="flex flex-col gap-4 items-stretch">
			<!-- text -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>Text</Label>
				<div class="relative">
					<Textarea
						on:keydown={(e) => {
							if (e.keyCode === 13) {
								e.preventDefault();
								generateSolution();
							}
						}}
						on:input={autoResize}
						style="height: {textareaHeight}px;"
						class="min-h-[200px] border-black dark:border-white text-xl resize-none"
						placeholder="Enter text..."
					/>

					<div class="absolute bottom-2 right-1">
						<Button
							size="sm"
							variant="ghost"
							class="bg-transparent opacity-60 hover:opacity-100 transition-all"
						>
							<Icon icon="basil:copy-solid" class="text-xl" />
						</Button>
					</div>
				</div>
			</div>

			<div class="w-full flex items-center justify-center">
				<Button on:click={generateSolution} size="sm" class="rounded-full"
					>Generate Questions</Button
				>
			</div>

			<!-- solution -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>Extracted questions</Label>
				<div class="relative">
					<Textarea
						on:input={autoResize}
						readonly
						style="height: {textareaHeight}px; color: #000;"
						class="min-h-[200px] border-black text-xl bg-gray-100 dark:bg-transparent dark:border-white dark:!text-white resize-none"
					/>
					<div class="absolute bottom-2 right-1">
						<Button
							size="sm"
							variant="ghost"
							class="bg-transparent opacity-60 hover:opacity-100 transition-all"
						>
							<Icon icon="basil:copy-solid" class="text-xl" />
						</Button>
					</div>
				</div>
			</div>

			<!-- feedback -->
			<div class="w-full flex justify-end" in:fly={{ y: 40 }}>
				<div
					class="shadow-xl rounded-full border border-black dark:border-white px-5 py-1 flex gap-2 min-w-fit items-center"
				>
					<div class="min-w-fit">Is this result accurate?</div>
					<div class="grid grid-cols-2 w-full my-2">
						<Button
							variant="outline"
							class="text-green-800 border-green-800 gap-2 hover:bg-green-100 rounded-none rounded-tl-full rounded-bl-full border-r-black dark:border-r-gray-700 dark:hover:bg-green-700"
							on:click={() => {}}
						>
							<Icon icon="octicon:thumbsup-16" />
						</Button>
						<Button
							variant="outline"
							on:click={() => {}}
							class="text-red-800 border-red-800 gap-2 hover:bg-red-100 rounded-none rounded-tr-full rounded-br-full border-l-0 dark:hover:bg-red-700"
						>
							<Icon icon="octicon:thumbsdown-16" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
