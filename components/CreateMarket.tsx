import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useKinielaContract } from '@/hooks/useKiniela';
import { MARKET_CATEGORIES } from '@/config/contracts';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TextInput } from 'react-native';
import { colorsRGB } from '@/src/config/colors';
import LaKinielaLogo from '@/components/LaKinielaLogo';

interface CreateMarketForm {
  question: string;
  description: string;
  category: number;
  optionA: string;
  optionB: string;
  closingTime: number;
  stake: string;
}

export default function CreateMarket() {
  const router = useRouter();
  const { createMarket, minimumBet, isWritePending } = useKinielaContract();
  
  const [form, setForm] = useState<CreateMarketForm>({
    question: '',
    description: '',
    category: 0,
    optionA: '',
    optionB: '',
    closingTime: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 días por defecto
    stake: minimumBet.toString(),
  });

  const [selectedCategory, setSelectedCategory] = useState(0);

  const handleInputChange = (field: keyof CreateMarketForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (categoryIndex: number) => {
    setSelectedCategory(categoryIndex);
    handleInputChange('category', categoryIndex);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!form.question.trim()) {
      Alert.alert('Error', 'La pregunta es obligatoria');
      return;
    }
    if (!form.optionA.trim() || !form.optionB.trim()) {
      Alert.alert('Error', 'Ambas opciones son obligatorias');
      return;
    }
    if (parseFloat(form.stake) < minimumBet) {
      Alert.alert('Error', `La apuesta mínima es ${minimumBet} MXNB`);
      return;
    }
    if (form.closingTime <= Math.floor(Date.now() / 1000)) {
      Alert.alert('Error', 'La fecha de cierre debe ser futura');
      return;
    }

    try {
      await createMarket.mutateAsync({
        question: form.question.trim(),
        description: form.description.trim(),
        category: selectedCategory,
        optionA: form.optionA.trim(),
        optionB: form.optionB.trim(),
        closingTime: form.closingTime,
        stake: form.stake,
      });
      
      Alert.alert(
        'Éxito', 
        'Mercado creado correctamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el mercado. Inténtalo de nuevo.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSocialImpactText = () => {
    const category = MARKET_CATEGORIES[selectedCategory];
    return `${category.socialPercentage}% de las comisiones se destinarán a ${category.name.toLowerCase()}`;
  };

  if (isWritePending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <ThemedText style={styles.loadingText}>Creando mercado...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo de La Kiniela */}
        <View style={styles.logoContainer}>
          <LaKinielaLogo width={100} height={60} variant="kiniela" />
        </View>
        
        <View style={styles.header}>
          <ThemedText style={styles.title}>Crear Nuevo Mercado</ThemedText>
          <ThemedText style={styles.subtitle}>
            Crea un mercado de predicción y gana comisiones
          </ThemedText>
        </View>

        {/* Pregunta */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Pregunta del Mercado *</ThemedText>
          <TextInput
            style={styles.textInput}
            value={form.question}
            onChangeText={(value) => handleInputChange('question', value)}
            placeholder="Ej: ¿Quién ganará la Copa Mundial 2026?"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <ThemedText style={styles.characterCount}>
            {form.question.length}/200
          </ThemedText>
        </View>

        {/* Descripción */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Descripción (opcional)</ThemedText>
          <TextInput
            style={styles.textInput}
            value={form.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Proporciona más contexto sobre el mercado..."
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <ThemedText style={styles.characterCount}>
            {form.description.length}/500
          </ThemedText>
        </View>

        {/* Categoría */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Categoría *</ThemedText>
          <View style={styles.categoriesContainer}>
            {MARKET_CATEGORIES.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === index && styles.categoryButtonSelected,
                  { borderColor: category.color }
                ]}
                onPress={() => handleCategorySelect(index)}
              >
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <ThemedText style={[
                  styles.categoryButtonText,
                  selectedCategory === index && styles.categoryButtonTextSelected
                ]}>
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          {selectedCategory !== -1 && (
            <ThemedText style={styles.socialImpactText}>
              {getSocialImpactText()}
            </ThemedText>
          )}
        </View>

        {/* Opciones */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Opción A *</ThemedText>
          <TextInput
            style={styles.textInput}
            value={form.optionA}
            onChangeText={(value) => handleInputChange('optionA', value)}
            placeholder="Primera opción de respuesta"
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Opción B *</ThemedText>
          <TextInput
            style={styles.textInput}
            value={form.optionB}
            onChangeText={(value) => handleInputChange('optionB', value)}
            placeholder="Segunda opción de respuesta"
            maxLength={100}
          />
        </View>

        {/* Fecha de cierre */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Fecha de Cierre *</ThemedText>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                const newTime = form.closingTime + (24 * 60 * 60); // +1 día
                handleInputChange('closingTime', newTime);
              }}
            >
              <ThemedText style={styles.dateButtonText}>+1 Día</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                const newTime = form.closingTime + (7 * 24 * 60 * 60); // +1 semana
                handleInputChange('closingTime', newTime);
              }}
            >
              <ThemedText style={styles.dateButtonText}>+1 Semana</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                const newTime = form.closingTime + (30 * 24 * 60 * 60); // +1 mes
                handleInputChange('closingTime', newTime);
              }}
            >
              <ThemedText style={styles.dateButtonText}>+1 Mes</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.dateText}>
            Cierra el: {formatDate(form.closingTime)}
          </ThemedText>
        </View>

        {/* Apuesta inicial */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Apuesta Inicial (MXNB) *</ThemedText>
          <TextInput
            style={styles.textInput}
            value={form.stake}
            onChangeText={(value) => handleInputChange('stake', value)}
            placeholder={minimumBet.toString()}
            keyboardType="numeric"
          />
          <ThemedText style={styles.helperText}>
            Apuesta mínima: {minimumBet} MXNB
          </ThemedText>
        </View>

        {/* Resumen */}
        <View style={styles.summaryContainer}>
          <ThemedText style={styles.summaryTitle}>Resumen del Mercado</ThemedText>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Categoría:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {MARKET_CATEGORIES[selectedCategory]?.name || 'No seleccionada'}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Impacto Social:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {MARKET_CATEGORIES[selectedCategory]?.socialPercentage || 0}%
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Fecha de Cierre:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {formatDate(form.closingTime)}
            </ThemedText>
          </View>
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={!form.question.trim() || !form.optionA.trim() || !form.optionB.trim()}
          >
            <ThemedText style={styles.submitButtonText}>Crear Mercado</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 50,
  },
  characterCount: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#F0FDF4',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryButtonTextSelected: {
    color: '#1E293B',
  },
  socialImpactText: {
    fontSize: 14,
    color: '#22C55E',
    marginTop: 8,
    fontStyle: 'italic',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  dateText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
});
