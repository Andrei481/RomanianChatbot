import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Animated } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import styles from '../components/LoginScreenStyle';

const SERVER_IP=process.env.SERVER_IP
const SERVER_PORT=process.env.SERVER_PORT
const gifDuration = 50000;

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    

    const onForgotPasswordPressed = () => {
        navigation.navigate('ForgotPassword');
    };

    const onSignUpPressed = () => {
        navigation.navigate('SignUp');
    };

    const onVerifyAccount = () => {
        navigation.navigate('EmailVerification');
    };

    const handleLogin = async () => {
        console.log("Login button pressed!");
        const user = {
            identifier: username,
            password: password,
        };
        try {
            const response = await axios.post(`http://${SERVER_IP}:${SERVER_PORT}/login`, user, { 
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 
            });

            if (response.status === 200) {
                console.log('Login successful!', response.data);
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('userId', response.data.userId);
                navigation.navigate('Conversations'); 
            } else {
                Alert.alert('Login Failed', response.data.message || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
            Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred during login');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.container}>
                <Image
                        source={require('../pictures/logo.jpg.png')} // Adjust the path to your image file
                        style={styles.image}
                        resizeMode="contain"
                />
                <Image
                        source={require('../pictures/messagif.gif')} // Adjust the path to your image file
                        style={styles.image}
                        resizeMode="contain"
                />
                <View style={styles.innerContainer}>
                    <CustomInput
                        placeholder="Enter Username or Email"
                        value={username}
                        setValue={setUsername}
                        keyboardType='username'
                    />
                    <CustomInput
                        placeholder="Enter Password"
                        value={password}
                        setValue={setPassword}
                        secureTextEntry={true}
                    />
                    <View style={{ width: 200, marginTop: 10 }}>
                            <CustomButton
                                text='Login' onPress={handleLogin}
                                type='PRIMARY'
                                disabled={!username || !password}
                            />
                    </View>
                    <View>
                        <CustomButton
                            text='Forgot your Password?'
                            onPress={onForgotPasswordPressed}
                            type='TERTIARY'
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                        <CustomButton
                            text='Sign Up!' onPress={onSignUpPressed}
                            type='TERTIARY'
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                        <CustomButton
                            text='Verify Account!' onPress={onVerifyAccount}
                            type='TERTIARY'
                        />
                    </View>
                </View>
                        
            </ScrollView>
        </TouchableWithoutFeedback>
        
    );
};

export default LoginScreen;