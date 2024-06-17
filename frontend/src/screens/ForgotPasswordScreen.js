import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import styles from '../components/SignUpScreenStyle';
const SERVER_IP="10.8.0.18" 
const SERVER_PORT="3000"

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigation = useNavigation();

    const user = {
        identifier: email,
    };

    const handleSendCode = async () => {
        try {
            const response = await axios.post(`https://b5b2-79-114-87-80.ngrok-free.app/forgotpass`, user, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            
            });
            if (response.status === 200) {
                navigation.navigate('ResetPassword');
                Alert.alert('Code Sent Successfully', 'Your password resetting code was sent to your email address.');
            } else {
                Alert.alert('Password Change Failed', response.data.message || 'Invalid verification code or email.');
            }
        } catch (error) {
            console.error('Error during password change:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred during password change';
            Alert.alert('Password Change Failed', errorMessage);
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
                    <Text style={styles.footerText}>What's your email?</Text>
                    <CustomInput
                        placeholder="Enter Email"
                        value={email}
                        setValue={setEmail}
                        keyboardType='email-address'
                    />
                    <View style={{ width: 200, marginTop: 10, marginBottom:20 }}>
                            <CustomButton
                                text='Send Password Code' onPress={handleSendCode}
                                type='PRIMARY'
                                disabled={!email}
                            />
                    </View>
                </View>
                <View style={styles.footer}>
                    
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
        
    );
};

export default ForgotPasswordScreen;