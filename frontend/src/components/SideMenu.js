import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_IP = process.env.SERVER_IP;
const SERVER_PORT = process.env.SERVER_PORT;

const SideMenu = ({ navigation, closeMenu }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          Alert.alert('Error', 'No authentication token or user ID found');
          return;
        }

        const conversationsResponse = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/user/${userId}/conversations`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },
        });

        const userResponse = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/user/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },
        });

        setConversations(conversationsResponse.data.conversations);
        setUserData(userResponse.data);
      } catch (error) {
        console.error("Error retrieving conversations or user data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

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
      navigation.navigate('HomeScreen', { conversationId });
      closeMenu();
    } catch (error) {
      console.error('Error saving conversation ID:', error);
      Alert.alert('Error', 'Failed to save conversation ID');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => { navigation.navigate('UserAccount'); closeMenu(); }}>
        {userData && userData.profilePicture ? (
          <Image
            source={{ uri: `data:image/png;base64,${userData.profilePicture}` }}
            style={styles.profilePicture}
          />
        ) : (
          <Text style={styles.greeting}>Hello, {userData ? userData.name : 'User'}</Text>
        )}
      </TouchableOpacity>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleConversationPress(item._id)}
          >
            <Text style={styles.conversationText}>{item._id}</Text>
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
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  greeting: {
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
