// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainConstants.sol";

library RentChainUtils {
    // Address utilities
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    function validateAddress(address addr) internal pure {
        require(addr != address(0), RentChainConstants.ERROR_INVALID_ADDRESS);
    }

    // String utilities
    function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    // Math utilities
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function percentage(uint256 amount, uint256 basisPoints) internal pure returns (uint256) {
        return (amount * basisPoints) / 10000;
    }

    // Time utilities
    function isFuture(uint256 timestamp) internal view returns (bool) {
        return timestamp > block.timestamp;
    }

    function isPast(uint256 timestamp) internal view returns (bool) {
        return timestamp < block.timestamp;
    }

    function addDays(uint256 timestamp, uint256 daysToAdd) internal pure returns (uint256) {
        return timestamp + (daysToAdd * RentChainConstants.SECONDS_PER_DAY);
    }

    function addMonths(uint256 timestamp, uint256 monthsToAdd) internal pure returns (uint256) {
        return timestamp + (monthsToAdd * RentChainConstants.SECONDS_PER_MONTH);
    }

    function getDaysBetween(uint256 from, uint256 to) internal pure returns (uint256) {
        require(to >= from, "Invalid time range");
        return (to - from) / RentChainConstants.SECONDS_PER_DAY;
    }

    // Array utilities
    function contains(address[] memory array, address value) internal pure returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                return true;
            }
        }
        return false;
    }

    function contains(uint256[] memory array, uint256 value) internal pure returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                return true;
            }
        }
        return false;
    }

    function removeAddress(address[] storage array, address value) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }

    function removeUint(uint256[] storage array, uint256 value) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }

    // Encoding utilities
    function encodePackedAddressArray(address[] memory addresses) internal pure returns (bytes memory) {
        bytes memory data;
        for (uint256 i = 0; i < addresses.length; i++) {
            data = abi.encodePacked(data, addresses[i]);
        }
        return data;
    }

    function encodePackedUintArray(uint256[] memory numbers) internal pure returns (bytes memory) {
        bytes memory data;
        for (uint256 i = 0; i < numbers.length; i++) {
            data = abi.encodePacked(data, numbers[i]);
        }
        return data;
    }

    // Validation utilities
    function validateRentAmount(uint256 amount) internal pure {
        require(amount > 0, RentChainConstants.ERROR_INVALID_AMOUNT);
        require(amount < type(uint128).max, "Rent amount too high");
    }

    function validateDuration(uint256 duration) internal pure {
        require(duration >= RentChainConstants.MIN_RENTAL_DURATION, "Duration too short");
        require(duration <= RentChainConstants.MAX_RENTAL_DURATION, "Duration too long");
    }

    function validateDepositAmount(uint256 rentAmount, uint256 depositAmount) internal pure {
        uint256 maxDeposit = rentAmount * RentChainConstants.MAX_SECURITY_DEPOSIT_MULTIPLIER;
        require(depositAmount <= maxDeposit, "Deposit too high");
    }

    // Hash utilities
    function generateAgreementHash(
        address landlord,
        address tenant,
        uint256 propertyId,
        uint256 rentAmount,
        uint256 startDate,
        uint256 endDate
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                landlord,
                tenant,
                propertyId,
                rentAmount,
                startDate,
                endDate,
                block.chainid
            )
        );
    }

    function generatePropertyHash(
        address owner,
        string memory location,
        uint256 price,
        string memory ipfsHash
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                owner,
                location,
                price,
                ipfsHash,
                block.chainid
            )
        );
    }

    // Signature verification (simplified)
    function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Invalid signature version");

        return ecrecover(hash, v, r, s);
    }

    // Safe math wrappers
    function safeAdd(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function safeSub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }

    function safeMul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function safeDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }

    // Conversion utilities
    function toWei(uint256 amount, uint8 decimals) internal pure returns (uint256) {
        return amount * (10 ** decimals);
    }

    function fromWei(uint256 amount, uint8 decimals) internal pure returns (uint256) {
        return amount / (10 ** decimals);
    }

    function normalizeAmount(uint256 amount, uint8 fromDecimals, uint8 toDecimals) internal pure returns (uint256) {
        if (fromDecimals == toDecimals) return amount;
        if (fromDecimals > toDecimals) {
            return amount / (10 ** (fromDecimals - toDecimals));
        } else {
            return amount * (10 ** (toDecimals - fromDecimals));
        }
    }
}