/*
!IMPORTANT: CHANGE THE DIRECTORY NAME TO deploy IN WHICH THESE SCRIPTS ARE STORED.
THEN ONLY THE yarn hardhat deploy --tags mocks COMMAND WILL WORK! 
*/

const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const DECIMALS = "8"
const INITIAL_PRICE = "200000000000" // 2000
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // If we are on a local development network, we need to deploy mocks!
    if (developmentChains.includes(network.name)) {
        //(1)
        console.log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        }) //(2)
        log("Mocks Deployed!")
        log("------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]

/*
(1)
We check if the loaded chainId is present in the developmentChains object we..
.. loaded. If it is present in it, we are deploying contracts locally.
Hence, we will use the mock contract, hence we deploy MockV3Aggregator.sol

(2)
We have to supply the constructor arguments in the deploy() method as we did..
.. in the 01-deploy-fund-me.js script. The DECIMALS and INITIAL_ANSWER arguments..
.. are the ones needed. We define them in the helper-hardhat-config.js file first..
.. and load it from there.
DECIMALS = 8
INITIAL_ANSWER = 200000000000


OUTPUT:
yarn hardhat deploy --tags mocks

Nothing to compile
Before conditional check
Local network detected! Deploying mocks...
deploying "MockV3Aggregator" (tx: 0x3d732abdeda8235691578f5eae48ec57c18e6860c18196ab7b211ca8f74dce2b)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 569759 gas
Mocks Deployed!
------------------------------------------------
Done in 5.07s.

MockV3Aggregator is deploying correctly!
*/
