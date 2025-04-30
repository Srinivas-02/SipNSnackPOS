import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    View,
    Keyboard,
    SafeAreaView,
    TouchableWithoutFeedback,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../common/api'
import useLocationStore from '../store/location'

const Login = () => {
    const locations = useLocationStore((state) => state.locations);
    const setLocations = useLocationStore((state) => state.setLocations);
    const setactiveLocation = useLocationStore((state) => state.setactiveLocation)
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [password, setPassword] = useState('');
    const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [error, setError] = useState('');
    const passwordRef = React.useRef<TextInput>(null);
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await api.get('/locations/');
                console.log(response.data);
                setLocations(response.data)
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocations();
    }, []);
    const validateLocation = async () => {
        if (!selectedLocation || selectedLocation === null) {
            setError('Please select a location');
            return;
        }
        const location = locations.find(loc => loc.id === Number(selectedLocation));
        try {
            const response = await api.post('/accounts/login-location/', {
                location_name: location?.name,
                location_password: password
            });
            console.log('Login successful:', response.data);
            setactiveLocation(response.data.location_id)
            navigate.navigate('Home')
        } catch (error: any) {
            console.log('Login failed:', error);
            if (error.response) {
                setError(error.response.data.message || 'Invalid credentials');
            } else if (error.request) {
                setError('No response from server. Please try again.');
            } else {
                setError('An error occurred. Please try again.');
            }
        }
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const isLocationSelected = selectedLocation && selectedLocation !== null;

    const locationOptions = locations.map(location => ({
        key: location.id.toString(),
        value: location.name
    }));

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.inner}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerText}>Welcome</Text>
                            <Text style={styles.subHeaderText}>Select Your Location</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <SelectList
                                setSelected={setSelectedLocation}
                                data={locationOptions}
                                save="key"
                                placeholder="Select Location"
                                searchPlaceholder="Search locations..."
                                boxStyles={styles.selectBox}
                                inputStyles={styles.inputStyles}
                                dropdownStyles={styles.dropdown}
                                onSelect={() => setError('')}
                            />

                            <TextInput
                                ref={passwordRef}
                                style={[
                                    styles.input,
                                    !isLocationSelected && styles.inputDisabled,
                                ]}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setError('');
                                }}
                                placeholder="Location Password"
                                placeholderTextColor={!isLocationSelected ? '#999' : '#666'}
                                secureTextEntry
                                autoCapitalize="none"
                                returnKeyType="done"
                                onSubmitEditing={validateLocation}
                                editable={isLocationSelected || undefined}
                            />
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}

                            <TouchableOpacity
                                onPress={() => {}}
                                style={styles.forgotPassword}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.loginButton,
                                    !isLocationSelected && styles.loginButtonDisabled,
                                ]}
                                onPress={validateLocation}
                                disabled={!isLocationSelected ? true : false}
                            >
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
    selectBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f8f8f8',
        color: '#000',
        height: 50,
    },
    inputStyles: {
        color: '#000',
        fontSize: 16,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        marginTop: 0,
        marginBottom: 10,
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
    inputDisabled: {
        backgroundColor: '#f0f0f0',
        borderColor: '#eee',
        color: '#999',
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
    loginButtonDisabled: {
        backgroundColor: '#ccc',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Login;
