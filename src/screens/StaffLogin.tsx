import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import api, { setAuthTokens } from '../common/api';
import useLocationStore from '../store/location';
import useAccountStore from '../store/account';
import useMenuStore from '../store/menu';

const StaffLogin = () => {
  const setAccountDetails = useAccountStore((state) => state.setDetails);
  const setCategories = useMenuStore((state) => state.setCategories);
  const setMenuItems = useMenuStore((state) => state.setMenuItems);
  const setLocations = useLocationStore((state) => state.setLocations);
  const setactiveLocationId = useLocationStore((state) => state.setactiveLocationId);
  const setactiveLocation = useLocationStore((state) => state.setactiveLocation);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    try{
      console.log('Attempting login... with email:', email, 'and password:', password);
      const response = await api.post('accounts/login/', {
        email, password
      });
      console.log('Login successful:', response.data);
      
      // Store the access and refresh tokens
      if (response.data.access && response.data.refresh) {
        await setAuthTokens(response.data.access, response.data.refresh);
      }
      
      setAccountDetails(response.data.user);
      
      // Set locations from the login response
      if (response.data.locations && response.data.locations.length > 0) {
        console.log('Setting locations from login response:', response.data.locations);
        setLocations(response.data.locations);
        
        // If there's only one location, set it as active and go to Home
        if (response.data.locations.length === 1) {
          const location = response.data.locations[0];
          setactiveLocationId(location.id);
          setactiveLocation(location.id);
          
          // Fetch categories and menu items for this location
          await fetchMenuData(location.id);
          
          navigation.navigate('Home');
        } else {
          // If there are multiple locations, navigate to location selector
          navigation.navigate('LocationSelector');
        }
      } else {
        setError('No locations associated with this account');
      }
    }
   // eslint-disable-next-line no-catch-shadow
   catch (error: any) {
    console.error('Login error:', error);
    if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.message || 'Invalid credentials');
    } else if (error.request) {
        console.error('No response received');
        setError('No response from server. Please try again.');
    } else {
        console.error('Error:', error.message);
        setError('An error occurred. Please try again.');
    }
  }
  };

  const fetchMenuData = async (locationId: number) => {
    try {
      console.log('Fetching categories for location:', locationId);
      const categorieresponse = await api.get(`/menu/categories/?location_id=${locationId}`);
      console.log('Categories data:', categorieresponse.data);
      setCategories(categorieresponse.data);

      console.log('Fetching menu items for location:', locationId);
      const menuitemresponse = await api.get(`/menu/menu-items/?location_id=${locationId}`);
      console.log('Menu items data:', menuitemresponse.data);
      setMenuItems(menuitemresponse.data);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.inner}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Staff Login</Text>
              <Text style={styles.subHeaderText}>Enter your credentials</Text>
            </View>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#666"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
                textContentType="password"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity style={styles.forgotPassword} onPress={() => {/* handle forgot password */}}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StaffLogin;
