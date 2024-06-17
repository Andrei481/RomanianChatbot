import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import styles from '../components/SignUpScreenStyle';
const SERVER_IP="10.8.0.18" 
const SERVER_PORT="3000"

const EmailVerificationScreen = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const navigation = useNavigation();

    const handleVerifyAccount = async () => {
        try {
            const response = await axios.post(`https://b5b2-79-114-87-80.ngrok-free.app/verify`, {
                identifier: email,
                userToken: code,
            });

            if (response.status === 200) {
                Alert.alert('Verification Successful', 'Your account has been verified successfully.');
                // Navigate to the login screen or another appropriate screen
                navigation.navigate('Login');
            } else {
                Alert.alert('Verification Failed', response.data.message || 'Invalid verification code or email.');
            }
        } catch (error) {
            console.error('Error during verification:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred during verification';
            Alert.alert('Verification Failed', errorMessage);
        }
    };
        

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.container}>
                <Image
                        source={require('../pictures/logo.jpg.png')} 
                        style={styles.image}
                        resizeMode="contain"
                    />
                <View style={styles.innerContainer}>
                    <Text style={styles.footerText}>What's your new account's email?</Text>
                    <CustomInput
                        placeholder="Enter Email"
                        value={email}
                        setValue={setEmail}
                        keyboardType='email-address'
                    />
                    <Text style={styles.footerText}>What's your verification code?</Text>
                    <CustomInput
                        placeholder="Enter Verification Code"
                        value={code}
                        setValue={setCode}
                        keyboardType='numeric-code'
                    />
                    <View style={{ width: 200, marginTop: 10 }}>
                            <CustomButton
                                text='Verify Account' onPress={handleVerifyAccount}
                                type='PRIMARY'
                                disabled={!email || !code}
                            />
                    </View>
                </View>
                <View style={styles.footer}>
                    
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
        
    );
};

export default EmailVerificationScreen;