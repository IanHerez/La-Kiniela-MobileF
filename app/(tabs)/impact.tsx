import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MARKET_CATEGORIES } from '@/config/contracts';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colorsRGB } from '@/src/config/colors';
import LaKinielaLogo from '@/components/LaKinielaLogo';

// Datos de ejemplo para el impacto social
const SOCIAL_IMPACT_DATA = {
  totalDonated: 15420.50,
  totalMarkets: 89,
  activeCauses: 6,
  monthlyGoal: 25000,
  categories: [
    {
      id: 'sports',
      name: 'Deportes',
      donated: 3850.25,
      markets: 23,
      percentage: 10,
      cause: 'Fundación Deportiva para Niños',
      description: 'Apoyando el desarrollo deportivo de niños en comunidades vulnerables',
      website: 'https://fundaciondeportiva.org',
    },
    {
      id: 'politics',
      name: 'Política',
      donated: 5780.75,
      markets: 15,
      percentage: 15,
      cause: 'Transparencia Electoral',
      description: 'Promoviendo la transparencia y participación ciudadana en procesos electorales',
      website: 'https://transparenciaelectoral.mx',
    },
    {
      id: 'entertainment',
      name: 'Entretenimiento',
      donated: 1540.20,
      markets: 18,
      percentage: 8,
      cause: 'Arte para Todos',
      description: 'Llevando arte y cultura a comunidades marginadas',
      website: 'https://arteparatodos.org',
    },
    {
      id: 'technology',
      name: 'Tecnología',
      donated: 2310.30,
      markets: 12,
      percentage: 12,
      cause: 'Código para México',
      description: 'Enseñando programación a jóvenes de bajos recursos',
      website: 'https://codigoparamexico.org',
    },
    {
      id: 'finance',
      name: 'Finanzas',
      donated: 3084.00,
      markets: 8,
      percentage: 20,
      cause: 'Educación Financiera',
      description: 'Capacitando a familias en gestión financiera responsable',
      website: 'https://educacionfinanciera.mx',
    },
    {
      id: 'other',
      name: 'Otros',
      donated: 3855.00,
      markets: 13,
      percentage: 5,
      cause: 'Fondo de Emergencias',
      description: 'Apoyo inmediato para comunidades afectadas por desastres naturales',
      website: 'https://fondoemergencias.org',
    },
  ],
};

interface CategoryCardProps {
  category: any;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const progressPercentage = (category.donated / category.monthlyGoal) * 100;
  
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
          <ThemedText style={styles.categoryPercentage}>
            {category.percentage}% de comisiones
          </ThemedText>
        </View>
        <View style={styles.categoryStats}>
          <ThemedText style={styles.donatedAmount}>
            ${category.donated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </ThemedText>
          <ThemedText style={styles.marketsCount}>
            {category.markets} mercados
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.causeInfo}>
        <ThemedText style={styles.causeName}>{category.cause}</ThemedText>
        <ThemedText style={styles.causeDescription} numberOfLines={2}>
          {category.description}
        </ThemedText>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(progressPercentage, 100)}%` }
            ]} 
          />
        </View>
        <ThemedText style={styles.progressText}>
          {progressPercentage.toFixed(1)}% del objetivo mensual
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default function ImpactScreen() {
  const { isConnected, isOnCorrectNetwork } = useAuth();
  
  const handleCategoryPress = (category: any) => {
    // TODO: Navegar a detalle de la causa o abrir sitio web
    console.log('Categoría seleccionada:', category);
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

  const totalDonated = SOCIAL_IMPACT_DATA.totalDonated;
  const monthlyGoal = SOCIAL_IMPACT_DATA.monthlyGoal;
  const progressPercentage = (totalDonated / monthlyGoal) * 100;

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
              ${totalDonated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Donado</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>{SOCIAL_IMPACT_DATA.totalMarkets}</ThemedText>
            <ThemedText style={styles.statLabel}>Mercados Activos</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>{SOCIAL_IMPACT_DATA.activeCauses}</ThemedText>
            <ThemedText style={styles.statLabel}>Causas Activas</ThemedText>
          </View>
        </View>

        {/* Progreso del mes */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressTitle}>Objetivo Mensual</ThemedText>
            <ThemedText style={styles.progressAmount}>
              ${monthlyGoal.toLocaleString('es-MX')}
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
              ${(monthlyGoal - totalDonated).toLocaleString('es-MX', { minimumFractionDigits: 2 })} restantes
            </ThemedText>
          </View>
        </View>

        {/* Categorías y causas */}
        <View style={styles.categoriesContainer}>
          <ThemedText style={styles.categoriesTitle}>
            Causas por Categoría
          </ThemedText>
          
          {SOCIAL_IMPACT_DATA.categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>¿Cómo funciona?</ThemedText>
          <ThemedText style={styles.infoText}>
            • Cada mercado de predicción genera comisiones que se distribuyen automáticamente
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • El porcentaje de impacto social varía según la categoría del mercado
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Las donaciones se procesan mensualmente y se envían directamente a las organizaciones
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Puedes ver el impacto en tiempo real y rastrear cada transacción en la blockchain
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
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: colorsRGB.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 4,
  },
  categoryPercentage: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  donatedAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.primary,
    marginBottom: 4,
  },
  marketsCount: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
  },
  causeInfo: {
    marginBottom: 16,
  },
  causeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 8,
  },
  causeDescription: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    lineHeight: 20,
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
