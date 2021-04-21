// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.8.0;

/**
 * @dev Interface for Convexity Protocol's OptionsFactory
 */
interface IOptionsFactory {
    function createOptionsContract(
        address _collateral,
        address _underlying,
        address _strike,
        int32 _oTokenExchangeExp,
        uint256 _strikePrice,
        int32 _strikeExp,
        uint256 _expiry,
        uint256 _windowSize,
        string calldata _name,
        string calldata _symbol
    ) external returns(address);
    function getNumberOfOptionsContracts() external view returns(uint256);
    function whitelistAsset(address _asset) external;
}