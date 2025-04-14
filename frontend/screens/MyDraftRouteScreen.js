// screens/MyDraftRoutesScreen.js
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
    Platform,
    FlatList,
    ActivityIndicator 
  } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const BASE_URL = Platform.OS === 'android'
? 'http://10.0.2.2:5001'
: 'http://localhost:5001';

export default function MyDraftRoutesScreen({ navigation }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) fetchDraftRoutes();
  }, [isFocused]);

  const fetchDraftRoutes = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${BASE_URL}/routes`, {
        params: {
          userId,
          isDraft: true
        }
      });
      setRoutes(response.data);
    } catch (err) {
      console.error('Failed to fetch draft routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderRoute = ({ item }) => (
    <TouchableOpacity
      style={styles.routeItem}
      onPress={() => navigation.navigate('RouteDetail', { routeData: item })}
    >
      <Text style={styles.routeTitle}>{item.title || 'Untitled Route'}</Text>
      <Text style={styles.routeDesc} numberOfLines={1}>{item.description || 'No description'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Draft Routes</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item._id}
          renderItem={renderRoute}
          contentContainerStyle={routes.length === 0 && styles.emptyContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No draft routes found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  routeItem: {
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
