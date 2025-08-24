import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';

interface UserData {
  address: string;
  initialBalance: number;
  currentBalance: number;
  purchases: Purchase[];
  createdAt: string;
  lastUpdated: string;
}

interface Purchase {
  id: string;
  marketId: number;
  option: 'A' | 'B';
  amount: number;
  timestamp: string;
  marketQuestion: string;
  optionText: string;
}

interface FixedBalanceHook {
  currentBalance: number;
  purchases: Purchase[];
  isLoading: boolean;
  makePurchase: (marketId: number, option: 'A' | 'B', amount: number, marketQuestion: string, optionText: string) => Promise<boolean>;
  resetData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const STORAGE_KEY = 'la_kiniela_user_data';
const INITIAL_BALANCE = 1000; // 1000 $MON inicial fijo

export function useFixedBalance(): FixedBalanceHook {
  const { address, isConnected } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Cargar datos del usuario al conectar
  useEffect(() => {
    if (address && isConnected) {
      loadUserData();
    } else {
      setUserData(null);
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // ✅ Cargar datos desde AsyncStorage
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedData) {
        const allUsersData: { [address: string]: UserData } = JSON.parse(storedData);
        const currentUserData = allUsersData[address!];
        
        if (currentUserData) {
          console.log('📦 Datos cargados para usuario:', address?.slice(0, 6) + '...');
          setUserData(currentUserData);
        } else {
          // Usuario nuevo
          await createNewUser();
        }
      } else {
        // Primer usuario
        await createNewUser();
      }
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      await createNewUser();
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Crear nuevo usuario
  const createNewUser = async () => {
    if (!address) return;

    const newUserData: UserData = {
      address,
      initialBalance: INITIAL_BALANCE,
      currentBalance: INITIAL_BALANCE,
      purchases: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    await saveUserData(newUserData);
    setUserData(newUserData);
    
    console.log('🎉 Nuevo usuario creado con 1000 $MON:', address.slice(0, 6) + '...');
  };

  // ✅ Guardar datos en AsyncStorage
  const saveUserData = async (data: UserData) => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      const allUsersData: { [address: string]: UserData } = storedData ? JSON.parse(storedData) : {};
      
      allUsersData[data.address] = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allUsersData));
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
    }
  };

  // ✅ Realizar compra
  const makePurchase = async (
    marketId: number, 
    option: 'A' | 'B', 
    amount: number, 
    marketQuestion: string, 
    optionText: string
  ): Promise<boolean> => {
    if (!userData || userData.currentBalance < amount) {
      return false;
    }

    const purchase: Purchase = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      marketId,
      option,
      amount,
      timestamp: new Date().toISOString(),
      marketQuestion,
      optionText,
    };

    const updatedUserData: UserData = {
      ...userData,
      currentBalance: userData.currentBalance - amount,
      purchases: [...userData.purchases, purchase],
    };

    await saveUserData(updatedUserData);
    setUserData(updatedUserData);

    console.log('💰 Compra realizada:', {
      market: marketId,
      option,
      amount,
      newBalance: updatedUserData.currentBalance,
    });

    return true;
  };

  // ✅ Resetear datos (para testing)
  const resetData = async () => {
    if (!address) return;
    
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      const allUsersData: { [address: string]: UserData } = storedData ? JSON.parse(storedData) : {};
      
      delete allUsersData[address];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allUsersData));
      
      await createNewUser();
      console.log('🔄 Datos reseteados para usuario:', address.slice(0, 6) + '...');
    } catch (error) {
      console.error('❌ Error reseteando datos:', error);
    }
  };

  // ✅ Refrescar datos
  const refreshData = async () => {
    if (address && isConnected) {
      await loadUserData();
    }
  };

  return {
    currentBalance: userData?.currentBalance || 0,
    purchases: userData?.purchases || [],
    isLoading,
    makePurchase,
    resetData,
    refreshData,
  };
}
