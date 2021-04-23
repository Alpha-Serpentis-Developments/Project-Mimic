// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Incentive {
    /**
     * @dev Mapping of addresses permitted to pull funds
     */
    mapping(address => bool) private permittedAddresses;
    /**
     * @dev Token to pay the incentive
     */
    IERC20 public payIn;
    /**
     * @dev Maximum allowed to pull per request
     */
    uint256 public maxPayment;
    /**
     * @dev Bool value if incentive is active
     */
    bool public active;
    /**
     * @dev Address of the admin
     */
    address public admin;

    constructor(address _tokenToPayIn, address _admin) {
        payIn = IERC20(_tokenToPayIn);
        admin = _admin;
    }

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }
    modifier onlyPermitted {
        _onlyPermitted();
        _;
    }

    function isIncentiveAvailable(
        uint256 _amount
    )
        public
        view
        returns(bool)
    {
        return _amount <= payIn.balanceOf(address(this)) && active;
    }
    function pullIncentive(
        address _receiving,
        uint256 _amount
    )
        external
        onlyPermitted
    {
        require(
            _amount <= maxPayment,
            "Incentive request too large!"
        );
        payIn.transfer(_receiving, _amount);
    }
    function changeActive(
        bool _newVal
    )
        external
        onlyAdmin
    {
        active = _newVal;
    }
    function addPermittedAddress(
        address _permitted
    )
        external
        onlyAdmin
    {
        require(
            _permitted != address(0),
            "Zero address"
        );
        permittedAddresses[_permitted] = true;
    }
    function revokePermittedAddress(
        address _revoked
    )
        external
        onlyAdmin
    {
        require(
            _revoked != address(0),
            "Zero address"
        );
        permittedAddresses[_revoked] = false;
    }
    function changePaymentToken(address _newToken) external onlyAdmin {
        require(
            _newToken != address(0),
            "Zero address"
        );
        payIn = IERC20(_newToken);
    }
    function changeAdmin(address _newAdmin) external onlyAdmin {
        require(
            _newAdmin != address(0),
            "Zero address"
        );
        admin = _newAdmin;
    }
    function _onlyAdmin() internal view {
        require(
            msg.sender == admin,
            "Unauthorized"
        );
    }
    function _onlyPermitted() internal view {
        require(
            permittedAddresses[msg.sender],
            "Unauthorized"
        );
    }

}