/**
 * Contract ABI 
 */
export const MOCK_ERC20_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "host",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "dispatcher",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "InconsistentState",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidAmount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnknownAsset",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroAddress",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "commitment",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "from",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "beneficiary",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "AssetReceived",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "commitment",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "beneficiary",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "AssetRefunded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "to",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "dest",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "commitment",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
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
          "internalType": "bool",
          "name": "redeem",
          "type": "bool"
        }
      ],
      "name": "AssetTeleported",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "erc20",
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
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "erc6160",
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
      "inputs": [
        {
          "internalType": "bytes",
          "name": "destination",
          "type": "bytes"
        }
      ],
      "name": "instance",
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
      "name": "lastMsgValue",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lastTeleportParams",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "relayerFee",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bool",
              "name": "redeem",
              "type": "bool"
            },
            {
              "internalType": "bytes32",
              "name": "to",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "dest",
              "type": "bytes"
            },
            {
              "internalType": "uint64",
              "name": "timeout",
              "type": "uint64"
            },
            {
              "internalType": "uint256",
              "name": "nativeCost",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "internalType": "struct TeleportParams",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "params",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "host",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "dispatcher",
              "type": "address"
            }
          ],
          "internalType": "struct TokenGatewayParams",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "setErc20",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "relayerFee",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bool",
              "name": "redeem",
              "type": "bool"
            },
            {
              "internalType": "bytes32",
              "name": "to",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "dest",
              "type": "bytes"
            },
            {
              "internalType": "uint64",
              "name": "timeout",
              "type": "uint64"
            },
            {
              "internalType": "uint256",
              "name": "nativeCost",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "internalType": "struct TeleportParams",
          "name": "teleportParams",
          "type": "tuple"
        }
      ],
      "name": "teleport",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "teleportCalled",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;
