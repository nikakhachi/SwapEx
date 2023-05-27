// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Lumina is ERC20 {
    constructor(uint _totalSupply) ERC20("Lumina", "LUM") {
        _mint(msg.sender, _totalSupply);
    }
}
