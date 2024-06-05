// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Animated, TextInput , Button, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
// import { Audio } from 'expo-av';
// import { Ionicons } from '@expo/vector-icons';
// import styles from '../components/HomeScreenStyle';

// const HomeScreen = () => {
//   const [recording, setRecording] = useState();
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioUri, setAudioUri] = useState(null);
//   const [transcription, setTranscription] = useState("");
//   const [text, setText] = useState("");
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     askPermission();
//   }, []);

//   const askPermission = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') {
//         alert('Permission to record audio denied');
//       }
//     } catch (error) {
//       console.error('Failed to request audio permission', error);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       setAudioUri(null);
//       setTranscription("");
//       const { granted } = await Audio.requestPermissionsAsync();
//       if (granted) {
//         const recordingOptions = {
//           android: {
//             extension: '.wav',
//             audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
//             sampleRate: 44100,
//             numberOfChannels: 2,
//             bitRate: 128000,
//           },
//           ios: {
//             extension: '.wav',
//             audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
//             sampleRate: 44100,
//             numberOfChannels: 1,
//             bitRate: 128000,
//             linearPCMBitDepth: 16,
//             linearPCMIsBigEndian: false,
//             linearPCMIsFloat: false,
//           },
//         }

//         const { recording } = await Audio.Recording.createAsync(recordingOptions);
//         setRecording(recording);
//         setIsRecording(true);
//       } else {
//         alert('Permission to record audio denied');
//       }
//     } catch (error) {
//       console.error('Failed to start recording', error);
//     }
//   };

//   const stopRecording = async () => {
//         setIsRecording(false);
//         await recording.stopAndUnloadAsync();
//         const uri = recording.getURI();

//         sendAudio(uri);
//         // fetchAudio();
//       };
    
//   const sendAudio = async (uri) => {
//     const formData = new FormData();
//     formData.append('audio', {
//       uri,
//       name: 'audio.wav',
//       type: 'audio/wav',
//     });

//     fetch('https://fat-turtle.loca.lt/upload', {
//       method: 'POST',
//       body: formData,
//     })
//       .then((response) => response.text())
//       .then((result) => {
//         console.log(result);
//         setTranscription(result.startsWith('"') && result.endsWith('"') ? result.slice(1, -1) : result);
//         fetchAudio();
//       })
//       .catch((error) => {
//         console.error('Error uploading audio', error);
//       });
//   };

//   const fetchAudio = async () => {
//     // fetch('http://192.168.1.2:5000/get_audio')
//     fetch('https://fat-turtle.loca.lt/get_audio')
//       .then(response => response.blob())
//       .then(blob => {
//         const reader = new FileReader();
//         reader.onload = () => {
//           setAudioUri(reader.result);
//         };
//         reader.readAsDataURL(blob);
//       })
//       .catch(error => {
//         console.error('Error fetching audio', error);
//       });
//   };

//   const playAudio = async () => {
//     if (audioUri) {
//       const soundObject = new Audio.Sound();
//       try {
//         await soundObject.loadAsync({ uri: audioUri });
//         await soundObject.playAsync();
//       } catch (error) {
//         console.error('Error playing audio', error);
//       }
//     }
//   };

//   const handleSend = () => {
//     if (text.trim()) {
//       setMessages([...messages, { id: messages.length.toString(), text }]);
//       setText("");
//     }
//   };

//   // return (
//   //   <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//   //     <View style={{ flex: 1}}>
//   //       <ScrollView contentContainerStyle={styles.container}>
//   //         <Image
//   //             source={require('../pictures/logo.jpg.png')} // Adjust the path to your image file
//   //             style={styles.image}
//   //             resizeMode="contain"
//   //         />
//   //         <Text>Audio Recorder</Text>
//   //         <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={isRecording ? stopRecording : startRecording} />
//   //         <Button title="Play Recorded Audio" onPress={playAudio} disabled={!audioUri || transcription == "404"} />
//   //         <Text>{transcription}</Text>
//   //         <FlatList
//   //           data={messages}
//   //           renderItem={({ item }) => <Text style={styles.message}>{item.text}</Text>}
//   //           keyExtractor={(item) => item.id}
//   //         />
//   //       </ScrollView>
//   //       {/* <View style={styles.textBoxContainer}>
//   //           <TextInput
//   //             style={styles.textBox}
//   //             placeholder="Enter text here..."
//   //           />
//   //       </View> */}
//   //       <View style={styles.textBoxContainer}>
//   //         <TextInput
//   //           style={styles.textBox}
//   //           placeholder="Enter text here..."
//   //           value={text}
//   //           onChangeText={setText}
//   //         />
//   //         <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
//   //           <Ionicons name="send" size={24} color="white" />
//   //         </TouchableOpacity>
//   //       </View>
//   //     </View>
//   //   </TouchableWithoutFeedback>
//   // );

//   const renderHeader = () => (
//     <View style={styles.container}>
//       <Image
//         source={require('../pictures/logo.jpg.png')}
//         style={styles.image}
//         resizeMode="contain"
//       />
//       <Text style={{ color: 'white' }}>Audio Recorder</Text>
//       <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={isRecording ? stopRecording : startRecording} />
//       <Button title="Play Recorded Audio" onPress={playAudio} disabled={!audioUri || transcription == "404"} />
//       <Text style={{ color: 'white' }}>{transcription}</Text>
//     </View>
//   );

//   const renderMessageItem = ({ item }) => (
//     <View style={styles.messageContainer}>
//       <Text style={styles.message}>{item.text}</Text>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={{ flex: 1 }}
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View style={{ flex: 1 }}>
//           {renderHeader()}
//           <FlatList
//             data={messages}
//             renderItem={renderMessageItem}
//             keyExtractor={(item) => item.id}
//             contentContainerStyle={styles.listContainer}
//             inverted
//           />
//           <View style={styles.textBoxContainer}>
//             <TextInput
//               style={styles.textBox}
//               placeholder="Enter text here..."
//               placeholderTextColor="gray"
//               value={text}
//               onChangeText={setText}
//             />
//             <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
//               <Ionicons name="send" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

// export default HomeScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, Image, TextInput, Button, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
// import ReactScrollableList from 'react-scrollable-list';
import styles from '../components/HomeScreenStyle';

const HomeScreen = () => {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    askPermission();
  }, []);

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

  // const handleSend = () => {
  //   if (text.trim()) {
  //     setMessages([...messages, { id: messages.length.toString(), text }]);
  //     setText("");
  //   }
  // };

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
    <View style={styles.container}>
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
  );

  // const renderMessageItem = ({ item }) => (
  //   <View style={styles.messageContainer}>
  //     <Text style={styles.message}>{item.text}</Text>
  //   </View>
  // );

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
      </View>
    </KeyboardAvoidingView>
  );
}

export default HomeScreen;
