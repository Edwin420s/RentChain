// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";



contract BatchOperations {
    address public owner;

    event BatchTransfer(address indexed from, address[] recipients, uint256[] amounts);
    event BatchApproval(address indexed owner, address[] spender, uint256[] amounts);
    event BatchPayment(address indexed payer, address[] recipients, uint256 totalAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function batchTransfer(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "Invalid input");
        
        IERC20 tokenContract = IERC20(token);
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        require(tokenContract.transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(tokenContract.transfer(recipients[i], amounts[i]), "Transfer to recipient failed");
        }

        emit BatchTransfer(msg.sender, recipients, amounts);
    }

    function batchTransferETH(address[] calldata recipients, uint256[] calldata amounts) external payable {
        require(recipients.length == amounts.length, "Invalid input");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(msg.value == totalAmount, "Incorrect ETH amount");

        for (uint256 i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(amounts[i]);
        }

        emit BatchTransfer(msg.sender, recipients, amounts);
    }

    function batchApprove(
        address token,
        address[] calldata spenders,
        uint256[] calldata amounts
    ) external {
        require(spenders.length == amounts.length, "Invalid input");

        IERC20 tokenContract = IERC20(token);
        
        for (uint256 i = 0; i < spenders.length; i++) {
            require(tokenContract.approve(spenders[i], amounts[i]), "Approval failed");
        }

        emit BatchApproval(msg.sender, spenders, amounts);
    }

    function batchRentPayment(
        address token,
        address[] calldata landlords,
        uint256[] calldata amounts,
        string memory description
    ) external {
        require(landlords.length == amounts.length, "Invalid input");

        IERC20 tokenContract = IERC20(token);
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        require(tokenContract.transferFrom(msg.sender, address(this), totalAmount), "Payment failed");

        for (uint256 i = 0; i < landlords.length; i++) {
            require(tokenContract.transfer(landlords[i], amounts[i]), "Transfer to landlord failed");
        }

        emit BatchPayment(msg.sender, landlords, totalAmount);
    }

    function batchCreateAgreements(
        address rentAgreement,
        uint256[] calldata propertyIds,
        address[] calldata tenants,
        uint256[] calldata rentAmounts,
        uint256[] calldata securityDeposits,
        uint256[] calldata startDates,
        uint256[] calldata endDates,
        address paymentToken
    ) external {
        require(propertyIds.length == tenants.length, "Invalid input");
        require(propertyIds.length == rentAmounts.length, "Invalid input");
        require(propertyIds.length == securityDeposits.length, "Invalid input");
        require(propertyIds.length == startDates.length, "Invalid input");
        require(propertyIds.length == endDates.length, "Invalid input");

        for (uint256 i = 0; i < propertyIds.length; i++) {
            (bool success, ) = rentAgreement.delegatecall(
                abi.encodeWithSignature(
                    "createAgreement(uint256,address,uint256,uint256,uint256,uint256,address)",
                    propertyIds[i],
                    tenants[i],
                    rentAmounts[i],
                    securityDeposits[i],
                    startDates[i],
                    endDates[i],
                    paymentToken
                )
            );
            require(success, "Agreement creation failed");
        }
    }

    function batchConfirmAgreements(
        address rentAgreement,
        uint256[] calldata agreementIds
    ) external {
        for (uint256 i = 0; i < agreementIds.length; i++) {
            (bool success, ) = rentAgreement.delegatecall(
                abi.encodeWithSignature("confirmAgreement(uint256)", agreementIds[i])
            );
            require(success, "Agreement confirmation failed");
        }
    }

    function batchPayRent(
        address rentAgreement,
        uint256[] calldata agreementIds,
        uint256[] calldata amounts
    ) external {
        require(agreementIds.length == amounts.length, "Invalid input");

        for (uint256 i = 0; i < agreementIds.length; i++) {
            (bool success, ) = rentAgreement.delegatecall(
                abi.encodeWithSignature("payRent(uint256,uint256)", agreementIds[i], amounts[i])
            );
            require(success, "Rent payment failed");
        }
    }

    function withdrawStuckTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }

    function withdrawStuckETH(uint256 amount) external onlyOwner {
        payable(owner).transfer(amount);
    }
}