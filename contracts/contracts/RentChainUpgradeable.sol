// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RentChainUpgradeable {
    address public implementation;
    address public admin;
    address public pendingAdmin;
    bool public initialized;

    mapping(bytes4 => address) public delegatedFunctions;
    mapping(address => bool) public authorizedUpgraders;

    event Upgraded(address indexed implementation);
    event AdminChanged(address previousAdmin, address newAdmin);
    event FunctionDelegated(bytes4 indexed functionSelector, address delegatedTo);
    event UpgraderAuthorized(address upgrader, bool authorized);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAuthorizedUpgrader() {
        require(authorizedUpgraders[msg.sender] || msg.sender == admin, "Not authorized");
        _;
    }

    modifier whenNotInitialized() {
        require(!initialized, "Already initialized");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedUpgraders[msg.sender] = true;
    }

    function initialize(address _implementation) external whenNotInitialized {
        implementation = _implementation;
        initialized = true;
    }

    function upgradeTo(address newImplementation) external onlyAuthorizedUpgrader {
        _setImplementation(newImplementation);
    }

    function upgradeToAndCall(address newImplementation, bytes calldata data) external onlyAuthorizedUpgrader {
        _setImplementation(newImplementation);
        (bool success, ) = newImplementation.delegatecall(data);
        require(success, "Initialization call failed");
    }

    function _setImplementation(address newImplementation) internal {
        require(newImplementation != address(0), "Invalid implementation");
        implementation = newImplementation;
        emit Upgraded(newImplementation);
    }

    function delegateFunction(bytes4 functionSelector, address to) external onlyAdmin {
        delegatedFunctions[functionSelector] = to;
        emit FunctionDelegated(functionSelector, to);
    }

    function undelegateFunction(bytes4 functionSelector) external onlyAdmin {
        delegatedFunctions[functionSelector] = address(0);
        emit FunctionDelegated(functionSelector, address(0));
    }

    function authorizeUpgrader(address upgrader, bool authorized) external onlyAdmin {
        authorizedUpgraders[upgrader] = authorized;
        emit UpgraderAuthorized(upgrader, authorized);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        pendingAdmin = newAdmin;
    }

    function acceptAdmin() external {
        require(msg.sender == pendingAdmin, "Not pending admin");
        emit AdminChanged(admin, pendingAdmin);
        admin = pendingAdmin;
        pendingAdmin = address(0);
    }

    function getFunctionDelegate(bytes4 functionSelector) external view returns (address) {
        return delegatedFunctions[functionSelector];
    }

    function isAuthorizedUpgrader(address upgrader) external view returns (bool) {
        return authorizedUpgraders[upgrader];
    }

    fallback() external payable {
        address delegate = delegatedFunctions[msg.sig];
        if (delegate != address(0)) {
            (bool success, ) = delegate.delegatecall(msg.data);
            require(success, "Delegated call failed");
        } else {
            (bool success, ) = implementation.delegatecall(msg.data);
            require(success, "Implementation call failed");
        }
    }

    receive() external payable {}
}