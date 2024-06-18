import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import styles from '../components/SignUpScreenStyle';

const SERVER_IP=process.env.SERVER_IP;
const SERVER_PORT=process.env.SERVER_PORT;

const ResetPasswordScreen = () => {
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();

    
    const handleChangePassword = async () => {
        try {
            const response = await axios.post(`http://${SERVER_IP}:${SERVER_PORT}/resetpass`, {
                identifier: email,
                resetToken: code,
                newPassword: newPassword
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (response.status === 200) {
                Alert.alert('Password Changed Successfully', 'Your password has been changed successfully.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Password Change Failed', response.data.message || 'Failed to change password.');
            }
        } catch (error) {
            console.error('Error during password change:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred while changing password';
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
                    <Text style={styles.footerText}>What's your verification code?</Text>
                    <CustomInput
                        placeholder="Enter Verification Code"
                        value={code}
                        setValue={setCode}
                        keyboardType='numeric-code'
                    />
                    <Text style={styles.footerText}>What's your email?</Text>
                    <CustomInput
                        placeholder="Enter Email"
                        value={email}
                        setValue={setEmail}
                        keyboardType='email-address'
                    />
                    <Text style={styles.footerText}>What's your new password?</Text>
                    <CustomInput
                        placeholder="Enter New Password"
                        value={newPassword}
                        setValue={setNewPassword}
                        secureTextEntry={true}
                    />
                    <Text style={styles.footerText}>Confirm new password</Text>
                    <CustomInput
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        setValue={setConfirmPassword}
                        secureTextEntry={true}
                    />
                    <View style={{ width: 200, marginTop: 10}}>
                            <CustomButton
                                text='Change Password' onPress={handleChangePassword}
                                type='PRIMARY'
                                disabled={!code || !newPassword|| !email || !confirmPassword || !(newPassword == confirmPassword)}
                            />
                    </View>
                </View>
                <View style={styles.footer}>
                    
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
        
    );
};

export default ResetPasswordScreen;