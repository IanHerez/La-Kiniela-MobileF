//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./CharityManager.sol";

/**
 * @title PredictionMarketWithCharity
 * @dev Versión con integración de CharityManager para causas benéficas
 */
contract PredictionMarketWithCharity is Ownable, ReentrancyGuard {
    enum MarketOutcome {
        UNRESOLVED,
        OPTION_A,
        OPTION_B,
        CANCELLED
    }

    struct UserShares {
        uint256 optionA;
        uint256 optionB;
    }

    struct Market {
        string question;
        string optionA;
        string optionB;
        uint256 endTime;
        uint256 totalOptionAShares;
        uint256 totalOptionBShares;
        MarketOutcome outcome;
        bool resolved;
        CharityManager.CharityCause selectedCause;  // Causa específica para este market
        mapping(address => UserShares) userShares;
        mapping(address => bool) hasClaimed;
    }

    // Custom Errors para gas efficiency
    error InvalidTokenAddress();
    error InvalidDuration();
    error MarketTradingEnded();
    error MarketAlreadyResolved();
    error MinimumBetRequired();
    error TokenTransferFailed();
    error MarketNotEnded();
    error InvalidOutcome();
    error MarketNotResolved();
    error AlreadyClaimed();
    error NoWinningsToClaim();
    error InsufficientAllowance();
    error InsufficientBalance();
    error InvalidCharityManager();

    // Constante para allowance infinito
    uint256 private constant MAX_UINT256 = type(uint256).max;

    IERC20 public immutable bettingToken;
    uint256 public marketCount;
    uint256 public platformFeePercentage;
    address public feeCollector;
    CharityManager public charityManager;
    
    mapping(uint256 => Market) public markets;

    event MarketCreated(uint256 indexed marketId, string question, string optionA, string optionB, uint256 endTime);
    event SharesPurchased(uint256 indexed marketId, address indexed buyer, bool isOptionA, uint256 amount);
    event MarketResolved(uint256 indexed marketId, MarketOutcome outcome);
    event Claimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event CharityManagerUpdated(address newCharityManager);
    event MarketCharityChanged(uint256 indexed marketId, CharityManager.CharityCause newCause);

    constructor(
        address _bettingToken,
        address _feeCollector,
        uint256 _initialFee,
        address _charityManager
    ) Ownable(msg.sender) {
        if (_bettingToken == address(0)) revert InvalidTokenAddress();
        if (_charityManager == address(0)) revert InvalidCharityManager();
        
        bettingToken = IERC20(_bettingToken);
        feeCollector = _feeCollector;
        platformFeePercentage = _initialFee;
        charityManager = CharityManager(_charityManager);
    }

    function createMarket(
        string memory _question,
        string memory _optionA,
        string memory _optionB,
        uint256 _duration,
        CharityManager.CharityCause _selectedCause
    ) external onlyOwner returns (uint256 marketId) {
        if (_duration < 1 hours || _duration > 30 days) revert InvalidDuration();

        marketId = marketCount;
        marketCount++;
        
        Market storage market = markets[marketId];
        market.question = _question;
        market.optionA = _optionA;
        market.optionB = _optionB;
        market.endTime = block.timestamp + _duration;
        market.outcome = MarketOutcome.UNRESOLVED;
        market.selectedCause = _selectedCause;  // Asignar causa específica al market

        emit MarketCreated(marketId, _question, _optionA, _optionB, market.endTime);
    }

    function buyShares(
        uint256 _marketId,
        bool _isOptionA,
        uint256 _amount
    ) external nonReentrant {
        Market storage market = markets[_marketId];
        if (block.timestamp >= market.endTime) revert MarketTradingEnded();
        if (market.resolved) revert MarketAlreadyResolved();
        if (_amount < 1e6) revert MinimumBetRequired();

        // Verificar balance y allowance ANTES de transferir
        if (bettingToken.balanceOf(msg.sender) < _amount) revert InsufficientBalance();
        if (bettingToken.allowance(msg.sender, address(this)) < _amount) revert InsufficientAllowance();

        if (!bettingToken.transferFrom(msg.sender, address(this), _amount)) revert TokenTransferFailed();

        if (_isOptionA) {
            market.userShares[msg.sender].optionA += _amount;
            market.totalOptionAShares += _amount;
        } else {
            market.userShares[msg.sender].optionB += _amount;
            market.totalOptionBShares += _amount;
        }

        emit SharesPurchased(_marketId, msg.sender, _isOptionA, _amount);
    }

    function resolveMarket(uint256 _marketId, MarketOutcome _outcome) external onlyOwner {
        Market storage market = markets[_marketId];
        if (block.timestamp < market.endTime) revert MarketNotEnded();
        if (market.resolved) revert MarketAlreadyResolved();
        if (_outcome == MarketOutcome.UNRESOLVED) revert InvalidOutcome();

        market.outcome = _outcome;
        market.resolved = true;

        // Distribuir fees a caridad si hay causa seleccionada
        _distributeFees(_marketId);

        emit MarketResolved(_marketId, _outcome);
    }

    function emergencyResolveMarket(uint256 _marketId, MarketOutcome _outcome) external onlyOwner {
        Market storage market = markets[_marketId];
        if (market.resolved) revert MarketAlreadyResolved();
        if (_outcome == MarketOutcome.UNRESOLVED) revert InvalidOutcome();

        market.outcome = _outcome;
        market.resolved = true;

        // Distribuir fees a caridad si hay causa seleccionada
        _distributeFees(_marketId);

        emit MarketResolved(_marketId, _outcome);
    }

    /**
     * @dev Distribuye fees recolectados a la plataforma y caridad específica del market
     */
    function _distributeFees(uint256 _marketId) internal {
        Market storage market = markets[_marketId];
        
        // Solo distribuir fees si el market no fue cancelado
        if (market.outcome == MarketOutcome.CANCELLED) {
            return;
        }

        uint256 totalPool = market.totalOptionAShares + market.totalOptionBShares;
        if (totalPool == 0 || platformFeePercentage == 0) {
            return;
        }

        // Calcular fees totales
        uint256 totalFees = (totalPool * platformFeePercentage) / 10000;
        
        if (totalFees > 0) {
            uint256 charityAmount = 0;
            
            // Distribuir a caridad solo si este market tiene una causa seleccionada
            if (market.selectedCause != CharityManager.CharityCause.NONE) {
                charityAmount = _distributeToSpecificCharity(market.selectedCause, totalFees);
            }
            
            // El resto va al fee collector
            uint256 platformAmount = totalFees - charityAmount;
            
            if (platformAmount > 0) {
                bettingToken.transfer(feeCollector, platformAmount);
            }
        }
    }

    /**
     * @dev Distribuye fees a una causa específica
     */
    function _distributeToSpecificCharity(
        CharityManager.CharityCause _cause, 
        uint256 _totalFees
    ) internal returns (uint256 charityAmount) {
        // Obtener información de la causa
        (,, address wallet, , bool isActive) = charityManager.getCharityInfo(_cause);
        
        if (!isActive || wallet == address(0)) {
            return 0; // Causa no activa o sin wallet
        }

        // Calcular cantidad para caridad
        charityAmount = (_totalFees * charityManager.charityFeePercentage()) / 10000;
        
        if (charityAmount > 0) {
            // Transferir directamente a la caridad
            bettingToken.transfer(wallet, charityAmount);
            
            // Actualizar estadísticas en el CharityManager
            charityManager.recordDonation(_cause, charityAmount);
        }
        
        return charityAmount;
    }

    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        if (!market.resolved) revert MarketNotResolved();
        if (market.hasClaimed[msg.sender]) revert AlreadyClaimed();

        UserShares memory user = market.userShares[msg.sender];
        uint256 userShares;
        uint256 totalWinningShares;
        uint256 totalLosingShares;

        if (market.outcome == MarketOutcome.OPTION_A) {
            userShares = user.optionA;
            totalWinningShares = market.totalOptionAShares;
            totalLosingShares = market.totalOptionBShares;
            market.userShares[msg.sender].optionA = 0;
        } else if (market.outcome == MarketOutcome.OPTION_B) {
            userShares = user.optionB;
            totalWinningShares = market.totalOptionBShares;
            totalLosingShares = market.totalOptionAShares;
            market.userShares[msg.sender].optionB = 0;
        } else if (market.outcome == MarketOutcome.CANCELLED) {
            uint256 totalStake = user.optionA + user.optionB;
            market.userShares[msg.sender] = UserShares(0, 0);
            
            bettingToken.transfer(msg.sender, totalStake);
            emit Claimed(_marketId, msg.sender, totalStake);
            return;
        }

        if (userShares == 0) revert NoWinningsToClaim();

        market.hasClaimed[msg.sender] = true;

        uint256 winnings = calculateWinnings(userShares, totalWinningShares, totalLosingShares);
        bettingToken.transfer(msg.sender, winnings);

        emit Claimed(_marketId, msg.sender, winnings);
    }

    function calculateWinnings(
        uint256 userShares,
        uint256 totalWinningShares,
        uint256 totalLosingShares
    ) internal view returns (uint256) {
        if (totalWinningShares == 0) return userShares;
        
        uint256 proportionalWinnings = (userShares * totalLosingShares) / totalWinningShares;
        uint256 winnings = userShares + proportionalWinnings;
        
        if (platformFeePercentage > 0) {
            uint256 fee = (winnings * platformFeePercentage) / 10000;
            winnings -= fee;
        }
        
        return winnings;
    }

    // ========== FUNCIONES DE CARIDAD ==========

    /**
     * @notice Cambia la causa de un market específico (solo owner y antes de que termine)
     * @param _marketId ID del market
     * @param _newCause Nueva causa a asignar
     */
    function setMarketCharity(uint256 _marketId, CharityManager.CharityCause _newCause) external onlyOwner {
        Market storage market = markets[_marketId];
        if (market.resolved) revert MarketAlreadyResolved();
        
        market.selectedCause = _newCause;
        
        emit MarketCharityChanged(_marketId, _newCause);
    }

    /**
     * @notice Obtiene la causa asignada a un market específico
     * @param _marketId ID del market
     */
    function getMarketCharity(uint256 _marketId) 
        external 
        view 
        returns (
            CharityManager.CharityCause cause,
            string memory causeName,
            bool isActive
        ) 
    {
        Market storage market = markets[_marketId];
        cause = market.selectedCause;
        
        if (cause == CharityManager.CharityCause.NONE) {
            causeName = "Sin causa asignada";
            isActive = false;
        } else {
            (string memory name,, , , bool active) = charityManager.getCharityInfo(cause);
            causeName = name;
            isActive = active;
        }
    }

    /**
     * @notice Actualiza la dirección del CharityManager (solo owner)
     * @param _newCharityManager Nueva dirección del contrato CharityManager
     */
    function setCharityManager(address _newCharityManager) external onlyOwner {
        if (_newCharityManager == address(0)) revert InvalidCharityManager();
        charityManager = CharityManager(_newCharityManager);
        emit CharityManagerUpdated(_newCharityManager);
    }

    /**
     * @notice Calcula cuánto irá a caridad de un market específico
     * @param _marketId ID del market
     */
    function calculateMarketCharityAmount(uint256 _marketId) 
        external 
        view 
        returns (uint256 charityAmount) 
    {
        Market storage market = markets[_marketId];
        
        if (market.selectedCause == CharityManager.CharityCause.NONE) {
            return 0;
        }
        
        // Verificar si la causa está activa
        (,, , , bool isActive) = charityManager.getCharityInfo(market.selectedCause);
        if (!isActive) {
            return 0;
        }
        
        uint256 totalPool = market.totalOptionAShares + market.totalOptionBShares;
        if (totalPool == 0 || platformFeePercentage == 0) {
            return 0;
        }
        
        uint256 totalFees = (totalPool * platformFeePercentage) / 10000;
        return (totalFees * charityManager.charityFeePercentage()) / 10000;
    }

    // ========== FUNCIONES HELPER ALLOWANCE (MISMAS QUE ANTES) ==========

    function getMaxAllowance() external pure returns (uint256 maxAmount) {
        return MAX_UINT256;
    }

    function hasInfiniteAllowance(address _user) external view returns (bool isInfinite) {
        uint256 allowance = bettingToken.allowance(_user, address(this));
        return allowance >= 1e30;
    }

    function hasSufficientAllowance(address _user, uint256 _amount) external view returns (bool isSufficient) {
        uint256 allowance = bettingToken.allowance(_user, address(this));
        return allowance >= _amount;
    }

    function needsApproval(address _user, uint256 _amount) 
        external 
        view 
        returns (bool needsApprovalBool, uint256 suggestedAmount) 
    {
        uint256 allowance = bettingToken.allowance(_user, address(this));
        
        if (allowance < _amount) {
            return (true, MAX_UINT256);
        }
        
        return (false, 0);
    }

    function getUserInfoAdvanced(address _user, uint256 _amount) 
        external 
        view 
        returns (
            uint256 balance,
            uint256 allowance,
            bool hasInfinite,
            bool needsApprovalForAmount
        ) 
    {
        balance = bettingToken.balanceOf(_user);
        allowance = bettingToken.allowance(_user, address(this));
        hasInfinite = allowance >= 1e30;
        needsApprovalForAmount = allowance < _amount;
    }

    function canUserBuySharesAdvanced(address _user, uint256 _amount) 
        external 
        view 
        returns (
            bool canBuy, 
            string memory reason,
            string memory suggestedAction
        ) 
    {
        uint256 balance = bettingToken.balanceOf(_user);
        uint256 allowance = bettingToken.allowance(_user, address(this));
        
        if (balance < _amount) {
            return (false, "Insufficient MXNB balance", "Get more MXNB tokens");
        }
        
        if (allowance < _amount) {
            return (false, "Insufficient allowance", "Approve infinite allowance");
        }
        
        return (true, "Ready to buy shares", "Proceed with purchase");
    }

    function checkAllowance(address _user, uint256 _amount) external view returns (bool hasAllowance) {
        return bettingToken.allowance(_user, address(this)) >= _amount;
    }

    function getUserAllowance(address _user) external view returns (uint256 allowance) {
        return bettingToken.allowance(_user, address(this));
    }

    function getUserBalance(address _user) external view returns (uint256 balance) {
        return bettingToken.balanceOf(_user);
    }

    function canUserBuyShares(address _user, uint256 _amount) 
        external 
        view 
        returns (bool canBuy, string memory reason) 
    {
        uint256 balance = bettingToken.balanceOf(_user);
        uint256 allowance = bettingToken.allowance(_user, address(this));
        
        if (balance < _amount) {
            return (false, "Insufficient balance");
        }
        
        if (allowance < _amount) {
            return (false, "Insufficient allowance - approve infinite amount");
        }
        
        return (true, "Can buy shares");
    }

    function getUserInfo(address _user) 
        external 
        view 
        returns (
            uint256 balance,
            uint256 allowance,
            bool needsApprovalBool
        ) 
    {
        balance = bettingToken.balanceOf(_user);
        allowance = bettingToken.allowance(_user, address(this));
        needsApprovalBool = allowance < 1e30;
    }

    // ========== FUNCIONES EXISTENTES ==========

    function getMarketInfo(uint256 _marketId)
        external
        view
        returns (
            string memory question,
            string memory optionA,
            string memory optionB,
            uint256 endTime,
            MarketOutcome outcome,
            uint256 totalOptionAShares,
            uint256 totalOptionBShares,
            bool resolved,
            CharityManager.CharityCause selectedCause
        )
    {
        Market storage market = markets[_marketId];
        return (
            market.question,
            market.optionA,
            market.optionB,
            market.endTime,
            market.outcome,
            market.totalOptionAShares,
            market.totalOptionBShares,
            market.resolved,
            market.selectedCause
        );
    }

    function getUserShares(uint256 _marketId, address _user) 
        external 
        view 
        returns (uint256 optionAShares, uint256 optionBShares) 
    {
        Market storage market = markets[_marketId];
        UserShares memory shares = market.userShares[_user];
        return (shares.optionA, shares.optionB);
    }
}
