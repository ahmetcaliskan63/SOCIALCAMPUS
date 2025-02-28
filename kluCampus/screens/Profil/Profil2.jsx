import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, SafeAreaView } from 'react-native';

const { width } = Dimensions.get('window');

const UserProfile = () => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Profile</Text>
        
        {/* Profile Picture */}
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            style={styles.profileImage} 
          />
          <TouchableOpacity style={styles.cameraIcon}>
            <Text>📷</Text>
          </TouchableOpacity>
        </View>
        
        {/* User Info */}
        <Text style={styles.name}>Richard Barnes</Text>
        <Text style={styles.bio}>22 year old dev from the Country Side</Text>
        <Text style={styles.active}>Active since - Aug, 2022</Text>
        
        {/* Personal Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Info</Text>

          <TouchableOpacity>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Email */}
        <View style={styles.infoItem}>
          <Text>📧 Email</Text>
          <Text style={styles.infoText}>richbarnes@gmail.com</Text>
        </View>

        {/* Phone */}
        <View style={styles.infoItem}>
          <Text>📞 Phone</Text>
          <Text style={styles.infoText}>+71138474930</Text>
        </View>

        {/* Location */}
        <View style={styles.infoItem}>
          <Text>📍 Location</Text>
          <Text style={styles.infoText}>Country Side</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40, // Adds space at the top
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 50,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
//   active: {
//     fontSize: 12,
//     color: '#aaa',
//     marginBottom: 20,
//   },
//   infoSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     padding: 10,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   editText: {
//     color: '#007bff',
//   },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  infoText: {
    color: '#333',
  },
});

export default UserProfile;
