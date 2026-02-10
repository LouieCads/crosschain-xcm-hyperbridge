<script lang="ts">
  import { themeStore } from '../stores/theme.svelte';
  import { connect, disconnect, getConnectors } from '@wagmi/core';
	import { wagmiConfig } from '../wagmi/config';
	import { isConnected, address, isConnecting } from '../wagmi/stores';
	import { formatAddress } from '../utils/format';

  let connecting = $state(false);
	let error = $state<string | null>(null);

	function toggleTheme() {
		themeStore.toggle();
	}

	async function handleConnect() {
		connecting = true;
		error = null;

		try {
			const connectors = getConnectors(wagmiConfig);
			const injectedConnector = connectors.find((c) => c.id === 'injected' || c.id === 'metaMaskSDK');

			if (!injectedConnector) {
				throw new Error('No wallet connector found. Please install MetaMask or another Web3 wallet.');
			}

			await connect(wagmiConfig, {
				connector: injectedConnector
			});
		} catch (err) {
			console.error('Connection error:', err);
			error = err instanceof Error ? err.message : 'Failed to connect wallet';
		} finally {
			connecting = false;
		}
	}

	async function handleDisconnect() {
		try {
			await disconnect(wagmiConfig);
			error = null;
		} catch (err) {
			console.error('Disconnect error:', err);
			error = err instanceof Error ? err.message : 'Failed to disconnect wallet';
		}
	}
</script>

<header class="sticky top-0 z-50 bg-white/80 dark:bg-[#0F1419]/90 backdrop-blur-xl border-b border-[#3A52A6]/10 dark:border-white/5 shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <div class="flex justify-between items-center gap-4">
      <!-- Logo/Brand -->
      <a href="/" class="flex items-center gap-3 group transition-transform duration-200 hover:translate-x-0.5">
        <div class="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-[#3A52A6] to-[#5A72C6] rounded-xl text-white shadow-lg shadow-[#3A52A6]/20 transition-all duration-200 group-hover:shadow-xl group-hover:shadow-[#3A52A6]/30 group-hover:scale-105">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 class="text-xl font-bold bg-gradient-to-r from-[#3A52A6] to-[#5A72C6] dark:from-[#7B93DB] dark:to-[#9BB3FB] bg-clip-text text-transparent">
          Crosschain
        </h1>
      </a>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          onclick={toggleTheme}
          class="flex cursor-pointer items-center justify-center w-10 h-10 rounded-xl bg-white/80 dark:bg-black/30 backdrop-blur-md border border-[#3A52A6]/20 dark:border-white/10 transition-all duration-200 hover:bg-white/90 dark:hover:bg-black/40 hover:border-[#3A52A6]/30 dark:hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md text-[#3A52A6] dark:text-[#F0F7FF] group"
          aria-label="Toggle theme"
          title={themeStore.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {#if themeStore.theme === 'light'}
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          {:else}
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              />
            </svg>
          {/if}
        </button>

        <div class="relative">
          {#if $isConnected && $address}
            <div class="flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-black/30 backdrop-blur-md border border-[#3A52A6]/20 dark:border-white/10 rounded-lg px-2 py-1.5 transition-all duration-200 hover:bg-white/90 dark:hover:bg-black/40 hover:border-[#3A52A6]/30 dark:hover:border-white/20 shadow-sm">
              <div class="flex flex-col items-center gap-0.5">
                <span class="text-xs font-mono text-gray-600 dark:text-gray-400">{formatAddress($address)}</span>
              </div>
              <button
                onclick={handleDisconnect}
                class="px-2.5 py-1.5 cursor-pointer bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-semibold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Disconnect
              </button>
            </div>
          {:else}
            <button
              onclick={handleConnect}
              disabled={connecting || $isConnecting}
              class="px-6 cursor-pointer py-2 bg-gradient-to-r from-[#3A52A6] to-[#5A72C6] hover:from-[#2A4296] hover:to-[#4A62B6] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md shadow-[#3A52A6]/30 hover:shadow-lg hover:shadow-[#3A52A6]/40 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-lg disabled:shadow-gray-400/30"
            >
              {connecting || $isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          {/if}

          {#if error}
            <div class="absolute top-full right-0 mt-2 w-64 sm:w-80 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/30 shadow-lg">
              {error}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</header>