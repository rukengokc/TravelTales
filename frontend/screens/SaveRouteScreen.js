import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5001'
  : 'http://localhost:5001';

const SaveRouteScreen = ({ route, navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const routePoints = route?.params?.routePoints || [];

  const initialRegion = {
    latitude: routePoints[0]?.latitude || 41.015137,
    longitude: routePoints[0]?.longitude || 28.979530,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);

  const saveRoute = async (isDraft) => {
    if (!title || !description) {
      Alert.alert("Please enter both a title and description.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/routes`, {
        userId,
        routePoints,
        isDraft,
        title,
        description,
      });
      Alert.alert(isDraft ? 'Draft saved!' : 'Route shared!');
      navigation.navigate(isDraft ? 'MyDraftRoutes' : 'MySharedRoutes');
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error saving route');
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {routePoints.map((marker, index) => (
          <Marker key={index} coordinate={marker} />
        ))}
        <Polyline coordinates={routePoints} strokeColor="#ff0000" strokeWidth={3} />
      </MapView>

      <View style={styles.form}>
        <TextInput
          placeholder="Route Title"
          style={styles.input}
          onChangeText={setTitle}
          value={title}
        />
        <TextInput
          placeholder="Description"
          style={styles.input}
          onChangeText={setDescription}
          value={description}
        />
        <Button title="Save as Draft" onPress={() => saveRoute(true)} />
        <Button title="Share" onPress={() => saveRoute(false)} />
      </View>
    </View>
  );
};

export default SaveRouteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
  },
  form: {
    padding: 15,
    backgroundColor: '#fff',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
    paddingHorizontal: 10,
    height: 40,
  }
});
