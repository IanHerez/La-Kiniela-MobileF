import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSwap } from '@/hooks/useSwap';
import { useAuth } from '@/hooks/useAuth';
import { ZEROX_CONFIG } from '@/config/contracts';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TextInput } from 'react-native';
import { colorsRGB } from '@/src/config/colors';
import LaKinielaLogo from '@/components/LaKinielaLogo';

interface SwapForm {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: string;
}

export default function SwapTokens() {
  const { isConnected, isOnCorrectNetwork } = useAuth();
  const { 
    getSwapQuote, 
    executeSwap, 
    approveToken, 
    supportedTokens, 
    supportedTokensLoading,
    tokenPrices,
    isWritePending 
  } = useSwap();
  
  const [form, setForm] = useState<SwapForm>({
    fromToken: ZEROX_CONFIG.supportedTokens.MXNB.address,
    toToken: ZEROX_CONFIG.supportedTokens.MONAD.address,
    fromAmount: '',
    toAmount: '',
    slippage: '0.5',
  });

  const [quote, setQuote] = useState<any>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof SwapForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTokenSelect = (field: 'fromToken' | 'toToken', tokenAddress: string) => {
    if (field === 'fromToken' && tokenAddress === form.toToken) {
      // Intercambiar tokens si se selecciona el mismo
      setForm(prev => ({
        ...prev,
        fromToken: prev.toToken,
        toToken: prev.fromToken,
        fromAmount: prev.toAmount,
        toAmount: prev.fromAmount,
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: tokenAddress }));
    }
    setQuote(null);
  };

  const handleAmountChange = async (amount: string) => {
    handleInputChange('fromAmount', amount);
    
    if (amount && parseFloat(amount) > 0) {
      setIsLoadingQuote(true);
      try {
        const swapQuote = await getSwapQuote.mutateAsync({
          fromToken: form.fromToken,
          toToken: form.toToken,
          fromAmount: amount,
          slippage: parseFloat(form.slippage),
        });
        
        setQuote(swapQuote);
        handleInputChange('toAmount', swapQuote.toAmount);
      } catch (error) {
        console.error('Error getting quote:', error);
        setQuote(null);
      } finally {
        setIsLoadingQuote(false);
      }
    } else {
      setQuote(null);
      handleInputChange('toAmount', '');
    }
  };

  const handleSwap = async () => {
    if (!quote) {
      Alert.alert('Error', 'No hay cotización disponible');
      return;
    }

    if (!form.fromAmount || parseFloat(form.fromAmount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    try {
      // Si es token a token, verificar allowance primero
      if (form.fromToken !== '0x0000000000000000000000000000000000000000') {
        // TODO: Verificar allowance actual y solicitar aprobación si es necesario
        // Por ahora, asumimos que ya está aprobado
      }

      await executeSwap.mutateAsync({
        quote,
        fromToken: form.fromToken,
        toToken: form.toToken,
        fromAmount: form.fromAmount,
        toAmount: form.toAmount,
      });

      Alert.alert('Éxito', 'Swap ejecutado correctamente');
      setForm(prev => ({ ...prev, fromAmount: '', toAmount: '' }));
      setQuote(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo ejecutar el swap. Inténtalo de nuevo.');
    }
  };

  const getTokenSymbol = (address: string) => {
    const token = Object.values(ZEROX_CONFIG.supportedTokens).find(
      t => t.address.toLowerCase() === address.toLowerCase()
    );
    return token?.symbol || 'Unknown';
  };

  const getTokenLogo = (address: string) => {
    const token = Object.values(ZEROX_CONFIG.supportedTokens).find(
      t => t.address.toLowerCase() === address.toLowerCase()
    );
    return token?.logoURI;
  };

  const calculatePriceImpact = () => {
    if (!quote || !form.fromAmount) return 0;
    return quote.priceImpact;
  };

  const getEstimatedGas = () => {
    if (!quote) return '0';
    return quote.gasEstimate;
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
              : 'Debes estar conectado a Monad Testnet para usar La Kiniela'
            }
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (supportedTokensLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <ThemedText style={styles.loadingText}>Cargando tokens...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LaKinielaLogo width={80} height={50} variant="kiniela" />
          </View>
          <ThemedText style={styles.title}>Intercambiar Tokens</ThemedText>
          <ThemedText style={styles.subtitle}>
            Cambia MXNB por otros tokens de forma rápida y segura
          </ThemedText>
        </View>

        {/* Token de origen */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Desde</ThemedText>
          <View style={styles.tokenInputContainer}>
            <TextInput
              style={styles.amountInput}
              value={form.fromAmount}
              onChangeText={handleAmountChange}
              placeholder="0.0"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.tokenSelector}
              onPress={() => {
                // TODO: Mostrar modal de selección de tokens
                Alert.alert('Seleccionar Token', 'Modal de selección de tokens');
              }}
            >
              <View style={styles.tokenInfo}>
                <View style={styles.tokenLogo} />
                <ThemedText style={styles.tokenSymbol}>
                  {getTokenSymbol(form.fromToken)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          {tokenPrices && (
            <ThemedText style={styles.priceInfo}>
              ≈ ${(parseFloat(form.fromAmount || '0') * (tokenPrices.mxnbPrice || 0)).toFixed(2)} USD
            </ThemedText>
          )}
        </View>

        {/* Botón de intercambio */}
        <TouchableOpacity
          style={styles.swapButton}
          onPress={() => {
            setForm(prev => ({
              ...prev,
              fromToken: prev.toToken,
              toToken: prev.fromToken,
              fromAmount: prev.toAmount,
              toAmount: prev.fromAmount,
            }));
            setQuote(null);
          }}
        >
          <ThemedText style={styles.swapButtonText}>⇅</ThemedText>
        </TouchableOpacity>

        {/* Token de destino */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Hacia</ThemedText>
          <View style={styles.tokenInputContainer}>
            <TextInput
              style={styles.amountInput}
              value={form.toAmount}
              placeholder="0.0"
              editable={false}
            />
            <TouchableOpacity
              style={styles.tokenSelector}
              onPress={() => {
                // TODO: Mostrar modal de selección de tokens
                Alert.alert('Seleccionar Token', 'Modal de selección de tokens');
              }}
            >
              <View style={styles.tokenInfo}>
                <View style={styles.tokenLogo} />
                <ThemedText style={styles.tokenSymbol}>
                  {getTokenSymbol(form.toToken)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          {tokenPrices && (
            <ThemedText style={styles.priceInfo}>
              ≈ ${(parseFloat(form.toAmount || '0') * (tokenPrices.usdcPrice || 0)).toFixed(2)} USD
            </ThemedText>
          )}
        </View>

        {/* Cotización */}
        {isLoadingQuote && (
          <View style={styles.quoteContainer}>
            <ActivityIndicator size="small" color="#22C55E" />
            <ThemedText style={styles.quoteText}>Obteniendo cotización...</ThemedText>
          </View>
        )}

        {quote && (
          <View style={styles.quoteContainer}>
            <ThemedText style={styles.quoteTitle}>Cotización del Swap</ThemedText>
            <View style={styles.quoteRow}>
              <ThemedText style={styles.quoteLabel}>Precio por token:</ThemedText>
              <ThemedText style={styles.quoteValue}>
                {((parseFloat(form.fromAmount) / parseFloat(form.toAmount)) || 0).toFixed(6)} {getTokenSymbol(form.fromToken)}/{getTokenSymbol(form.toToken)}
              </ThemedText>
            </View>
            <View style={styles.quoteRow}>
              <ThemedText style={styles.quoteLabel}>Impacto en precio:</ThemedText>
              <ThemedText style={[styles.quoteValue, { color: calculatePriceImpact() > 1 ? '#EF4444' : '#22C55E' }]}>
                {calculatePriceImpact().toFixed(2)}%
              </ThemedText>
            </View>
            <View style={styles.quoteRow}>
              <ThemedText style={styles.quoteLabel}>Gas estimado:</ThemedText>
              <ThemedText style={styles.quoteValue}>{getEstimatedGas()} GWEI</ThemedText>
            </View>
          </View>
        )}

        {/* Configuración avanzada */}
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <ThemedText style={styles.advancedToggleText}>
            {showAdvanced ? '▼' : '▶'} Configuración Avanzada
          </ThemedText>
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedContainer}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Tolerancia de Slippage (%)</ThemedText>
              <TextInput
                style={styles.textInput}
                value={form.slippage}
                onChangeText={(value) => handleInputChange('slippage', value)}
                placeholder="0.5"
                keyboardType="numeric"
              />
              <ThemedText style={styles.helperText}>
                Porcentaje máximo de cambio de precio aceptado
              </ThemedText>
            </View>
          </View>
        )}

        {/* Botón de swap */}
        <TouchableOpacity
          style={[
            styles.swapExecuteButton,
            (!quote || !form.fromAmount || isWritePending) && styles.swapExecuteButtonDisabled
          ]}
          onPress={handleSwap}
          disabled={!quote || !form.fromAmount || isWritePending}
        >
          {isWritePending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.swapExecuteButtonText}>
              Intercambiar {getTokenSymbol(form.fromToken)} por {getTokenSymbol(form.toToken)}
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>¿Cómo funciona?</ThemedText>
          <ThemedText style={styles.infoText}>
            • Los swaps se ejecutan a través de la API 0x para obtener los mejores precios
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Las transacciones se procesan en la blockchain Monad
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Los precios se actualizan en tiempo real
          </ThemedText>
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 8,
  },
  tokenInputContainer: {
    flexDirection: 'row',
    backgroundColor: colorsRGB.card,
    borderWidth: 1,
    borderColor: colorsRGB.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  amountInput: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    color: colorsRGB.cardForeground,
    fontWeight: '500',
  },
  tokenSelector: {
    backgroundColor: colorsRGB.muted,
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: colorsRGB.border,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colorsRGB.muted,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  priceInfo: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    marginTop: 8,
    textAlign: 'right',
  },
  swapButton: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colorsRGB.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  swapButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quoteContainer: {
    backgroundColor: colorsRGB.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colorsRGB.border,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 16,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quoteLabel: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
  },
  quoteValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  quoteText: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    marginLeft: 8,
  },
  advancedToggle: {
    paddingVertical: 16,
    marginBottom: 16,
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.primary,
  },
  advancedContainer: {
    backgroundColor: colorsRGB.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colorsRGB.border,
  },
  textInput: {
    backgroundColor: colorsRGB.muted,
    borderWidth: 1,
    borderColor: colorsRGB.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colorsRGB.cardForeground,
  },
  helperText: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    marginTop: 8,
  },
  swapExecuteButton: {
    backgroundColor: colorsRGB.primary,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 24,
  },
  swapExecuteButtonDisabled: {
    backgroundColor: colorsRGB.muted,
  },
  swapExecuteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: colorsRGB.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorsRGB.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    lineHeight: 20,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorsRGB.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colorsRGB.mutedForeground,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
  },
});
