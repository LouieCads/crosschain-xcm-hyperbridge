import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { parseEther, type Address, type WalletClient, type PublicClient } from "viem";
import { network } from "hardhat";

import MockERC20Artifact from "../artifacts/contracts/mocks/MockERC20.sol/MockERC20.json";
import MockGatewayArtifact from "../artifacts/contracts/mocks/MockTokenGateway.sol/MockTokenGateway.json";
import TokenBridgeArtifact from "../artifacts/contracts/TokenBridge.sol/TokenBridge.json";

describe("TokenBridge", async function () {
  const { viem } = await network.connect();

  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let deployer: Address;
  let user: Address;
  let recipient: Address;

  let tokenBridgeAddress: Address;
  let mockTokenAddress: Address;
  let feeTokenAddress: Address;
  let mockGatewayAddress: Address;

  const INITIAL_BALANCE = parseEther("1000");
  const BRIDGE_AMOUNT = parseEther("100");
  const RELAYER_FEE = parseEther("1");
  const TIMEOUT = 3600n;

  beforeEach(async function () {
    publicClient = await viem.getPublicClient();
    const addresses = await viem.getWalletClients();
    walletClient = addresses[0];
    
    const [account0, account1, account2] = await walletClient.getAddresses(); 
    deployer = account0;
    user = account1;
    recipient = account2;
    
    console.log("Deployer:", deployer);
    console.log("User:", user);
    console.log("Recipient:", recipient);

    console.log("\nDeploying Mock ERC20 Token...");
    const mockTokenHash = await walletClient.deployContract({
      abi: MockERC20Artifact.abi,
      bytecode: MockERC20Artifact.bytecode as `0x${string}`,
      account: deployer,
    });

    const mockTokenReceipt = await publicClient.waitForTransactionReceipt({
      hash: mockTokenHash,
    });
    mockTokenAddress = mockTokenReceipt.contractAddress!;
    console.log("Mock ERC20 Token deployed at:", mockTokenAddress);

    console.log("\nDeploying Fee Token...");
    const feeTokenHash = await walletClient.deployContract({
      abi: MockERC20Artifact.abi,
      bytecode: MockERC20Artifact.bytecode as `0x${string}`,
      account: deployer,
    });

    const feeTokenReceipt = await publicClient.waitForTransactionReceipt({
      hash: feeTokenHash,
    });
    feeTokenAddress = feeTokenReceipt.contractAddress;
    console.log("FeeToken deployed at:", feeTokenAddress)

    console.log("\nDeploying Mock Gateway...");
    const mockGatewayHash = await walletClient.deployContract({
      abi: MockGatewayArtifact.abi,
      bytecode: MockGatewayArtifact.bytecode as `0x${string}`,
      account: deployer,
      args: [
        "0x0000000000000000000000000000000000000123",
        "0x0000000000000000000000000000000000000456",
      ],
    });

    const mockGatewayReceipt = await publicClient.waitForTransactionReceipt({
      hash: mockGatewayHash,
    });
    mockGatewayAddress = mockGatewayReceipt.contractAddress!;
    console.log("Mock Gateway deployed at:", mockGatewayAddress);

    console.log("\nDeploying TokenBridge...");
    const tokenBridgeHash = await walletClient.deployContract({
      abi: TokenBridgeArtifact.abi,
      bytecode: TokenBridgeArtifact.bytecode as `0x${string}`,
      account: deployer,
      args: [
        mockGatewayAddress,
        feeTokenAddress,
      ],
    });

    const tokenBridgeReceipt = await publicClient.waitForTransactionReceipt({
      hash: tokenBridgeHash,
    });
    tokenBridgeAddress = tokenBridgeReceipt.contractAddress!;
    console.log("TokenBridge deployed at:", tokenBridgeAddress);

    const mintFeeHash = await walletClient.writeContract({
      address: feeTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "mint",
      args: [user, INITIAL_BALANCE],
      account: deployer,
    });
    await publicClient.waitForTransactionReceipt({ hash: mintFeeHash });
    console.log("\nMinted fee tokens to user\n");
  });
  
  it("should have test accounts", async function () {
    assert.ok(deployer, "Deployer should exist");
    assert.ok(user, "User should exist");
    assert.ok(recipient, "Recipient should exist");
  });
});