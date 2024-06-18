import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import styles from '../components/SignUpScreenStyle';

const SERVER_IP=process.env.SERVER_IP;
const SERVER_PORT=process.env.SERVER_PORT;


const EmailVerificationScreen = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const navigation = useNavigation();

    const handleVerifyAccount = async () => {
        try {
            console.log(`http://${SERVER_IP}:${SERVER_PORT}/verify`);
            const response = await axios.post(`http://${SERVER_IP}:${SERVER_PORT}/verify`, {
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
                    <Text style={styles.footerText}>What's your account's email or username?</Text>
                    <CustomInput
                        placeholder="Enter Email or Username"
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