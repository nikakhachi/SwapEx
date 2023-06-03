// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Math.sol";

import "hardhat/console.sol";

contract Staker is Ownable {
    event Stake(address indexed staker, uint amount, uint timestamp);
    event Withdraw(address indexed staker, uint amount, uint timestamp);

    IERC20 public immutable rewardsToken;

    constructor(address _rewardsToken) {
        rewardsToken = IERC20(_rewardsToken);
    }

    uint public totalRewardsToGive; // Total Rewards that will be given
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
        duration = _duration;
        finishAt = block.timestamp + _duration;
        rewardRate = _amount / _duration;
        lastUpdateTime = block.timestamp;
        totalRewardsToGive = _amount;
    }

    function stake() external payable {
        require(stakedBalanceOf[msg.sender] == 0);
        require(msg.value > 0);
        require(block.timestamp < finishAt);
        if (totalStaked != 0) {
            rewardPerToken +=
                ((rewardRate * (_lastApplicableTime() - lastUpdateTime)) *
                    1e18) /
                totalStaked;
            userRewardPerTokenPaid[msg.sender] = rewardPerToken;
        }
        totalStaked += msg.value;
        stakedBalanceOf[msg.sender] = msg.value;
        lastUpdateTime = block.timestamp;
        emit Stake(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() external {
        require(stakedBalanceOf[msg.sender] != 0);
        uint stakedAmount = stakedBalanceOf[msg.sender];
        rewardPerToken +=
            ((rewardRate * (_lastApplicableTime() - lastUpdateTime)) * 1e18) /
            totalStaked;
        uint rewards = (stakedAmount *
            (rewardPerToken - userRewardPerTokenPaid[msg.sender])) / 1e18;
        userRewardPerTokenPaid[msg.sender] = rewardPerToken;
        stakedBalanceOf[msg.sender] = 0;
        totalStaked -= stakedAmount;
        lastUpdateTime = _lastApplicableTime();
        userRewards[msg.sender] += rewards;
        emit Withdraw(msg.sender, stakedAmount, block.timestamp);
    }

    function _lastApplicableTime() private view returns (uint) {
        return Math.min(block.timestamp, finishAt);
    }

    function getRewards() external {
        require(userRewards[msg.sender] != 0);
        uint rewards = userRewards[msg.sender];
        userRewards[msg.sender] = 0;
        rewardsToken.transfer(msg.sender, rewards);
    }
}
