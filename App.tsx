import React from 'react';
import LogoSplash from './src/screens/LogoSplash';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
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
          component={Login}
          name="Login"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
