import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { parseEther, type Address, type WalletClient, type PublicClient } from "viem";
import { network } from "hardhat";

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
  });
  
  it("should have test accounts", async function () {
    assert.ok(deployer, "Deployer should exist");
    assert.ok(user, "User should exist");
    assert.ok(recipient, "Recipient should exist");
  });
});
