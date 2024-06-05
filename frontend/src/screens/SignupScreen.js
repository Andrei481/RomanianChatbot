import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Animated } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import styles from '../components/SignUpScreenStyle';

const gifDuration = 50000;

const SignUpScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleCreateAccount = () => {
        navigation.navigate('HomeScreen');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.container}>
                <Image
                        source={require('../pictures/logo.jpg.png')} // Adjust the path to your image file
                        style={styles.image}
                        resizeMode="contain"
                    />
                <View style={styles.innerContainer}>
                    <Text style={styles.footerText}>What's your username?</Text>
                    <CustomInput
                        placeholder="Enter Username"
                        value={username}
                        setValue={setUsername}
                        keyboardType='email-address'
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