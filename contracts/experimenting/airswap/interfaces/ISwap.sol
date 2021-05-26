// SPDX-License-Identifier: Apache-2.0
// SOURCE: https://github.com/airswap/airswap-protocols/blob/master/source/swap/contracts/interfaces/ISwap.sol
pragma solidity =0.8.4;
pragma experimental ABIEncoderV2;

import "../types/Types.sol";
import "../transfers/TransferHandlerRegistry.sol";

interface ISwap {
  event Swap(
    uint256 indexed nonce,
    uint256 timestamp,
    address indexed signerWallet,
    uint256 signerAmount,
    uint256 signerId,
    address signerToken,
    address indexed senderWallet,
    uint256 senderAmount,
    uint256 senderId,
    address senderToken,
    address affiliateWallet,
    uint256 affiliateAmount,
    uint256 affiliateId,
    address affiliateToken
  );

  event Cancel(uint256 indexed nonce, address indexed signerWallet);

  event CancelUpTo(uint256 indexed nonce, address indexed signerWallet);

  event AuthorizeSender(
    address indexed authorizerAddress,
    address indexed authorizedSender
  );

  event AuthorizeSigner(
    address indexed authorizerAddress,
    address indexed authorizedSigner
  );

  event RevokeSender(
    address indexed authorizerAddress,
    address indexed revokedSender
  );

  event RevokeSigner(
    address indexed authorizerAddress,
    address indexed revokedSigner
  );

  /**
   * @notice Atomic Token Swap
   * @param order Types.Order
   */
  function swap(Types.Order calldata order) external;

  /**
   * @notice Cancel one or more open orders by nonce
   * @param nonces uint256[]
   */
  function cancel(uint256[] calldata nonces) external;

  /**
   * @notice Cancels all orders below a nonce value
   * @dev These orders can be made active by reducing the minimum nonce
   * @param minimumNonce uint256
   */
  function cancelUpTo(uint256 minimumNonce) external;

  /**
   * @notice Authorize a delegated sender
   * @param authorizedSender address
   */
  function authorizeSender(address authorizedSender) external;

  /**
   * @notice Authorize a delegated signer
   * @param authorizedSigner address
   */
  function authorizeSigner(address authorizedSigner) external;

  /**
   * @notice Revoke an authorization
   * @param authorizedSender address
   */
  function revokeSender(address authorizedSender) external;

  /**
   * @notice Revoke an authorization
   * @param authorizedSigner address
   */
  function revokeSigner(address authorizedSigner) external;

  function senderAuthorizations(address, address) external view returns (bool);

  function signerAuthorizations(address, address) external view returns (bool);

  function signerNonceStatus(address, uint256) external view returns (bytes1);

  function signerMinimumNonce(address) external view returns (uint256);

  function registry() external view returns (TransferHandlerRegistry);
}