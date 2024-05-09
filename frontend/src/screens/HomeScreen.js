import React, { useState, useEffect } from 'react';
import { Text, View, Button } from 'react-native';
import { Audio } from 'expo-av';

const HomeScreen = () => {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [transcription, setTranscription] = useState("")

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
        // fetchAudio();
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
    // fetch('http://192.168.1.2:5000/get_audio')
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

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Audio Recorder</Text>
      <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={isRecording ? stopRecording : startRecording} />
      <Button title="Play Recorded Audio" onPress={playAudio} disabled={!audioUri || transcription == "404"} />
      <Text>{transcription}</Text>
    </View>
  );
}

export default HomeScreen;