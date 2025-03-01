import React, { useState } from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormContainer from '../Components/FormContainer';
import FormInput from '../Components/FormInput';
import FormSubmitButton from '../Components/FormSubmitButton';
import { isValidObjectField, updateError, isValidEmail } from '../Utils/Methods';
import client from '../API/client';

const LoginForm = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { email, password } = userInfo;

    const handleOnChangeText = (value, fieldName) => {
        setUserInfo({ ...userInfo, [fieldName]: value });
    };

    const isValidForm = () => {
        if (!isValidObjectField(userInfo)) 
            return updateError('All fields are required', setError);
        if (!isValidEmail(email)) 
            return updateError('Invalid email format', setError);
        if (!password.trim() || password.length < 8) 
            return updateError('Password must be at least 8 characters', setError);
        return true;
    };

    const submitForm = async () => {
        if (isValidForm()) {
            try {
                setLoading(true);
                const res = await client.post('/sign-in', userInfo);

                if (res.data.success) {
                    const { token, user } = res.data;

                    // Store token & user details
                    await AsyncStorage.setItem('token', token);
                    await AsyncStorage.setItem('userRole', user.role);
                    await AsyncStorage.setItem('user', JSON.stringify(user));

                    // Redirect based on role
                    switch (user.role) {
                        case 'admin':
                            navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
                            break;
                        case 'guide':
                            navigation.reset({ index: 0, routes: [{ name: 'GuideDashboard' }] });
                            break;
                        default:
                            navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
                    }
                } else {
                    updateError('Invalid credentials', setError);
                }
            } catch (error) {
                console.error("Login error:", error.response?.data || error.message);
                updateError(error.response?.data?.message || 'Error logging in', setError);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <FormContainer>
            {error ? <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>{error}</Text> : null}
            
            <FormInput
                value={email}
                onChangeText={(value) => handleOnChangeText(value, 'email')}
                label="Email"
                placeholder="example@email.com"
                autoCapitalize="none"
            />
            
            <FormInput
                value={password}
                onChangeText={(value) => handleOnChangeText(value, 'password')}
                label="Password"
                placeholder="********"
                autoCapitalize="none"
                secureTextEntry
            />
            
            <FormSubmitButton 
                onPress={submitForm} 
                title={loading ? "Logging in..." : "Login"} 
                disabled={loading}
            />
        </FormContainer>
    );
};

export default LoginForm;
