// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ITokenGateway, TeleportParams, TokenGatewayParams} from "@hyperbridge/core/contracts/apps/TokenGateway.sol";

contract MockTokenGateway is ITokenGateway {
    bool public teleportCalled;
    TeleportParams private _lastTeleportParams;
    uint256 public lastMsgValue;
    
    TokenGatewayParams private _params;
    mapping(bytes32 => address) private _erc20s;
    mapping(bytes32 => address) private _erc6160s;
    mapping(bytes => address) private _instances;
    
    constructor(address host, address dispatcher) {
        _params = TokenGatewayParams({
            host: host,
            dispatcher: dispatcher
        });
    }
    
    function teleport(TeleportParams calldata teleportParams) external payable {
        teleportCalled = true;
        _lastTeleportParams = teleportParams;
        lastMsgValue = msg.value;
        
        emit AssetTeleported(
            teleportParams.to,
            string(teleportParams.dest),
            teleportParams.amount,
            bytes32(0),
            msg.sender,
            teleportParams.assetId,
            teleportParams.redeem
        );
    }
    
    function lastTeleportParams() external view returns (TeleportParams memory) {
        return _lastTeleportParams;
    }
    
    function params() external view returns (TokenGatewayParams memory) {
        return _params;
    }
    
    function erc20(bytes32 assetId) external view returns (address) {
        return _erc20s[assetId];
    }
    
    function erc6160(bytes32 assetId) external view returns (address) {
        return _erc6160s[assetId];
    }
    
    function instance(bytes calldata destination) external view returns (address) {
        return _instances[destination];
    }
    
    function setErc20(bytes32 assetId, address token) external {
        _erc20s[assetId] = token;
    }
    
    function reset() external {
        teleportCalled = false;
        lastMsgValue = 0;
        delete _lastTeleportParams;
    }
}