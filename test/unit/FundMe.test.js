const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", () => {
    let fundMe
    let deployer
    let mockV3Aggregator
    let mockV3AggregatorAddress
    let fundMeAddress
    const sendValue = ethers.parseEther("1") // 1 ETH

    beforeEach(async () => {
        // deploy FundMe using hardhat-deploy
        // alt way to get accounts:
        /*
           const accounts = await ethers.getSigners()
           const accountZero = accounts[0] //(4)

           .getContract() -- deprecated!
           .getContractAt() -- use this instead!
         */
        deployer = (await getNamedAccounts()).deployer //(3)
        await deployments.fixture(["all"]) //(1)

        //(7)
        fundMeAddress = (await deployments.get("FundMe")).address
        fundMe = await ethers.getContractAt("FundMe", fundMeAddress) //(2)

        mockV3AggregatorAddress = (await deployments.get("MockV3Aggregator"))
            .address
        mockV3Aggregator = await ethers.getContractAt(
            "MockV3Aggregator",
            mockV3AggregatorAddress,
        ) //(5)
    })
    describe("constructor", () => {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3AggregatorAddress)
        }) //(6)
    })

    describe("fund", () => {
        it("fails if you dont send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!",
            )
        }) //(8)

        it("updates the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        }) //(9)

        it("adds getFunder to the array of getFunder", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getFunder(0)
            assert.equal(response, deployer)
        }) //(10)
    })

    describe("withdraw", () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraws ETH from a single founder", async () => {
            /* deprecated:
            fundMe.provider.getBalance(fundMeAddress)
            */
            // initial balances
            const initialFundMeBalance =
                await ethers.provider.getBalance(fundMeAddress)
            const initialDeployerBalance =
                await ethers.provider.getBalance(deployer)

            // withdraw funds
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // checking final balance
            const finalFundMeBalance =
                await ethers.provider.getBalance(fundMeAddress)
            const finalDeployerBalance =
                await ethers.provider.getBalance(deployer)

            assert.equal(finalFundMeBalance, 0)
            assert.equal(
                initialFundMeBalance + initialDeployerBalance,
                finalDeployerBalance + transactionReceipt.fee,
            ) //(11)
        })

        it("allows us to withdraw with multiple getFunder", async () => {
            //(12)
            const accounts = await ethers.getSigners()

            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i],
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            // initial balances

            const initialFundMeBalance =
                await ethers.provider.getBalance(fundMeAddress)
            const initialDeployerBalance =
                await ethers.provider.getBalance(deployer)

            // withdraw funds
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // checking final balance
            const finalFundMeBalance =
                await ethers.provider.getBalance(fundMeAddress)
            const finalDeployerBalance =
                await ethers.provider.getBalance(deployer)

            // checking if the transction worked
            assert.equal(finalFundMeBalance, 0)
            assert.equal(
                initialFundMeBalance + initialDeployerBalance,
                finalDeployerBalance + transactionReceipt.fee,
            )

            // making sure the getFunder are reset
            await expect(fundMe.getFunder(0)).to.be.reverted

            // making sure if the amount of all the accounts is zero
            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0,
                )
            }
        })

        it("only allows owner to withdraw", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[2]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(
                attackerConnectedContract.withdraw(),
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })

        it("cheaperWithdraw", async () => {
            //(12)
            const accounts = await ethers.getSigners()

            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i],
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            // initial balances

            const initialFundMeBalance =
                await ethers.provider.getBalance(fundMeAddress)
            const initialDeployerBalance =
                await ethers.provider.getBalance(deployer)

            // withdraw funds
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // checking final balance
            const finalFundMeBalance =
                await ethers.provider.getBalance(fundMeAddress)
            const finalDeployerBalance =
                await ethers.provider.getBalance(deployer)

            // checking if the transction worked
            assert.equal(finalFundMeBalance, 0)
            assert.equal(
                initialFundMeBalance + initialDeployerBalance,
                finalDeployerBalance + transactionReceipt.fee,
            )

            // making sure the getFunder are reset
            await expect(fundMe.getFunder(0)).to.be.reverted

            // making sure if the amount of all the accounts is zero
            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0,
                )
            }
        })

        it("withdraws ETH from a single founder", async () => {
            /* deprecated:
            fundMe.provider.getBalance(fundMeAddress)
            */
            // initial balances
            const initialFundMeBalance =
                await ethers.provider.getBalance(fundMeAddress)
            const initialDeployerBalance =
                await ethers.provider.getBalance(deployer)

            // withdraw funds
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // checking final balance
            const finalFundMeBalance =
                await ethers.provider.getBalance(fundMeAddress)
            const finalDeployerBalance =
                await ethers.provider.getBalance(deployer)

            assert.equal(finalFundMeBalance, 0)
            assert.equal(
                initialFundMeBalance + initialDeployerBalance,
                finalDeployerBalance + transactionReceipt.fee,
            ) //(11)
        })
    })
})

//custom command specified in package.json "yarn unit-test"
//"yarn hardhat test test/unit/FundMe.test.js" === "yarn unit-test"

/**
 * (1)
 *
 * .fixture() method helps us to run the deploy folder with as many..
 * .. tags as we want. We are using the "all" tag here.
 *
 * (2)
 * .getContract() method gets the most recently deployed contract..
 * .. and stores it in the fundMe variable. We wil be calling functions..
 * .. from FundMe deployed through the "deployer" account.
 *
 * (3)
 * We are getting the "deployer" account from the getNamedAccounts() and ..
 * .. storing it in the deployer variable, declared in the outer scope.
 *
 * (4)
 * This will get list of accounts specified. If using the hardhat network,
 * it will get the list of fake accounts. If using the testnet, will get..
 * .. the list of specified accounts in the hardhat config.
 *
 * (5)
 * Getting the MockV3Aggregator similarly like we did FundMe.
 *
 * (6)
 * constructor of FundMe.sol contract takes the getPriceFeed address..
 * .. and initialises "getPriceFeed" variable to the address of ..
 * .. the specific price feed.
 *
 * As this is unit testing, we are testing the contracts in the ..
 * .. developement environment, hence we are checking whether the ..
 * .. initialised address is equal to mockV3Aggregator address.
 *
 * (7)
 * We are getting the address via "deployments" because it will give the address..
 * .. of the contracts deployed through the "deployer" account!
 *
 * (8)
 * This will revert back with a message. It would fail usually without expect.
 * The expect method is from "waffle" which will override "chai" here.
 *
 * (9)
 * This uses the fund() method first, then takes the amountFunded for the "deployer"..
 * .. from the mapping "getAddressToAmountFunded".
 * Then we check if the amount of "deployer" is equal to "sendValue"
 *
 * (10)
 * This uses fund() with deployer account first, then stores first value in the getFunder array in response.
 * Then compares if the funder == deployer.
 *
 * (11)
 * initial balances in both the contract and the deployer must be equal to the final ..
 * .. balance of teh deployer. But, gas cost must be taken in consideration.
 * After the transaction, there will be imbalance in the deployer's account because..
 * .. gas is deducted. Hence, we add the gas back.
 *
 * (12)
 * As we are testing on the local environment, we are getting all the dummy accounts..
 * .. and storing it in the accounts variable using .getSigners()
 *
 * Then, we are iterating through the first 5 accounts (excluding the first one because..
 * .. its the "deployer") and then using the fund() method using that specific account.
 *
 * Then we do the same process as in the previous test.
 *
 *
 */
