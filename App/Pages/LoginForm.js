import React from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormContainer from '../Components/FormContainer';
import FormInput from '../Components/FormInput';
import FormSubmitButton from '../Components/FormSubmitButton';
import { Formik } from 'formik';
import * as Yup from 'yup';
import client from '../API/client';

const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().trim().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const LoginForm = ({ navigation }) => {
    const userInfo = {
        email: '',
        password: ''
    };

    const submitForm = async (values, formikActions) => {
        try {
            const res = await client.post('/sign-in', values);

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
                formikActions.setFieldError('general', 'Invalid credentials');
            }
        } catch (error) {
            console.error("Login error:", error.response?.data || error.message);
            formikActions.setFieldError('general', error.response?.data?.message || 'Error logging in');
        } finally {
            formikActions.setSubmitting(false);
        }
    };

    return (
        <FormContainer>
            <Formik 
                initialValues={userInfo} 
                validationSchema={validationSchema} 
                onSubmit={submitForm}
            >
                {({ values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit }) => (
                    <View>
                        {errors.general ? 
                            <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
                                {errors.general}
                            </Text> 
                            : null
                        }
                        
                        <FormInput
                            value={values.email}
                            error={touched.email && errors.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            label="Email"
                            placeholder="example@email.com"
                            autoCapitalize="none"
                        />
                        
                        <FormInput
                            value={values.password}
                            error={touched.password && errors.password}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            label="Password"
                            placeholder="********"
                            autoCapitalize="none"
                            secureTextEntry
                        />
                        
                        <FormSubmitButton 
                            onPress={handleSubmit} 
                            title={isSubmitting ? "Logging in..." : "Login"} 
                            submitting={isSubmitting}
                        />
                    </View>
                )}
            </Formik>
        </FormContainer>
    );
};

export default LoginForm;