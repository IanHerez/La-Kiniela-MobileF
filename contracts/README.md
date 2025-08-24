# Smart Contracts - La Kiniela

## 📋 Descripción Técnica

Esta carpeta contiene los smart contracts principales para La Kiniela, una plataforma de predicciones deportivas con distribución automática a causas benéficas implementada en Solidity ^0.8.19.

## 🔧 Arquitectura de Contratos

### 🎯 PredictionMarketWithCharity.sol

**Contrato principal para mercados de predicciones con integración benéfica**

#### Estructuras de Datos Principales

```solidity
struct Market {
    string question;                    // Pregunta del mercado
    string optionA;                     // Primera opción
    string optionB;                     // Segunda opción
    uint256 endTime;                    // Timestamp de finalización
    uint256 totalOptionAShares;         // Total shares en opción A
    uint256 totalOptionBShares;         // Total shares en opción B
    MarketOutcome outcome;              // Resultado del mercado
    bool resolved;                      // Estado de resolución
    CharityManager.CharityCause selectedCause; // Causa benéfica asignada
    mapping(address => UserShares) userShares; // Shares por usuario
    mapping(address => bool) hasClaimed;       // Control de claims
}
```

#### Métodos Principales

**🔨 Funciones de Administración**

```solidity
function createMarket(
    string memory _question,
    string memory _optionA,
    string memory _optionB,
    uint256 _duration,
    CharityManager.CharityCause _selectedCause
) external onlyOwner
```

- **Parámetros**: Pregunta, opciones A/B, duración en segundos, causa benéfica
- **Restricciones**: Solo owner, duración > 1 hora
- **Emite**: `MarketCreated(marketId, question, optionA, optionB, endTime)`

**💰 Funciones de Trading**

```solidity
function buyShares(
    uint256 _marketId,
    bool _isOptionA,
    uint256 _amount
) external nonReentrant
```

- **Parámetros**: ID del mercado, opción elegida (true=A, false=B), cantidad de tokens
- **Validaciones**:
  - Mercado no terminado (`block.timestamp < market.endTime`)
  - Cantidad mínima 1e6 tokens
  - Balance y allowance suficientes
- **Efectos**: Actualiza shares del usuario y totales del mercado
- **Emite**: `SharesPurchased(marketId, user, isOptionA, amount)`

**⚖️ Funciones de Resolución**

```solidity
function resolveMarket(uint256 _marketId, MarketOutcome _outcome) external onlyOwner
function emergencyResolveMarket(uint256 _marketId, MarketOutcome _outcome) external onlyOwner
```

- **Diferencias**: `resolveMarket` requiere que haya terminado el tiempo, `emergencyResolveMarket` no
- **Outcomes válidos**: `OPTION_A`, `OPTION_B`, `CANCELLED`
- **Efectos**: Marca mercado como resuelto y ejecuta `_distributeFees()`

**🎁 Funciones de Claim**

```solidity
function claimWinnings(uint256 _marketId) external nonReentrant
```

- **Lógica de payout**:
  - Si ganaste: `(tus_shares / total_shares_ganadoras) * (pool_total - fees)`
  - Si cancelado: Reembolso completo de tus shares
- **Protecciones**: Un solo claim por usuario, mercado debe estar resuelto

#### Sistema de Fees y Distribución

```solidity
function _distributeFees(uint256 _marketId) internal
```

- **Cálculo**: `totalFees = (totalPool * platformFeePercentage) / 10000`
- **Distribución automática**:
  - Porcentaje configurable a la causa específica del mercado
  - Resto al `feeCollector` de la plataforma
- **Transferencias directas**: No requiere claim adicional

---

### 💖 CharityManager.sol

**Gestor centralizado de causas benéficas**

#### Enum de Causas

