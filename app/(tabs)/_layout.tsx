import { Tabs } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import TabBarIcon from '@/components/ui/TabBarIcon';
import { colorsRGB } from '@/src/config/colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorsRGB.primary,
        tabBarInactiveTintColor: colorsRGB.mutedForeground,
        tabBarStyle: {
          backgroundColor: colorsRGB.card,
          borderTopWidth: 1,
          borderTopColor: colorsRGB.border,
        },
        headerStyle: {
          backgroundColor: colorsRGB.background,
        },
        headerTintColor: colorsRGB.cardForeground,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mercados',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'trending-up' : 'trending-up-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: 'Swap',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: 'Impacto',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
