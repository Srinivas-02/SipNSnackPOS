import React, { useState } from 'react';
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

// Location data with their corresponding passwords
const LOCATIONS = [
    { key: 'select', value: 'Select Location', password: '' },
    { key: 'location1', value: 'San Francisco Store', password: 'admin' },
    { key: 'location2', value: 'New York Store', password: 'admin' },
    { key: 'location3', value: 'Chicago Store', password: 'admin' },
    { key: 'location4', value: 'Los Angeles Store', password: 'admin' },
    { key: 'location5', value: 'Houston Store', password: 'admin' },
    { key: 'location6', value: 'Phoenix Store', password: 'admin' },
    { key: 'location7', value: 'Philadelphia Store', password: 'admin' },
    { key: 'location8', value: 'San Antonio Store', password: 'admin' },
    { key: 'location9', value: 'San Diego Store', password: 'admin' },
    { key: 'location10', value: 'Dallas Store', password: 'admin' },
    { key: 'location11', value: 'San Jose Store', password: 'admin' },
    { key: 'location12', value: 'Austin Store', password: 'admin' },
    { key: 'location13', value: 'Jacksonville Store', password: 'admin' },
    { key: 'location14', value: 'Fort Worth Store', password: 'admin' },
    { key: 'location15', value: 'Columbus Store', password: 'admin' },
    { key: 'location16', value: 'Charlotte Store', password: 'admin' },
    { key: 'location17', value: 'Indianapolis Store', password: 'admin' },
    { key: 'location18', value: 'Seattle Store', password: 'admin' },
    { key: 'location19', value: 'Denver Store', password: 'admin' },
    { key: 'location20', value: 'Washington DC Store', password: 'admin' },
    { key: 'location21', value: 'Boston Store', password: 'admin' },
    { key: 'location22', value: 'Portland Store', password: 'admin' },
    { key: 'location23', value: 'Las Vegas Store', password: 'admin' },
    { key: 'location24', value: 'Detroit Store', password: 'admin' },
    { key: 'location25', value: 'Nashville Store', password: 'admin' },
];


const Login = () => {
    const [selectedLocation, setSelectedLocation] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [error, setError] = useState('');
    const passwordRef = React.useRef<TextInput>(null);

    const validateLocation = () => {
        if (!selectedLocation || selectedLocation === 'select') {
            setError('Please select a location');
            return;
        }

        const location = LOCATIONS.find(loc => loc.key === selectedLocation);
        if (location && password === location.password) {
            navigate.replace('Home');
        } else {
            setError('Invalid password for selected location');
        }
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const isLocationSelected = selectedLocation && selectedLocation !== 'select';

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
                                data={LOCATIONS}
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
