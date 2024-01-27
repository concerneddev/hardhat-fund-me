// This files enables us to use the respecitve "address" parameter for the
// .. appropriate network to make use of the oracle data feed for the respective network.

const networkConfig = {
    31337: {
        name: "localhost",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    }, //(1)
}

const developmentChains = ["hardhat", "localhost"] //(3)

module.exports = {
    networkConfig,
    developmentChains,
}
//(2)

/*
(1)
We specify the chainId first; for that chainId, we provide the name and the priceFeed to use.
This will be loaded in the constructor argument in the contract to be deployed.

(2)
This export will help us import this file in "01-deploy-fund-me.js" by using..
.. const { networkConfig } = require("../helper-hardhat-config.js")
DECIMALS and INITIAL_ANSWER are the constructor arguments for the mock..
.. contracts. 

(3)
We defined these chains so that we can avoid deploying the mock contract..
.. "contracts/test/MockV3Aggregator.sol" on the testnet and only on the ..
.. local chain.
Furthermore, we make this ready to be exported to use in "00-deploy-mocks.s"..
.. where we will add the abovementioned functionality.

*/
