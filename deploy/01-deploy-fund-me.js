/*
(1)
function deployFunc(hre){
    console.log("Hi!")
}

(2)
module.exports.default = deployFunc

*/

// alt format:
/*

(3)
module.exports = async (hre) => {
    (4)
    const { getNamedAccounts, deployments } = hre 

    above line is equivalent to:
    hre.getNamedAccounts
    hre.deployments

}
*/

/*
!IMPORTANT: CHANGE THE DIRECTORY NAME TO deploy IN WHICH THESE SCRIPTS ARE STORED.
THEN ONLY THE yarn hardhat deploy --tags mocks COMMAND WILL WORK! 
*/

const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config.js")
const { network } = require("hardhat")
const { verify } = require("../utils/verify.js")
require("dotenv").config

// even better way to write the above code:
//(5)
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts() //(6)
    const chainId = network.config.chainId //(7)

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] //(9)
    } //(11)
    //note: when going for localhost or hardhat network, we want to use a "mock" (10)

    const args = [ethUsdPriceFeedAddress]
    //(8)
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    //Verifying
    /*
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    */

    log("------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]

/*
OUTPUT:
yarn hardhat deploy --network sepolia

Nothing to compile
deploying "FundMe" (tx: 0xcbaa002a2b4d47ae2934dbcd1a535f9a920be6ed4a7b926e0aff415cc60185b2)...: deployed at 0xC063E71490dC474d7960085602B7A440620f15C6 with 901520 gas
------------------------------------------------------------------------
NOTES:
(1)
This is equivalent of writing in the deploy.js file.
We are passing the hre (hardhat runtime environment) and logging the message.

(2)
We are making the function ready to be exported and use elsewhere.

(3)
Alternative way to write this is to directly add the function by making it anoynymous...
... and making it ready for exporting.

(4)
We are loading them from the hre so we can use it

(5)
Instead of loading them separately, we can just pass them in the anonymous func..
.. and then use them below to load objects from them,

(6)
Grabbing the 'deployer' account from the named accounts ..
..specified in 'hardhat.config.js'

(7)
Grabbing the chainId 

(8)
We are using the deploy() method we loaded above and passing FundMe.sol as arg1...
...and other arguments include: 
"from"-- to see from where to deploy the contract
"args"-- constructor arguments to pass in the contract
"log"-- log the output without using console.log

(9)
This will help us use data feed addresses defined in the helper-hardhat-config.js..
.. for the specified network in the cmd.
For Eg.
yarn hardhat deploy --network sepolia

This will use the data feed address defined for the 'sepolia' netwokr in the ..
.. helper-hardhat-config.js file.

(10)
The FundMe.sol and PriceConverter.sol contracts make use of the specified ..
.. oracles. They deliver the real time price of ETH/USD. The addresses specified..
.. for their working are for respective 'testnets'. If we wish to test the working..
.. of these contracts which interact with oracles, we need "mocks". This will allow..
.. us to test the contracts locally and also supply the data from the respective oracle.
The file needed for writing these mocks is located in "deploy/00-deploy-mocks.js" folder.
This file interacts with the mock contract defined inside "contracts/test/MockV3Aggregator.sol"
This is our mock contract which will substitue the AggregatorV3Interface.sol that we use for ..
.. testnet.

(11)
We check if we are deploying on the local network, if yes then we use the previously ..
.. deployed MockV3Aggregator contract to get the feed, else, we use the helper-hardhat-config.js file to load the appropriate data feed address for the testnet.
 */
