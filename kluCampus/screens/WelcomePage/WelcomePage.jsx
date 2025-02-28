import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function WelcomePage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    faculty: '',
    department: '',
    birthDate: new Date(),
    city: '',
    email: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prevState => ({
        ...prevState,
        birthDate: selectedDate
      }));
    }
  };

  const handleSubmit = () => {
    console.log('Form data submitted:', formData);
    // Here you would typically send the data to your backend
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hoş Geldiniz!</Text>
      <Text style={styles.subtitle}>Lütfen bilgilerinizi girin</Text>

      <TextInput
        style={styles.input}
        placeholder="Ad"
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Soyad"
        value={formData.surname}
        onChangeText={(text) => handleChange('surname', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Fakülte"
        value={formData.faculty}
        onChangeText={(text) => handleChange('faculty', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Bölüm"
        value={formData.department}
        onChangeText={(text) => handleChange('department', text)}
      />
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{formData.birthDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Şehir"
        value={formData.city}
        onChangeText={(text) => handleChange('city', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Gönder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});