// SPDX-License-Identifier: MIT
// SG pragma
pragma solidity ^0.8.8; 

// SG import
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// SG event

// SG error
error FundMe__NotOwner();

// SG interface

// SG library

// SG contract
contract FundMe {
    // SG type declaration
    using PriceConverter for uint256; 

    // SG state variable
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    address private i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface private s_priceFeed;

    // SG event

    // SG error

    // SG modifier
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // SG functions
    // SG constructor
    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }
    
    // SG receive
    receive() external payable {
        fund();
    }

    // SG fallback
    fallback() external payable {
        fund();
    }

    // SG external

   // SG public 
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    //cheaper withdraw
    function cheaperWithdraw() public payable onlyOwner{
        address[] memory funders = s_funders;
        for(
            uint256 funderIndex = 0;

            funderIndex < funders.length;
            funderIndex++
        ){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "Call failed!");
    }
    // SG internal

    // SG private

    // SG view
    function getOwner() public view returns(address){
        return i_owner;
    }

    function getFunder(uint256 index) public view returns(address){
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns(uint256){
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }
}

/**
 * STYLE GUIDE(SG):
 * 
 * Contract elements should be laid out in the following order:
 * 
 * Pragma statements
 * Import statements
 * Events
 * Errors
 * Interfaces
 * Libraries
 * Contracts
 * 
 * Inside each contract, library or interface, use the following order:
 * 
 * Type declarations
 * State variables
 * Events
 * Errors
 * Modifiers
 * Functions
 * 
 * Funtions' order:
 * 
 * constructor
 * receive
 * fallback
 * external
 * public
 * internal
 * private
 * view / pure
 */