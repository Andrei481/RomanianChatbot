import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, Image, TextInput, Button, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SideMenu from '../components/SideMenu';
import styles from '../components/HomeScreenStyle'; // Adjust the path as necessary

const HomeScreen = () => {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-Dimensions.get('window').width * 0.75))[0]; // Initial position off-screen
  const navigation = useNavigation();

  useEffect(() => {
    askPermission();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuVisible ? 0 : -Dimensions.get('window').width * 0.75, // Slide in from the left
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible]);

  const askPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to record audio denied');
      }
    } catch (error) {
      console.error('Failed to request audio permission', error);
    }
  };

  const startRecording = async () => {
    try {
      setAudioUri(null);
      setTranscription("");
      const { granted } = await Audio.requestPermissionsAsync();
      if (granted) {
        const recordingOptions = {
          android: {
            extension: '.wav',
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
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

    fetch('https://fat-turtle.loca.lt/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        setTranscription(result.startsWith('"') && result.endsWith('"') ? result.slice(1, -1) : result);
        fetchAudio();
      })
      .catch((error) => {
        console.error('Error uploading audio', error);
      });
  };

  const fetchAudio = async () => {
    fetch('https://fat-turtle.loca.lt/get_audio')
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

  const handleSend = () => {
    if (text.trim()) {
      const userMessage = { id: messages.length.toString(), text, isUser: true };
      const answerMessage = { id: (messages.length + 1).toString(), text: 'This is an answer message', isUser: false };

      setMessages([...messages, userMessage]);
      setText('');

      // Add the answer message with a slight delay
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, answerMessage]);
      }, 1000); // 1 second delay for demonstration
    }
  };

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
        <Text style={{ color: 'white' }}>Audio Recorder</Text>
        <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={isRecording ? stopRecording : startRecording} />
        <Button title="Play Recorded Audio" onPress={playAudio} disabled={!audioUri || transcription == "404"} />
        <Text style={{ color: 'white' }}>{transcription}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  const renderMessageItem = ({ item }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.answerMessage]}>
      <Text style={styles.message}>{item.text}</Text>
    </View>
  );

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
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={24} color="white" />
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

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#1E1E1E',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//   },
//   menuIcon: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//   },
//   image: {
//     width: 100,
//     height: 100,
//     alignSelf: 'center',
//   },
//   messageContainer: {
//     padding: 10,
//     borderRadius: 10,
//     marginVertical: 5,
//     marginHorizontal: 10,
//   },
//   userMessage: {
//     backgroundColor: '#007AFF',
//     alignSelf: 'flex-end',
//   },
//   answerMessage: {
//     backgroundColor: '#E5E5EA',
//     alignSelf: 'flex-start',
//   },
//   message: {
//     color: '#FFF',
//   },
//   textBoxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//   },
//   textBox: {
//     flex: 1,
//     borderColor: 'gray',
//     borderWidth: 1,
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     color: 'white',
//   },
//   sendButton: {
//     marginLeft: 10,
//     backgroundColor: '#007AFF',
//     borderRadius: 20,
//     padding: 10,
//   },
//   sideMenuContainer: {
//     position: 'absolute',
//     top: 0,
//     bottom: 0,
//     left: 0,
//     width: Dimensions.get('window').width * 0.75,
//     backgroundColor: '#1E1E1E',
//     zIndex: 10,
//   },
//   listContainer: {
//     paddingVertical: 20,
//   },
// });

export default HomeScreen;
