import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import aboutData from "../../aboutData.json";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function AboutScreen({ modalVisible, setModalVisible }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(aboutData);
  }, []);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>{data?.title}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={28}
                color="#fff"
                style={styles.closeButtonIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Content Section */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.textTitle}>{data?.welcome}</Text>
            <Text style={styles.text}>{data?.description}</Text>
            <Text style={styles.text}>{data?.developer}</Text>

            <Text style={styles.subtitle}>Özellikler</Text>
            <Text style={styles.subtitle}>Yemekhane Bilgileri</Text>
            <Text style={styles.text}>{data?.features.foodInfo}</Text>

            <Text style={styles.subtitle}>Kulüp Bilgileri</Text>
            <Text style={styles.text}>{data?.features.clubsInfo}</Text>

            <Text style={styles.subtitle}>Sosyalleşme</Text>
            <Text style={styles.text}>{data?.features.socialInfo}</Text>

            <Text style={styles.subtitle}>Satış</Text>
            <Text style={styles.text}>{data?.features.salesInfo}</Text>
          </ScrollView>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darkened background overlay for better focus
    justifyContent: "center",
    alignItems: "center",
  },
  blurContainer: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.75,
    borderRadius: 20,
    overflow: "hidden", // Taşan içerik köşelerde görünmez
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark background with opacity
    paddingHorizontal: 20,
    paddingTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 15, // Android gölge desteği
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  closeButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
  },
  closeButtonIcon: {
    fontSize: 25,
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
  textTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: screenWidth * 0.04,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginTop: 14,
    marginBottom: 6,
  },
  text: {
    fontSize: screenWidth * 0.035,
    color: "#fff",
    lineHeight: 20,
    marginBottom: 12,
  },
});
