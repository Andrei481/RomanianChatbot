import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/HomeScreenStyle';
import { useNavigation } from '@react-navigation/native';

const ConversationsList = () => {
    const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          Alert.alert('Error', 'No authentication token or user ID found');
          return;
        }

        const response = await axios.get(`https://b5b2-79-114-87-80.ngrok-free.app/user/${userId}/conversations`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },
        });

        if (response.status === 200) {
          setConversations(response.data.conversations);
        } else {
          Alert.alert('Error', response.data.message || 'Failed to fetch conversations');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        Alert.alert('Error', error.response?.data?.message || 'An error occurred while fetching conversations');
      }
    };

    fetchConversations();
  }, []);

  const handleConversationPress = async (conversationId) => {
    try {
      await AsyncStorage.setItem('conversationId', conversationId);
      // Navigate to the conversation screen if needed
      navigation.navigate('HomeScreen', { conversationId });
    } catch (error) {
      console.error('Error saving conversation ID:', error);
      Alert.alert('Error', 'Failed to save conversation ID');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem} onPress={() => handleConversationPress(item._id)}>
      <Text style={styles.conversationText}>ID: {item._id}</Text>
      <Text style={styles.conversationText}>{item.title || 'No Title'}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={conversations}
      renderItem={renderItem}
      keyExtractor={item => item._id}
      style={styles.listContainer}
    />
  );
};

export default ConversationsList;
