import React, { useState, useEffect } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, StyleSheet, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConversationsList from '../components/ConversationsList';
import CustomButton from '../components/CustomButton';
import styles from '../components/HomeScreenStyle'; // Adjust the path as necessary

const SERVER_IP = "10.8.0.18";
const SERVER_PORT = "3000";

const ConversationsScreen = () => {
  const navigation = useNavigation();

  const renderHeader = () => (
    <View style={styles.container}>
      <Image
        source={require('../pictures/logo.jpg.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          text='New Conversation'
          onPress={handleNewConversation}
          type='PRIMARY'
        />
      </View>
    </View>
  );

  const handleNewConversation = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log(token)
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Alert.alert('Error', 'No authentication token or user ID found');
        return;
      }

      const response = await axios.post(`https://b5b2-79-114-87-80.ngrok-free.app/user/${userId}/newConversation`,
        { messages: [] }, // Initially empty messages
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(response.data.conversation._id)
        await AsyncStorage.setItem('conversationId', response.data.conversation._id);
        Alert.alert('Success', 'Conversation created successfully');
        navigation.navigate('HomeScreen');
        // navigation.navigate('ConversationScreen', { conversationId: response.data.conversation._id });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred while creating the conversation');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        {renderHeader()}
        <ConversationsList />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ConversationsScreen;
