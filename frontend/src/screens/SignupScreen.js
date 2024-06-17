import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import styles from '../components/SignUpScreenStyle';
import CustomInputSignUp from '../components/CustomInputSignUp';
const SERVER_IP="10.8.0.18" 
const SERVER_PORT="3000"

const SignUpScreen = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();

    const handleCreateAccount = async () => {
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
        if (!usernameRegex.test(firstName)) {
            Alert.alert("Invalid First Name", "First Name can only contain letters, numbers, and the symbols: . _ -");
            return;
        }
        if (!usernameRegex.test(firstName)) {
            Alert.alert("Invalid Last Name", "Last Name can only contain letters, numbers, and the symbols: . _ -");
            return;
        }
        if (!usernameRegex.test(username)) {
            Alert.alert("Invalid Username", "Username can only contain letters, numbers, and the symbols: . _ -");
            return;
        }
        if (!emailRegex.test(email)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        const user = {
            name: firstName+" "+lastName,
            username: username,
            email: email,
            password: password
        };

        try {
            const response = await axios.post(`https://b5b2-79-114-87-80.ngrok-free.app/register`, user, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // Set a timeout to avoid hanging indefinitely
            });
            // console.log(name, " ", username);
            Alert.alert("Success", "Account created successfully!");
            navigation.navigate('EmailVerification');
            console.log("Response from server:", response.data);

            
        } catch (error) {
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
                console.error("Error response headers:", error.response.headers);
            } else if (error.request) {
                console.error("Error request data:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
            console.error("Error config:", error.config);
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
                    <Text style={styles.footerText}>What's your first name?</Text>
                    <CustomInputSignUp
                        placeholder="First name"
                        value={firstName}
                        setValue={setFirstName}
                        keyboardType='name'
                    />
                    <Text style={styles.footerText}>What's your last name?</Text>
                    <CustomInputSignUp
                        placeholder="Last Name"
                        value={lastName}
                        setValue={setLastName}
                        keyboardType='name'
                    />
                    <Text style={styles.footerText}>What's your username?</Text>
                    <CustomInputSignUp
                        placeholder="Enter Username"
                        value={username}
                        setValue={setUsername}
                        keyboardType='username'
                    />
                    <Text style={styles.footerText}>What's your email?</Text>
                    <CustomInputSignUp
                        placeholder="Enter Email"
                        value={email}
                        setValue={setEmail}
                        keyboardType='email-address'
                    />
                    <Text style={styles.footerText}>What's your password?</Text>
                    <CustomInputSignUp
                        placeholder="Enter Password"
                        value={password}
                        setValue={setPassword}
                        secureTextEntry={true}
                    />
                    <Text style={styles.footerText}>Verify password</Text>
                    <CustomInputSignUp
                        placeholder="Enter Password"
                        value={confirmPassword}
                        setValue={setConfirmPassword}
                        secureTextEntry={true}
                    />
                    <View style={{ width: 200, marginTop: 10 }}>
                            <CustomButton
                                text='Create Account' onPress={handleCreateAccount}
                                type='PRIMARY'
                                disabled={!firstName || !lastName || !password || !confirmPassword || !(password == confirmPassword) || !email}
                            />
                    </View>
                </View>
                <View style={styles.footer}>
                    
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
        
    );
};

export default SignUpScreen;