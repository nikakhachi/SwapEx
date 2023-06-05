// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Math.sol";

/// @title Constant Product AMM Contract
/// @author Nika Khachiashvili
/// @notice A contract that allows users to swap tokens and provide liquidity to a token pair.
contract SwapEx is ERC20 {
    event Swap(
        address indexed swapper,
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOut,
        uint timestamp
    );
    event LiquidityAdded(
        address indexed lp,
        uint amount0,
        uint amount1,
        uint timestamp
    );
    event LiquidityRemoved(
        address indexed lp,
        uint amount0,
        uint amount1,
        uint timestamp
    );

    ERC20 public token0;
    ERC20 public token1;

    /// @dev Token Reservers are tracked in this variable
    /// @dev Nowhere in the code are we getting balance from token.balanceOf
    uint public reserve0;
    uint public reserve1;

    /// @dev Contract constructor.
    /// @param _token0 first token
    /// @param _token1 second token
    constructor(address _token0, address _token1) ERC20("SwapExLP", "SELP") {
        token0 = ERC20(_token0);
        token1 = ERC20(_token1);
    }

    /// @dev Allows users to swap tokens.
    /// @param _tokenIn The address of the input token.
    /// @param _amountIn The amount of input tokens.
    /// @return amountOut The amount of output tokens received.
    function swap(address _tokenIn, uint _amountIn) external returns (uint) {
        /// @dev Make sure _tokenIn is one of the contracts tokens
        require(
            _tokenIn == address(token0) || _tokenIn == address(token1),
            "invalid _tokenIn"
        );

        bool isToken0 = _tokenIn == address(token0);
        (ERC20 tokenIn, ERC20 tokenOut) = isToken0
            ? (token0, token1)
            : (token1, token0);

        tokenIn.transferFrom(msg.sender, address(this), _amountIn);

        uint amountOut = calculateAmountOut(_tokenIn, _amountIn);

        /// @dev We are updating like this and not like "token0.getBalance" because
        /// @dev users can manipulate the balances by directly sending funds to us and
        /// @dev therefore manipulate prices, so we always set reserves current reserve
        /// @dev plus amount in and minus amount out
        if (isToken0) {
            _update(reserve0 + _amountIn, reserve1 - amountOut);
        } else {
            _update(reserve0 - amountOut, reserve1 + _amountIn);
        }

        tokenOut.transfer(msg.sender, amountOut);
        emit Swap(
            msg.sender,
            address(tokenIn),
            address(tokenOut),
            _amountIn,
            amountOut,
            block.timestamp
        );
        return amountOut;
    }

    /// @dev Calculates the amount of output tokens for a given input token and amount.
    /// @dev Including fees
    /// @param _tokenIn The address of the input token.
    /// @param _amountIn The amount of input tokens.
    /// @return amountOut The amount of output tokens.
    function calculateAmountOut(
        address _tokenIn,
        uint _amountIn
    ) public view returns (uint) {
        /// @dev Make sure _tokenIn is one of the contracts tokens
        require(
            _tokenIn == address(token0) || _tokenIn == address(token1),
            "invalid _tokenIn"
        );

        (uint reserveIn, uint reserveOut) = _tokenIn == address(token0)
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        uint amountInWithFees = (_amountIn * 995) / 1000; /// @dev 0.5% fees

        /// @dev Calculate amount out based on constant product AMM
        /// @dev xy = k formula
        /// @dev xy = (x + x△)*(y - y△)
        /// @dev y△ = (y * x△) / (x + x△)
        uint amountOut = (reserveOut * amountInWithFees) /
            (reserveIn + amountInWithFees);

        return amountOut;
    }

    /// @dev Allows users to add liquidity by providing tokens to the pool.
    /// @param _amount0 The amount of token0 to provide.
    /// @param _amount1 The amount of token1 to provide.
    /// @return shares The number of liquidity shares received.
    function addLiquidity(
        uint _amount0,
        uint _amount1
    ) external returns (uint shares) {
        require(_amount1 > 0 && _amount0 > 0); /// @dev Make user amounts are more than 0

        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);

        /// @dev if liquidity is already present, make sure that liquidity
        /// @dev added doesn't mess the prices
        if (reserve0 > 0)
            /// @dev Calculate the ratio of liquidity that can be provided
            /// @dev with formula x△ / y△ = x / y
            require(
                _amount0 ==
                    secondTokenLiquidityAmount(address(token1), _amount1),
                "Invalid Ratio"
            );

        if (totalSupply() == 0) {
            /// @dev Liquidity/Shares = root from xy
            shares = Math.sqrt(_amount0 * _amount1);
        } else {
            /// @dev Shares = x△ / x * T = y△ / y * T
            shares = Math.min(
                (_amount0 * totalSupply()) / reserve0,
                (_amount1 * totalSupply()) / reserve1
            );
        }

        require(shares > 0);

        _mint(msg.sender, shares);

        _update(reserve0 + _amount0, reserve1 + _amount1);

        emit LiquidityAdded(msg.sender, _amount0, _amount1, block.timestamp);
    }

    /// @dev Allows users to remove liquidity from the pool.
    /// @param _shares The number of liquidity shares to remove.
    function removeLiquidity(uint _shares) public {
        require(_shares > 0);

        /// @dev Shares = x△ / x * T = y△ / y * T
        uint token0Out = (_shares * reserve0) / totalSupply();
        uint token1Out = (_shares * reserve1) / totalSupply();

        _burn(msg.sender, _shares);

        _update(reserve0 - token0Out, reserve1 - token1Out);

        token0.transfer(msg.sender, token0Out);
        token1.transfer(msg.sender, token1Out);

        emit LiquidityRemoved(
            msg.sender,
            token0Out,
            token1Out,
            block.timestamp
        );
    }

    /// @dev Allows users to remove all of their liquidity from the pool.
    function removeAllLiquidity() external {
        removeLiquidity(balanceOf(msg.sender));
    }

    /// @dev Calculates the correct amount of the second token for the ratio
    /// @dev in a liquidity pair based on the first token and its amount,
    /// @dev so that the the prices aren't manipulated
    /// @param _tokenOne The address of the first token in the pair.
    /// @param _tokenOneIn The amount of the first token.
    /// @return The amount of the second token.
    function secondTokenLiquidityAmount(
        address _tokenOne,
        uint _tokenOneIn
    ) public view returns (uint) {
        /// @dev x△ / y△ = x / y
        /// @dev x△ / y△ = x / y
        /// @dev y△ = y * x△ / x
        if (_tokenOne == address(token0)) {
            return (reserve1 * _tokenOneIn) / reserve0;
        } else if (_tokenOne == address(token1)) {
            return (reserve0 * _tokenOneIn) / reserve1;
        } else {
            revert("Invalid _tokenOne");
        }
    }

    /// @dev Updates the reserves of the token pair.
    /// @param _reserve0 The new reserve0 value.
    /// @param _reserve1 The new reserve1 value.
    function _update(uint _reserve0, uint _reserve1) private {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
    }
}
