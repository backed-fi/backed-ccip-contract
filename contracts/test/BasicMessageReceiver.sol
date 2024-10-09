// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract BasicMessageReceiver is CCIPReceiver {
    bytes32 latestMessageId;
    address tokenReceiver;
    uint64 tokenId;
    uint256 amount;
    uint256 multiplier;
    uint256 multiplierNonce;
    TokenVariant variant;
      /// Variants of tokens that are supported by this bridge.
    enum TokenVariant {
        REGULAR,
        AUTO_FEE
    }

    constructor(address router) CCIPReceiver(router) {}

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        latestMessageId = message.messageId;

        (address _tokenReceiver, uint64 _tokenId, uint256 _amount, TokenVariant _variant, bytes memory _payload) = abi.decode(message.data, (address, uint64, uint256, TokenVariant, bytes));

        tokenReceiver = _tokenReceiver;
        tokenId = _tokenId;
        amount = _amount;
        variant = _variant;

        if (variant == TokenVariant.AUTO_FEE) {
            (uint256 _multiplier, uint256 _multiplierNonce) = abi.decode(_payload, (uint256, uint256)); 
            multiplier = _multiplier;
            multiplierNonce = _multiplierNonce;
        }
    }

    function getLatestMessageDetails()
        public
        view
        returns (bytes32, address, uint64, uint256, TokenVariant, uint256, uint256)
    {
        return (latestMessageId, tokenReceiver, tokenId, amount, variant, multiplier, multiplierNonce);
        
    }
}
