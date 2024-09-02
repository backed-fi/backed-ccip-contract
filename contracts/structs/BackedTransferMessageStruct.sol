// SPDX-License-Identifier: MIT 
pragma solidity 0.8.19;

library BackedStructs {
    /**
     * @dev Struct to hold the decoded data from CCIP message
     * @param messageId The ID of the last received message.
     * @param receiver The address of the receiver of the transfer in last message
     * @param token The address of the token received in last message
     * @param amount The amount of the token receiver in last message
     */
    struct BackedTransferMessageStruct {
        bytes32 messageId;
        address receiver;
        address token;
        uint256 amount;
    }
}