import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Button,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const CreateRouteScreen = ({ navigation }) => {
  const [markers, setMarkers] = useState([]);

  const [region, setRegion] = useState({
    latitude: 41.015137, // Default to Istanbul
    longitude: 28.979530,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const handleMapPress = (e) => {
    const newMarker = e.nativeEvent.coordinate;
    setMarkers([...markers, newMarker]);
  };

  const handleSaveRoute = () => {
    navigation.navigate('SaveRoute', { routePoints: markers });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MapView
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
      >
        {markers.map((marker, index) => (
          <Marker key={index} coordinate={marker} />
        ))}
        <Polyline coordinates={markers} strokeColor="#FF0000" strokeWidth={3} />
      </MapView>

      <View style={styles.controls}>
        <Button title="Save the Route" onPress={handleSaveRoute} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateRouteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 100,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
});
