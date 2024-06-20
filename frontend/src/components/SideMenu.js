import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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

  const handleDeleteConversation = async (conversationId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }

      const response = await axios.delete(`http://${SERVER_IP}:${SERVER_PORT}/conversation/${conversationId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Conversation deleted successfully');
        // Remove the deleted conversation from the state
        setConversations(conversations.filter(conv => conv._id !== conversationId));

        const currentConversationId = await AsyncStorage.getItem('conversationId');
        if (currentConversationId === conversationId) {
          await AsyncStorage.removeItem('conversationId');
          navigation.navigate('Conversations'); // Redirect to 'Conversations' screen
        }
      } else {
        Alert.alert('Error', response.data.message || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred while deleting the conversation');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleProfilePress = () => {
    navigation.navigate('UserAccount');
    closeMenu();
  };

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
      <TouchableOpacity style={styles.profileContainer} onPress={handleProfilePress}>
        {userData && userData.profilePicture ? (
          <Image
            source={{ uri: `data:image/png;base64,${userData.profilePicture}` }}
            style={styles.profilePicture}
          />
        ) : (
          <Image
            source={require('../pictures/user.png')}
            style={styles.profilePicture}
          />
        )}
        <Text style={styles.greeting}>
          Hello, {userData ? userData.name : 'User'}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id.toString()}  // Ensure the key is a string
        renderItem={({ item }) => (
          <View style={styles.conversationItemContainer}>
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => handleConversationPress(item._id)}
            >
              <Text style={styles.conversationText}>{item.messages?.[0]?.text || 'Nu au fost puse întrebări încă.'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteConversation(item._id)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
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
    paddingTop: 40, // Added padding to push content lower
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
  },
  conversationItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  conversationItem: {
    flex: 1,
  },
  conversationText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SideMenu;
