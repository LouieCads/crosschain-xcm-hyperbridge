<script lang="ts">
	import { isConnected, address, chainIdStore } from '$lib/wagmi/stores';
	import { bridgeTokens, type BridgeTokensParams } from '$lib/hooks/useTokenBridge';
	import { readContract } from '@wagmi/core';
	import { wagmiConfig } from '$lib/wagmi/config';
	import { MOCK_ERC20_ABI } from '$lib/contracts/MockERC20';
	import { formatTokenAmount } from '$lib/utils/format';
	import { parseUnits } from 'viem';
	import type { Address } from 'viem';

	// USD.h token address on Sepolia
	const USDH_ADDRESS = '0xA801da100bF16D07F668F4A49E1f71fc54D05177' as `0x${string}`;

	let tokenAddress = $state('');
	let amount = $state('');
	let recipientAddress = $state('');
	let destChain = $state('sepolia');
	let redeem = $state(true);

	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);
	let tokenBalance = $state<bigint | null>(null);
	let tokenSymbol = $state<string>('');
	let tokenDecimals = $state<number>(18);

	$effect(() => {
    if ($isConnected && !tokenAddress) {
        tokenAddress = USDH_ADDRESS;
    }
	});

	async function fetchTokenInfo() {
		try {
			const [balance, symbol, decimals] = await Promise.all([
				readContract(wagmiConfig, {
					address: tokenAddress as Address,
					abi: MOCK_ERC20_ABI,
					functionName: 'balanceOf',
					args: [$address as Address]
				}),
				readContract(wagmiConfig, {
					address: tokenAddress as Address,
					abi: MOCK_ERC20_ABI,
					functionName: 'symbol'
				}),
				readContract(wagmiConfig, {
					address: tokenAddress as Address,
					abi: MOCK_ERC20_ABI,
					functionName: 'decimals'
				})
			]);

			tokenBalance = balance as bigint;
			tokenSymbol = symbol as string;
			tokenDecimals = decimals as number;
		} catch (err) {
			console.error('Failed to fetch token info:', err);
			tokenBalance = null;
			tokenSymbol = '';
			tokenDecimals = 18;
		}
	}

	async function handleBridge() {
		error = null;
		success = null;

		if (!$isConnected) {
			error = 'Please connect your wallet first';
			return;
		}

		if (!tokenAddress) {
			error = 'Please enter a token address';
			return;
		}

		if (!amount || parseFloat(amount) <= 0) {
			error = 'Please enter a valid amount';
			return;
		}

		if (!recipientAddress) {
			error = 'Please enter a recipient address';
			return;
		}

		if (!destChain) {
			error = 'Please select a destination chain';
			return;
		}

		isLoading = true;

		try {
			const amountBigInt = parseUnits(amount.toString(), tokenDecimals);

			const params: BridgeTokensParams = {
				token: tokenAddress as Address,
				amount: amountBigInt,
				recipient: recipientAddress as Address,
				destChain: destChain,
				redeem: true,
				relayerFee: 0n,
				timeout: 3600,
				nativeCost: 0n
			};

			const result = await bridgeTokens(params);
			success = `Bridge transaction confirmed! TX: ${result.txHash}`;
			
			amount = '';
			recipientAddress = '';
			
			await fetchTokenInfo();
		} catch (err: any) {
			console.error('Bridge error:', err);
			error = err.message || 'Failed to bridge tokens';
		} finally {
			isLoading = false;
		}
	}

	function setMaxAmount() {
		if (tokenBalance !== null) {
			amount = formatTokenAmount(tokenBalance, tokenDecimals);
		}
	}
</script>

