import { task } from "hardhat/config";
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

export default {
  solidity: {
    version: "0.8.3",
    setting:{
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  path: {
    contracts: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
