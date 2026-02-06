import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

export default buildModule("TokenBridgeModule", (m) => {
  const tokenGatewayAddress = m.getParameter(
    "tokenGateway",
    "0x0000000000000000000000000000000000000000" 
  );
  
  const feeTokenAddress = m.getParameter(
    "feeToken",
    "0x0000000000000000000000000000000000000000" 
  );

  const tokenBridge = m.contract("TokenBridge", [
    tokenGatewayAddress,
    feeTokenAddress,
  ]);

  return { tokenBridge };
});