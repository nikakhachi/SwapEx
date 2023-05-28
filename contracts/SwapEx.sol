// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Math.sol";

contract SwapEx is ERC20 {
    ERC20 public token0;
    ERC20 public token1;

    uint public reserve0;
    uint public reserve1;

    constructor(address _token0, address _token1) ERC20("SwapExLP", "SELP") {
        token0 = ERC20(_token0);
        token1 = ERC20(_token1);
    }

    function swap(address _tokenIn, uint _amountIn) external returns (uint) {
        require(
            _tokenIn == address(token0) || _tokenIn == address(token1),
            "invalid _tokenIn"
        );

        bool isToken0 = _tokenIn == address(token0);
        (
            ERC20 tokenIn,
            ERC20 tokenOut,
            uint reserveIn,
            uint reserveOut
        ) = isToken0
                ? (token0, token1, reserve0, reserve1)
                : (token1, token0, reserve1, reserve0);

        tokenIn.transferFrom(msg.sender, address(this), _amountIn);

        uint amountInWithFees = (_amountIn * 995) / 1000; // 0.5% fees
        // y△ = (y * x△) / (x + x△)
        uint amountOut = (reserveOut * amountInWithFees) /
            (reserveIn + amountInWithFees);

        // We are updating like this and not like "token0.getBalance" because
        // users can manipulate the balances by directly sending funds to us and
        // therefore manipulate prices, so we always set reserves current reserve
        // plus amount in
        if (isToken0) {
            _update(reserve0 + amountInWithFees, reserve1 - amountOut);
        } else {
            _update(reserve0 - amountOut, reserve1 + amountInWithFees);
        }

        tokenOut.transfer(msg.sender, amountOut);
        return amountOut;
    }

    // function tokenPrice(
    //     address _interestedToken
    // ) external view returns (uint price) {
    //     require(
    //         _interestedToken == address(token0) ||
    //             _interestedToken == address(token1),
    //         "invalid _tokenIn"
    //     );
    //     (uint reserveIn, uint reserveOut) = _interestedToken == address(token0)
    //         ? (reserve1, reserve0)
    //         : (reserve0, reserve1);

    //     uint amountOut = ((10 ** decimals()) * 1000) / 1000; // no fees;

    //     // x△ = (x * y△) / (y - y△)
    //     price = (reserveIn * amountOut) / (reserveOut - amountOut);
    // }

    function addLiquidity(
        uint _amount0,
        uint _amount1
    ) external returns (uint shares) {
        require(_amount1 > 0 && _amount0 > 0);

        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);

        // x△ / y△ = x / y
        if (_amount0 > 0) require(_amount0 * reserve1 == _amount1 * reserve0);

        // Liquidity = root from xy
        // Shares = x△ / x * T = y△ / y * T
        if (totalSupply() == 0) {
            shares = Math.sqrt(_amount0 * _amount1);
        } else {
            shares = Math.min(
                (_amount0 / reserve0) * totalSupply(),
                (_amount1 / reserve1) * totalSupply()
            );
        }

        require(shares > 0);

        _mint(msg.sender, shares);

        _update(reserve0 + _amount0, reserve1 + _amount1);
    }

    function removeLiquidity(uint _shares) external {
        require(_shares > 0);

        // Shares = dx / x * T = dy / y * T
        // x△ = shares * x / T
        // y△ = shares * y / T

        uint token0Out = (_shares * reserve0) / totalSupply();
        uint token1Out = (_shares * reserve1) / totalSupply();

        _burn(msg.sender, _shares);

        _update(reserve0 - token0Out, reserve1 - token1Out);

        token0.transfer(msg.sender, token0Out);
        token1.transfer(msg.sender, token1Out);
    }

    function _update(uint _reserve0, uint _reserve1) private {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
    }
}
