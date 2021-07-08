// SPDX-License-Identifier: Apache-2.0
// SOURCE: https://github.com/airswap/airswap-protocols/blob/master/source/types/contracts/Types.sol
pragma solidity =0.8.4;
pragma experimental ABIEncoderV2;

/**
 * @title Types: Library of Swap Protocol Types and Hashes
 */
library Types {
  struct Order {
    uint256 nonce; // Unique per order and should be sequential
    uint256 expiry; // Expiry in seconds since 1 January 1970
    Party signer; // Party to the trade that sets terms
    Party sender; // Party to the trade that accepts terms
    Party affiliate; // Party compensated for facilitating (optional)
    Signature signature; // Signature of the order
  }

  struct Party {
    bytes4 kind; // Interface ID of the token
    address wallet; // Wallet address of the party
    address token; // Contract address of the token
    uint256 amount; // Amount for ERC-20 or ERC-1155
    uint256 id; // ID for ERC-721 or ERC-1155
  }

  struct Signature {
    address signatory; // Address of the wallet used to sign
    address validator; // Address of the intended swap contract
    bytes1 version; // EIP-191 signature version
    uint8 v; // `v` value of an ECDSA signature
    bytes32 r; // `r` value of an ECDSA signature
    bytes32 s; // `s` value of an ECDSA signature
  }

  bytes internal constant EIP191_HEADER = "\x19\x01";

  bytes32 internal constant DOMAIN_TYPEHASH =
    keccak256(
      abi.encodePacked(
        "EIP712Domain(",
        "string name,",
        "string version,",
        "address verifyingContract",
        ")"
      )
    );

  bytes32 internal constant ORDER_TYPEHASH =
    keccak256(
      abi.encodePacked(
        "Order(",
        "uint256 nonce,",
        "uint256 expiry,",
        "Party signer,",
        "Party sender,",
        "Party affiliate",
        ")",
        "Party(",
        "bytes4 kind,",
        "address wallet,",
        "address token,",
        "uint256 amount,",
        "uint256 id",
        ")"
      )
    );

  bytes32 internal constant PARTY_TYPEHASH =
    keccak256(
      abi.encodePacked(
        "Party(",
        "bytes4 kind,",
        "address wallet,",
        "address token,",
        "uint256 amount,",
        "uint256 id",
        ")"
      )
    );

  /**
   * @notice Hash an order into bytes32
   * @dev EIP-191 header and domain separator included
   * @param order Order The order to be hashed
   * @param domainSeparator bytes32
   * @return bytes32 A keccak256 abi.encodePacked value
   */
  function hashOrder(Order calldata order, bytes32 domainSeparator)
    external
    pure
    returns (bytes32)
  {
    return
      keccak256(
        abi.encodePacked(
          EIP191_HEADER,
          domainSeparator,
          keccak256(
            abi.encode(
              ORDER_TYPEHASH,
              order.nonce,
              order.expiry,
              keccak256(
                abi.encode(
                  PARTY_TYPEHASH,
                  order.signer.kind,
                  order.signer.wallet,
                  order.signer.token,
                  order.signer.amount,
                  order.signer.id
                )
              ),
              keccak256(
                abi.encode(
                  PARTY_TYPEHASH,
                  order.sender.kind,
                  order.sender.wallet,
                  order.sender.token,
                  order.sender.amount,
                  order.sender.id
                )
              ),
              keccak256(
                abi.encode(
                  PARTY_TYPEHASH,
                  order.affiliate.kind,
                  order.affiliate.wallet,
                  order.affiliate.token,
                  order.affiliate.amount,
                  order.affiliate.id
                )
              )
            )
          )
        )
      );
  }

  /**
   * @notice Hash domain parameters into bytes32
   * @dev Used for signature validation (EIP-712)
   * @param name bytes
   * @param version bytes
   * @param verifyingContract address
   * @return bytes32 returns a keccak256 abi.encodePacked value
   */
  function hashDomain(
    bytes calldata name,
    bytes calldata version,
    address verifyingContract
  ) external pure returns (bytes32) {
    return
      keccak256(
        abi.encode(
          DOMAIN_TYPEHASH,
          keccak256(name),
          keccak256(version),
          verifyingContract
        )
      );
  }
}