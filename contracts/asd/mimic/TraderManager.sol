// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.8.0;

contract TraderManager {
    struct SocialTrader {
        mapping(address => Follower) followers;
        address user;
        address socialTraderToken;
        bool verified;
    }
    struct Follower {
        address user;
    }

    mapping(address => SocialTrader) private listOfSocialTraders;
    address private admin;

    constructor(address _admin) {
        require(
            _admin != address(0)
        );
        admin = _admin;
    }

    modifier onlyAdmin {
        onlyAdminCheck();
        _;
    }

    function followSocialTrader(address _socialTrader) external {
        require(
            listOfSocialTraders[_socialTrader].user != address(0),
            "Invalid social trader"
        );
    }
    function verifySocialTrader(address _user) external onlyAdmin {
        require(
            listOfSocialTraders[_user].user != address(0)
        );
        listOfSocialTraders[_user].verified = true;
    }
    function onlyAdminCheck() internal view {
        require(
            msg.sender == admin,
            "Not admin"
        );
    }

}