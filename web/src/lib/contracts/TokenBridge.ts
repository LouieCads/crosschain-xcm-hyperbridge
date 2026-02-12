/**
 * Contract ABI 
 */
export const TOKEN_BRIDGE_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenGateway",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_feeToken",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientAmount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidRecipient",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "recipient",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "destChain",
          "type": "bytes"
        }
      ],
      "name": "BridgeInitiated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "destChain",
          "type": "bytes"
        },
        {
          "internalType": "bool",
          "name": "redeem",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "relayerFee",
          "type": "uint256"
        },
        {
          "internalType": "uint64",
          "name": "timeout",
          "type": "uint64"
        }
      ],
      "name": "bridgeTokens",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "deriveAssetId",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "feeToken",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tokenGateway",
      "outputs": [
        {
          "internalType": "contract ITokenGateway",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;
  
/**
 * Contract Addresses 
 */
export const TOKEN_BRIDGE_ADDRESSES = {
  // Hardhat localhost network (chain ID: 31337)
  hardhat: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
  // Sepolia testnet (chain ID: 11155111)
  sepolia: '0x69660dd0bbA8ce6D534c79aA666E682Eff73afB0' as `0x${string}`,
  // BSC Testnet (chain ID: 97)
  bscTestnet: '0x048c39a7f1dcD4589d5359ebD010A0dEEBBe08f0' as `0x${string}`,
} as const;

/**
 * Get contract address for a given chain ID
 */
export function getContractAddress(chainId: number): `0x${string}` | undefined {
  switch (chainId) {
    case 31337: // Hardhat localhost
      return TOKEN_BRIDGE_ADDRESSES.hardhat;
    case 11155111: // Sepolia
      return TOKEN_BRIDGE_ADDRESSES.sepolia;
    case 97: // BSC Testnet
      return TOKEN_BRIDGE_ADDRESSES.bscTestnet;
    default:
      return undefined;
  }
}
