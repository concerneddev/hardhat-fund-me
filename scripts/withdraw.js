const { deployments, ethers } = require("hardhat")

async function main() {
    const contractAddress = (await deployments.get("FundMe")).address
    const fundMe = await ethers.getContractAt("FundMe", contractAddress)
    const fundTxResponse = await fundMe.fund({
        value: ethers.parseEther("0.1"),
    })
    await fundTxResponse.wait(1)
    console.log(
        `Balance is ${await ethers.provider.getBalance(contractAddress)}`,
    )
    console.log("Withdrawing...")
    const withdrawTxresponse = await fundMe.withdraw()
    console.log(
        `Balance after withdraw is ${await ethers.provider.getBalance(
            contractAddress,
        )}`,
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

/*
!START A LOCAL NODE BEFORE RUNNING THE SCRIPT!

COMMAND:
$ yarn hardhat run scripts/withdraw.js --network localhost

Balance is 200000000000000000
Withdrawing...
Balance after withdraw is 0
Done in 4.73s.

*/
