import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { colorsRGB } from '@/src/config/colors';

interface PurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<boolean>;
  marketQuestion: string;
  option: 'A' | 'B';
  optionText: string;
  currentBalance: number;
  isEmpty: boolean;
}

export default function PurchaseModal({
  visible,
  onClose,
  onConfirm,
  marketQuestion,
  option,
  optionText,
  currentBalance,
  isEmpty,
}: PurchaseModalProps) {
  const [amount, setAmount] = useState<string>(isEmpty ? '10' : '5');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida');
      return;
    }

    if (numAmount > currentBalance) {
             Alert.alert('Fondos Insuficientes', `Solo tienes ${currentBalance.toFixed(2)} $MON disponibles`);
      return;
    }

    setLoading(true);
    
    try {
      const success = await onConfirm(numAmount);
      if (success) {
        setAmount(isEmpty ? '10' : '5'); // Reset
        onClose();
      } else {
        Alert.alert('Error', 'No se pudo completar la compra');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al realizar la compra');
    } finally {
      setLoading(false);
    }
  };

  const suggestedAmounts = isEmpty ? [5, 10, 20, 50] : [1, 5, 10, 25];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>
              {isEmpty ? '🚀 Inicializar Mercado' : '💰 Comprar Shares'}
            </ThemedText>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ThemedText style={styles.closeText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Market Info */}
          <View style={styles.marketInfo}>
            <ThemedText style={styles.question} numberOfLines={3}>
              {marketQuestion}
            </ThemedText>
            <View style={[styles.optionBadge, option === 'A' ? styles.optionA : styles.optionB]}>
              <ThemedText style={styles.optionLabel}>Opción {option}:</ThemedText>
              <ThemedText style={styles.optionText}>{optionText}</ThemedText>
            </View>
          </View>

          {/* Special message for empty markets */}
          {isEmpty && (
            <View style={styles.specialInfo}>
              <ThemedText style={styles.specialText}>
                🎯 ¡Sé el primero en apostar!{'\n'}
                                 El sistema añadirá automáticamente 100 $MON al pool inicial.
              </ThemedText>
            </View>
          )}

          {/* Balance Info */}
          <View style={styles.balanceInfo}>
            <ThemedText style={styles.balanceLabel}>Tu Balance:</ThemedText>
                         <ThemedText style={styles.balanceValue}>{currentBalance.toFixed(2)} $MON</ThemedText>
          </View>

          {/* Fee Info */}
          {amount && parseFloat(amount) > 0 && (
            <View style={styles.feeInfo}>
              <View style={styles.feeRow}>
                <ThemedText style={styles.feeLabel}>Monto a apostar:</ThemedText>
                                 <ThemedText style={styles.feeValue}>{parseFloat(amount).toFixed(2)} $MON</ThemedText>
              </View>
              <View style={styles.feeRow}>
                <ThemedText style={styles.feeLabel}>Impacto Social (10%):</ThemedText>
                                 <ThemedText style={styles.feeValueGreen}>+{(parseFloat(amount) * 0.1).toFixed(2)} $MON</ThemedText>
              </View>
              <View style={styles.feeRowTotal}>
                <ThemedText style={styles.feeLabelTotal}>Total a descontar:</ThemedText>
                                 <ThemedText style={styles.feeValueTotal}>{parseFloat(amount).toFixed(2)} $MON</ThemedText>
              </View>
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Cantidad a apostar:</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.0"
                placeholderTextColor={colorsRGB.mutedForeground}
                keyboardType="numeric"
                selectTextOnFocus
              />
                             <ThemedText style={styles.currencyLabel}>$MON</ThemedText>
            </View>
          </View>

          {/* Suggested Amounts */}
          <View style={styles.suggestedContainer}>
            <ThemedText style={styles.suggestedLabel}>Cantidades sugeridas:</ThemedText>
            <View style={styles.suggestedButtons}>
              {suggestedAmounts.map((suggestedAmount) => (
                <TouchableOpacity
                  key={suggestedAmount}
                  style={[
                    styles.suggestedButton,
                    suggestedAmount > currentBalance && styles.suggestedButtonDisabled
                  ]}
                  onPress={() => setAmount(suggestedAmount.toString())}
                  disabled={suggestedAmount > currentBalance}
                >
                  <ThemedText style={[
                    styles.suggestedButtonText,
                    suggestedAmount > currentBalance && styles.suggestedButtonTextDisabled
                  ]}>
                    {suggestedAmount}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, loading && styles.confirmButtonDisabled]} 
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.confirmButtonText}>
                  {isEmpty ? '🎯 Inicializar' : '💰 Comprar'}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colorsRGB.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colorsRGB.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    fontWeight: 'bold',
  },
  marketInfo: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    color: colorsRGB.cardForeground,
    marginBottom: 12,
    lineHeight: 22,
  },
  optionBadge: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionA: {
    borderColor: colorsRGB.secondary,
    backgroundColor: `${colorsRGB.secondary}20`,
  },
  optionB: {
    borderColor: colorsRGB.primary,
    backgroundColor: `${colorsRGB.primary}20`,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.mutedForeground,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  specialInfo: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  specialText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colorsRGB.muted,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colorsRGB.primary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorsRGB.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorsRGB.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    padding: 0,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.mutedForeground,
    marginLeft: 8,
  },
  suggestedContainer: {
    marginBottom: 24,
  },
  suggestedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 12,
  },
  suggestedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestedButton: {
    flex: 1,
    backgroundColor: colorsRGB.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  suggestedButtonDisabled: {
    backgroundColor: colorsRGB.muted,
  },
  suggestedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  suggestedButtonTextDisabled: {
    color: colorsRGB.mutedForeground,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colorsRGB.muted,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.mutedForeground,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colorsRGB.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colorsRGB.muted,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  feeInfo: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#BAE6FD',
  },
  feeLabel: {
    fontSize: 14,
    color: '#0369A1',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
  },
  feeValueGreen: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  feeLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
  },
  feeValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369A1',
  },
});
