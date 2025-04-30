import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import api from '../common/api'
import useLocationStore from '../store/location'
import useAccountStore from '../store/account'
import useMenuStore from '../store/menu'
const StaffLogin = () => {
  const activeLocationid = useLocationStore((state) => state.activeLocation?.id)
  const setAccountDetails = useAccountStore((state) => state.setDetails)
  const setCategories = useMenuStore((state) => state.setCategories)
  const setMenuItems = useMenuStore((state) => state.setMenuItems)
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
      const response = await api.post('accounts/login/', {
        email,password, location_id : activeLocationid
      })  
      console.log(response.data)
      setAccountDetails(response.data)
      const categorieresponse = await api.get('/menu/categories/')
      setCategories(categorieresponse.data)
      const menuitemresponse = await api.get('/menu/menu-items/')
      setMenuItems(menuitemresponse.data)

    }
   catch (error: any) {
    if (error.response) {
        setError(error.response.data.message || 'Invalid credentials');
    } else if (error.request) {
        setError('No response from server. Please try again.');
    } else {
        setError('An error occurred. Please try again.');
    }
}
    
    setError('');
    navigation.navigate('Home');
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
