//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CharityManager
 * @dev Contrato para manejar causas benéficas y distribuir fees
 */
contract CharityManager is Ownable {
    
    // Enum para las causas disponibles
    enum CharityCause {
        NONE,           // 0 - Sin causa seleccionada
        EDUCATION,      // 1 - Educación
        ENVIRONMENT,    // 2 - Medio Ambiente
        HEALTH,         // 3 - Salud
        POVERTY         // 4 - Pobreza
    }

    // Información de cada causa
    struct CharityInfo {
        string name;
        string description;
        address wallet;
        uint256 totalReceived;
        bool isActive;
    }

    // Variables del contrato
    IERC20 public immutable bettingToken;
    uint256 public charityFeePercentage; // Porcentaje del fee total que va a caridad (base 10000)
    
    // Mapeo de causas
    mapping(CharityCause => CharityInfo) public charities;
    
    // Causa seleccionada por el owner del market
    CharityCause public selectedCause;

    // Eventos
    event CharitySelected(CharityCause cause, string name);
    event CharityDeselected();
    event CharityDonation(CharityCause cause, uint256 amount);
    event CharityWalletUpdated(CharityCause cause, address newWallet);
    event CharityFeePercentageUpdated(uint256 newPercentage);

    // Errores
    error InvalidCause();
    error CharityNotActive();
    error InvalidWalletAddress();
    error InvalidPercentage();
    error TransferFailed();

    constructor(
        address _bettingToken,
        uint256 _charityFeePercentage
    ) Ownable(msg.sender) {
        bettingToken = IERC20(_bettingToken);
        charityFeePercentage = _charityFeePercentage;
        
        // Inicializar las 4 causas con información genérica
        _initializeCharities();
    }

    /**
     * @dev Inicializa las causas benéficas con datos por defecto
     */
    function _initializeCharities() private {
        charities[CharityCause.EDUCATION] = CharityInfo({
            name: "Educacion Global",
            description: "Apoyo a la educacion en comunidades necesitadas",
            wallet: address(0), // Se debe configurar después
            totalReceived: 0,
            isActive: false
        });

        charities[CharityCause.ENVIRONMENT] = CharityInfo({
            name: "Planeta Verde",
            description: "Proteccion del medio ambiente y sostenibilidad",
            wallet: address(0),
            totalReceived: 0,
            isActive: false
        });

        charities[CharityCause.HEALTH] = CharityInfo({
            name: "Salud Universal",
            description: "Acceso a servicios de salud para todos",
            wallet: address(0),
            totalReceived: 0,
            isActive: false
        });

        charities[CharityCause.POVERTY] = CharityInfo({
            name: "Fin de la Pobreza",
            description: "Erradicacion de la pobreza extrema",
            wallet: address(0),
            totalReceived: 0,
            isActive: false
        });
    }

    /**
     * @notice Selecciona una causa benéfica (solo owner)
     * @param _cause La causa a seleccionar
     */
    function selectCharity(CharityCause _cause) external onlyOwner {
        if (_cause != CharityCause.NONE && !charities[_cause].isActive) {
            revert CharityNotActive();
        }

        selectedCause = _cause;

        if (_cause == CharityCause.NONE) {
            emit CharityDeselected();
        } else {
            emit CharitySelected(_cause, charities[_cause].name);
        }
    }

    /**
     * @notice Distribuye fees a la causa seleccionada
     * @param _totalFeeAmount El monto total de fees recolectado
     */
    function distributeFees(uint256 _totalFeeAmount) external onlyOwner {
        if (selectedCause == CharityCause.NONE || _totalFeeAmount == 0) {
            return; // No hay causa seleccionada o no hay fees
        }

        CharityInfo storage charity = charities[selectedCause];
        if (!charity.isActive || charity.wallet == address(0)) {
            return; // Causa no activa o sin wallet configurado
        }

        // Calcular cantidad para caridad
        uint256 charityAmount = (_totalFeeAmount * charityFeePercentage) / 10000;
        
        if (charityAmount > 0) {
            // Transferir tokens a la caridad
            if (!bettingToken.transfer(charity.wallet, charityAmount)) {
                revert TransferFailed();
            }

            // Actualizar estadísticas
            charity.totalReceived += charityAmount;

            emit CharityDonation(selectedCause, charityAmount);
        }
    }

    /**
     * @notice Configura la wallet de una causa (solo owner)
     * @param _cause La causa a configurar
     * @param _wallet La nueva dirección wallet
     */
    function setCharityWallet(CharityCause _cause, address _wallet) external onlyOwner {
        if (_cause == CharityCause.NONE) revert InvalidCause();
        if (_wallet == address(0)) revert InvalidWalletAddress();

        charities[_cause].wallet = _wallet;
        charities[_cause].isActive = true;

        emit CharityWalletUpdated(_cause, _wallet);
    }

    /**
     * @notice Activa o desactiva una causa (solo owner)
     * @param _cause La causa a modificar
     * @param _isActive Si la causa debe estar activa
     */
    function setCharityActive(CharityCause _cause, bool _isActive) external onlyOwner {
        if (_cause == CharityCause.NONE) revert InvalidCause();
        
        charities[_cause].isActive = _isActive;
    }

    /**
     * @notice Actualiza el porcentaje de fees que va a caridad (solo owner)
     * @param _newPercentage Nuevo porcentaje (base 10000, ej: 500 = 5%)
     */
    function setCharityFeePercentage(uint256 _newPercentage) external onlyOwner {
        if (_newPercentage > 10000) revert InvalidPercentage(); // Máximo 100%
        
        charityFeePercentage = _newPercentage;
        emit CharityFeePercentageUpdated(_newPercentage);
    }

    // ========== FUNCIONES DE CONSULTA ==========

    /**
     * @notice Obtiene información de una causa
     * @param _cause La causa a consultar
     */
    function getCharityInfo(CharityCause _cause) 
        external 
        view 
        returns (
            string memory name,
            string memory description,
            address wallet,
            uint256 totalReceived,
            bool isActive
        ) 
    {
        CharityInfo memory charity = charities[_cause];
        return (
            charity.name,
            charity.description,
            charity.wallet,
            charity.totalReceived,
            charity.isActive
        );
    }

    /**
     * @notice Obtiene la causa actualmente seleccionada
     */
    function getSelectedCharity() 
        external 
        view 
        returns (
            CharityCause cause,
            string memory name,
            bool hasActiveCause
        ) 
    {
        cause = selectedCause;
        hasActiveCause = (cause != CharityCause.NONE && charities[cause].isActive);
        
        if (hasActiveCause) {
            name = charities[cause].name;
        } else {
            name = "Ninguna causa seleccionada";
        }
    }

    /**
     * @notice Calcula cuánto irá a caridad de un monto de fees
     * @param _feeAmount Monto total de fees
     */
    function calculateCharityAmount(uint256 _feeAmount) 
        external 
        view 
        returns (uint256 charityAmount) 
    {
        if (selectedCause == CharityCause.NONE || !charities[selectedCause].isActive) {
            return 0;
        }
        
        return (_feeAmount * charityFeePercentage) / 10000;
    }

    /**
     * @notice Obtiene todas las causas disponibles
     */
    function getAllCharities() 
        external 
        view 
        returns (
            string[4] memory names,
            bool[4] memory activeStatus,
            uint256[4] memory totalReceived
        ) 
    {
        CharityCause[4] memory causes = [
            CharityCause.EDUCATION,
            CharityCause.ENVIRONMENT,
            CharityCause.HEALTH,
            CharityCause.POVERTY
        ];

        for (uint i = 0; i < 4; i++) {
            CharityInfo memory charity = charities[causes[i]];
            names[i] = charity.name;
            activeStatus[i] = charity.isActive;
            totalReceived[i] = charity.totalReceived;
        }
    }

    /**
     * @notice Registra una donación (solo para contratos autorizados)
     * @param _cause La causa que recibió la donación
     * @param _amount El monto donado
     */
    function recordDonation(CharityCause _cause, uint256 _amount) external onlyOwner {
        if (_cause != CharityCause.NONE) {
            charities[_cause].totalReceived += _amount;
            emit CharityDonation(_cause, _amount);
        }
    }
}