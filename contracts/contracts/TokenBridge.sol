// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ITokenGateway, TeleportParams} from "@hyperbridge/core/contracts/apps/TokenGateway.sol";
import {StateMachine} from "@hyperbridge/core/contracts/libraries/StateMachine.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error InsufficientAmount();
error InvalidRecipient();
error InsufficientBalance();
error InsufficientAllowance();

contract TokenBridge {
    ITokenGateway public immutable tokenGateway;
    address public immutable feeToken;

    event BridgeInitiated(
        address indexed token,
        address indexed sender,
        bytes32 indexed assetId,
        bytes32 recipient,
        uint256 amount,
        bytes destChain
    );

    constructor(address _tokenGateway, address _feeToken) {
        tokenGateway = ITokenGateway(_tokenGateway);
        feeToken = _feeToken;
    }

    /// @notice Bridge tokens to another chain
    /// @param token The token address to bridge
    /// @param amount The amount to bridge
    /// @param recipient The recipient address on the destination chain
    /// @param destChain The destination chain identifier
    /// @param redeem Whether to redeem on the destination chain
    /// @param relayerFee The fee for the relayer
    /// @param timeout The timeout for the teleport function
    function bridgeTokens(
        address token,
        uint256 amount,
        address recipient,
        bytes memory destChain,
        bool redeem,
        uint256 relayerFee,
        uint64 timeout
    ) external payable {
        IERC20 erc20 = IERC20(token);
        
        if (amount == 0) revert InsufficientAmount();
        if (recipient == address(0)) revert InvalidRecipient();
        if (erc20.balanceOf(msg.sender) < amount) revert InsufficientBalance();
        if (erc20.allowance(msg.sender, address(this)) < amount) revert InsufficientAllowance();

        // Convert the token address to assetId
        bytes32 assetId = deriveAssetId(token);

        // Transfer tokens from user to this contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        // Approve the gateway to spend tokens
        IERC20(token).approve(address(tokenGateway), amount);
        // Approve the gateway to spend fee tokens (Hyperbridge fee)
        IERC20(feeToken).approve(address(tokenGateway), type(uint256).max);

        // Convert recipient address to bytes32
        bytes32 recipientBytes32 = bytes32(uint256(uint160(recipient)));

        // Create teleport parameters
        TeleportParams memory params = TeleportParams({
            amount: amount,
            relayerFee: relayerFee,
            assetId: assetId,
            redeem: redeem,
            to: recipientBytes32,
            dest: destChain,
            timeout: timeout,
            nativeCost: msg.value,
            data: ""
        });

        // Initiate the teleport
        tokenGateway.teleport{value: msg.value}(params);

        emit BridgeInitiated(
            token,
            msg.sender,
            assetId,
            recipientBytes32,
            amount,
            destChain
        );
    }

    /// @notice Derive assetId from token address
    function deriveAssetId(address token) public pure returns (bytes32) {
        return bytes32(uint256(uint160(token)));
    }
}