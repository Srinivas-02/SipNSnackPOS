import React from 'react';
import LogoSplash from './src/screens/LogoSplash';
import Home from './src/screens/Home';
import StaffLogin from './src/screens/StaffLogin';
import LocationSelector from './src/screens/LocationSelector';
import PrinterSettings from './src/screens/PrinterSettings';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';

const App = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Logo"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F0F8FF'},
          animation: 'slide_from_right',
        }}>
        <Stack.Screen
          component={LogoSplash}
          name="Logo"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          component={StaffLogin}
          name="StaffLogin"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          component={LocationSelector}
          name="LocationSelector"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          component={Home}
          name="Home"
          options={{
            title: 'Home',
            headerStyle: {
              backgroundColor: '#F0F8FF',
            },
            headerTintColor: '#000',
          }}
        />
        <Stack.Screen
          component={PrinterSettings}
          name="PrinterSettings"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
