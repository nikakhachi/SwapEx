// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

error InsufficientFunds();
error InvalidAddress();
error TooManyRequests();

contract Faucet {
    event Withdraw(address indexed user, uint timestamp);

    IERC20 public token;
    uint public withdrawableAmount;
    uint public cooldown;

    mapping(address => uint) public withdrawalTimes;

    constructor(address _token, uint _withdrawableAmount, uint _cooldown) {
        token = IERC20(_token);
        withdrawableAmount = _withdrawableAmount;
        cooldown = _cooldown;
    }

    function withdraw() external {
        if (msg.sender == address(0)) revert InvalidAddress();
        if (token.balanceOf(address(this)) < withdrawableAmount)
            revert InsufficientFunds();
        if (withdrawalTimes[msg.sender] > block.timestamp)
            revert TooManyRequests();
        withdrawalTimes[msg.sender] = block.timestamp + cooldown;
        token.transfer(msg.sender, withdrawableAmount);
        emit Withdraw(msg.sender, block.timestamp);
    }
}
