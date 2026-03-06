// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract Exchange is EIP712 {
    using ECDSA for bytes32;
    
    bytes32 public constant ORDER_TYPEHASH = keccak256(
        "Order(address seller,address tokenA,address tokenB,uint256 amountA,uint256 amountB,uint256 expiry,uint256 nonce)"
    );
    
    struct Order {
        address seller;
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        uint256 expiry;
        uint256 nonce;
    }

    mapping(bytes32 => uint256) public filledAmountA;
    mapping(bytes32 => bool) public cancelled;

    event PublishOrder(bytes32 indexed _hash,
                address indexed _seller,
                address indexed _tokenA,
                address _tokenB,
                uint256 _amountA,
                uint256 _amountB,
                uint256 _expiry,
                uint256 _nonce,
                bytes _signature);

	constructor() EIP712("D21P2", "1") {}

    function _isValidOrder(bytes32 hash, Order calldata order, bytes memory signature) internal view returns (bool) {
        address signer = ECDSA.recover(hash, signature);
        if (signer != order.seller) return false;
        if(order.tokenA == address(0) || order.tokenB == address(0)) return false;
        if(block.timestamp > order.expiry) return false;
        return true;
    }

    function _isFillable(
        bytes32 hash,
        Order calldata order,
        bytes memory signature,
        uint256 fillAmountA
    ) internal view returns (bool) {
        if (!_isValidOrder(hash, order, signature)) return false;
        if (cancelled[hash]) return false;
        if (order.amountA <= filledAmountA[hash] || order.amountA - filledAmountA[hash] < fillAmountA) return false;
        if (order.amountA == 0) return false;

        uint256 fillAmountB = Math.mulDiv(fillAmountA, order.amountB, order.amountA, Math.Rounding.Ceil);
        if (IERC20(order.tokenA).allowance(order.seller, address(this)) < fillAmountA) return false;
        if (IERC20(order.tokenA).balanceOf(order.seller) < fillAmountA) return false;
        if (IERC20(order.tokenB).allowance(msg.sender, address(this)) < fillAmountB) return false;
        if (IERC20(order.tokenB).balanceOf(msg.sender) < fillAmountB) return false;
        return true;
    }

    function _fillOrder(
        bytes32 hash,
        Order calldata order,
        bytes memory signature,
        uint256 fillAmountA
    ) internal {
        require(_isFillable(hash, order, signature, fillAmountA), "Order not fillable");
        
        uint256 fillAmountB = Math.mulDiv(fillAmountA, order.amountB, order.amountA, Math.Rounding.Ceil);

        require(IERC20(order.tokenB).transferFrom(msg.sender, order.seller, fillAmountB), "Transfer failed");
        require(IERC20(order.tokenA).transferFrom(order.seller, msg.sender, fillAmountA), "Transfer failed");

        filledAmountA[hash] += fillAmountA;
    }

    function sellOrder(
        Order calldata order,
        bytes memory signature,
        bool shouldPublish
    ) external {
        bytes32 hash = _hashTypedDataV4(keccak256(abi.encode(ORDER_TYPEHASH, order.seller, order.tokenA, order.tokenB, order.amountA, order.amountB, order.expiry, order.nonce)));
        require(_isValidOrder(hash, order, signature), "Invalid order");

        if (shouldPublish) {
            emit PublishOrder(hash, order.seller, order.tokenA, order.tokenB, order.amountA, order.amountB, order.expiry, order.nonce, signature);
        }
    }

    function cancelOrder(
        Order calldata order,
        bytes memory signature
    ) external {
        bytes32 hash = _hashTypedDataV4(keccak256(abi.encode(ORDER_TYPEHASH, order.seller, order.tokenA, order.tokenB, order.amountA, order.amountB, order.expiry, order.nonce)));
        address signer = ECDSA.recover(hash, signature);
        require(signer == order.seller, "Invalid signature");
        require(msg.sender == order.seller, "Only seller can cancel");
        require(block.timestamp <= order.expiry, "Order has expired");
        cancelled[hash] = true;
    }

    function fillOrder(
        Order calldata order,
        bytes memory signature,
        uint256 fillAmountA
    ) external {
        require(fillAmountA > 0, "Invalid fill amount");
        bytes32 hash = _hashTypedDataV4(keccak256(abi.encode(ORDER_TYPEHASH, order.seller, order.tokenA, order.tokenB, order.amountA, order.amountB, order.expiry, order.nonce)));
        _fillOrder(hash, order, signature, fillAmountA);
    }

    function bulkFillOrders(
        Order[] calldata orders,
        bytes[] calldata signatures,
        uint256[] calldata fillAmountAs
    ) external {
        require(orders.length == signatures.length && orders.length == fillAmountAs.length, "Input array length mismatch");
        for (uint256 i = 0; i < orders.length; i++) {
            require(fillAmountAs[i] > 0, "Invalid fill amount");
            bytes32 hash = _hashTypedDataV4(keccak256(abi.encode(ORDER_TYPEHASH, orders[i].seller, orders[i].tokenA, orders[i].tokenB, orders[i].amountA, orders[i].amountB, orders[i].expiry, orders[i].nonce)));
            _fillOrder(hash, orders[i], signatures[i], fillAmountAs[i]);
        }
    }

    function isFillable(
        Order calldata order,
        bytes memory signature,
        uint256 fillAmountA
    ) external view returns (bool) {
        bytes32 hash = _hashTypedDataV4(keccak256(abi.encode(ORDER_TYPEHASH, order.seller, order.tokenA, order.tokenB, order.amountA, order.amountB, order.expiry, order.nonce)));
        return _isFillable(hash, order, signature, fillAmountA);
    }
}