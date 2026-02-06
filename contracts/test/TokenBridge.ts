import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { parseEther, stringToHex, type Address, type WalletClient, type PublicClient } from "viem";
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
    
    // ============================================
    // Deploy Mock ERC20 Token
    // ============================================
    const mockTokenHash = await walletClient.deployContract({
      abi: MockERC20Artifact.abi,
      bytecode: MockERC20Artifact.bytecode as `0x${string}`,
      account: deployer,
    });

    const mockTokenReceipt = await publicClient.waitForTransactionReceipt({
      hash: mockTokenHash,
    });
    mockTokenAddress = mockTokenReceipt.contractAddress!;

    // ============================================
    // Deploy Fee Token
    // ============================================
    const feeTokenHash = await walletClient.deployContract({
      abi: MockERC20Artifact.abi,
      bytecode: MockERC20Artifact.bytecode as `0x${string}`,
      account: deployer,
    });

    const feeTokenReceipt = await publicClient.waitForTransactionReceipt({
      hash: feeTokenHash,
    });
    feeTokenAddress = feeTokenReceipt.contractAddress;

    // ============================================
    // Deploy Mock Gateway
    // ============================================
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

    // ============================================
    // Deploy TokenBridge
    // ============================================
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

    // ============================================
    // Setup: Mint tokens to user
    // ============================================
    const mintHash = await walletClient.writeContract({
      address: mockTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "mint",
      args: [user, INITIAL_BALANCE],
      account: deployer,
    });
    await publicClient.waitForTransactionReceipt({ hash: mintHash });

    const mintFeeHash = await walletClient.writeContract({
      address: feeTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "mint",
      args: [user, INITIAL_BALANCE],
      account: deployer,
    });
    await publicClient.waitForTransactionReceipt({ hash: mintFeeHash });
  });
  
  it("should have test accounts", async function () {
    assert.ok(deployer, "Deployer should exist");
    assert.ok(user, "User should exist");
    assert.ok(recipient, "Recipient should exist");
  });

  it("should deploy contracts successfully", async function () {
    assert.ok(tokenBridgeAddress, "TokenBridge should be deployed");
    assert.ok(mockTokenAddress, "Mock Token should be deployed");
    assert.ok(feeTokenAddress, "Fee Token should be deployed");
    assert.ok(mockGatewayAddress, "Mock Gateway should be deployed");
  });

  it("should set correct gateway and fee token", async function () {
    const gateway = await publicClient.readContract({
      address: tokenBridgeAddress,
      abi: TokenBridgeArtifact.abi,
      functionName: "tokenGateway",
    });
    
    const feeToken = await publicClient.readContract({
      address: tokenBridgeAddress,
      abi: TokenBridgeArtifact.abi,
      functionName: "feeToken",
    });
    
    assert.equal(gateway.toLowerCase(), mockGatewayAddress.toLowerCase(), "Gateway should match");
    assert.equal(feeToken.toLowerCase(), feeTokenAddress.toLowerCase(), "Fee token should match");
  });

  it("should have correct initial balances", async function () {
    const userBalance = await publicClient.readContract({
      address: feeTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "balanceOf",
      args: [user],
    });
    
    assert.equal(userBalance, INITIAL_BALANCE, "User should haveccd initial balance");
  });

  it("should bridge tokens successfully", async function () {
    // Step 1: Check initial balance
    const initialBalance = await publicClient.readContract({
      address: mockTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "balanceOf",
      args: [user],
    });
    
    // Step 2: Approve TokenBridge to spend tokens
    const approveHash = await walletClient.writeContract({
      address: mockTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "approve",
      args: [tokenBridgeAddress, BRIDGE_AMOUNT],
      account: user,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    
    // Step 3: Bridge tokens
    const destChain = stringToHex("ethereum", { size: 32 });
    
    const bridgeHash = await walletClient.writeContract({
      address: tokenBridgeAddress,
      abi: TokenBridgeArtifact.abi,
      functionName: "bridgeTokens",
      args: [
        mockTokenAddress,     
        BRIDGE_AMOUNT,       
        recipient,            
        destChain,            
        true,                  
        RELAYER_FEE,          
        TIMEOUT,            
      ],
      account: user,
      value: parseEther("0.1"), 
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: bridgeHash 
    });
    
    // Step 4: Verify balances changed
    const finalUserBalance = await publicClient.readContract({
      address: mockTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "balanceOf",
      args: [user],
    });
    
    const bridgeBalance = await publicClient.readContract({
      address: mockTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "balanceOf",
      args: [tokenBridgeAddress],
    });
    
    assert.equal(
      finalUserBalance,
      INITIAL_BALANCE - BRIDGE_AMOUNT,
      "User balance should decrease"
    );
    
    assert.equal(
      bridgeBalance,
      BRIDGE_AMOUNT,
      "Bridge should hold tokens"
    );
    
    const logs = receipt.logs;
    assert.ok(logs.length > 0, "Should emit events");
  });

  it("should bridge with redeem false", async function () {
    const approveHash = await walletClient.writeContract({
      address: mockTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "approve",
      args: [tokenBridgeAddress, BRIDGE_AMOUNT],
      account: user,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    
    const destChain = stringToHex("bsc", { size: 32 });
    
    const bridgeHash = await walletClient.writeContract({
      address: tokenBridgeAddress,
      abi: TokenBridgeArtifact.abi,
      functionName: "bridgeTokens",
      args: [
        mockTokenAddress,
        BRIDGE_AMOUNT,
        recipient,
        destChain,
        false, 
        RELAYER_FEE,
        TIMEOUT,
      ],
      account: user,
      value: parseEther("0.1"),
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: bridgeHash 
    });
    
    assert.ok(receipt.status === "success", "Transaction should succeed");
  });

  it("should revert when amount is zero", async function () {
    const destChain = stringToHex("ethereum", { size: 32 });
    
    try {
      await walletClient.writeContract({
        address: tokenBridgeAddress,
        abi: TokenBridgeArtifact.abi,
        functionName: "bridgeTokens",
        args: [
          mockTokenAddress,
          0n, 
          recipient,
          destChain,
          true,
          RELAYER_FEE,
          TIMEOUT,
        ],
        account: user,
        value: parseEther("0.1"),
      });
      
      assert.fail("Should have reverted");
    } catch (error: any) {
      assert.ok(
        error.message.includes("InsufficientAmount") || 
        error.message.includes("revert"),
        "Should revert with InsufficientAmount"
      );
    }
  });

  it("should revert when recipient is zero address", async function () {
    const approveHash = await walletClient.writeContract({
      address: mockTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "approve",
      args: [tokenBridgeAddress, BRIDGE_AMOUNT],
      account: user,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    
    const destChain = stringToHex("ethereum", { size: 32 });
    
    try {
      await walletClient.writeContract({
        address: tokenBridgeAddress,
        abi: TokenBridgeArtifact.abi,
        functionName: "bridgeTokens",
        args: [
          mockTokenAddress,
          BRIDGE_AMOUNT,
          "0x0000000000000000000000000000000000000000",
          destChain,
          true,
          RELAYER_FEE,
          TIMEOUT,
        ],
        account: user,
        value: parseEther("0.1"),
      });
      
      assert.fail("Should have reverted");
    } catch (error: any) {
      assert.ok(
        error.message.includes("InvalidRecipient") || 
        error.message.includes("revert"),
        "Should revert with InvalidRecipient"
      );
    }
  });

  it("should revert when insufficient balance", async function () {
    const approveHash = await walletClient.writeContract({
      address: mockTokenAddress,
      abi: MockERC20Artifact.abi,
      functionName: "approve",
      args: [tokenBridgeAddress, BRIDGE_AMOUNT],
      account: user,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    const destChain = stringToHex("ethereum", { size: 32 });
    
    try {
      await walletClient.writeContract({
        address: tokenBridgeAddress,
        abi: TokenBridgeArtifact.abi,
        functionName: "bridgeTokens",
        args: [
          mockTokenAddress,
          1000n * 10n ** 18n, 
          recipient,
          destChain,
          true,
          RELAYER_FEE,
          TIMEOUT,
        ],
        account: user,
        value: parseEther("0.1"),
      });
      
      assert.fail("Should have reverted");
    } catch (error: any) {
      assert.ok(error.message.includes("revert"), "Should revert");
    }
  });

  it("should revert when insufficient allowance", async function () {
    const destChain = stringToHex("ethereum", { size: 32 });
    
    try {
      // Don't approve tokens
      await walletClient.writeContract({
        address: tokenBridgeAddress,
        abi: TokenBridgeArtifact.abi,
        functionName: "bridgeTokens",
        args: [
          mockTokenAddress,
          BRIDGE_AMOUNT,
          recipient,
          destChain,
          true,
          RELAYER_FEE,
          TIMEOUT,
        ],
        account: user,
        value: parseEther("0.1"),
      });
      
      assert.fail("Should have reverted");
    } catch (error: any) {
      assert.ok(error.message.includes("revert"), "Should revert");
    }
  });
});