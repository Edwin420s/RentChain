// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainBase.sol";

contract RentChainUpgradeableProxy is RentChainBase {
    bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    bytes32 private constant _ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    event Upgraded(address indexed implementation);
    event AdminChanged(address previousAdmin, address newAdmin);

    constructor(address _logic, address _admin, bytes memory _data) RentChainBase(address(0)) {
        _setImplementation(_logic);
        _setAdmin(_admin);
        if (_data.length > 0) {
            (bool success,) = _logic.delegatecall(_data);
            require(success, "Initialization failed");
        }
    }

    modifier onlyProxyAdmin() {
        require(msg.sender == _getAdmin(), "Not proxy admin");
        _;
    }

    function _getImplementation() internal view returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }

    function _setImplementation(address newImplementation) private {
        require(Address.isContract(newImplementation), "Not a contract");
        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
    }

    function _getAdmin() internal view returns (address) {
        return StorageSlot.getAddressSlot(_ADMIN_SLOT).value;
    }

    function _setAdmin(address newAdmin) private {
        require(newAdmin != address(0), "Invalid admin");
        StorageSlot.getAddressSlot(_ADMIN_SLOT).value = newAdmin;
    }

    function upgradeTo(address newImplementation) external onlyProxyAdmin {
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable onlyProxyAdmin {
        _setImplementation(newImplementation);
        (bool success,) = newImplementation.delegatecall(data);
        require(success, "Call failed");
        emit Upgraded(newImplementation);
    }

    function changeAdmin(address newAdmin) external onlyProxyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        _setAdmin(newAdmin);
        emit AdminChanged(_getAdmin(), newAdmin);
    }

    function implementation() external view returns (address) {
        return _getImplementation();
    }

    function getProxyAdmin() external view returns (address) {
        return _getAdmin();
    }

    receive() external payable override {
        _delegate(_getImplementation());
    }

    fallback() external payable {
        _delegate(_getImplementation());
    }

    function _delegate(address _implementation) internal {
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), _implementation, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}

library Address {
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
}

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly {
            r.slot := slot
        }
    }
}