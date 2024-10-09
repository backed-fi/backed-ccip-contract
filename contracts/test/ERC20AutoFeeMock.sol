/**
 * SPDX-License-Identifier: MIT
 *
 * Copyright (c) 2021-2024 Backed Finance AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Disclaimer and Terms of Use
 *
 * These ERC-20 tokens have not been registered under the U.S. Securities Act of 1933, as
 * amended or with any securities regulatory authority of any State or other jurisdiction
 * of the United States and (i) may not be offered, sold or delivered within the United States
 * to, or for the account or benefit of U.S. Persons, and (ii) may be offered, sold or otherwise
 * delivered at any time only to transferees that are Non-United States Persons (as defined by
 * the U.S. Commodities Futures Trading Commission).
 * For more information and restrictions please refer to the issuer's [Website](https://www.backedassets.fi/legal-documentation)
 */

pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev
 *
 * This token contract is following the ERC20 standard.
 * It inherits BackedTokenImplementation.sol, which is base Backed token implementation. BackedAutoFeeTokenImplementation extends it
 * with logic of multiplier, which is used for rebasing logic of the token, thus becoming rebase token itself. Additionally, it contains
 * mechanism, which changes this multiplier per configured fee periodically, on defined period length.
 * It contains one additional role:
 *  - A multiplierUpdater, that can update value of a multiplier.
 *
 */

contract ERC20AutoFeeMock is ERC20 {
    // Roles:
    address public multiplierUpdater;

    /**
     * @dev Defines ratio between a single share of a token to balance of a token.
     * Defined in 1e18 precision.
     *
     */
    uint256 public multiplier;
    uint256 public multiplierNonce;

    mapping(address => uint256) private _shares;

    uint256 internal _totalShares;

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        multiplier = 1e18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        (uint256 newMultiplier, ,) = getCurrentMultiplier();
        return _getUnderlyingAmountByShares(_totalShares, newMultiplier);
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(
        address account
    ) public view virtual override returns (uint256) {
        (uint256 newMultiplier, ,) = getCurrentMultiplier();
        return _getUnderlyingAmountByShares(sharesOf(account), newMultiplier);
    }

    /**
     * @dev Retrieves most up to date value of multiplier
     *
     */
    function getCurrentMultiplier()
        public
        view
        virtual
        returns (uint256 newMultiplier, uint256 periodsPassed, uint256 newMultiplierNonce)
    {
        newMultiplier = multiplier;
        newMultiplierNonce = multiplierNonce;
        periodsPassed = 1;
    }

    /**
     * @dev Returns amount of shares owned by given account
     */
    function sharesOf(address account) public view virtual returns (uint256) {
        return _shares[account];
    }

    /**
     * @return the amount of shares that corresponds to `_underlyingAmount` underlying amount.
     */
    function getSharesByUnderlyingAmount(
        uint256 _underlyingAmount
    ) external view returns (uint256) {
        (uint256 newMultiplier, ,) = getCurrentMultiplier();
        return _getSharesByUnderlyingAmount(_underlyingAmount, newMultiplier);
    }

    /**
     * @return the amount of underlying that corresponds to `_sharesAmount` token shares.
     */
    function getUnderlyingAmountByShares(
        uint256 _sharesAmount
    ) external view returns (uint256) {
        (uint256 newMultiplier, ,) = getCurrentMultiplier();
        return _getUnderlyingAmountByShares(_sharesAmount, newMultiplier);
    }

    /**
     * @dev Transfers underlying shares to destination account
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `sharesAmount`.
     */
    function transferShares(
        address to,
        uint256 sharesAmount
    ) external virtual returns (bool) {
        address owner = _msgSender();
        uint256 amount = _getUnderlyingAmountByShares(sharesAmount, multiplier);
        transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev Function to change the contract multiplier updater. Allowed only for owner
     *
     * Emits a { NewMultiplierUpdater } event
     *
     * @param newMultiplierUpdater The address of the new multiplier updater
     */
    function setMultiplierUpdater(
        address newMultiplierUpdater
    ) external {
        multiplierUpdater = newMultiplierUpdater;
    }

    /**
     * @dev Function to change the contract multiplier, only if oldMultiplier did not change in the meantime. Allowed only for owner
     *
     * Emits a { MultiplierChanged } event
     *
     * @param newMultiplier New multiplier value
     */
    function updateMultiplierValue(
        uint256 newMultiplier
    ) external {
        _updateMultiplier(newMultiplier, multiplierNonce + 1);
    }

    /**
     * @dev Function to change the contract multiplier, only if oldMultiplier did not change in the meantime. Allowed only for owner
     *
     * Emits a { MultiplierChanged } event
     *
     * @param newMultiplier New multiplier value
     */
    function updateMultiplierWithNonce(
        uint256 newMultiplier,
        uint256 newNonce
    ) external {
        _updateMultiplier(newMultiplier, newNonce);
    }

    /**
     * @return the amount of shares that corresponds to `_underlyingAmount` underlying amount.
     */
    function _getSharesByUnderlyingAmount(
        uint256 _underlyingAmount,
        uint256 _multiplier
    ) internal pure returns (uint256) {
        return (_underlyingAmount * 1e18) / _multiplier;
    }

    /**
     * @return the amount of underlying that corresponds to `_sharesAmount` token shares.
     */
    function _getUnderlyingAmountByShares(
        uint256 _sharesAmount,
        uint256 _multiplier
    ) internal pure returns (uint256) {
        return (_sharesAmount * _multiplier) / 1e18;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `sender` to `recipient`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     * Emits a {TransferShares} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     */
    function transfer(
        address from,
        address to,
        uint256 amount
    ) public {
        uint256 _sharesAmount = _getSharesByUnderlyingAmount(
            amount,
            multiplier
        );

        uint256 currentSenderShares = _shares[from];
        unchecked {
            _shares[from] = currentSenderShares - (_sharesAmount);
        }
        _shares[to] = _shares[to] + (_sharesAmount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     * Emits a {TransferShares} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function mint(address account, uint256 amount) public {
        uint256 sharesAmount = _getSharesByUnderlyingAmount(amount, multiplier);

        _totalShares += sharesAmount;
        _shares[account] += sharesAmount;
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     * Emits a {TransferShares} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `sharesAmount` token shares.
     */
    function burn (address account, uint256 amount) public {
        uint256 sharesAmount = _getSharesByUnderlyingAmount(amount, multiplier);

        uint256 accountBalance = _shares[account];
      
        unchecked {
            _shares[account] = accountBalance - sharesAmount;
        }
        _totalShares -= sharesAmount;
    }

    /**
     * @dev Updates currently stored multiplier with a new value
     *
     * Emit an {MultiplierUpdated} event.
     */
    function _updateMultiplier(uint256 newMultiplier, uint256 newMultiplierNonce) internal virtual {
        multiplier = newMultiplier;
        multiplierNonce = newMultiplierNonce;
    }
}
