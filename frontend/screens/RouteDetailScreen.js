// screens/RouteDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function RouteDetailScreen({ route }) {
  const { routeData } = route.params;

  const initialRegion = {
    latitude: routeData.routePoints[0]?.latitude || 41.015137,
    longitude: routeData.routePoints[0]?.longitude || 28.979530,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {routeData.routePoints.map((marker, index) => (
          <Marker key={index} coordinate={marker} />
        ))}
        <Polyline coordinates={routeData.routePoints} strokeColor="#ff0000" strokeWidth={3} />
      </MapView>
      <View style={styles.details}>
        <Text style={styles.title}>{routeData.title || "Untitled Route"}</Text>
        <Text style={styles.description}>{routeData.description || "No description provided."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.5,
  },
  details: {
    padding: 16,
    backgroundColor: '#fff',
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
});
