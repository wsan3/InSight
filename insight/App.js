import React, { useState, useEffect } from 'react';
import { Flex, Button, Spacer, Container, Heading, Text, Center, NativeBaseProvider } from "native-base";
import { Audio } from 'expo-av';

const App = () => {
  const [text, setText] = useState(true);
  const [sound, setSound] = useState();
  const [recording, setRecording] = useState();
  const [recordedURI, setRecordedURI] = useState();

  async function playSound() {
    console.log('Loading Sound');
    // const { sound } = await Audio.Sound.createAsync(require('./assets/Hello.mp3'));
    const sound = new Audio.Sound()

    await sound.loadAsync({
      uri: recordedURI
    })
    setSound(sound);
    console.log('Playing Sound');
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    setRecordedURI(uri);
    console.log('Recording stopped and stored at', uri);
  }


  return (
    <Container>
      <Heading>
        A component library for the
        <Text color="emerald.500"> React Ecosystem</Text>
      </Heading>
      <Text mt="3" fontWeight="medium">
        {text}
      </Text>

      <Flex h={40} alignItems="center">
        <Button size={16} bg="primary.500" _dark={{
          bg: "primary.400"
        }} rounded="sm" _text={{
          color: "warmGray.50",
          fontWeight: "medium"
        }}
          onPress={recording ? stopRecording : startRecording}
        // onPress={() => { setText("blue") }}
        >
          {recording ? 'Stop Recording' : 'Start Recording'}
        </Button>

        <Spacer />

        <Button size={16} bg="secondary.500" _dark={{
          bg: "secondary.400"
        }} rounded="sm" _text={{
          color: "warmGray.50",
          fontWeight: "medium"
        }}
          onPress={() => { setText("pink"); playSound() }}
        >
          Play Sound
        </Button>

        {/* <Button
          size={16} bg="secondary.500" _dark={{
            bg: "secondary.400"
          }} rounded="sm" _text={{
            color: "warmGray.50",
            fontWeight: "medium"
          }}
        >
          {recording ? 'Stop Recording' : 'Start Recording'}
        </Button> */}
      </Flex>
    </Container>
  )
};

export default () => {
  return (
    <NativeBaseProvider>
      <Center flex={1} px="3">
        <App />
      </Center>
    </NativeBaseProvider>
  );
};