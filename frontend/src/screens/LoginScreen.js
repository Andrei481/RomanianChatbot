import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const onForgotPasswordPressed = () => {
        navigation.navigate('Forgot Password');
    };

    const onSignUpPressed = () => {
        navigation.navigate('SignUp');
    };

    const handleLogin = () => {
        console.log("Login button pressed!");
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView>
                <View>
                    <CustomInput
                        placeholder="Enter Username or Email"
                        value={username}
                        setValue={setUsername}
                        keyboardType='email-address'
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
                </View>
                <View>
                    <Text>Don't have an account?</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                            <CustomButton
                                text='Sign Up!' onPress={onSignUpPressed}
                                type='TERTIARY'
                            />
                        </View>
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
        
    );
};

export default LoginScreen;