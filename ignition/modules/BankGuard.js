import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BankGuardModule", (m) => {
  const bankGuard = m.contract("BankGuard");

  return { bankGuard };
});