// screens/EditProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRegister } from 'react-native-event-listeners';

const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5001'
  : 'http://localhost:5001';

export default function EditProfileScreen({ navigation, route }) {
  const { userId } = route.params;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  useEffect(() => {
    axios.get(`${BASE_URL}/user/${userId}`)
      .then(res => {
        setUsername(res.data.username);
        setEmail(res.data.email);
        setDateOfBirth(res.data.dateOfBirth || '');
      })
      .catch(err => {
        console.error('Error fetching user for edit:', err);
        Alert.alert("Failed to load user data.");
      });
  }, []);

  const save = async () => {
    try {
      await axios.put(`${BASE_URL}/user/${userId}`, {
        username,
        email,
        dateOfBirth
      });
      await AsyncStorage.setItem('username', username); // update local storage
      EventRegister.emit('profileUpdated'); // 🔔 notify ProfileScreen
      Alert.alert("Profile updated!");
      navigation.goBack();
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert("Update failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        style={styles.input}
        placeholder="YYYY-MM-DD"
      />

      <Button title="Save" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { marginTop: 12, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 4
  },
});
