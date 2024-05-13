import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Login' component={LoginScreen} />
                <Stack.Screen name='HomeScreen' component={HomeScreen} />
                {/* <Stack.Screen name='SignUp' component={SignupScreen} />
                <Stack.Screen name='Forgot Password' component={ForgotPasswordScreen} />
                <Stack.Screen name='Reset Password' component={ResetPasswordScreen} />
                <Stack.Screen name='Home' component={HomeScreen} />
                <Stack.Screen name='User Profile' component={UserProfileScreen} /> */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;