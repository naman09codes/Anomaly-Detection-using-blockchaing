const hre = require("hardhat");

async function main() {
  // Contract ko dhoondhna
  const BankGuard = await hre.ethers.getContractFactory("BankGuard");
  
  // Deploy karna
  const bankGuard = await BankGuard.deploy();
  await bankGuard.waitForDeployment();

  // Address print karna
  console.log("------------------------------------------");
  console.log("Mubarak Ho! Contract Address mil gaya:");
  console.log(await bankGuard.getAddress());
  console.log("------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});