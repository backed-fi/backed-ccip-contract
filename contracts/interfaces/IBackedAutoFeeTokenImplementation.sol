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

interface IBackedAutoFeeTokenImplementation {
    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() external view returns (uint256);
    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) external view returns (uint256);
    /**
     * @dev Retrieves most up to date value of multiplier
     *
     */
    function getCurrentMultiplier() external view returns (uint256 newMultiplier, uint256 periodsPassed);
    /**
     * @dev Returns amount of shares owned by given account
     */
    function sharesOf(address account) external view returns (uint256);
    /**
     * @return the amount of shares that corresponds to `_underlyingAmount` underlying amount.
     */
    function getSharesByUnderlyingAmount(uint256 _underlyingAmount) external view returns (uint256);

    /**
     * @return the amount of underlying that corresponds to `_sharesAmount` token shares.
     */
    function getUnderlyingAmountByShares(uint256 _sharesAmount) external view returns (uint256);
    /**
     * @dev Delegated Transfer Shares, transfer shares via a sign message, using erc712.
     */
    function delegatedTransferShares(
        address owner,
        address to,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
    /**
     * @dev Transfers underlying shares to destination account
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `sharesAmount`.
     */
    function transferShares(address to, uint256 sharesAmount) external returns (bool);
    /**
     * @dev Function to set the new fee. Allowed only for owner
     *
     * @param newFeePerPeriod The new fee per period value
     */
    function updateFeePerPeriod(uint256 newFeePerPeriod) external;
    /**
     * @dev Function to change the contract multiplier updater. Allowed only for owner
     *
     * Emits a { NewMultiplierUpdater } event
     *
     * @param newMultiplierUpdater The address of the new multiplier updater
     */
    function setMultiplierUpdater(address newMultiplierUpdater) external;
    /**
     * @dev Function to change the time of last fee accrual. Allowed only for owner
     *
     * @param newLastTimeFeeApplied A timestamp of last time fee was applied
     */
    function setLastTimeFeeApplied(uint256 newLastTimeFeeApplied) external;
    /**
     * @dev Function to change period length. Allowed only for owner
     *
     * @param newPeriodLength Length of a single accrual period in seconds
     */
    function setPeriodLength(uint256 newPeriodLength) external;
    /**
     * @dev Function to change the contract multiplier, only if oldMultiplier did not change in the meantime. Allowed only for owner
     *
     * Emits a { MultiplierChanged } event
     *
     * @param newMultiplier New multiplier value
     */
    function updateMultiplierValue(uint256 newMultiplier, uint256 oldMultiplier) external;
}