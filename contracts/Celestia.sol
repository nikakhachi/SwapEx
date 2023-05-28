// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Celestia is ERC20 {
    constructor(uint _initialSupply) ERC20("Celestia", "CEL") {
        _mint(msg.sender, _initialSupply);
    }
}
