import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("TokenBridge", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("", async function () {
    // no tests yet
  });
});
