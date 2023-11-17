<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { LanguageMap } from '$lib/const';

	const LanguagesList = Object.keys(LanguageMap).map((languageName) => {
		return [languageName, LanguageMap[languageName as keyof typeof LanguageMap]];
	});

	export let value: string = LanguagesList[0][1];
	export let width = 0;
</script>

<Select.Root>
	<Select.Trigger style="width: {width === 0 ? '100%' : `${width}px`};" class="ring-0 border-none">
		<Select.Value placeholder={LanguagesList.find((e) => e[1] === value)?.[0]} />
	</Select.Trigger>
	<Select.Content>
		{#each LanguagesList as language}
			<Select.Item on:click={() => (value = language[1])} value={language[1]} label={language[0]}>
				{language[0]}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
