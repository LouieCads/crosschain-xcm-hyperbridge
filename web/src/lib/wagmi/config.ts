import { createConfig, http } from '@wagmi/core';
import { injected } from '@wagmi/connectors';
import { hardhat, sepolia, polygonAmoy } from 'viem/chains';
import type { Config } from '@wagmi/core';

/**
 * Wagmi configuration for wallet connections
 */

const supportedChains = [hardhat, sepolia, polygonAmoy] as const;

export const wagmiConfig: Config = createConfig({
	chains: supportedChains,
	connectors: [injected()],
	transports: {
		[hardhat.id]: http('http://127.0.0.1:8545'),
		[sepolia.id]: http('https://rpc.sepolia.dev'),
		[polygonAmoy.id]: http('https://rpc-amoy.polygon.technology')
	},
	ssr: false
});
