import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';

interface Cause {
  id: string;
  name: string;
  description: string;
  feePercentage: number;
  totalDonated: number;
  website: string;
  color: string;
}

interface Donation {
  id: string;
  causeId: string;
  amount: number;
  fromPurchase: number; // Monto original de la compra
  timestamp: string;
  marketQuestion: string;
}

interface SocialImpactData {
  causes: Cause[];
  donations: Donation[];
  totalDonated: number;
  monthlyGoal: number;
}

const STORAGE_KEY = 'la_kiniela_social_impact';
const MONTHLY_GOAL = 500; // 500 $MON objetivo mensual

// ✅ Solo 2 causas principales (5% cada una = 10% total)
const DEFAULT_CAUSES: Cause[] = [
  {
    id: 'education',
    name: 'Educación Digital',
    description: 'Llevando tecnología y educación digital a comunidades rurales de México',
    feePercentage: 5, // 5% del fee
    totalDonated: 0,
    website: 'https://educaciondigital.mx',
    color: '#3B82F6', // Azul
  },
  {
    id: 'environment',
    name: 'Medio Ambiente',
    description: 'Proyectos de reforestación y conservación ambiental en Latinoamérica',
    feePercentage: 5, // 5% del fee
    totalDonated: 0,
    website: 'https://bosquesparatodos.org',
    color: '#22C55E', // Verde
  },
];

export function useSocialImpact() {
  const { address, isConnected } = useAuth();
  const [impactData, setImpactData] = useState<SocialImpactData>({
    causes: DEFAULT_CAUSES,
    donations: [],
    totalDonated: 0,
    monthlyGoal: MONTHLY_GOAL,
  });
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Cargar datos al conectar
  useEffect(() => {
    if (isConnected) {
      loadImpactData();
    } else {
      setImpactData({
        causes: DEFAULT_CAUSES,
        donations: [],
        totalDonated: 0,
        monthlyGoal: MONTHLY_GOAL,
      });
      setIsLoading(false);
    }
  }, [isConnected]);

  // ✅ Cargar datos desde AsyncStorage
  const loadImpactData = async () => {
    try {
      setIsLoading(true);
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedData) {
        const data: SocialImpactData = JSON.parse(storedData);
        setImpactData(data);
      } else {
        // Primera vez - inicializar con datos por defecto
        const initialData: SocialImpactData = {
          causes: DEFAULT_CAUSES,
          donations: [],
          totalDonated: 0,
          monthlyGoal: MONTHLY_GOAL,
        };
        await saveImpactData(initialData);
        setImpactData(initialData);
      }
    } catch (error) {
      console.error('❌ Error cargando datos de impacto:', error);
      setImpactData({
        causes: DEFAULT_CAUSES,
        donations: [],
        totalDonated: 0,
        monthlyGoal: MONTHLY_GOAL,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Guardar datos en AsyncStorage
  const saveImpactData = async (data: SocialImpactData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('❌ Error guardando datos de impacto:', error);
    }
  };

  // ✅ Procesar donación del 10% de fee de una compra
  const processDonation = async (purchaseAmount: number, marketQuestion: string): Promise<void> => {
    if (!isConnected) return;

    try {
      // Calcular 10% de fee (5% para cada causa)
      const totalFee = purchaseAmount * 0.1; // 10% del monto de compra
      const feePerCause = totalFee / 2; // 5% para cada una

      const newDonations: Donation[] = impactData.causes.map((cause) => ({
        id: `${Date.now()}_${cause.id}_${Math.random().toString(36).substr(2, 9)}`,
        causeId: cause.id,
        amount: feePerCause,
        fromPurchase: purchaseAmount,
        timestamp: new Date().toISOString(),
        marketQuestion,
      }));

      // Actualizar causas con nuevas donaciones
      const updatedCauses = impactData.causes.map((cause) => ({
        ...cause,
        totalDonated: cause.totalDonated + feePerCause,
      }));

      const updatedData: SocialImpactData = {
        ...impactData,
        causes: updatedCauses,
        donations: [...impactData.donations, ...newDonations],
        totalDonated: impactData.totalDonated + totalFee,
      };

      await saveImpactData(updatedData);
      setImpactData(updatedData);

      console.log('💚 Donación procesada:', {
        totalFee: totalFee.toFixed(3),
        feePerCause: feePerCause.toFixed(3),
        marketQuestion,
        newTotalDonated: updatedData.totalDonated.toFixed(3),
      });

    } catch (error) {
      console.error('❌ Error procesando donación:', error);
    }
  };

  // ✅ Resetear datos (para testing)
  const resetImpactData = async () => {
    try {
      const initialData: SocialImpactData = {
        causes: DEFAULT_CAUSES,
        donations: [],
        totalDonated: 0,
        monthlyGoal: MONTHLY_GOAL,
      };
      await saveImpactData(initialData);
      setImpactData(initialData);
      console.log('🔄 Datos de impacto social reseteados');
    } catch (error) {
      console.error('❌ Error reseteando datos de impacto:', error);
    }
  };

  // ✅ Estadísticas calculadas
  const stats = {
    totalDonated: impactData.totalDonated,
    monthlyGoal: impactData.monthlyGoal,
    progressPercentage: (impactData.totalDonated / impactData.monthlyGoal) * 100,
    totalDonations: impactData.donations.length,
    remaining: impactData.monthlyGoal - impactData.totalDonated,
  };

  return {
    causes: impactData.causes,
    donations: impactData.donations,
    stats,
    isLoading,
    processDonation,
    resetImpactData,
  };
}
