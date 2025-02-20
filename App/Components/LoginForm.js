// Components/LoginForm.js
import React, { useState } from 'react';
import { Text } from 'react-native';
import FormContainer from './FormContainer';
import FormInput from './FormInput';
import FormSubmitButton from './FormSubmitButton';
import { isValidObjectField, updateError, isValidEmail } from '../Utils/Methods';
import client from '../API/client';

const LoginForm = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { email, password } = userInfo;

    const handleOnChangeText = (value, fieldName) => {
        setUserInfo({ ...userInfo, [fieldName]: value });
    };

    const isValidForm = () => {
        if (!isValidObjectField(userInfo)) 
            return updateError('Required all fields', setError);
        if (!isValidEmail(email)) 
            return updateError('Invalid email', setError);
        if (!password.trim() || password.length < 8) 
            return updateError('Password must be at least 8 characters', setError);
        return true;
    };

    const submitForm = async () => {
        if (isValidForm()) {
            try {
                const res = await client.post('/sign-in', userInfo);
                if (res.data.success) {
                    navigation.replace('UserProfile', {
                        token: res.data.token,
                        user: res.data.user
                    });
                }
            } catch (error) {
                updateError(error.response?.data?.message || 'Error logging in', setError);
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
            <FormSubmitButton onPress={submitForm} title="Login" />
        </FormContainer>
    );
};

export default LoginForm;