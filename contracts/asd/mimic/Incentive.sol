// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.7.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Incentive {
    /**
     * @dev Token to pay the incentive
     */
    IERC20 private payIn;
    /**
     * @dev Maximum allowed to pull per request
     */
    uint256 private maxPayment;
    /**
     * @dev Mapping of addresses permitted to pull funds
     */
    mapping(address => bool) private permittedAddresses;
    /**
     * @dev Address of the admin
     */
    address private admin;

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

    function pullIncentive(uint256 _amount) external onlyPermitted {
        payIn.transfer(msg.sender, _amount);
    }
    function addPermittedAddress(address _permitted) external onlyAdmin {
        require(
            _permitted != address(0),
            "Zero address"
        );
        permittedAddresses[_permitted] = true;
    }
    function revokePermittedAddress(address _revoked) external onlyAdmin {
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