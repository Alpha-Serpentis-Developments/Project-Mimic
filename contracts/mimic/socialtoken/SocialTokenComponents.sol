// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {ProtocolManager} from "../ProtocolManager.sol";
import {GeneralActions} from "../interfaces/mimic/GeneralActions.sol";
import {IOptionAdapter} from "../adapters/IOptionAdapter.sol";
import {IExchangeAdapter} from "../adapters/IExchangeAdapter.sol";
import {ILendingAdapter} from "../adapters/ILendingAdapter.sol";

import {ERC20, IERC20} from "../../oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "../../oz/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardUpgradeable} from "../../oz/security/ReentrancyGuardUpgradeable.sol";
import {OwnableUpgradeable} from "../../oz/access/OwnableUpgradeable.sol";

abstract contract SocialTokenComponents is
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    /// -- USER-DEFINED TYPES --
    type PositionSize is uint256;
    type CostBasis is uint256;

    /// -- CUSTOM ERRORS --
    error Adapter_NotTrusted();
    error Invalid_ZeroValue();
    error Invalid_TagDNE();
    error Position_AlreadyOpen();
    error Position_DidNotClose();

    /// -- STRUCTS --

    /**
     @notice The position represents what the social trader has decided to execute
     - optionalData is optional data that a position can store
     - option represents the option the position references
     - size represents the size of the option position
     - costBasis is negative if short (isLong == false) and positive if long (isLong == true) and represents how much of the denomination asset is used
     - isLong represents whether or not the position is long; if it is NOT long, size is assumed to be "negative"
     */
    struct Position {
        bytes optionalData;
        IOptionAdapter.Option option;
        PositionSize size;
        CostBasis costBasis;
        uint256 isLong;
    }

    /**
     @notice The lending position represents what the social trader has decided to execute
     - size represents the size of the position
     */
    struct LendingPosition {
        PositionSize size;
    }

    /// -- CONSTANTS --

    bytes public constant OA_TAG = "OPTIONADAPTER"; // 0x4f5054494f4e41444150544552
    bytes public constant EA_TAG = "EXCHANGEADAPTER"; // 0x45584348414e474541444150544552
    bytes public constant L_TAG = "LENDINGADAPTER"; // 0x4c454e44494e4741444150544552

    /// -- STATE VARIABLES --

    /// @notice Storage of all positions
    mapping(uint256 => Position) public positions;
    /// @notice Currently active positions - recommended to not have more than FIVE active positions
    uint256[] public activePositions;
    /// @notice The protocol manager
    address public protocolManager;
    /// @notice The token's denomination
    address public denominationAsset;
    /// @notice The option adapter
    address public optionAdapter;
    /// @notice The exchange adapter
    address public exchangeAdapter;
    /// @notice The lending adapter
    address public lendingAdapter;
    /// @notice Unique number
    uint256 public positionId;
    /// @notice The token's current uncollected fees
    uint256 public unredeemedFees;
    /// @notice The token's maximum allowed assets in the denomination asset
    uint256 public maximumAssets;
    /// @notice The token-level deposit fee
    uint16 public depositFee;
    /// @notice The token-level withdrawal fee
    uint16 public withdrawalFee;
    /// @notice The token-level management fee
    uint16 public managementFee;
    /// @notice The token-level performance fee
    uint16 public performanceFee;

    /// -- EVENTS --

    event FeeModified(bytes32 tag, uint16 newFee);
    event AdapterChanged(bytes tag, address adapter);
    event PositionOpened(uint256 id);
    event PositionModified(uint256 id);
    event PositionClosed(uint256 id);

    /// -- MODIFIERS & FUNCTIONS --

    function modifyFees(bytes32 tag, uint16 _fee)
        external
        onlyOwner
        nonReentrant
    {
        if (tag == bytes32("DEPOSIT")) {
            depositFee = _fee;
        } else if (tag == bytes32("WITHDRAWAL")) {
            withdrawalFee = _fee;
        } else if (tag == bytes32("MANAGEMENT")) {
            managementFee = _fee;
        } else if (tag == bytes32("PERFORMANCE")) {
            performanceFee = _fee;
        } else {
            revert Invalid_TagDNE();
        }

        emit FeeModified(tag, _fee);
    }

    function changeAdapter(bytes memory _tag, address _newAdapter)
        external
        onlyOwner
        nonReentrant
    {
        if (!ProtocolManager(protocolManager).isTrusted(_tag, _newAdapter))
            revert Adapter_NotTrusted();

        if (bytes32(_tag) == bytes32(OA_TAG)) {
            if (activePositions.length != 0) revert Position_DidNotClose();

            optionAdapter = _newAdapter;
        } else if (bytes32(_tag) == bytes32(EA_TAG)) {
            exchangeAdapter = _newAdapter;
        } else if (bytes32(_tag) == bytes32(L_TAG)) {
            lendingAdapter = _newAdapter;
        }
    }

    function openPosition(
        GeneralActions.Action[] memory _actions,
        Position memory _position,
        bytes[] calldata _args
    ) external onlyOwner nonReentrant {
        _openPosition(_actions, _position, _args);
    }

    function closePosition(
        GeneralActions.Action[] memory _actions,
        uint256 _position,
        bytes[] calldata _args
    ) external onlyOwner nonReentrant {
        _closePosition(_actions, _position, _args);
    }

    function modifyPosition(
        GeneralActions.Action[] memory _actions,
        uint256 _position,
        bytes[] calldata _args
    ) external onlyOwner nonReentrant {
        _modifyPosition(_actions, _position, _args);
    }

    function _openPosition(
        GeneralActions.Action[] memory _actions,
        Position memory _position,
        bytes[] memory _args
    ) internal virtual {
        if (_position.option.token == address(0)) revert Invalid_ZeroValue();

        uint256 posId = positionId++;

        Position storage pos = positions[posId];

        if (PositionSize.unwrap(pos.size) != 0) revert Position_AlreadyOpen();

        // bytes memory _optionalData = Execution._operateActions(
        //     _actions,
        //     _args,
        //     optionAdapter,
        //     exchangeAdapter,
        //     lendingAdapter
        // );

        bytes memory _optionalData = _operateActions(_actions, _args, pos);

        activePositions.push(posId);
        pos.optionalData = _optionalData;
        pos.option = _position.option;
        pos.size = _position.size;
        pos.isLong = _position.isLong;

        emit PositionOpened(posId);
    }

    function _modifyPosition(
        GeneralActions.Action[] memory _actions,
        uint256 _position,
        bytes[] calldata _args
    ) internal virtual {
        Position storage pos = positions[_position];

        // bytes memory _optionalData = Execution._operateActions(
        //     _actions,
        //     _args,
        //     optionAdapter,
        //     exchangeAdapter,
        //     lendingAdapter
        // );

        bytes memory _optionalData = _operateActions(_actions, _args, pos);
    }

    function _closePosition(
        GeneralActions.Action[] memory _actions,
        uint256 _position,
        bytes[] calldata _args
    ) internal virtual {
        Position storage pos = positions[_position];

        _operateActions(_actions, _args, pos);

        if (!_didPositionClose(pos)) {
            revert Position_DidNotClose();
        } else {
            for (uint256 i; i < activePositions.length; i++) {
                if (activePositions[i] == _position) {
                    activePositions[i] = activePositions[
                        activePositions.length - 1
                    ];
                    activePositions.pop();
                    break;
                }
            }
        }

        emit PositionClosed(_position);
    }

    /// @notice Operates the specified action(s)
    /// @dev Allows to execute the specified actions with said arguments
    /// @param _actions is an array of the provided actions
    /// @param _arguments is an array of encoded data of the arguments being passed that coincides with the action
    /// @return returnData is the data returned by the operations concatenated together in order of their operation
    function _operateActions(
        GeneralActions.Action[] memory _actions,
        bytes[] memory _arguments,
        Position storage _pos
    ) internal returns (bytes memory returnData) {
        IOptionAdapter oa = IOptionAdapter(optionAdapter);
        IExchangeAdapter ea = IExchangeAdapter(exchangeAdapter);
        ILendingAdapter la = ILendingAdapter(lendingAdapter);

        for (uint256 i; i < _actions.length; i++) {
            if (_actions[i] == GeneralActions.Action.INCREASE_ALLOWANCE) {
                (
                    address assetToApprove,
                    address approveTo,
                    uint256 amount
                ) = abi.decode(_arguments[i], (address, address, uint256));

                IERC20(assetToApprove).safeIncreaseAllowance(approveTo, amount);
            } else if (
                _actions[i] == GeneralActions.Action.DECREASE_ALLOWANCE
            ) {
                (
                    address assetToDecrease,
                    address approveTo,
                    uint256 amount
                ) = abi.decode(_arguments[i], (address, address, uint256));

                IERC20(assetToDecrease).safeDecreaseAllowance(
                    approveTo,
                    amount
                );
            } else if (_actions[i] == GeneralActions.Action.BATCH) {
                returnData = bytes.concat(
                    returnData,
                    oa.batchOperation(_arguments[i])
                );
                break;
            } else if (_actions[i] == GeneralActions.Action.ADD_COLLATERAL) {
                returnData = bytes.concat(
                    returnData,
                    oa.addCollateral(_arguments[i])
                );
            } else if (_actions[i] == GeneralActions.Action.REMOVE_COLLATERAL) {
                returnData = bytes.concat(
                    returnData,
                    oa.removeCollateral(_arguments[i])
                );
            } else if (_actions[i] == GeneralActions.Action.OPEN_VAULT) {
                returnData = bytes.concat(
                    returnData,
                    oa.openVault(_arguments[i])
                );
            } else if (_actions[i] == GeneralActions.Action.WRITE_OPTION) {
                returnData = bytes.concat(
                    returnData,
                    oa.writeOption(_arguments[i])
                );
            } else if (_actions[i] == GeneralActions.Action.BURN_OPTION) {
                returnData = bytes.concat(
                    returnData,
                    oa.burnOption(_arguments[i])
                );
            } else if (_actions[i] == GeneralActions.Action.SETTLE) {
                returnData = bytes.concat(returnData, oa.settle(_arguments[i]));
            } else if (_actions[i] == GeneralActions.Action.EXERCISE) {
                returnData = bytes.concat(
                    returnData,
                    oa.exercise(_arguments[i])
                );
            } else if (_actions[i] == GeneralActions.Action.BUY) {
                returnData = bytes.concat(returnData, ea.buy(_arguments[i]));
            } else if (_actions[i] == GeneralActions.Action.SELL) {
                returnData = bytes.concat(returnData, ea.sell(_arguments[i]));
            } else if (_actions[i] == GeneralActions.Action.LEND) {
                la.deposit(_arguments[i]);
            } else if (_actions[i] == GeneralActions.Action.WITHDRAW_LEND) {
                la.withdraw(_arguments[i]);
            }
        }

        _pos.costBasis = CostBasis.wrap(_calculateCostBasisInDenom(_pos));
    }

    function _calculateCostBasisInDenom(Position storage _pos)
        internal
        view
        virtual
        returns (uint256);

    function _didPositionClose(Position storage _position)
        internal
        view
        virtual
        returns (bool)
    {
        return PositionSize.unwrap(_position.size) == 0;
    }
}
