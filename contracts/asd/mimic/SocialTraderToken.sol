// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "../ERC677/ERC677.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

// !!! TODO: ADD BURNABLE FUNCTIONS !!!
contract SocialTraderToken is ERC677 {
    using SafeMath for uint256;
    /**
     * @dev Address of the token for fees
     */
    address public FEE_TOKEN_ADDRESS;
    /**
     * @dev Fee for minting tokens
     * FEE_PER_TOKEN represents 1.00... token
     * FEE = FEE_PER_TOKEN * # of tokens
     */
    uint256 public FEE_PER_TOKEN;
    /**
     * @dev Minimum amount to mint new Social Trader tokens
     */
    uint256 public MINIMUM_MINT;
    /**
     * @dev Address of the social trader associated with this token
     */
    address immutable public socialTrader;
    /**
     * @dev Allow to mint new tokens
     */
    bool public allowNewMints = true;

    constructor(
        address _socialTrader, 
        string memory _name, 
        string memory _symbol, 
        uint8 _decimals,
        address _FEE_TOKEN_ADDRESS,
        uint256 _FEE_PER_TOKEN,
        uint256 _MINIMUM_MINT
    ) 
        ERC677(_name, _symbol) 
    {
        require(
            _socialTrader != address(0)
        );
        if(_FEE_PER_TOKEN > 0) {
            require(
                _FEE_TOKEN_ADDRESS != address(0)
            );
        }
        socialTrader = _socialTrader;
        FEE_TOKEN_ADDRESS = _FEE_TOKEN_ADDRESS;
        FEE_PER_TOKEN = _FEE_PER_TOKEN;
        MINIMUM_MINT = _MINIMUM_MINT;
        _setupDecimals(_decimals);
    }

    modifier onlySocialTrader {
        _onlySocialTrader();
        _;
    }
    modifier onlyFollower {
        _onlyFollower();
        _;
    }
    function mintTokens(uint256 _amount) public {
        require(
            allowNewMints,
            "Mints not allowed"
        );
        require(
            _amount >= MINIMUM_MINT
        );
        _chargeFee(_amount);
    }
    function redeemFees() public onlySocialTrader {
        IERC20 token = IERC20(FEE_TOKEN_ADDRESS);
        token.transfer(socialTrader, token.balanceOf(address(this)));
    }
    function changeFee(uint256 _amount) public onlySocialTrader {
        if(_amount > 0) {
            require(
                FEE_TOKEN_ADDRESS != address(0)
            );
        }
        FEE_PER_TOKEN = _amount;
    }
    function changeFeeToken(address _token) public onlySocialTrader {
        FEE_TOKEN_ADDRESS = _token;
    }
    function isFollower(address _account) public view returns(bool) {
        return balanceOf(_account) > 0;
    } 
    function _onlySocialTrader() internal view {
        require(
            msg.sender == socialTrader,
            "Not authorized"
        );
    }
    function _onlyFollower() internal view {
        require(
            balanceOf(msg.sender) > 0,
            "Not a follower"
        );
    }
    function _chargeFee(uint256 _minted) internal {
        transferFrom(msg.sender, address(this), _minted.mul(FEE_PER_TOKEN));
    }

}
