import React from 'react';
import { View, Text, Image, StyleSheet, Linking, Modal, TouchableOpacity, Dimensions, ScrollView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const ClubDetailsModal = ({ visible, club, onClose }) => {
  if (!club) return null;

  const isDefaultImage = club.image.includes('defaultLogo.jpg');

  const handleInstagramPress = () => {
    if (club.instagram) {
      Linking.openURL(club.instagram).catch((err) => console.error('An error occurred', err));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.7)']}
          style={styles.modalContainer}
        >
          <BlurView intensity={100} tint="dark" style={styles.modalContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#4ECDC4" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {isDefaultImage ? (
                <View style={[styles.image, styles.letterContainer]}>
                  <Text style={styles.letterText}>
                    {club.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <Image source={{ uri: club.image }} style={styles.image} />
              )}
              <Text style={styles.name}>{club.name}</Text>
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Ionicons name="person" size={24} color="#4ECDC4" />
                  <Text style={styles.detail}>
                    <Text style={styles.detailLabel}>Başkan: </Text>
                    {club.president}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="school" size={24} color="#4ECDC4" />
                  <Text style={styles.detail}>
                    <Text style={styles.detailLabel}>Danışman: </Text>
                    {club.advisor}
                  </Text>
                </View>
              </View>
              {club.instagram && (
                <TouchableOpacity 
                  style={styles.instagramButton} 
                  onPress={handleInstagramPress}
                >
                  <LinearGradient
                    colors={['#405DE6', '#5851DB', '#833AB4', '#C13584', '#E1306C', '#FD1D1D']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.instagramGradient}
                  >
                    <Ionicons name="logo-instagram" size={24} color="#fff" />
                    <Text style={styles.instagramText}>Bizi Instagram'da Takip Et</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </ScrollView>
          </BlurView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.04,
  },
  modalContent: {
    width: '90%',
    maxHeight: screenHeight * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: screenHeight * 0.03,
    paddingHorizontal: screenWidth * 0.04,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? screenHeight * 0.02 : screenHeight * 0.015,
    right: screenWidth * 0.04,
    zIndex: 1,
    padding: 8,
  },
  image: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.4,
    borderRadius: screenWidth * 0.2,
    marginBottom: screenHeight * 0.02,
    borderWidth: 4,
    borderColor: '#4ECDC4',
  },
  name: {
    fontSize: screenWidth * 0.06,
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.02,
    color: '#4ECDC4',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
    paddingHorizontal: screenWidth * 0.04,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: screenHeight * 0.03,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.015,
    backgroundColor: 'rgba(78,205,196,0.1)',
    borderRadius: 15,
    padding: screenWidth * 0.04,
  },
  detail: {
    fontSize: screenWidth * 0.04,
    marginLeft: screenWidth * 0.03,
    color: '#fff',
    flex: 1,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  instagramButton: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 15,
  },
  instagramGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenHeight * 0.015,
    paddingHorizontal: screenWidth * 0.04,
  },
  instagramText: {
    color: '#fff',
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
    marginLeft: screenWidth * 0.02,
  },
  letterContainer: {
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: screenWidth * 0.12,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
});

export default ClubDetailsModal;