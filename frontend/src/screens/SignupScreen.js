import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import styles from '../components/SignUpScreenStyle';

const SERVER_IP=process.env.SERVER_IP
const SERVER_PORT=process.env.SERVER_PORT


const SignUpScreen = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();

    const handleCreateAccount = async () => {
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
        if (!usernameRegex.test(name)) {
            Alert.alert("Invalid Name", "Name can only contain letters, numbers, and the symbols: . _ -");
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
            name: name,
            username: username,
            email: email,
            password: password
        };

        try {
            const response = await axios.post(`http://${SERVER_IP}:${SERVER_PORT}/register`, user, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // Set a timeout to avoid hanging indefinitely
            });
            console.log(name, " ", username);
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
                    <Text style={styles.footerText}>What's your name?</Text>
                    <CustomInput
                        placeholder="Enter Name"
                        value={name}
                        setValue={setName}
                        keyboardType='name'
                    />
                    <Text style={styles.footerText}>What's your username?</Text>
                    <CustomInput
                        placeholder="Enter Username"
                        value={username}
                        setValue={setUsername}
                        keyboardType='username'
                    />
                    <Text style={styles.footerText}>What's your email?</Text>
                    <CustomInput
                        placeholder="Enter Email"
                        value={email}
                        setValue={setEmail}
                        keyboardType='email-address'
                    />
                    <Text style={styles.footerText}>What's your password?</Text>
                    <CustomInput
                        placeholder="Enter Password"
                        value={password}
                        setValue={setPassword}
                        secureTextEntry={true}
                    />
                    <View style={{ width: 200, marginTop: 10 }}>
                            <CustomButton
                                text='Create Account' onPress={handleCreateAccount}
                                type='PRIMARY'
                                disabled={!username || !password || !email}
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