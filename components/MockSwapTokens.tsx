import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colorsRGB } from '@/src/config/colors';
import LaKinielaLogo from '@/components/LaKinielaLogo';

interface MockToken {
  symbol: string;
  name: string;
  balance: number;
  price: number; // En USD
}

// ✅ Tokens simulados para demo
const MOCK_TOKENS: { [key: string]: MockToken } = {
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    balance: 2.5432,
    price: 3200.50,
  },
  MONAD: {
    symbol: 'MONAD',
    name: 'Monad Token',
    balance: 15000.789,
    price: 0.95,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 5000.00,
    price: 1.00,
  },
};

export default function MockSwapTokens() {
  const { isConnected, isOnCorrectNetwork } = useAuth();
  const [fromToken, setFromToken] = useState<string>('WETH');
  const [toToken, setToToken] = useState<string>('MONAD');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(0);

  // ✅ Calcular tasa de cambio automáticamente
  useEffect(() => {
    if (fromToken && toToken) {
      const fromPrice = MOCK_TOKENS[fromToken]?.price || 0;
      const toPrice = MOCK_TOKENS[toToken]?.price || 0;
      const rate = toPrice > 0 ? fromPrice / toPrice : 0;
      setExchangeRate(rate);
      
      // Auto-calcular toAmount cuando cambia fromAmount
      if (fromAmount && rate > 0) {
        const calculatedTo = (parseFloat(fromAmount) * rate).toFixed(6);
        setToAmount(calculatedTo);
      }
    }
  }, [fromToken, toToken, fromAmount]);

  // ✅ Manejar cambio de fromAmount
  const handleFromAmountChange = (amount: string) => {
    setFromAmount(amount);
    if (amount && exchangeRate > 0) {
      const calculatedTo = (parseFloat(amount) * exchangeRate).toFixed(6);
      setToAmount(calculatedTo);
    } else {
      setToAmount('');
    }
  };

  // ✅ Intercambiar tokens
  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // ✅ Ejecutar swap simulado
  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida');
      return;
    }

    const fromTokenData = MOCK_TOKENS[fromToken];
    const amount = parseFloat(fromAmount);

    if (amount > fromTokenData.balance) {
      Alert.alert('Error', `No tienes suficiente ${fromToken}`);
      return;
    }

    setLoading(true);

    // Simular delay de transacción
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '¡Swap Exitoso!',
        `Has intercambiado ${fromAmount} ${fromToken} por ${toAmount} ${toToken}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Simular actualización de balances
              MOCK_TOKENS[fromToken].balance -= amount;
              MOCK_TOKENS[toToken].balance += parseFloat(toAmount);
              setFromAmount('');
              setToAmount('');
            }
          }
        ]
      );
    }, 2000);
  };

  // ✅ Obtener precio en USD
  const getUSDValue = (tokenSymbol: string, amount: string) => {
    const token = MOCK_TOKENS[tokenSymbol];
    if (!token || !amount) return 0;
    return parseFloat(amount) * token.price;
  };

  if (!isConnected || !isOnCorrectNetwork) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.authContainer}>
          <ThemedText style={styles.authTitle}>
            {!isConnected ? 'Conecta tu Wallet' : 'Red Incorrecta'}
          </ThemedText>
          <ThemedText style={styles.authSubtitle}>
            {!isConnected 
              ? 'Conecta tu wallet para intercambiar tokens'
              : 'Debes estar conectado a Monad Testnet para hacer swaps'
            }
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LaKinielaLogo width={100} height={60} variant="kiniela" />
          </View>
          <ThemedText style={styles.title}>Intercambiar Tokens - Demo</ThemedText>
          <ThemedText style={styles.subtitle}>
            Cambia tokens de manera rápida y segura en Monad testnet
          </ThemedText>
        </View>

        <View style={styles.swapContainer}>
        {/* From Token */}
        <View style={styles.tokenContainer}>
          <View style={styles.tokenHeader}>
            <ThemedText style={styles.tokenLabel}>Desde</ThemedText>
            <ThemedText style={styles.balance}>
              Balance: {MOCK_TOKENS[fromToken]?.balance.toFixed(4)} {fromToken}
            </ThemedText>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.amountInput}
              value={fromAmount}
              onChangeText={handleFromAmountChange}
              placeholder="0.0"
              placeholderTextColor={colorsRGB.mutedForeground}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.tokenSelector}>
              <ThemedText style={styles.tokenSymbol}>{fromToken}</ThemedText>
            </TouchableOpacity>
          </View>
          
          {fromAmount && (
            <ThemedText style={styles.usdValue}>
              ≈ ${getUSDValue(fromToken, fromAmount).toFixed(2)} USD
            </ThemedText>
          )}
        </View>

        {/* Swap Button */}
        <TouchableOpacity style={styles.swapButton} onPress={handleSwapTokens}>
          <ThemedText style={styles.swapButtonText}>⇅</ThemedText>
        </TouchableOpacity>

        {/* To Token */}
        <View style={styles.tokenContainer}>
          <View style={styles.tokenHeader}>
            <ThemedText style={styles.tokenLabel}>Hacia</ThemedText>
            <ThemedText style={styles.balance}>
              Balance: {MOCK_TOKENS[toToken]?.balance.toFixed(4)} {toToken}
            </ThemedText>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.amountInput, styles.readOnlyInput]}
              value={toAmount}
              placeholder="0.0"
              placeholderTextColor={colorsRGB.mutedForeground}
              editable={false}
            />
            <TouchableOpacity style={styles.tokenSelector}>
              <ThemedText style={styles.tokenSymbol}>{toToken}</ThemedText>
            </TouchableOpacity>
          </View>
          
          {toAmount && (
            <ThemedText style={styles.usdValue}>
              ≈ ${getUSDValue(toToken, toAmount).toFixed(2)} USD
            </ThemedText>
          )}
        </View>

        {/* Exchange Rate */}
        {exchangeRate > 0 && (
          <View style={styles.rateContainer}>
            <ThemedText style={styles.rateText}>
              1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}
            </ThemedText>
          </View>
        )}

        {/* Swap Action Button */}
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            (!fromAmount || loading) && styles.actionButtonDisabled
          ]}
          onPress={handleSwap}
          disabled={!fromAmount || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.actionButtonText}>
              Intercambiar Tokens
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Token Selection Demo */}
        <View style={styles.tokenOptions}>
          <ThemedText style={styles.optionsTitle}>Tokens Disponibles:</ThemedText>
          <View style={styles.optionsContainer}>
            {Object.keys(MOCK_TOKENS).map((symbol) => (
              <TouchableOpacity
                key={symbol}
                style={[
                  styles.tokenOption,
                  (symbol === fromToken || symbol === toToken) && styles.tokenOptionSelected
                ]}
                onPress={() => {
                  if (symbol !== fromToken && symbol !== toToken) {
                    setToToken(symbol);
                  }
                }}
              >
                <ThemedText style={styles.tokenOptionText}>{symbol}</ThemedText>
                <ThemedText style={styles.tokenOptionBalance}>
                  {MOCK_TOKENS[symbol].balance.toFixed(2)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsRGB.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: colorsRGB.background,
    borderBottomWidth: 1,
    borderBottomColor: colorsRGB.border,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    textAlign: 'center',
  },
  swapContainer: {
    flex: 1,
    padding: 20,
  },
  tokenContainer: {
    backgroundColor: colorsRGB.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  balance: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    padding: 0,
  },
  readOnlyInput: {
    color: colorsRGB.mutedForeground,
  },
  tokenSelector: {
    backgroundColor: colorsRGB.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  usdValue: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    marginTop: 8,
  },
  swapButton: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colorsRGB.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    zIndex: 1,
  },
  swapButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rateText: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
  },
  actionButton: {
    backgroundColor: colorsRGB.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButtonDisabled: {
    backgroundColor: colorsRGB.muted,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenOptions: {
    marginTop: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tokenOption: {
    flex: 1,
    backgroundColor: colorsRGB.card,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tokenOptionSelected: {
    borderColor: colorsRGB.primary,
  },
  tokenOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  tokenOptionBalance: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
    marginTop: 4,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    textAlign: 'center',
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    textAlign: 'center',
  },
});
