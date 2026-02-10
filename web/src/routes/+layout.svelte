<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if (themeStore.theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	$effect(() => {
		const currentTheme = themeStore.theme;
		if (currentTheme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<title>Crosschain</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-[#0F1419] dark:via-[#0F1419] dark:to-[#1A1F2E] transition-colors duration-300">
	<Header />

	<main class="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
		{@render children()}
	</main>

	<Footer />

	<div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
		<div class="absolute w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-[#3A52A6] to-[#5A72C6] -top-48 -left-48 animate-[float_20s_ease-in-out_infinite]"></div>
		
		<div class="absolute w-80 h-80 sm:w-[400px] sm:h-[400px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-[#5A72C6] to-[#7B93DB] -bottom-40 -right-40 animate-[float-delayed_20s_ease-in-out_infinite_7s]"></div>
		
		<div class="absolute w-72 h-72 sm:w-[350px] sm:h-[350px] rounded-full blur-3xl opacity-15 dark:opacity-8 bg-gradient-to-br from-[#3A52A6] to-[#7B93DB] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[float-delayed-2_20s_ease-in-out_infinite_14s]"></div>
	</div>
</div>