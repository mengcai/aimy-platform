// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AIMYSecurityToken.sol";
import "../interfaces/IAIMYSecurityToken.sol";

/**
 * @title SolarFarm3643
 * @dev Example ERC-3643 compliant security token for a solar farm asset
 * @notice Demonstrates the AIMY security token implementation with solar-specific features
 */
contract SolarFarm3643 is AIMYSecurityToken {
    // Solar farm specific properties
    string public projectName;
    string public location;
    uint256 public capacityMW;
    uint256 public expectedAnnualYield;
    uint256 public constructionStartDate;
    uint256 public operationalDate;
    uint256 public expectedLifespan;
    
    // Solar farm specific events
    event SolarFarmDetailsUpdated(
        string projectName,
        string location,
        uint256 capacityMW,
        uint256 expectedAnnualYield,
        uint256 timestamp
    );
    
    event ConstructionMilestone(
        string milestone,
        uint256 completionDate,
        uint256 timestamp
    );
    
    event YieldDistribution(
        address indexed investor,
        uint256 amount,
        uint256 period,
        uint256 timestamp
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the SolarFarm3643 token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _maxSupply Maximum token supply
     * @param _minTicketSize Minimum investment amount
     * @param _maxTicketSize Maximum investment amount
     * @param _lockupPeriod Lockup period in seconds
     * @param _complianceEngine Compliance engine address
     * @param _assetRegistry Asset registry address
     * @param _issuer Issuer address
     * @param _projectName Solar farm project name
     * @param _location Solar farm location
     * @param _capacityMW Solar farm capacity in MW
     * @param _expectedAnnualYield Expected annual yield percentage
     * @param _constructionStartDate Construction start date
     * @param _expectedLifespan Expected lifespan in years
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _minTicketSize,
        uint256 _maxTicketSize,
        uint256 _lockupPeriod,
        address _complianceEngine,
        address _assetRegistry,
        address _issuer,
        string memory _projectName,
        string memory _location,
        uint256 _capacityMW,
        uint256 _expectedAnnualYield,
        uint256 _constructionStartDate,
        uint256 _expectedLifespan
    ) public initializer {
        super.initialize(
            _name,
            _symbol,
            _maxSupply,
            _minTicketSize,
            _maxTicketSize,
            _lockupPeriod,
            _complianceEngine,
            _assetRegistry,
            _issuer
        );
        
        projectName = _projectName;
        location = _location;
        capacityMW = _capacityMW;
        expectedAnnualYield = _expectedAnnualYield;
        constructionStartDate = _constructionStartDate;
        expectedLifespan = _expectedLifespan;
    }

    /**
     * @dev Update solar farm project details
     * @param _projectName New project name
     * @param _location New location
     * @param _capacityMW New capacity in MW
     * @param _expectedAnnualYield New expected annual yield
     */
    function updateSolarFarmDetails(
        string memory _projectName,
        string memory _location,
        uint256 _capacityMW,
        uint256 _expectedAnnualYield
    ) external onlyRole(ISSUER_ROLE) {
        require(bytes(_projectName).length > 0, "Project name cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(_capacityMW > 0, "Capacity must be greater than 0");
        require(_expectedAnnualYield > 0 && _expectedAnnualYield <= 100, "Invalid yield percentage");
        
        projectName = _projectName;
        location = _location;
        capacityMW = _capacityMW;
        expectedAnnualYield = _expectedAnnualYield;
        
        emit SolarFarmDetailsUpdated(_projectName, _location, _capacityMW, _expectedAnnualYield, block.timestamp);
    }

    /**
     * @dev Set construction milestone
     * @param _milestone Milestone description
     * @param _completionDate Completion date
     */
    function setConstructionMilestone(
        string memory _milestone,
        uint256 _completionDate
    ) external onlyRole(ISSUER_ROLE) {
        require(bytes(_milestone).length > 0, "Milestone cannot be empty");
        require(_completionDate > 0, "Invalid completion date");
        
        emit ConstructionMilestone(_milestone, _completionDate, block.timestamp);
    }

    /**
     * @dev Set operational date
     * @param _operationalDate Date when solar farm becomes operational
     */
    function setOperationalDate(uint256 _operationalDate) external onlyRole(ISSUER_ROLE) {
        require(_operationalDate > constructionStartDate, "Operational date must be after construction start");
        require(_operationalDate > block.timestamp, "Operational date cannot be in the past");
        
        operationalDate = _operationalDate;
        
        emit ConstructionMilestone("Operational", _operationalDate, block.timestamp);
    }

    /**
     * @dev Calculate expected yield for an investor
     * @param _investor Investor address
     * @param _period Period in days
     * @return Expected yield amount
     */
    function calculateExpectedYield(
        address _investor,
        uint256 _period
    ) external view returns (uint256) {
        uint256 balance = balanceOf(_investor);
        if (balance == 0) return 0;
        
        // Calculate yield based on annual percentage and period
        uint256 annualYield = (balance * expectedAnnualYield) / 100;
        uint256 periodYield = (annualYield * _period) / 365 days;
        
        return periodYield;
    }

    /**
     * @dev Get solar farm information
     * @return Solar farm details
     */
    function getSolarFarmInfo() external view returns (
        string memory _projectName,
        string memory _location,
        uint256 _capacityMW,
        uint256 _expectedAnnualYield,
        uint256 _constructionStartDate,
        uint256 _operationalDate,
        uint256 _expectedLifespan,
        bool _isOperational
    ) {
        _projectName = projectName;
        _location = location;
        _capacityMW = capacityMW;
        _expectedAnnualYield = expectedAnnualYield;
        _constructionStartDate = constructionStartDate;
        _operationalDate = operationalDate;
        _expectedLifespan = expectedLifespan;
        _isOperational = operationalDate > 0 && block.timestamp >= operationalDate;
    }

    /**
     * @dev Check if solar farm is operational
     * @return Whether the solar farm is operational
     */
    function isOperational() external view returns (bool) {
        return operationalDate > 0 && block.timestamp >= operationalDate;
    }

    /**
     * @dev Get construction status
     * @return Construction status information
     */
    function getConstructionStatus() external view returns (
        bool _constructionStarted,
        bool _constructionCompleted,
        uint256 _daysSinceStart,
        uint256 _daysUntilOperational
    ) {
        _constructionStarted = constructionStartDate > 0;
        _constructionCompleted = operationalDate > 0 && block.timestamp >= operationalDate;
        
        if (_constructionStarted) {
            _daysSinceStart = (block.timestamp - constructionStartDate) / 1 days;
        }
        
        if (operationalDate > 0 && block.timestamp < operationalDate) {
            _daysUntilOperational = (operationalDate - block.timestamp) / 1 days;
        }
    }

    /**
     * @dev Override createIssuance to add solar-specific validation
     * @param _investor Investor address
     * @param _amount Token amount
     * @param _price Price per token
     */
    function createIssuance(
        address _investor,
        uint256 _amount,
        uint256 _price
    ) external override onlyRole(ISSUER_ROLE) {
        // Check if construction has started
        require(constructionStartDate > 0, "Construction has not started");
        
        // Call parent function
        super.createIssuance(_investor, _amount, _price);
    }

    /**
     * @dev Override completeIssuance to add solar-specific logic
     * @param _issuanceId Issuance ID to complete
     */
    function completeIssuance(uint256 _issuanceId) external override onlyRole(ISSUER_ROLE) {
        // Call parent function
        super.completeIssuance(_issuanceId);
        
        // Additional solar-specific logic can be added here
        // For example, tracking total investment in the project
    }

    /**
     * @dev Get project valuation based on current token price and supply
     * @return Project valuation in USD
     */
    function getProjectValuation() external view returns (uint256) {
        // This is a simplified calculation
        // In a real implementation, this would consider actual asset value, cash flows, etc.
        return totalSupply() * 100; // Assuming $100 per token
    }

    /**
     * @dev Get investor portfolio value
     * @param _investor Investor address
     * @return Portfolio value in USD
     */
    function getInvestorPortfolioValue(address _investor) external view returns (uint256) {
        uint256 balance = balanceOf(_investor);
        return balance * 100; // Assuming $100 per token
    }
}