```solidity
enum CharityCause {
    NONE,           // 0 - Sin causa
    EDUCATION,      // 1 - Educación
    ENVIRONMENT,    // 2 - Medio Ambiente
    HEALTH,         // 3 - Salud
    POVERTY         // 4 - Pobreza
}
```

#### Métodos de Configuración

**🔧 Configuración de Causas**

```solidity
function setCharityWallet(CharityCause _cause, address _wallet) external onlyOwner
```

- **Efecto**: Asigna wallet y activa automáticamente la causa
- **Validación**: Causa válida (!= NONE) y dirección != address(0)

```solidity
function setCharityActive(CharityCause _cause, bool _isActive) external onlyOwner
```

- **Uso**: Activar/desactivar causas sin cambiar wallet

**📊 Configuración de Porcentajes**

```solidity
function setCharityFeePercentage(uint256 _newPercentage) external onlyOwner
```

- **Base**: 10000 (ej: 500 = 5%, 1000 = 10%)
- **Máximo**: 5000 (50% del fee total)

#### Métodos de Consulta

```solidity
function getCharityInfo(CharityCause _cause) external view returns (
    string memory name,
    string memory description,
    address wallet,
    uint256 totalReceived,
    bool isActive
)
```

```solidity
function recordDonation(CharityCause _cause, uint256 _amount) external
```

- **Restricción**: Solo callable por contratos autorizados
- **Efecto**: Incrementa `totalReceived` para estadísticas

## 🔄 Flujo Técnico Completo

### 1. **Setup Inicial**

```solidity
// Deploy CharityManager
CharityManager charityManager = new CharityManager(tokenAddress, 1000); // 10%

// Deploy PredictionMarket
PredictionMarket market = new PredictionMarket(
    tokenAddress,
    address(charityManager),
    feeCollectorAddress,
    500  // 5% platform fee
);

// Configurar causas
charityManager.setCharityWallet(CharityCause.EDUCATION, educationWallet);
charityManager.setCharityWallet(CharityCause.HEALTH, healthWallet);
```

### 2. **Creación y Trading**

```solidity
// Crear mercado con causa específica
market.createMarket(
    "¿Quién ganará el clásico Real Madrid vs Barcelona?",
    "Real Madrid",
    "Barcelona",
    86400,  // 24 horas
    CharityCause.EDUCATION
);

// Usuario compra shares
token.approve(address(market), 1000e18);
market.buyShares(0, true, 1000e18); // Participa en opción A
```

### 3. **Resolución y Claims**

```solidity
// Resolver mercado (solo owner)
market.resolveMarket(0, MarketOutcome.OPTION_A);

// Usuarios ganadores reclaman
market.claimWinnings(0);
```

## 🛡️ Características de Seguridad

### Protecciones Implementadas

- **ReentrancyGuard**: Todas las funciones de transferencia
- **Ownable**: Funciones administrativas restringidas
- **Custom Errors**: Gas-efficient error handling
- **Checks-Effects-Interactions**: Patrón seguido en todas las transferencias
- **Balance/Allowance Verification**: Antes de cada `transferFrom`

### Validaciones Críticas

- Mercados no pueden resolverse antes de tiempo (excepto emergency)
- Usuarios no pueden hacer claim múltiples veces
- Causas inactivas no reciben fondos automáticamente
- Mínimo de participación para evitar spam (1e6 tokens)

## 📝 Consideraciones de Deployment

- **Solidity Version**: ^0.8.19
- **Dependencies**: OpenZeppelin v4.x+
- **Gas Optimization**: Custom errors, efficient storage patterns
- **Upgradability**: Contratos no upgradeables por seguridad
- **Network**: Compatible con cualquier EVM (Ethereum, Polygon, BSC, etc.)

## 🔗 Integraciones Requeridas

- **Token ERC20**: Para participaciones y pagos
- **Oracle/Admin**: Para resolución de mercados
- **Frontend**: Para interacción de usuarios
- **Wallets Benéficas**: Direcciones verificadas para cada causa
