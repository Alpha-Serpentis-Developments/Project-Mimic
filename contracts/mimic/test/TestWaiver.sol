// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ERC1155} from "../../oz/token/ERC1155/ERC1155.sol";

// DO NOT USE IN PROD
contract TestWaiver is ERC1155 {

    error Unauthorized();

    address public immutable admin;

    uint256 public constant MERCURY = 0;
    uint256 public constant VENUS = 1;

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }

    constructor() ERC1155("ipfs.io/ipfs/QmcniBv7UQ4gGPQQW2BwbD4ZZHzN3o3tPuNLZCbBchd1zh") {
        admin = msg.sender;
    }

    function mint(address _to, uint256 _id) external onlyAdmin {
        _mint(_to, _id, 1, "");
    }

    function _onlyAdmin() internal view {
        if(msg.sender != admin)
            revert Unauthorized();
    }
}