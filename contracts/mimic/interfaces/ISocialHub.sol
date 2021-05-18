// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface ISocialHub {
    struct NewTokenSettings {
        bytes32 newName;
        bytes32 newSymbol;
        address traderManager;
        bool allowUnsafeModules;
        uint16 mintingFee;
        uint16 takeProfitFee;
        uint16 withdrawalFee;
    }
    
    function receiveTransferDetails(
        address _token,
        address _socialTrader,
        bytes32 _twitterHandle,
        bool _verified,
        bool _generateNewToken,
        NewTokenSettings memory _tokenSettings
    ) external;

    function transferDetailsToSuccessor(
        address _trader,
        bool _generateNewToken,
        bytes32 _newName,
        bytes32 _newSymbol,
        uint16 _newMintingFee,
        uint16 _newProfitTakeFee,
        uint16 _newWithdrawalFee,
        bool _allowUnsafeModules,
        address _traderManager
    ) external;

    function becomeSocialTrader(
        bytes32 _tokenName,
        bytes32 _symbol,
        bytes32 _twitterHandle,
        uint16 _mintingFee,
        uint16 _profitTakeFee,
        uint16 _withdrawalFee,
        bool _allowUnsafeModules,
        address _traderManager
    ) external;

    function verifySocialTrader(address _socialTrader) external;

    function isSocialTrader(address _socialTrader) external view returns(bool);
}