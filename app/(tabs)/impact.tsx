import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useSocialImpact } from '@/hooks/useSocialImpact';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colorsRGB } from '@/src/config/colors';
import LaKinielaLogo from '@/components/LaKinielaLogo';

// ✅ Datos reales desde el hook

interface CauseCardProps {
  cause: {
    id: string;
    name: string;
    description: string;
    feePercentage: number;
    totalDonated: number;
    website: string;
    color: string;
  };
  onPress: () => void;
}

const CauseCard: React.FC<CauseCardProps> = ({ cause, onPress }) => {
  return (
    <TouchableOpacity style={[styles.causeCard, { borderLeftColor: cause.color }]} onPress={onPress}>
      <View style={styles.causeHeader}>
        <View style={styles.causeInfo}>
          <ThemedText style={styles.causeName}>{cause.name}</ThemedText>
          <ThemedText style={styles.causePercentage}>
            {cause.feePercentage}% de cada compra
          </ThemedText>
        </View>
        <View style={styles.causeStats}>
          <ThemedText style={styles.donatedAmount}>
                         {cause.totalDonated.toFixed(2)} $MON
          </ThemedText>
          <ThemedText style={styles.donatedLabel}>Total donado</ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.causeDescription} numberOfLines={2}>
        {cause.description}
      </ThemedText>
      
      <View style={styles.causeFooter}>
        <ThemedText style={styles.websiteText}>Ver más →</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default function ImpactScreen() {
  const { isConnected, isOnCorrectNetwork } = useAuth();
  const { causes, donations, stats, isLoading, resetImpactData } = useSocialImpact();
  
  const handleCausePress = (cause: any) => {
    Alert.alert(
      cause.name,
             `${cause.description}\n\nTotal donado: ${cause.totalDonated.toFixed(2)} $MON\nPorcentaje del fee: ${cause.feePercentage}%\n\n¿Quieres visitar su sitio web?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Visitar sitio', 
          onPress: () => Linking.openURL(cause.website).catch(() => 
            Alert.alert('Error', 'No se pudo abrir el sitio web')
          )
        }
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Resetear Datos de Impacto',
      '¿Seguro que quieres resetear todos los datos de impacto social?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Resetear', style: 'destructive', onPress: resetImpactData }
      ]
    );
  };

  // Verificar autenticación y red
  if (!isConnected || !isOnCorrectNetwork) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.authContainer}>
          <ThemedText style={styles.authTitle}>
            {!isConnected ? 'Conecta tu Wallet' : 'Red Incorrecta'}
          </ThemedText>
          <ThemedText style={styles.authSubtitle}>
            {!isConnected 
              ? 'Conecta tu wallet para ver el impacto social'
              : 'Debes estar conectado a Monad Testnet para usar La Kiniela'
            }
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const totalDonated = stats.totalDonated;
  const monthlyGoal = stats.monthlyGoal;
  const progressPercentage = stats.progressPercentage;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo de La Kiniela */}
        <View style={styles.logoContainer}>
          <LaKinielaLogo width={100} height={60} variant="kiniela" />
        </View>
        
        {/* Header con resumen */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Impacto Social</ThemedText>
          <ThemedText style={styles.subtitle}>
            Tu participación en mercados de predicción genera un impacto real en la sociedad
          </ThemedText>
        </View>

        {/* Estadísticas generales */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>
              {totalDonated.toFixed(2)} $MON
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Donado</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>{stats.totalDonations}</ThemedText>
            <ThemedText style={styles.statLabel}>Donaciones</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>{causes.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Causas Activas</ThemedText>
          </View>
        </View>

        {/* Progreso del mes */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressTitle}>Objetivo Mensual</ThemedText>
            <ThemedText style={styles.progressAmount}>
              {monthlyGoal} $MON
            </ThemedText>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]} 
            />
          </View>
          
          <View style={styles.progressFooter}>
            <ThemedText style={styles.progressText}>
              {progressPercentage.toFixed(1)}% completado
            </ThemedText>
            <ThemedText style={styles.progressRemaining}>
              {stats.remaining.toFixed(2)} $MON restantes
            </ThemedText>
          </View>
        </View>

        {/* Causas sociales */}
        <View style={styles.causesContainer}>
          <View style={styles.causesHeader}>
            <ThemedText style={styles.causesTitle}>
              Causas Sociales
            </ThemedText>
            {donations.length > 0 && (
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <ThemedText style={styles.resetButtonText}>🔄 Reset</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          {causes.map((cause) => (
            <CauseCard
              key={cause.id}
              cause={cause}
              onPress={() => handleCausePress(cause)}
            />
          ))}
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>¿Cómo funciona?</ThemedText>
          <ThemedText style={styles.infoText}>
            • Cada compra de shares genera un fee del 10% destinado a causas sociales
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • El 10% se divide equitativamente: 5% para Educación Digital y 5% para Medio Ambiente
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Las donaciones se rastrean en tiempo real y se acumulan automáticamente
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Tu participación en mercados contribuye directamente a proyectos sociales reales
          </ThemedText>
        </View>

        {/* Call to action */}
        <View style={styles.ctaContainer}>
          <ThemedText style={styles.ctaTitle}>
            ¡Únete al cambio!
          </ThemedText>
          <ThemedText style={styles.ctaText}>
            Participa en mercados de predicción y contribuye a causas sociales mientras ganas
          </ThemedText>
          <TouchableOpacity style={styles.ctaButton}>
            <ThemedText style={styles.ctaButtonText}>Explorar Mercados</ThemedText>
          </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colorsRGB.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: colorsRGB.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
  },
  progressAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colorsRGB.primary,
  },
  progressBar: {
    height: 12,
    backgroundColor: colorsRGB.muted,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colorsRGB.primary,
    borderRadius: 6,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
  },
  progressRemaining: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  causesContainer: {
    marginBottom: 24,
  },
  causesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  causesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
  },
  resetButton: {
    backgroundColor: colorsRGB.destructive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  causeCard: {
    backgroundColor: colorsRGB.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  causeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  causeInfo: {
    flex: 1,
    marginRight: 16,
  },
  causeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 4,
  },
  causePercentage: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
  },
  causeStats: {
    alignItems: 'flex-end',
  },
  donatedAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.primary,
    marginBottom: 4,
  },
  donatedLabel: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
  },
  causeDescription: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    lineHeight: 20,
    marginBottom: 12,
  },
  causeFooter: {
    alignItems: 'flex-end',
  },
  websiteText: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.primary,
  },
  infoContainer: {
    backgroundColor: colorsRGB.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  ctaContainer: {
    backgroundColor: colorsRGB.muted,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colorsRGB.border,
    marginBottom: 40,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 16,
    color: colorsRGB.cardForeground,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: colorsRGB.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: colorsRGB.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
