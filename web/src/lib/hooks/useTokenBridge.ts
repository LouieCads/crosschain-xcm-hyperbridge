import { readContract, writeContract, waitForTransactionReceipt, getConnection } from '@wagmi/core';
import type { Address } from 'viem';
import { stringToHex } from 'viem';
import { wagmiConfig } from '../wagmi/config';
import { TOKEN_BRIDGE_ABI, getContractAddress } from '../contracts/TokenBridge';
import { MOCK_ERC20_ABI } from '../contracts/MockERC20';

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

  // Step 1: Approve token spending
  await writeContract(wagmiConfig, {
    address: token,
    abi: MOCK_ERC20_ABI,
    functionName: 'approve',
    args: [tokenBridgeAddress, amount],
  });

  // Step 2: Convert destination chain to bytes
  const destChainBytes = stringToHex(destChain);

  // Step 3: Call bridgeTokens function
  const txHash = await writeContract(wagmiConfig, {
    address: tokenBridgeAddress,
    abi: TOKEN_BRIDGE_ABI,
    functionName: 'bridgeTokens',
    args: [token, amount, recipient, destChainBytes, redeem, relayerFee, BigInt(timeout)],
  });

  // Step 4: Wait for transaction receipt
  const receipt = await waitForTransactionReceipt(wagmiConfig, {
    hash: txHash,
  }).catch(() => null); 

  return { txHash, receipt };
}