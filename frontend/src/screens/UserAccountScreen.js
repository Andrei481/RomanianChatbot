import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import baseStyles from '../components/SignUpScreenStyle';

const SERVER_IP = process.env.SERVER_IP;
const SERVER_PORT = process.env.SERVER_PORT;

const UserAccountScreen = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
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

                const response = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/user/${userId}`, {
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
                    if (userData.profilePicture) {
                        setProfilePicture(`data:image/png;base64,${userData.profilePicture}`);
                    }
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

    const handleImageSelection = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                base64: true,
            });
    
            // console.log('ImagePicker result:', result);
    
            if (!result.cancelled) {
                // console.log('Base64-encoded image data:', result.assets[0].base64); // Log the base64 data if available
                updateProfilePicture(result.assets[0].base64);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
        }
    };
    

    const updateProfilePicture = async (base64Image) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const userId = await AsyncStorage.getItem('userId');

            if (!token || !userId) {
                Alert.alert('Error', 'No authentication token or user ID found');
                return;
            }

            const response = await axios.put(`http://${SERVER_IP}:${SERVER_PORT}/user/${userId}/profilePicture`, 
            {
                profilePicture: base64Image
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                },
            });

            if (response.status === 200) {
                setProfilePicture(`data:image/png;base64,${base64Image}`);
                Alert.alert('Success', 'Profile picture updated successfully');
            } else {
                Alert.alert('Error', response.data.message || 'Failed to update profile picture');
            }
        } catch (error) {
            console.error('Error updating profile picture:', error);
            Alert.alert('Error', error.response?.data?.message || 'An error occurred while updating profile picture');
        }
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('authToken');
                            const userId = await AsyncStorage.getItem('userId');

                            if (!token || !userId) {
                                Alert.alert('Error', 'No authentication token or user ID found');
                                return;
                            }

                            const response = await axios.delete(`http://${SERVER_IP}:${SERVER_PORT}/user/${userId}`, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `${token}`,
                                },
                            });

                            if (response.status === 200) {
                                Alert.alert('Success', 'Account deleted successfully');
                                await AsyncStorage.clear();
                                navigation.navigate('Login');
                            } else {
                                Alert.alert('Error', response.data.message || 'Failed to delete account');
                            }
                        } catch (error) {
                            console.error('Error deleting account:', error);
                            Alert.alert('Error', error.response?.data?.message || 'An error occurred while deleting account');
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={handleImageSelection}>
                {profilePicture ? (
                    <Image
                        source={{ uri: profilePicture }}
                        style={styles.profilePicture}
                        resizeMode="contain"
                    />
                ) : (
                    <Image
                        source={require('../pictures/user.png')}
                        style={styles.profilePicture}
                        resizeMode="contain"
                    />
                )}
            </TouchableOpacity>
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

const styles = StyleSheet.create({
    ...baseStyles,
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
});

export default UserAccountScreen;
