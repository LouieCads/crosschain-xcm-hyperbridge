<script lang="ts">
	import { isConnected, address, chainIdStore } from '$lib/wagmi/stores';
	import { bridgeTokens, type BridgeTokensParams } from '$lib/hooks/useTokenBridge';
	import { readContract } from '@wagmi/core';
	import { wagmiConfig } from '$lib/wagmi/config';
	import { MOCK_ERC20_ABI } from '$lib/contracts/MockERC20';
	import { formatTokenAmount } from '$lib/utils/format';
	import { parseUnits } from 'viem';
	import type { Address } from 'viem';

	let tokenAddress = $state('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
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
		if (tokenAddress && $isConnected && $address) {
			fetchTokenInfo();
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
			const amountBigInt = parseUnits(amount, tokenDecimals);

			const params: BridgeTokensParams = {
				token: tokenAddress as Address,
				amount: amountBigInt,
				recipient: recipientAddress as Address,
				destChain: destChain,
				redeem: redeem,
				relayerFee: 0n,
				timeout: 3600,
				nativeCost: 0n
			};

			const result = await bridgeTokens(params);
			success = `Bridge transaction successful! TX: ${result.txHash}`;
			
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

<div class="w-full max-w-4xl mx-auto space-y-8">
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
		<div class="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-[#3A52A6]/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
			<!-- Network Info -->
			<div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200 dark:border-blue-800/30 px-4 sm:px-6 py-4">
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

			<form onsubmit={(e) => { e.preventDefault(); handleBridge(); }} class="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
				<!-- Token Section -->
				<div class="space-y-5 sm:space-y-6">
					<div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
						<div class="w-10 h-10 bg-gradient-to-br from-[#3A52A6] to-[#5A72C6] rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
							<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">Token Details</h3>
					</div>

					<!-- Token Address -->
					<div>
						<label for="tokenAddress" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
							Token Address
						</label>
						<input
							id="tokenAddress"
							type="text"
							bind:value={tokenAddress}
							placeholder="0x..."
							class="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-black/30 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#3A52A6] focus:border-[#3A52A6] dark:focus:border-[#7B93DB] outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 font-mono text-sm"
						/>
						{#if tokenSymbol && tokenBalance !== null}
							<div class="mt-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
								<p class="text-sm text-green-800 dark:text-green-300">
									<span class="font-semibold">Balance:</span> 
									<span class="font-bold text-[#3A52A6] dark:text-[#7B93DB]">
										{formatTokenAmount(tokenBalance, tokenDecimals)} {tokenSymbol}
									</span>
								</p>
							</div>
						{/if}
					</div>

					<!-- Amount -->
					<div>
						<label for="amount" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
							Amount {tokenSymbol ? `(${tokenSymbol})` : ''}
						</label>
						<div class="relative">
							<input
								id="amount"
								type="text"
								bind:value={amount}
								placeholder="0.0"
								class="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-black/30 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#3A52A6] focus:border-[#3A52A6] dark:focus:border-[#7B93DB] outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base sm:text-lg font-semibold pr-20 sm:pr-24"
							/>
							<button
								type="button"
								onclick={setMaxAmount}
								disabled={tokenBalance === null}
								class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#3A52A6] to-[#5A72C6] hover:from-[#2A4296] hover:to-[#4A62B6] text-white rounded-lg text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
							>
								MAX
							</button>
						</div>
					</div>
				</div>

				<!-- Destination Section -->
				<div class="space-y-5 sm:space-y-6">
					<div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
						<div class="w-10 h-10 bg-gradient-to-br from-[#3A52A6] to-[#5A72C6] rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
							<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<h3 class="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">Destination</h3>
					</div>

					<!-- Recipient Address -->
					<div>
						<label for="recipient" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
							Recipient Address
						</label>
						<input
							id="recipient"
							type="text"
							bind:value={recipientAddress}
							placeholder="0x..."
							class="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-black/30 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#3A52A6] focus:border-[#3A52A6] dark:focus:border-[#7B93DB] outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 font-mono text-sm"
						/>
						<p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
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
							class="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-black/30 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#3A52A6] focus:border-[#3A52A6] dark:focus:border-[#7B93DB] outline-none transition-all text-gray-900 dark:text-gray-100 cursor-pointer font-medium"
						>
							<option value="sepolia">Sepolia Testnet</option>
							<option value="amoy">Polygon Amoy</option>
							<option value="localhost">Localhost</option>
						</select>
					</div>

					<!-- Redeem Option -->
					<div class="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-black/20 dark:to-black/30 border border-gray-200 dark:border-white/10 rounded-xl">
						<input
							id="redeem"
							type="checkbox"
							bind:checked={redeem}
							class="w-5 h-5 text-[#3A52A6] bg-white dark:bg-black/20 border-2 border-gray-300 dark:border-white/20 rounded focus:ring-2 focus:ring-[#3A52A6] cursor-pointer flex-shrink-0"
						/>
						<label for="redeem" class="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
							Auto-redeem tokens on destination chain
						</label>
					</div>
				</div>

				<!-- Messages -->
				<div class="space-y-3">
					{#if error}
						<div class="p-4 sm:p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800/40 rounded-xl">
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p class="text-sm font-medium text-red-700 dark:text-red-300 break-words">{error}</p>
							</div>
						</div>
					{/if}

					{#if success}
						<div class="p-4 sm:p-5 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800/40 rounded-xl">
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p class="text-sm font-medium text-green-700 dark:text-green-300 break-all">{success}</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isLoading}
					class="w-full py-4 cursor-pointer sm:py-5 px-6 bg-gradient-to-r from-[#3A52A6] to-[#5A72C6] hover:from-[#2A4296] hover:to-[#4A62B6] text-white font-bold text-base sm:text-lg rounded-xl shadow-xl shadow-[#3A52A6]/30 hover:shadow-2xl hover:shadow-[#3A52A6]/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0"
				>
					{#if isLoading}
						<svg class="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" viewBox="0 0 24 24" fill="none">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span>Processing Transaction...</span>
					{:else}
						<svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						<span>Bridge Tokens</span>
					{/if}
				</button>
			</form>
		</div>

		<!-- Feature Cards -->
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
			<div class="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-[#3A52A6]/10 dark:border-white/5 rounded-xl p-5 sm:p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
				<div class="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 bg-gradient-to-br from-[#3A52A6] to-[#5A72C6] rounded-xl flex items-center justify-center shadow-lg">
					<svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				</div>
				<h3 class="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2">Secure</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">Battle-tested smart contracts</p>
			</div>

			<div class="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-[#3A52A6]/10 dark:border-white/5 rounded-xl p-5 sm:p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
				<div class="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 bg-gradient-to-br from-[#3A52A6] to-[#5A72C6] rounded-xl flex items-center justify-center shadow-lg">
					<svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<h3 class="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2">Fast</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">Quick cross-chain transfers</p>
			</div>

			<div class="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-[#3A52A6]/10 dark:border-white/5 rounded-xl p-5 sm:p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
				<div class="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 bg-gradient-to-br from-[#3A52A6] to-[#5A72C6] rounded-xl flex items-center justify-center shadow-lg">
					<svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
				</div>
				<h3 class="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2">Trustless</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">Decentralized protocol</p>
			</div>
		</div>
	{/if}
</div>