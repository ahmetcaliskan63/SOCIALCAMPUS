import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AppAdd = ({ modalVisible, setModalVisible }) => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:batuhansalkimm@gmail.com?subject=SocialCampus Uygulama Önerisi');
  };

  const features = [
    {
      title: "Etkinlik Takvimi",
      description: "Üniversite etkinliklerini takip edebileceğiniz, kendi etkinliklerinizi ekleyebileceğiniz interaktif bir takvim.",
      icon: "calendar-outline"
    },
    {
      title: "Duyuru Sistemi",
      description: "Fakülte ve bölüm duyurularını anlık bildirimlerle takip edebilme özelliği.",
      icon: "notifications-outline"
    },
    {
      title: "Öğrenci Forumu",
      description: "Öğrencilerin ders notları paylaşabileceği, sorular sorabileceği ve tartışabileceği bir platform.",
      icon: "chatbubbles-outline"
    },
    {
      title: "Ders Programı",
      description: "Kişiselleştirilmiş ders programı oluşturma ve yönetme özelliği.",
      icon: "time-outline"
    },
    {
      title: "Yemek Değerlendirme",
      description: "Yemekleri değerlendirme, puan verme ve yorum yapabilme özelliği ile daha iyi bir yemekhane deneyimi.",
      icon: "star-outline"
    },
    {
      title: "Kulüp Etkinlikleri",
      description: "Kulüplerin geçmiş etkinliklerini ve yeni yapılacak etkinliklerini görüntüleme imkanı.",
      icon: "people-outline"
    },
    {
      title: "Gelişmiş Profil Sistemi",
      description: "Sohbet kısmında, istediğiniz kişinin profil sayfasını görüntüleyebilirsiniz.",
      icon: "person-circle-outline"
    },
    {
      title: "Kırklareli Yaşam",
      description: "Kırklareli'de yaşamı kolaylaştıracak birçok bilgi, reklamlar, kampanyalar ve indirimlerin bulunduğu özel sayfa.",
      icon: "gift-outline"
    }
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <BlurView intensity={100} tint="dark" style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Yakında Eklenecek Özellikler</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-circle" size={32} color="#4ECDC4" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Uygulamamızı sürekli geliştiriyor ve yeni özellikler ekliyoruz.
          </Text>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={24} color="#4ECDC4" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}

            <Text style={styles.noteText}>
              Bu özellikler geliştirme aşamasındadır ve yakında kullanıma sunulacaktır.
              Önerileriniz için iletişime geçebilirsiniz.
            </Text>

            <TouchableOpacity 
              style={styles.emailButton}
              onPress={handleEmailPress}
            >
              <Ionicons name="mail-outline" size={24} color="#000" style={styles.emailIcon} />
              <Text style={styles.emailButtonText}>Mail Gönder</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity 
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    color: '#4ECDC4',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#fff',
    marginBottom: 20,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(78,205,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#fff',
    opacity: 0.8,
    lineHeight: SCREEN_WIDTH * 0.05,
  },
  noteText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#fff',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  closeModalButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalButtonText: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  emailIcon: {
    marginRight: 8,
  },
  emailButtonText: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
});

export default AppAdd;
