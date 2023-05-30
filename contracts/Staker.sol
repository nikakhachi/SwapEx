// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Math.sol";

contract Staker is Ownable {
    IERC20 public immutable rewardsToken;

    constructor(address _rewardsToken) {
        rewardsToken = IERC20(_rewardsToken);
    }

    uint public rewardsSupply; // Total Supply of Rewards to Give
    uint public duration; // Duration of Rewards Given
    uint public finishAt; // End of Giving Rewards
    uint public rewardRate; // Amount of rewards to give / duration

    uint public totalStaked; // Total amount of tokens staked

    mapping(address => uint) public stakedBalanceOf; // Amount of token staked by users
    mapping(address => uint) public userRewardPerTokenPaid; // Amount of rewards paid to users
    mapping(address => uint) public userRewards; // Rewards earned by users

    uint public rewardPerToken; // Reward per token
    uint public lastUpdateTime; // Last timestamp when someone staked or withdrew

    function setRewards(uint _amount, uint _duration) external onlyOwner {
        require(finishAt < block.timestamp);
        require(_amount > 0);
        require(_duration > 0);
        require(rewardsToken.balanceOf(address(this)) >= _amount);
        rewardsSupply = _amount;
        duration = _duration;
        finishAt = block.timestamp + _duration;
        rewardRate = _amount / _duration;
        lastUpdateTime = block.timestamp;
    }

    function stake() external payable {
        require(stakedBalanceOf[msg.sender] == 0);
        require(msg.value > 0);
        if (totalStaked != 0) {
            rewardPerToken +=
                (rewardRate / totalStaked) *
                (_lastApplicableTime() - lastUpdateTime);
            uint rewards = stakedBalanceOf[msg.sender] *
                (rewardPerToken - userRewardPerTokenPaid[msg.sender]);
            userRewards[msg.sender] += rewards;
            userRewardPerTokenPaid[msg.sender] = rewardPerToken;
        }
        stakedBalanceOf[msg.sender] += msg.value;
        totalStaked += msg.value;
    }

    function withdraw(uint _amount) external {
        rewardPerToken +=
            (rewardRate / totalStaked) *
            (_lastApplicableTime() - lastUpdateTime);
        uint rewards = _amount *
            (rewardPerToken - userRewardPerTokenPaid[msg.sender]);
        userRewardPerTokenPaid[msg.sender] = rewardPerToken;
        stakedBalanceOf[msg.sender] -= _amount;
        totalStaked -= _amount;
        // rewardsToken.transfer(msg.sender, rewards);
        userRewards[msg.sender] += rewards;
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success);
    }

    function _lastApplicableTime() private view returns (uint) {
        return Math.min(block.timestamp, finishAt);
    }

    function getRewards() external {
        uint rewards = userRewards[msg.sender];
        userRewards[msg.sender] = 0;
        rewardsToken.transfer(msg.sender, rewards);
    }
}
