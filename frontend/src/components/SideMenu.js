import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const SERVER_IP=process.env.SERVER_IP;
const SERVER_PORT=process.env.SERVER_PORT;

const SideMenu = ({ navigation, closeMenu }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          Alert.alert('Error', 'No authentication token or user ID found');
          return;
        }

        const response = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/user/${userId}/conversations`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },
        });

        setConversations(response.data.conversations);
      } catch (error) {
        console.error("Error retrieving conversations: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      setLoading(true);
      fetchConversations();
    }
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleConversationPress = async (conversationId) => {
    try {
      await AsyncStorage.setItem('conversationId', conversationId);
      navigation.navigate('HomeScreen', { conversationId }); // Pass conversationId to HomeScreen
      closeMenu();
    } catch (error) {
      console.error('Error saving conversation ID:', error);
      Alert.alert('Error', 'Failed to save conversation ID');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => { navigation.navigate('UserAccount'); closeMenu(); }}>
        <Text style={styles.menuItem}>User Profile</Text>
      </TouchableOpacity>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleConversationPress(item._id)}
          >
            <Text style={styles.conversationText}>{item.messages?.[0]?.text || 'Nu au fost puse întrebări încă.'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    fontSize: 18,
    marginVertical: 10,
  },
  conversationItem: {
    backgroundColor: '#000',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  conversationText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SideMenu;

