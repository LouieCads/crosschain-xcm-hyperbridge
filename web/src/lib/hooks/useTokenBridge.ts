import { readContract, writeContract, waitForTransactionReceipt, getConnection } from '@wagmi/core';
import type { Address } from 'viem';
import { stringToHex } from 'viem';
import { wagmiConfig } from '../wagmi/config';
import { TOKEN_BRIDGE_ABI, getContractAddress } from '../contracts/TokenBridge';

export interface BridgeTokensParams {
  token: Address;
  amount: bigint;
  recipient: Address;
  destChain: string;
  redeem?: boolean;
  relayerFee?: bigint;
  timeout?: number;
  nativeCost?: bigint;
}

export interface BridgeTokensResult {
  txHash: string;
  receipt?: any;
}

/**
 * Bridges tokens to another chain
 * @param params - Bridge parameters
 * @returns Transaction hash and receipt
 */
export async function bridgeTokens(params: BridgeTokensParams): Promise<BridgeTokensResult> {
  const {
    token,
    amount,
    recipient,
    destChain,
    redeem = true,
    relayerFee = 0n,
    timeout = 3600,
    nativeCost = 0n,
  } = params;

  const connection = getConnection(wagmiConfig);
  if (!connection.chain) {
    throw new Error('No chain connected');
  }
  if (!connection.chain.id) {
    throw new Error('No chain ID available');
  }

  const tokenBridgeAddress = getContractAddress(connection.chain.id);
  if (!tokenBridgeAddress) {
    throw new Error(`TokenBridge not deployed on chain ${connection.chain.id}`);
  }

  if (amount <= 0n) {
    throw new Error('Amount must be greater than 0');
  }

  if (!recipient || recipient === '0x0000000000000000000000000000000000000000') {
    throw new Error('Invalid recipient address');
  }

  const normalizedDest = destChain.trim().toLowerCase();
  const destChainId =
    normalizedDest === 'sepolia' ? 11155111 :
    normalizedDest === 'amoy' ? 80002 :
    normalizedDest === 'localhost' ? 31337 :
    undefined;

  const destStateMachine =
    normalizedDest.startsWith('evm-') || normalizedDest.startsWith('substrate-')
      ? destChain.trim()
      : destChainId
        ? `EVM-${destChainId}`
        : undefined;

  if (!destStateMachine) {
    throw new Error(`Unsupported destination chain "${destChain}". Expected "sepolia", "amoy", "localhost", or "EVM-<chainId>".`);
  }

  if (destChainId && destChainId === connection.chain.id) {
    throw new Error('Destination chain must be different from the source chain');
  }

  const destChainBytes = stringToHex(destStateMachine);

  // Call bridgeTokens function with explicit gas limit
  const txHash = await writeContract(wagmiConfig, {
    address: tokenBridgeAddress,
    abi: TOKEN_BRIDGE_ABI,
    functionName: 'bridgeTokens',
    args: [token, amount, recipient, destChainBytes, redeem, relayerFee, BigInt(timeout)],
    value: nativeCost, // Include native cost if needed
  });

  // Wait for transaction receipt
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
  if (receipt.status !== 'success') {
    throw new Error(`Bridge transaction reverted: ${txHash}`);
  }

  return { txHash, receipt };
}