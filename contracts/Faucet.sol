// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @dev Custom errors
error InsufficientFunds();
error InvalidAddress();
error TooManyRequests();

/// @title Faucet
/// @author Nika Khachiashvili
/// @notice A contract that allows users to withdraw ERC20 tokens in a controlled manner.
contract Faucet {
    event Withdraw(address indexed user, uint timestamp);

    /// @dev Reference to the ERC20 token contract.
    IERC20 public token;

    /// @dev Amount of tokens that can be withdrawn per request.
    uint public withdrawableAmount;

    /// @dev Cooldown period between two consecutive withdrawals for a user.
    uint public cooldown;

    /// @dev Mapping to track the last withdrawal timestamp for each user.
    mapping(address => uint) public withdrawalTimes;

    /// @dev Contract constructor.
    /// @param _token The address of the ERC20 token contract.
    /// @param _withdrawableAmount The amount of tokens that can be withdrawn per request.
    /// @param _cooldown The cooldown period between two consecutive withdrawals for a user.
    constructor(address _token, uint _withdrawableAmount, uint _cooldown) {
        token = IERC20(_token);
        withdrawableAmount = _withdrawableAmount;
        cooldown = _cooldown;
    }

    /// @dev Function to withdraw tokens from the faucet.
    /// @notice Users can call this function to withdraw tokens from the faucet.
    function withdraw() external {
        if (msg.sender == address(0)) revert InvalidAddress(); // Check if the sender address is invalid

        // Check if the faucet has insufficient funds
        if (token.balanceOf(address(this)) < withdrawableAmount)
            revert InsufficientFunds();

        // Make sure that user hasn't already withdrawn within the cooldown time
        if (withdrawalTimes[msg.sender] > block.timestamp)
            revert TooManyRequests();

        // Set the withdrawal timestamp for the user
        withdrawalTimes[msg.sender] = block.timestamp + cooldown;

        // Transfer tokens from the faucet to the user
        token.transfer(msg.sender, withdrawableAmount);

        // Emit the Withdraw event
        emit Withdraw(msg.sender, block.timestamp);
    }
}
