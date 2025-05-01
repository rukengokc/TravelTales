import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

export default function RouteDetailScreen({ route, navigation }) {
  const { routeData, editable } = route.params;

  const [title, setTitle] = useState(routeData.title || '');
  const [description, setDescription] = useState(routeData.description || '');
  const [points, setPoints] = useState(routeData.routePoints || []);

  const initialRegion = {
    latitude: points[0]?.latitude || 41.015137,
    longitude: points[0]?.longitude || 28.979530,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  const addPoint = (e) => {
    const newPoint = e.nativeEvent.coordinate;
    setPoints([...points, newPoint]);
  };

  const removeLastPoint = () => {
    if (points.length === 0) return;
    const updated = [...points];
    updated.pop();
    setPoints(updated);
  };

  const saveChanges = async () => {
    try {
      await axios.put(`${BASE_URL}/routes/${routeData._id}`, {
        title,
        description,
        routePoints: points,
      });

      Alert.alert('Success', 'Route updated successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Save failed:', err.message);
      Alert.alert('Error', 'Error updating route');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={editable ? addPoint : undefined}
      >
        {points.map((point, index) => (
          <Marker key={index} coordinate={point} />
        ))}
        <Polyline coordinates={points} strokeColor="#ff0000" strokeWidth={3} />
      </MapView>

      <View style={styles.form}>
        {editable ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />
            <TouchableOpacity style={styles.button} onPress={removeLastPoint}>
              <Text style={styles.buttonText}>Remove Last Point</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,

    height: Dimensions.get('window').height * 0.5,
  },
  form: {
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