<div class="w-full max-w-4xl mx-auto space-y-3">
	{#if !$isConnected}
		 <div class="text-center space-y-3">
			<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#3A52A6] to-[#5A72C6] dark:from-[#7B93DB] dark:to-[#9BB3FB] bg-clip-text text-transparent leading-tight">
				Bridge Your Tokens
			</h1>
			<p class="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
				Transfer tokens securely across different blockchain networks
			</p>
		</div>

		<div class="p-8 sm:p-10 text-center">
			<div class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-[#3A52A6] to-[#5A72C6] rounded-2xl flex items-center justify-center shadow-lg">
				<svg class="w-10 h-10 sm:w-12 sm:h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
			</div>
			<h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
				Wallet Not Connected
			</h2>
			<p class="text-base sm:text-lg text-gray-600 dark:text-gray-400">
				Please connect your wallet to start bridging tokens
			</p>
		</div>
	{:else}
		<!-- Network Info -->
		<div class="bg-black/40 rounded-xl border-b border-blue-200 dark:border-blue-800/30 px-4 sm:px-6 py-4">
			<div class="flex items-start sm:items-center gap-3">
				<svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold text-blue-900 dark:text-blue-300">
						Current Network: Chain ID {$chainIdStore || 'Unknown'}
					</p>
					<p class="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
						Make sure you're on the correct source network before bridging
					</p>
				</div>
			</div>
		</div>

		<div class="space-y-1 sm:space-y-2">
			<!-- Sell Container -->
			<div class="bg-white/80 dark:bg-black/40 backdrop-blur-sm border-1 border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-1">
				<div class="flex items-center gap-3 relative">
					<h3 class="text-sm sm:text-base text-gray-800 dark:text-gray-200">Sell</h3>
					<button
						type="button"
						onclick={setMaxAmount}
						disabled={tokenBalance === null}
						class="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-transparent border-1 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Max
					</button>
				</div>

				<!-- Amount -->
				<div>
					<div class="relative">
						<input
							id="amount"
							type="number"
							bind:value={amount}
							placeholder="0"
							class="w-full bg-transparent px-0 border-0 rounded-xl outline-none focus:outline-none focus:ring-0 focus:border-0 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-xl sm:text-2xl font-semibold"
						/>
					</div>
				</div>
			</div>

			<!-- Bridge Direction Indicator -->
			<div class="flex justify-center -my-4 sm:-my-5 relative z-10">
				<div class="w-9 h-9 bg-gradient-to-br from-[#3A52A6] to-[#5A72C6] rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900">
					<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
					</svg>
				</div>
			</div>

			<!-- Buy Container -->
			<div class="bg-white/80 dark:bg-black/40 backdrop-blur-sm border-1 border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-1">
				<div class="flex items-center gap-3">
					<h3 class="text-sm sm:text-base text-gray-800 dark:text-gray-200">Buy</h3>
				</div>

				<!-- Recipient Address -->
				<div class="mb-4">
					<input
						id="recipient"
						type="text"
						bind:value={recipientAddress}
						placeholder="0x..."
						class="w-full bg-transparent px-0 border-0 rounded-xl outline-none focus:outline-none focus:ring-0 focus:border-0 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg sm:text-xl font-semibold"
					/>
					<p class="mt-2 text-[11px] text-gray-500 dark:text-gray-500">
						Enter the address that will receive tokens on the destination chain
					</p>
				</div>

				<!-- Destination Chain -->
				<div>
					<label for="destChain" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
						Destination Chain
					</label>
					<select
						id="destChain"
						bind:value={destChain}
						class="w-full px-4 py-3 text-sm bg-transparent border-1 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:outline-none focus:ring-0 focus:border-0 outline-none transition-all text-gray-900 dark:text-gray-100 cursor-pointer font-medium"
					>
						<option value="sepolia">Sepolia Testnet</option>
						<option value="amoy">Polygon Amoy</option>
						<option value="localhost">Localhost</option>
					</select>
				</div>

				<!-- Redeem Option -->
				<!-- <div class="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-black/20 dark:to-black/30 border border-gray-200 dark:border-white/10 rounded-xl">
					<input
						id="redeem"
						type="checkbox"
						bind:checked={redeem}
						class="w-5 h-5 text-[#3A52A6] bg-white dark:bg-black/20 border-1 border-gray-300 dark:border-white/20 rounded focus:ring-2 focus:ring-[#3A52A6] cursor-pointer flex-shrink-0"
					/>
					<label for="redeem" class="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
						Auto-redeem tokens on destination chain
					</label>
				</div> -->
			</div>

			<!-- Messages -->
			<div class="space-y-3">
				{#if error}
					<div class="p-4 sm:p-5 bg-red-50 dark:bg-red-900/20 border-1 border-red-300 dark:border-red-800/40 rounded-xl">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<p class="text-sm font-medium text-red-700 dark:text-red-300 break-words">{error}</p>
						</div>
					</div>
				{/if}

				{#if success}
					<div class="p-4 sm:p-5 bg-green-50 dark:bg-green-900/20 border-1 border-green-300 dark:border-green-800/40 rounded-xl">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<p class="text-sm font-medium text-green-700 dark:text-green-300 break-all">{success}</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- Bridge Button -->
			<button
				onclick={handleBridge}
				disabled={isLoading}
				class="w-full py-3 cursor-pointer px-4 bg-[#3A52A6] hover:to-[#4A62B6] text-white font-semibold text-base rounded-2xl shadow-md shadow-[#3A52A6]/30 hover:shadow-lg hover:shadow-[#3A52A6]/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0"
			>
				{#if isLoading}
					<span>Processing...</span>
				{:else}
					<span>Swap</span>
				{/if}
			</button>
		</div>
	{/if}
</div>