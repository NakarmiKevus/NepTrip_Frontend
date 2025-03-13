import React from 'react';
import { View, Alert } from 'react-native';
import FormContainer from '../Components/FormContainer';
import FormInput from '../Components/FormInput';
import FormSubmitButton from '../Components/FormSubmitButton';
import { Formik } from 'formik';
import * as Yup from 'yup';
import client from '../API/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const validationSchema = Yup.object({
    fullname: Yup.string().trim().min(3, 'Invalid name').required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().trim().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string().equals([Yup.ref('password')], 'Passwords do not match').required('Confirm password is required'),
});

const SignupForm = ({ navigation }) => {
    const userInfo = {
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
    };

    const signUp = async (values, formikActions) => {
        try {
            const res = await client.post('/create-user', values);
            if (res.data.success) {
                const signInRes = await client.post('/sign-in', {
                    email: values.email,
                    password: values.password,
                });
                if (signInRes.data.success) {
                    // ✅ Store token and user in AsyncStorage
                    await AsyncStorage.setItem('token', signInRes.data.token);
                    await AsyncStorage.setItem('user', JSON.stringify(signInRes.data.user));

                    // ✅ Navigate to Image Upload
                    navigation.replace('ImageUpload', {
                        token: signInRes.data.token,
                        onComplete: () => navigation.replace('Dashboard'),
                    });
                }
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Error signing up');
        }
        formikActions.setSubmitting(false);
    };

    return (
        <FormContainer>
            <Formik initialValues={userInfo} validationSchema={validationSchema} onSubmit={signUp}>
                {({ values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit }) => (
                    <View>
                        <FormInput
                            value={values.fullname}
                            error={touched.fullname && errors.fullname}
                            onChangeText={handleChange('fullname')}
                            onBlur={handleBlur('fullname')}
                            label="Full Name"
                            placeholder="John Doe"
                        />
                        <FormInput
                            value={values.email}
                            error={touched.email && errors.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            autoCapitalize="none"
                            label="Email"
                            placeholder="example@email.com"
                        />
                        <FormInput
                            value={values.password}
                            error={touched.password && errors.password}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            autoCapitalize="none"
                            secureTextEntry
                            label="Password"
                            placeholder="********"
                        />
                        <FormInput
                            value={values.confirmPassword}
                            error={touched.confirmPassword && errors.confirmPassword}
                            onChangeText={handleChange('confirmPassword')}
                            onBlur={handleBlur('confirmPassword')}
                            autoCapitalize="none"
                            secureTextEntry
                            label="Confirm Password"
                            placeholder="********"
                        />
                        <FormSubmitButton submitting={isSubmitting} onPress={handleSubmit} title="Sign up" />
                    </View>
                )}
            </Formik>
        </FormContainer>
    );
};

export default SignupForm;
