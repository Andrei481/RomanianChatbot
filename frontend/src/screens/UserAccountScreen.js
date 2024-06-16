import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/SignUpScreenStyle';

const SERVER_IP=process.env.SERVER_IP
const SERVER_PORT=process.env.SERVER_PORT

const UserAccountScreen = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const userId = await AsyncStorage.getItem('userId');

                if (!token || !userId) {
                    Alert.alert('Error', 'No authentication token or user ID found');
                    return;
                }

                const response = await axios.get(`https://b5b2-79-114-87-80.ngrok-free.app/user/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${token}`,
                    },
                });

                if (response.status === 200) {
                    const userData = response.data;
                    setName(userData.name);
                    setUsername(userData.username);
                    setEmail(userData.email);
                } else {
                    Alert.alert('Error', response.data.message || 'Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Error', error.response?.data?.message || 'An error occurred while fetching user data');
            }
        };

        fetchUserData();
    }, []);

    const handleDeleteAccount = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const userId = await AsyncStorage.getItem('userId');

            if (!token || !userId) {
                Alert.alert('Error', 'No authentication token or user ID found');
                return;
            }

            const response = await axios.delete(`https://b5b2-79-114-87-80.ngrok-free.app/user/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                },
            });

            if (response.status === 200) {
                Alert.alert('Success', 'Account deleted successfully');
                // Clear AsyncStorage and navigate to the login screen
                await AsyncStorage.clear();
                navigation.navigate('Login');
            } else {
                Alert.alert('Error', response.data.message || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            Alert.alert('Error', error.response?.data?.message || 'An error occurred while deleting account');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require('../pictures/logo.jpg.png')}
                style={styles.image}
                resizeMode="contain"
            />
            <View style={styles.innerContainer}>
                <Text style={styles.footerText}>Username:</Text>
                <View style={styles.nonEditableBox}>
                    <Text style={styles.nonEditableText}>{username}</Text>
                </View>
                <Text style={styles.footerText}>Email:</Text>
                <View style={styles.nonEditableBox}>
                    <Text style={styles.nonEditableText}>{email}</Text>
                </View>
                <View style={{ width: 200, marginTop: 10 }}>
                    <CustomButton
                        text='Delete Account' 
                        onPress={handleDeleteAccount}
                        type='PRIMARY'
                    />
                </View>
            </View>
            <View style={styles.footer}></View>
        </ScrollView>
    );
};



export default UserAccountScreen;

