// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface ISocialHub {
    function receiveTransferDetails(
        address _token,
        address _socialTrader,
        string memory _twitterHandle,
        bool _verified,
        bool _generateNewToken,
        string memory _newName,
        string memory _newSymbol,
        uint16 _newMintingFee,
        uint16 _newProfitTakeFee,
        uint16 _newWithdrawalFee
    ) external;

    function transferDetailsToSuccessor(
        address _trader,
        bool _generateNewToken,
        string memory _newName,
        string memory _newSymbol,
        uint16 _newMintingFee,
        uint16 _newProfitTakeFee,
        uint16 _newWithdrawalFee
    ) external;

    function becomeSocialTrader(
        string memory _tokenName,
        string memory _symbol,
        string memory _twitterHandle,
        uint16 _mintingFee,
        uint16 _profitTakeFee,
        uint16 _withdrawalFee
    ) external;

    function verifySocialTrader(address _socialTrader) external;

    function isSocialTrader(address _socialTrader) external view returns(bool);
}