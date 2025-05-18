import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList,
  TouchableOpacity, StyleSheet, Alert, Platform, ScrollView
} from 'react-native';
import axios from 'axios';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

export default function ManageUsersScreen() {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDob, setNewDob] = useState('');

  const fetchUsers = async () => {
    const res = await axios.get(`${BASE_URL}/users`);
    setUsers(res.data);
  };

  const handleAdd = async () => {
    try {
      await axios.post(`${BASE_URL}/register`, {
        username: newUsername,
        email: newEmail,
        password: newPassword,
        dateOfBirth: newDob,
        role: "user"
      });
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewDob('');
      fetchUsers();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to add user");
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BASE_URL}/users/${id}`);
    fetchUsers();
  };

  const handlePromote = async (id) => {
    await axios.put(`${BASE_URL}/users/${id}/role`, { role: "admin" });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Manage Users</Text>

        <TextInput placeholder="Username" value={newUsername} onChangeText={setNewUsername} style={styles.input} />
        <TextInput placeholder="Email" value={newEmail} onChangeText={setNewEmail} style={styles.input} />
        <TextInput placeholder="Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} style={styles.input} />
        <TextInput placeholder="Date of Birth (e.g. 2001-05-12)" value={newDob} onChangeText={setNewDob} style={styles.input} />
        <Button title="Add User" onPress={handleAdd} />

        {users.map(user => (
          <View key={user._id} style={styles.userRow}>
            <Text>{user.username} ({user.role})</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handlePromote(user._id)}>
                <Text style={styles.link}>Promote</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(user._id)}>
                <Text style={styles.link}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 50 },
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 8, padding: 8 },
  userRow: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  link: { color: '#007AFF', marginHorizontal: 8 },
});
