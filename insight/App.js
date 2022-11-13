import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Button, Image, ActivityIndicator, StyleSheet, Text, View, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';

const API_KEY = process.env.API_KEY;
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

async function callGoogleVisionAsync(image) {
  const body = {
    requests: [
      {
        image: {
          content: image,
        },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION',
            maxResults: 1,
          },
        ],
      },
    ],
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();

  // return result.responses[0].labelAnnotations[0].description;
  return result.responses[0].textAnnotations[0].description;
}

export default function App() {
  const [image, setImage] = React.useState(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [description, setDescription] = React.useState(null);
  const [permissions, setPermissions] = React.useState(false);

  const speak = () => {
    setIsSpeaking(true);
    Speech.speak(description);
  };

  const stopSpeak = () => {
    setIsSpeaking(false);
    Speech.stop();
  };

  const askPermissionsAsync = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    } else {
      setPermissions(true);
    }
  };

  const takePictureAsync = async () => {
    const { cancelled, uri, base64 } = await ImagePicker.launchCameraAsync({
      base64: true,
    });

    if (!cancelled) {
      setImage(uri);
      setDescription('Loading...');
      try {
        const result = await callGoogleVisionAsync(base64);
        setDescription(result);
      } catch (error) {
        setDescription(`Error: ${error.message}`);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {permissions === false ? (
        <View style={{
          flex: 1, alignItems: 'center',
          justifyContent: 'center', width: '100%'
        }} >
          <Button onPress={askPermissionsAsync} title="Ask permissions" />
        </View>
      ) : (

        <View style={[styles.container, {
          // Try setting `flexDirection` to `"row"`.
          flexDirection: "column"
        }]}>
          <>
            <View style={{
              flex: 1, alignItems: 'center',
              justifyContent: 'center', width: '100%', backgroundColor: "white"
            }} >
              <Text onPress={takePictureAsync} style={{ fontSize: 40, backgroundColor: "white", color: "#2596be" }}>
                InSight
              </Text>
            </View>

            <View style={{
              flex: 2, alignItems: 'center',
              justifyContent: 'center', width: '100%', backgroundColor: "#f0f7ff"
            }} >
              {image ?
                <Image style={styles.image} source={{ uri: image }} />
                :
                null
              }
            </View>

            <View style={{ flex: 4, width: '100%', backgroundColor: "#d4e9ff" }} >
              {description === 'Loading...' ?
                <ActivityIndicator style={{ flex: 1 }} color="white" size="large" />
                :
                <ScrollView style={{ flex: 1, margin: 20, backgroundColor: "#d4e9ff" }}>
                  {description && <Text style={styles.text}>{description}</Text>}
                </ScrollView >
              }

            </View>
            <View style={{
              flex: 1, flexDirection: 'row', width: '100%', backgroundColor: "green"
            }}>
              <View style={{
                flex: 1, backgroundColor: "white", alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Button style={{ flex: 1 }} onPress={takePictureAsync} title="Take a Picture" />
              </View>
              <View style={{
                flex: 1, backgroundColor: "white", alignItems: 'center',
                justifyContent: 'center'
              }}>

                {!isSpeaking ?
                  <Button style={{ flex: 1 }} onPress={speak} title="Start Speech" />
                  :
                  <Button style={{ flex: 1 }} onPress={stopSpeak} title="Stop Speech" />
                }
              </View>
            </View>
          </>
        </View >
      )
      }
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  text: {
    margin: 5,
    fontSize: 40
  },
});