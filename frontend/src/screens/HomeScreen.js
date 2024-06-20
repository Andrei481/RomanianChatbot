import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, Image, TextInput, Button, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import SideMenu from '../components/SideMenu';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../components/HomeScreenStyle'; // Adjust the path as necessary

const SERVER_IP=process.env.SERVER_IP;
const SERVER_PORT=process.env.SERVER_PORT;
const LLM_SERVER_IP=process.env.LLM_SERVER_IP;
const LLM_SERVER_PORT=process.env.LLM_SERVER_PORT;

const HomeScreen = () => {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [wait, setWait] = useState(false);
  const [waitForResponse, setWaitForResponse] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const slideAnim = useState(new Animated.Value(-Dimensions.get('window').width * 0.75))[0]; // Initial position off-screen
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId: newConversationId } = route.params || {};

  useEffect(() => {
    fetchConversations(newConversationId);
  }, [newConversationId]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuVisible ? 0 : -Dimensions.get('window').width * 0.75, // Slide in from the left
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible]);

  useEffect(() => {
    if (audioUri) {
      playAudio();
      setWait(false);
      setAudioUri(null);
    }
  }, [audioUri]);

  const fetchConversations = async (conversationId) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const storedConversationId = conversationId || await AsyncStorage.getItem('conversationId');

      if (!token || !storedConversationId) {
        Alert.alert('Error', 'No authentication token or conversation ID found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/conversation/${storedConversationId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`, // Add Bearer prefix
        },
      });

      if (response.status === 200) {
        const messages = response.data.conversation.messages.map((message, index) => ({
          ...message,
          isUser: index % 2 === 0, // Set isUser based on index
        }));
        setMessages(messages);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch conversation');
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred while fetching conversation');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (granted) {
        const recordingOptions = {
          android: {
            extension: '.wav',
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 48000,
            numberOfChannels: 1,
            bitRate: 256000,
          },
          ios: {
            extension: '.wav',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 48000,
            numberOfChannels: 1,
            bitRate: 256000,
            linearPCMBitDepth: 24,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        }

        const { recording } = await Audio.Recording.createAsync(recordingOptions);
        setRecording(recording);
        setIsRecording(true);
      } else {
        alert('Permission to record audio denied');
      }
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    sendAudio(uri);
  };

  const sendAudio = async (uri) => {
    const formData = new FormData();
    formData.append('audio', {
      uri,
      name: 'audio.wav',
      type: 'audio/wav',
    });

    fetch(`http://${LLM_SERVER_IP}:${LLM_SERVER_PORT}/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        if(result != 404)
        {
          setText(result.startsWith('"') && result.endsWith('"') ? result.slice(1, -1) : result);
        }
      })
      .catch((error) => {
        console.error('Error uploading audio', error);
      });
  };

  const sendText = async (text) => {
    try {
      setAudioUri(null);
      setWait(true);
      console.log(text);
      if(text != "")
      {
        const response = await fetch(`http://${LLM_SERVER_IP}:${LLM_SERVER_PORT}/send_textForTTS`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: text,
        });
    
        const result = await response.text();
        console.log(result);
        if(result != 404)
        {
          fetchAudio();
        }
        else setWait(false);
      }

    } catch (error) {
      console.error('Error sending text', error);
    }
  };

  const fetchAudio = async () => {
    fetch(`http://${LLM_SERVER_IP}:${LLM_SERVER_PORT}/get_audio`)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          setAudioUri(reader.result);
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('Error fetching audio', error);
        setAudioUri(null);
      });
  };

  const playAudio = async () => {
    if (audioUri) {
      const soundObject = new Audio.Sound();
      try {
        await soundObject.loadAsync({ uri: audioUri });
        await soundObject.playAsync();
      } catch (error) {
        console.error('Error playing audio', error);
      }
    }
  };


  const handleSend = async () => {
    if (text.trim()) {
      setWaitForResponse(true);
      const userMessage = { id: messages.length.toString(), text, isUser: true };
      // const answerMessage = { id: (messages.length + 1).toString(), text: 'This is an answer message', isUser: false };

      setMessages([...messages, userMessage]);
      setText('');

      // // Add the answer message with a slight delay
      // setTimeout(() => {
      //   setMessages(prevMessages => [...prevMessages, answerMessage]);
      // }, 1000); // 1 second delay for demonstration

      try {
        const response = await axios.post(`http://${LLM_SERVER_IP}:${LLM_SERVER_PORT}/rag`, { prompt: text }, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // Set a timeout for the request
        });
  
        console.log('Response received:', response);
        console.log("RESPONSE DATA: ", response.data);
  
        if (response.status === 200) {
          setWaitForResponse(false);
          let answer = response.data;
          console.log('ANSWER:', answer);

          let answerMessage = { id: (messages.length + 1).toString(), text: answer, isUser: false };
          setMessages(prevMessages => [...prevMessages, answerMessage]);
          try {
            const token = await AsyncStorage.getItem('authToken');
            const conversationId = await AsyncStorage.getItem('conversationId');
    
            if (!token) {
              Alert.alert('Error', 'No authentication token found');
              return;
            }
    
            const response = await axios.put(`http://${SERVER_IP}:${SERVER_PORT}/conversation/${conversationId}`, 
              { messages: [userMessage, answerMessage] },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `${token}`,
                },
              }
            );
    
            if (response.status === 200) {
              console.log('Messages added successfully');
            } else {
              Alert.alert('Error', response.data.message || 'Failed to add messages');
            }
          } catch (error) {
            console.error('Error adding messages to conversation:', error);
            Alert.alert('Error', error.response?.data?.message || 'An error occurred while adding messages');
          }
        } else {
          Alert.alert('Error', response.data.message || 'Failed to get a response');
          setWaitForResponse(false);
        }
      } catch(error) {
        setWaitForResponse(false);
        if (error.response) {
          // Server responded with a status other than 200 range
          console.error('Server error response:', error.response.data);
          Alert.alert('Server Error', error.response.data.message || 'An error occurred while getting a response');
        } else if (error.request) {
          // No response was received
          console.error('No response received:', error.request);
          Alert.alert('Network Error', 'No response received from the server. Please check your network connection.');
        } else {
          // Something happened in setting up the request
          console.error('Request error:', error.message);
          Alert.alert('Request Error', error.message || 'An error occurred while setting up the request.');
        }
      }
    }
  };

  // const handleSend = async () => {
  //   if (text.trim()) {
  //     const userMessage = { id: messages.length.toString(), text, isUser: true };
  
  //     setMessages([...messages, userMessage]);
  //     setText('');
  
  //     try {
  //       console.log(`Sending request to http://${LLM_SERVER_IP}:${LLM_SERVER_PORT}/rag with prompt: ${text}`);
        
  //       const response = await axios.post(`http://${LLM_SERVER_IP}:${LLM_SERVER_PORT}/rag`, { prompt: text }, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         timeout: 10000, // Set a timeout for the request
  //       });
  
  //       console.log('Response received:', response);
  //       console.log("RESPONSE DATA: ", response.data);
  
  //       if (response.status === 200) {
  //         let answer = response.data;
  //         console.log('ANSWER:', answer);
  
  //         const answerMessage = { id: (messages.length + 1).toString(), text: answer, isUser: false };
  //         setMessages(prevMessages => [...prevMessages, answerMessage]);

  //         try {
  //           const token = await AsyncStorage.getItem('authToken');
  //           const conversationId = await AsyncStorage.getItem('conversationId');
    
  //           if (!token) {
  //             Alert.alert('Error', 'No authentication token found');
  //             return;
  //           }
    
  //           const updateConversationResponse = await axios.put(`http://${SERVER_IP}:${SERVER_PORT}/${conversationId}`, 
  //             { messages: [userMessage, answerMessage] },
  //             {
  //               headers: {
  //                 'Content-Type': 'application/json',
  //                 'Authorization': `${token}`,
  //               },
  //             }
  //           );
    
  //           if (updateConversationResponse.status === 200) {
  //             console.log('Messages added successfully');
  //           } else {
  //             Alert.alert('Error', response.data.message || 'Failed to add messages');
  //           }
  //         } catch (error) {
  //           console.error('Error adding messages to conversation:', error);
  //           Alert.alert('Error', error.response?.data?.message || 'An error occurred while adding messages');
  //         }
  //       } else {
  //         Alert.alert('Error', response.data.message || 'Failed to get a response');
  //       }
  //     } catch (error) {
  //       if (error.response) {
  //         // Server responded with a status other than 200 range
  //         console.error('Server error response:', error.response.data);
  //         Alert.alert('Server Error', error.response.data.message || 'An error occurred while getting a response');
  //       } else if (error.request) {
  //         // No response was received
  //         console.error('No response received:', error.request);
  //         Alert.alert('Network Error', 'No response received from the server. Please check your network connection.');
  //       } else {
  //         // Something happened in setting up the request
  //         console.error('Request error:', error.message);
  //         Alert.alert('Request Error', error.message || 'An error occurred while setting up the request.');
  //       }
  //     }
  //   }
  // };

  const renderHeader = () => (
    <TouchableWithoutFeedback onPress={() => isMenuVisible && setIsMenuVisible(false)}>
      <View style={styles.container}>
        <View style={styles.menuIcon}>
          <TouchableOpacity onPress={() => setIsMenuVisible(!isMenuVisible)} >
            <Ionicons name="menu" size={32} color="white" />
          </TouchableOpacity>
        </View>
        <Image
          source={require('../pictures/logo.jpg.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </TouchableWithoutFeedback>
  );

  const renderMessageItem = ({ item }) => {
    const playButton = (
      <TouchableOpacity style={item.isUser ? styles.userButton : styles.responseButton} onPress={() => sendText(item.text)} disabled={wait}>
        <Ionicons name="play-circle" size={24} color={wait ? "black" : "white"} />
      </TouchableOpacity>
    );
  
    return (
      <View
        key={item.id} 
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessage : styles.answerMessage,
          { flexDirection: item.isUser ? 'row' : 'row-reverse' }
        ]}
      >

        {playButton}
        <Text style={styles.message}>{item.text}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        {renderHeader()}
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
        <View style={styles.textBoxContainer}>
          <TextInput
            style={styles.textBox}
            placeholder="Enter text here..."
            placeholderTextColor="gray"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={isRecording ? stopRecording : startRecording}>
            <Ionicons name="mic-outline" size={24} color={isRecording ? '#003BB8' : 'white'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled = {isRecording || waitForResponse}>
            <Ionicons name="send" size={24} color={(isRecording || waitForResponse) ? 'black' : 'white'} />
          </TouchableOpacity>
        </View>
        {isMenuVisible && (
          <Animated.View style={[styles.sideMenuContainer, { transform: [{ translateX: slideAnim }] }]}>
            <SideMenu navigation={navigation} closeMenu={() => setIsMenuVisible(false)} />
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

export default HomeScreen;
