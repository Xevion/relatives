<script lang="ts">
	import '@fontsource/inter/400.css';
	import '@fontsource/inter/500.css';
	import '@fontsource/inter/600.css';
	import '@fontsource/inter/700.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<OverlayScrollbarsComponent
	options={{
		scrollbars: {
			autoHide: 'leave',
			autoHideDelay: 800
		}
	}}
	class="h-screen"
>
	{@render children()}
</OverlayScrollbarsComponent>
