// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {TokenBridge, InsufficientAmount, InvalidRecipient} from "./TokenBridge.sol";
import {TeleportParams} from "@hyperbridge/core/contracts/apps/TokenGateway.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockTokenGateway} from "./mocks/MockTokenGateway.sol";

contract TokenBridgeTest is Test {
  TokenBridge public tokenBridge;
  MockTokenGateway public mockGateway;
  MockERC20 public mockToken;
  MockERC20 public feeToken;

  address public user = address(0x1);
  address public recipient = address(0x2);

  uint256 constant INITIAL_BALANCE = 1000 ether;
  uint256 constant BRIDGE_AMOUNT = 100 ether;
  uint256 constant RELAYER_FEE = 1 ether;
  uint64 constant TIMEOUT = 3600;

  function setUp() public {
    mockToken = new MockERC20();
    feeToken = new MockERC20();
    mockGateway = new MockTokenGateway(address(0x123), (address(0x456)));
    tokenBridge = new TokenBridge(address(mockGateway), address(feeToken));

    mockToken.mint(user, INITIAL_BALANCE);
    feeToken.mint(user, INITIAL_BALANCE);
    vm.deal(user, 10 ether);
  }

  function test_Constructor() public view {
    assertEq(address(tokenBridge.tokenGateway()), address(mockGateway));
    assertEq(tokenBridge.feeToken(), address(feeToken));
  }

  function test_BridgeTokens_Success() public {
    vm.startPrank(user);

    mockToken.approve(address(tokenBridge), BRIDGE_AMOUNT);
    bytes memory destChain = bytes("ethereum");

    vm.expectEmit(true, true, true, true);
    emit TokenBridge.BridgeInitiated(
      address(mockToken),
      user,
      bytes32(uint256(uint160(address(mockToken)))),
      bytes32(uint256(uint160(recipient))),
      BRIDGE_AMOUNT,
      destChain
    );

    tokenBridge.bridgeTokens{value: 0.1 ether}(
      address(mockToken),
      BRIDGE_AMOUNT,
      recipient,
      destChain,
      true,
      RELAYER_FEE,
      TIMEOUT
    );

    vm.stopPrank();

    assertEq(mockToken.balanceOf(user), INITIAL_BALANCE - BRIDGE_AMOUNT);
    assertEq(mockToken.balanceOf(address(tokenBridge)), BRIDGE_AMOUNT);
    assertTrue(mockGateway.teleportCalled());
    assertEq(mockGateway.lastMsgValue(), 0.1 ether);

    TeleportParams memory params = mockGateway.lastTeleportParams();
    assertEq(params.amount, BRIDGE_AMOUNT);
    assertEq(params.relayerFee, RELAYER_FEE);
    assertEq(params.assetId, bytes32(uint256(uint160(address(mockToken)))));
    assertTrue(params.redeem);
    assertEq(params.to, bytes32(uint256(uint160(recipient))));
    assertEq(params.dest, destChain);
    assertEq(params.timeout, TIMEOUT);
    assertEq(params.nativeCost, 0.1 ether);
  }
}