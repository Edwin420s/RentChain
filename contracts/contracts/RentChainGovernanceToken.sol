// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainBase.sol";
import "./RentChainConstants.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentChainGovernanceToken is RentChainBase {
    string public constant name = "RentChain Governance Token";
    string public constant symbol = "RENTG";
    uint8 public constant decimals = 18;
    
    uint256 public totalSupply;
    uint256 public maxSupply;
    address public minter;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public nonces;

    bytes32 public constant PERMIT_TYPEHASH = 
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public immutable DOMAIN_SEPARATOR;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    event MinterUpdated(address newMinter);

    modifier onlyMinter() {
        require(msg.sender == minter, "Not minter");
        _;
    }

    constructor(address _emergencySystem) RentChainBase(_emergencySystem) {
        minter = msg.sender;
        maxSupply = 100000000 * 10**18; // 100 million
        
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function mint(address to, uint256 value) external onlyMinter whenNotPaused whenInitialized {
        require(totalSupply + value <= maxSupply, "Max supply exceeded");
        
        totalSupply += value;
        balanceOf[to] += value;
        
        emit Mint(to, value);
        emit Transfer(address(0), to, value);
    }

    function burn(uint256 value) external whenNotPaused whenInitialized {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        totalSupply -= value;
        balanceOf[msg.sender] -= value;
        
        emit Burn(msg.sender, value);
        emit Transfer(msg.sender, address(0), value);
    }

    function approve(address spender, uint256 value) external whenNotPaused whenInitialized returns (bool) {
        allowance[msg.sender][spender] = value;
        
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external whenNotPaused whenInitialized returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external whenNotPaused whenInitialized returns (bool) {
        require(allowance[from][msg.sender] >= value, "Allowance exceeded");
        
        allowance[from][msg.sender] -= value;
        _transfer(from, to, value);
        
        return true;
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external whenNotPaused whenInitialized {
        require(deadline >= block.timestamp, "Permit expired");
        
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline))
            )
        );
        
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, "Invalid signature");
        
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(to != address(0), "Invalid recipient");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        
        emit Transfer(from, to, value);
    }

    function setMinter(address newMinter) external onlyAdmin {
        minter = newMinter;
        emit MinterUpdated(newMinter);
    }

    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        allowance[msg.sender][spender] += addedValue;
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        uint256 currentAllowance = allowance[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "Decreased allowance below zero");
        
        allowance[msg.sender][spender] = currentAllowance - subtractedValue;
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }

    function emergencyMint(address to, uint256 value) external onlyAdmin {
        require(isSystemPaused(), "System not paused");
        require(totalSupply + value <= maxSupply, "Max supply exceeded");
        
        totalSupply += value;
        balanceOf[to] += value;
        
        emit Mint(to, value);
        emit Transfer(address(0), to, value);
    }

    function batchTransfer(
        address[] calldata recipients,
        uint256[] calldata values
    ) external whenNotPaused whenInitialized returns (bool) {
        require(recipients.length == values.length, "Invalid input");
        
        uint256 totalValue = 0;
        for (uint256 i = 0; i < values.length; i++) {
            totalValue += values[i];
        }
        
        require(balanceOf[msg.sender] >= totalValue, "Insufficient balance");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], values[i]);
        }
        
        return true;
    }

    function getCirculatingSupply() external view returns (uint256) {
        return totalSupply - balanceOf[address(0)];
    }

    function getMaxSupply() external view returns (uint256) {
        return maxSupply;
    }

    function setMaxSupply(uint256 newMaxSupply) external onlyAdmin {
        require(newMaxSupply >= totalSupply, "New max supply too low");
        maxSupply = newMaxSupply;
    }

    function snapshot() external onlyAdmin view returns (uint256) {
        return block.number;
    }

    function multiDelegatecall(bytes[] calldata data) external onlyAdmin returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success, "Delegatecall failed");
            results[i] = result;
        }
        return results;
    }
}