// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.8.0;

/**
 * @dev Interface of Convexity's Protocol OptionsExchange contract.
 */
interface IOptionsExchange {
    function sellOTokens(
        address payable receiver,
        address oTokenAddress,
        address payoutTokenAddress,
        uint256 oTokensToSell
    ) external;
    function buyOTokens(
        address payable receiver,
        address oTokenAddress,
        address paymentTokenAddress,
        uint256 oTokensToBuy
    ) external payable;
    function premiumReceived(
        address oTokenAddress,
        address payoutTokenAddress,
        uint256 oTokensToSell
    ) external view returns(uint256);
}