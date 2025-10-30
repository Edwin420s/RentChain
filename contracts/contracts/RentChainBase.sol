// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainConstants.sol";
import "./RentChainUtils.sol";
import "./RentChainEmergency.sol";

abstract contract RentChainBase {
    using RentChainUtils for address;
    using RentChainUtils for uint256;
    using RentChainUtils for string;

    // Core state variables
    address public admin;
    bool public initialized;
    uint256 public version;

    // Emergency system reference
    RentChainEmergency public emergencySystem;

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, RentChainConstants.ERROR_NOT_ADMIN);
        _;
    }

    modifier whenNotPaused() {
        (bool systemPaused, , , , , , , ) = emergencySystem.getEmergencyStatus();
        require(!systemPaused, RentChainConstants.ERROR_SYSTEM_PAUSED);
        _;
    }

    modifier whenInitialized() {
        require(initialized, "Contract not initialized");
        _;
    }

    modifier validAddress(address addr) {
        RentChainUtils.validateAddress(addr);
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, RentChainConstants.ERROR_INVALID_AMOUNT);
        _;
    }

    // Events
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);
    event ContractUpgraded(uint256 oldVersion, uint256 newVersion);
    event EmergencySystemUpdated(address oldSystem, address newSystem);
    event ContractInitialized(address initializer, uint256 version);

    constructor(address _emergencySystem) {
        admin = msg.sender;
        emergencySystem = RentChainEmergency(_emergencySystem);
        version = 1;
    }

    // Initialization function for upgradeable contracts
    function initializeBase(address _admin, address _emergencySystem) internal {
        require(!initialized, "Already initialized");
        
        admin = _admin;
        emergencySystem = RentChainEmergency(_emergencySystem);
        initialized = true;
        version = 1;

        emit ContractInitialized(msg.sender, version);
    }

    // Admin management
    function transferAdmin(address newAdmin) external onlyAdmin validAddress(newAdmin) {
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminChanged(oldAdmin, newAdmin);
    }

    function updateEmergencySystem(address newEmergencySystem) external onlyAdmin validAddress(newEmergencySystem) {
        address oldSystem = address(emergencySystem);
        emergencySystem = RentChainEmergency(newEmergencySystem);
        emit EmergencySystemUpdated(oldSystem, newEmergencySystem);
    }

    // Version management
    function setVersion(uint256 newVersion) external onlyAdmin {
        uint256 oldVersion = version;
        version = newVersion;
        emit ContractUpgraded(oldVersion, newVersion);
    }

    // Emergency functions
    function pauseContract() external onlyAdmin {
        emergencySystem.pauseSystem(true, true, true, RentChainConstants.MAX_PAUSE_DURATION, "Admin pause");
    }

    function resumeContract() external onlyAdmin {
        emergencySystem.resumeSystem();
    }

    // Utility functions for derived contracts
    function calculatePlatformFee(uint256 amount) internal pure virtual returns (uint256) {
        return RentChainUtils.percentage(amount, RentChainConstants.PLATFORM_FEE_BP);
    }

    function calculateInsuranceFee(uint256 amount) internal pure returns (uint256) {
        return RentChainUtils.percentage(amount, RentChainConstants.INSURANCE_FEE_BP);
    }

    function validateRentalParameters(
        uint256 rentAmount,
        uint256 depositAmount,
        uint256 duration
    ) internal pure virtual {
        RentChainUtils.validateRentAmount(rentAmount);
        RentChainUtils.validateDuration(duration);
        RentChainUtils.validateDepositAmount(rentAmount, depositAmount);
    }

    function generateUniqueHash(
        address party1,
        address party2,
        uint256 uniqueId,
        uint256 timestamp
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                party1,
                party2,
                uniqueId,
                timestamp,
                block.chainid,
                address(this)
            )
        );
    }

    // Security functions
    function isContract(address account) internal view returns (bool) {
        return RentChainUtils.isContract(account);
    }

    function isValidChain() internal view returns (bool) {
        return RentChainConstants.isValidChain(block.chainid);
    }

    // State verification functions
    function isSystemPaused() public view returns (bool) {
        (bool systemPaused, , , , , , , ) = emergencySystem.getEmergencyStatus();
        return systemPaused;
    }

    function getPauseInfo() public view returns (
        bool paused,
        uint256 pauseStart,
        uint256 pauseEnd,
        string memory reason
    ) {
        (bool _paused, , , , uint256 _pauseStart, uint256 duration, string memory _reason, ) = emergencySystem.getEmergencyStatus();
        return (
            _paused,
            _pauseStart,
            _pauseStart + duration,
            _reason
        );
    }

    // Emergency withdrawal support
    function requestEmergencyWithdrawal(address token, uint256 amount) external returns (bytes32) {
        return emergencySystem.requestEmergencyWithdrawal(token, amount);
    }

    // Contract information
    function getContractInfo() external view returns (
        address contractAdmin,
        address emergencySystemAddress,
        uint256 contractVersion,
        bool isInitialized,
        bool isPaused
    ) {
        return (
            admin,
            address(emergencySystem),
            version,
            initialized,
            isSystemPaused()
        );
    }

    // Fallback function to prevent accidental ether sends
    receive() external payable virtual {
        revert("Direct ether transfers not allowed");
    }

    // Emergency recovery function
    function recoverStuckTokens(
        address token,
        uint256 amount,
        address recipient
    ) external onlyAdmin {
        require(isSystemPaused(), "System not paused");
        
        if (token == address(0)) {
            payable(recipient).transfer(amount);
        } else {
            (bool success, ) = token.call(abi.encodeWithSignature("transfer(address,uint256)", recipient, amount));
            require(success, RentChainConstants.ERROR_TRANSFER_FAILED);
        }
    }

    // Batch operations support
    function batchTransfer(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal {
        require(recipients.length == amounts.length, "Invalid input");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (token == address(0)) {
                payable(recipients[i]).transfer(amounts[i]);
            } else {
                (bool success, ) = token.call(abi.encodeWithSignature("transfer(address,uint256)", recipients[i], amounts[i]));
                require(success, RentChainConstants.ERROR_TRANSFER_FAILED);
            }
        }
    }

    // Event emission utilities
    function emitStandardEvent(string memory eventType, string memory details) internal {
        // This would emit a standardized event format
        // In production, you'd define specific event structures
    }

    // Upgrade safety checks
    function validateUpgrade(address newImplementation) internal view {
        require(newImplementation != address(0), "Invalid implementation");
        require(RentChainUtils.isContract(newImplementation), "Not a contract");
        require(!isSystemPaused(), "System paused during upgrade");
    }
}