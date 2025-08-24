# La Kiniela Mobile 🎯

Aplicación móvil para La Kiniela, un sistema descentralizado de mercados de predicción basado en blockchain que combina trading de predicciones con impacto social.

## 🚀 Características Principales

- **Mercados de Predicción**: Crea y participa en mercados binarios sobre eventos futuros
- **Staking con MXNB**: Invierte tokens MXNB para ganar recompensas
- **Impacto Social**: Parte de las comisiones se destinan automáticamente a causas benéficas
- **Swaps de Tokens**: Intercambia MXNB por otros tokens usando la API 0x
- **Wallet Web3**: Conexión segura usando Reown AppKit
- **Blockchain Monad**: Construido sobre la blockchain Monad para transacciones rápidas y económicas

## 🛠️ Tecnologías

- **React Native + Expo**: Desarrollo multiplataforma móvil
- **TypeScript**: Tipado estático para mayor seguridad
- **Reown AppKit**: Integración Web3 nativa y optimizada
- **Wagmi + Viem**: Hooks para Ethereum y contratos inteligentes
- **React Query**: Manejo de estado y cache de datos
- **Monad Blockchain**: L1 escalable y compatible con EVM

## 📱 Pantallas Principales

### 1. Mercados (Home)

- Lista de mercados activos
- Crear nuevos mercados
- Ver probabilidades en tiempo real
- Filtros por categoría

### 2. Swap

- Intercambiar MXNB por otros tokens
- Cotizaciones en tiempo real
- Configuración de slippage
- Integración con API 0x

### 3. Perfil

- Balance de tokens
- Historial de participaciones
- Estadísticas de rendimiento
- Reclamar ganancias

### 4. Impacto Social

- Dashboard de donaciones
- Causas por categoría
- Progreso de objetivos
- Transparencia total

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Reown AppKit Project ID
EXPO_PUBLIC_REOWN_PROJECT_ID=tu_project_id_aqui

# 0x API Key para swaps
EXPO_PUBLIC_ZEROX_API_KEY=tu_0x_api_key_aqui

# Direcciones de contratos (actualizar con direcciones reales)
EXPO_PUBLIC_KINIELA_MARKET_ADDRESS=0x...
EXPO_PUBLIC_MXNB_TOKEN_ADDRESS=0x...
EXPO_PUBLIC_USDC_TOKEN_ADDRESS=0x...
```

### 2. Obtener Credenciales

#### Reown AppKit

1. Ve a [dashboard.reown.com](https://dashboard.reown.com)
2. Crea un nuevo proyecto
3. Copia el Project ID
4. Configura las cadenas soportadas (Monad Testnet)

#### 0x API

1. Ve a [dashboard.0x.org](https://dashboard.0x.org)
2. Crea una cuenta y obtén tu API Key
3. Configura los tokens soportados

### 3. Contratos Inteligentes

Los contratos deben estar desplegados en Monad Testnet con las siguientes funciones:

- `createMarket()`: Crear nuevo mercado
- `placeBet()`: Participar en mercado
- `claimWinnings()`: Reclamar ganancias
- `resolveMarket()`: Resolver mercado
- `getMarketInfo()`: Obtener información del mercado
- `getActiveMarkets()`: Listar mercados activos

## 🚀 Instalación y Ejecución

### 1. Instalar Dependencias

```bash
# Usar yarn (recomendado)
yarn install

# O npm
npm install --legacy-peer-deps
```

### 2. Configurar Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables de entorno
nano .env
```

### 3. Ejecutar Aplicación

```bash
# Iniciar Metro bundler
yarn start

# Ejecutar en Android
yarn android

# Ejecutar en iOS
yarn ios

# Ejecutar en web
yarn web
```

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── MarketList.tsx  # Lista de mercados
│   ├── CreateMarket.tsx # Crear mercado
│   ├── SwapTokens.tsx  # Swap de tokens
│   └── ...
├── hooks/              # Hooks personalizados
│   ├── useKiniela.ts  # Hook principal de La Kiniela
│   ├── useSwap.ts     # Hook para swaps
│   └── ...
├── config/             # Configuración
│   ├── contracts.ts   # ABIs y direcciones
│   └── ...
├── types/              # Tipos TypeScript
│   └── kiniela.ts     # Interfaces principales
└── app/                # Pantallas (Expo Router)
    └── (tabs)/        # Navegación por tabs
```

## 🎨 Diseño y UX

### Paleta de Colores

- **Verde Principal**: #22C55E (MXNB, éxito)
- **Rojo**: #EF4444 (pérdidas, alertas)
- **Azul**: #3B82F6 (información, enlaces)
- **Grises**: #1E293B, #64748B, #E2E8F0

### Inspiración Mexicana

- Colores vibrantes y cálidos
- Tipografía clara y legible
- Iconografía moderna y accesible
- Espaciado generoso para mejor usabilidad

## 🔒 Seguridad

- **Wallet Connection**: Solo a través de Reown AppKit
- **Transacciones**: Firma local, nunca se envían claves privadas
- **Validaciones**: Verificación en frontend y smart contracts
- **Error Handling**: Manejo robusto de errores de red y blockchain

## 📈 Roadmap

### Fase 1 (Actual)

- ✅ Mercados básicos de predicción
- ✅ Conexión wallet Web3
- ✅ Swaps de tokens
- ✅ Sistema de impacto social

### Fase 2

- 🔄 Mercados con múltiples opciones
- 🔄 Sistema de reputación
- 🔄 Notificaciones push
- 🔄 Modo offline

### Fase 3

- 📋 Integración con redes sociales
- 📋 Mercados NFT
- 📋 Gobernanza descentralizada
- 📋 Cross-chain bridges

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [docs.lakiniela.com](https://docs.lakiniela.com)
- **Discord**: [discord.gg/lakiniela](https://discord.gg/lakiniela)
- **Telegram**: [t.me/lakiniela](https://t.me/lakiniela)
- **Email**: support@lakiniela.com

## 🙏 Agradecimientos

- **Reown Team**: Por AppKit y soporte técnico
- **Monad Labs**: Por la blockchain escalable
- **0x Protocol**: Por la infraestructura de swaps
- **Comunidad La Kiniela**: Por el feedback y testing

---

**¡Haz predicciones, gana tokens y genera impacto social con La Kiniela! 🎯✨**
