// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import { Bytes } from "@openzeppelin/contracts/utils/Bytes.sol";
/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract BasicMessageReceiver is CCIPReceiver {
    using Bytes for bytes;
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

        address _tokenReceiver = address(uint160(uint256(bytes32(message.data.slice(0, 32)))));
        uint64 _tokenId = uint64(bytes8(message.data.slice(32, 40)));
        uint256 _amount = uint256(bytes32(message.data.slice(40, 72)));
        TokenVariant _variant = TokenVariant(uint8(bytes1(message.data.slice(72, 73))));
        bytes memory _payload = message.data.slice(73);

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
