import { createConfig, http } from '@wagmi/core';
import { injected } from '@wagmi/connectors';
import { hardhat, sepolia } from 'viem/chains';
import type { Config } from '@wagmi/core';

/**
 * Wagmi configuration for wallet connections
 */

const supportedChains = [hardhat, sepolia] as const;

export const wagmiConfig: Config = createConfig({
	chains: supportedChains,
	connectors: [injected()],
	transports: {
		[hardhat.id]: http('http://127.0.0.1:8545'),
		[sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
	},
	ssr: false
});
