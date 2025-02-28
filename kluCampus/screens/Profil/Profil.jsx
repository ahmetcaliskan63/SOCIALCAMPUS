import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Dimensions,
    StyleSheet,
    Linking,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AboutScreen from '../About/About';
import AppAdd from "../AppAdd/AppAdd";
import facultiesData from '../../data/faculties.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../../services/api';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 saat

const AboutAppModal = ({ visible, onClose }) => (
  <Modal visible={visible} animationType="slide" transparent>
    <BlurView intensity={100} tint="dark" style={styles.aboutModalContainer}>
      <LinearGradient
        colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.85)']}
        style={styles.aboutModalContent}
      >
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleContainer}>
            <Ionicons name="information-circle" size={32} color="#4ECDC4" style={styles.modalTitleIcon} />
            <Text style={styles.aboutModalTitle}>Uygulama Hakkında</Text>
          </View>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Ionicons name="close-circle" size={35} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalScrollView}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['rgba(78,205,196,0.15)', 'rgba(78,205,196,0.05)']}
            style={styles.welcomeSection}
          >
            <Text style={styles.aboutModalSubtitle}>SocialCampus'e Hoş Geldiniz</Text>

            <Text style={styles.aboutModalText}>
              SocialCampus, Kırklareli Üniversitesi öğrencilerinin kampüs deneyimini zenginleştirmek ve günlük yaşamlarını
              kolaylaştırmak amacıyla özel olarak tasarlanmış yenilikçi bir mobil platformdur. Modern arayüzü ve kullanıcı
              dostu özellikleriyle, öğrencilerin akademik ve sosyal hayatlarını daha verimli bir şekilde yönetmelerine
              olanak sağlar.
            </Text>
          </LinearGradient>

          <View style={styles.developerSection}>
            <Text style={styles.aboutModalText}>
              Bu platform, Kırklareli Üniversitesi Yazılım Mühendisliği bölümü öğrencisi tarafından, öğrenci topluluğunun
              ihtiyaçları göz önünde bulundurularak geliştirilmiştir. Amacımız, teknoloji ile öğrenci deneyimini
              iyileştirerek, kampüs yaşamını daha etkileşimli ve erişilebilir hale getirmektir.
            </Text>
          </View>

          <Text style={styles.featuresTitle}>
            <Ionicons name="star" size={24} color="#4ECDC4" /> Temel Özellikler
          </Text>

          <View style={styles.featuresContainer}>
            <FeatureCard
              title="Yemekhane Bilgi Sistemi"
              icon="restaurant-outline"
              description="Günlük yemek menülerini anlık olarak görüntüleyebilir, haftalık menüleri inceleyebilir ve
              beslenme planlamanızı buna göre yapabilirsiniz."
            />

            <FeatureCard
              title="Öğrenci Kulüpleri Portalı"
              icon="people-outline"
              description="Üniversitemizdeki tüm öğrenci kulüplerinin detaylı bilgilerine,
              yönetim kadrosuna ve iletişim bilgilerine tek bir platformdan erişebilirsiniz."
            />

            <FeatureCard
              title="Kampüs Sosyal Ağı"
              icon="chatbubbles-outline"
              description="Kampüs içi etkinlikleri, duyuruları ve güncel haberleri takip edebilir, diğer öğrencilerle
              etkileşime geçebilirsiniz. Sosyal ağımız, öğrenci topluluğunu bir araya getirerek bilgi paylaşımını ve
              iletişimi güçlendirir."
            />

            <FeatureCard
              title="Öğrenci Alışveriş Platformu"
              icon="cart-outline"
              description="Kampüs içi alışveriş deneyimini kolaylaştıran bu platformda, diğer öğrencilerin paylaştığı
              ders kitapları, kırtasiye malzemeleri ve çeşitli ürünlere göz atabilirsiniz. İlgilendiğiniz ürünün
              satıcısıyla Instagram üzerinden doğrudan iletişime geçebilir, detayları görüşebilirsiniz. Ayrıca kendi
              ürünlerinizi de platforma ekleyerek diğer öğrencilerle güvenli bir şekilde alışveriş yapabilirsiniz."
            />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.modalBottomButton} onPress={onClose}>
          <LinearGradient
            colors={['#4ECDC4', '#45B7AF']}
            style={styles.bottomButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.modalBottomButtonText}>Kapat</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </BlurView>
  </Modal>
);

const FeatureCard = ({ title, icon, description }) => (
  <LinearGradient
    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
    style={styles.featureCard}
  >
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color="#4ECDC4" />
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </LinearGradient>
);

export default function Profil() {
    const [modalVisible, setModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({
        isimSoyisim: "Yükleniyor...",
        fakulte: "Yükleniyor...",
        bolum: "Yükleniyor..."
    });

    const [editedInfo, setEditedInfo] = useState({
        fullName: "",
        faculty: "",
        department: ""
    });

    const [aboutAppModalVisible, setAboutAppModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showChatbotModal, setShowChatbotModal] = useState(false);

    useEffect(() => {
        getUserData();
    }, []);

    const getUserData = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if (!storedUserData) {
                throw new Error('Kullanıcı bilgileri bulunamadı');
            }

            const userData = JSON.parse(storedUserData);
            console.log('Kullanıcı verisi yüklendi:', userData);

            // Kullanıcı bilgilerini göster
            setUserInfo({
                isimSoyisim: userData.tam_ad || "Belirtilmemiş",
                fakulte: userData.fakulte || "Belirtilmemiş",
                bolum: userData.bolum || "Belirtilmemiş"
            });

        } catch (error) {
            console.error('Kullanıcı bilgileri alınırken hata:', error);
            setUserInfo({
                isimSoyisim: "Belirtilmemiş",
                fakulte: "Belirtilmemiş",
                bolum: "Belirtilmemiş"
            });
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        // En az bir alan dolu olmalı ve değişiklik yapılmış olmalı
        return (
            (editedInfo.fullName.trim() !== '' && editedInfo.fullName !== userInfo.isimSoyisim) ||
            (editedInfo.faculty.trim() !== '' && editedInfo.faculty !== userInfo.fakulte) ||
            (editedInfo.department.trim() !== '' && editedInfo.department !== userInfo.bolum)
        );
    };

    const updateUserData = async () => {
        if (isSubmitting) return;

        if (!isFormValid()) {
            Alert.alert('Uyarı', 'En az bir alanda değişiklik yapmalısınız.');
            return;
        }

        setIsSubmitting(true);

        try {
            const userDataStr = await AsyncStorage.getItem('userData');
            if (!userDataStr) {
                Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı.');
                return;
            }

            const userData = JSON.parse(userDataStr);

            // Sadece değiştirilmiş alanları güncelle
            const updateData = {};

            if (editedInfo.fullName.trim() !== '') {
                updateData.tam_ad = editedInfo.fullName.trim();
            }

            if (editedInfo.faculty.trim() !== '') {
                updateData.fakulte = editedInfo.faculty.trim();
            }

            if (editedInfo.department.trim() !== '') {
                updateData.bolum = editedInfo.department.trim();
            }

            console.log('Güncelleme isteği gönderiliyor:', {
                userId: userData.id,
                data: updateData
            });

            // userService'e sadece updateData'yı gönder
            const result = await userService.updateUser(userData.id, updateData);
            console.log('API Yanıtı:', result);

            if (result.success) {
                // AsyncStorage'daki kullanıcı bilgilerini güncelle
                const updatedUserData = {
                    ...userData,
                    tam_ad: updateData.tam_ad || userData.tam_ad,
                    fakulte: updateData.fakulte || userData.fakulte,
                    bolum: updateData.bolum || userData.bolum
                };
                await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

                // State'i güncelle
                setUserInfo({
                    isimSoyisim: updatedUserData.tam_ad,
                    fakulte: updatedUserData.fakulte,
                    bolum: updatedUserData.bolum
                });

                Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
                setModalVisible(false);

                // Form verilerini temizle
                setEditedInfo({
                    fullName: "",
                    faculty: "",
                    department: ""
                });
            } else {
                throw new Error(result.message || 'Güncelleme başarısız');
            }
        } catch (error) {
            console.error('Profil güncellenirken hata:', error);
            Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateEditedInfo = (key, value) => {
        setEditedInfo(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePress = () => {
        Linking.openURL('https://www.linkedin.com/in/batuhanslkmm/');
    };

    const renderChatbotModal = () => (
      <Modal
        visible={showChatbotModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChatbotModal(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={100} tint="dark" style={styles.chatbotModalContent}>
            <LinearGradient
              colors={['rgba(26,26,26,0.98)', 'rgba(13,13,13,0.95)']}
              style={styles.chatbotGradient}
            >
              <View style={styles.chatbotModalHeader}>
                <View style={styles.chatbotTitleContainer}>
                  <LinearGradient
                    colors={['#4ECDC4', '#45B7AF']}
                    style={styles.chatbotIconBg}
                  >
                    <Ionicons name="logo-android" size={32} color="#1a1a1a" />
                  </LinearGradient>
                  <Text style={styles.chatbotModalTitle}>AI Asistan</Text>

                </View>
                <TouchableOpacity onPress={() => setShowChatbotModal(false)} style={styles.modalCloseButton}>
                  <Ionicons name="close-circle" size={35} color="#4ECDC4" />
              </TouchableOpacity>
            </View>

              <ScrollView
                style={styles.chatbotScrollView}
                showsVerticalScrollIndicator={false}
              >
                <Text style={{color:"red",fontSize:18,fontWeight:"bold",fontFamily:"Arial",textAlign:"center",marginVertical:10}}>YAKINDA EKLENECEK...</Text>

                <LinearGradient
                  colors={['rgba(78,205,196,0.15)', 'rgba(78,205,196,0.05)']}
                  style={styles.chatbotWelcomeSection}
                >
                  <Text style={{color:"white"}}>Yapay Zeka Destekli Asistanınız</Text>
                  <Text style={{color:"white"}}>
                    SOCİALCAMPUS AI Asistan, üniversite yaşamınızı kolaylaştırmak için tasarlanmış akıllı bir yardımcıdır.
                    Anlık sorularınıza hızlı ve doğru yanıtlar sunar, kampüs hayatınızı daha verimli hale getirir.
              </Text>
                </LinearGradient>

                <View style={styles.chatbotFeatureGrid}>
                  <View style={styles.chatbotFeatureRow}>
                    <View style={styles.chatbotFeatureCard}>
                      <View style={styles.chatbotFeatureIconContainer}>
                        <Ionicons name="flash" size={24} color="#4ECDC4" />
                      </View>
                      <Text style={styles.chatbotFeatureTitle}>Anlık Yanıtlar</Text>
                      <Text style={styles.chatbotFeatureText}>
                        Saniyeler içinde bilgiye erişin
              </Text>
                    </View>

                    <View style={styles.chatbotFeatureCard}>
                      <View style={styles.chatbotFeatureIconContainer}>
                        <Ionicons name="school" size={24} color="#4ECDC4" />
                      </View>
                      <Text style={styles.chatbotFeatureTitle}>Akademik Destek</Text>
                      <Text style={styles.chatbotFeatureText}>
                        Eğitim süreçlerinizde yanınızda
              </Text>
                    </View>
                  </View>

                  <View style={styles.chatbotFeatureRow}>
                    <View style={styles.chatbotFeatureCard}>
                      <View style={styles.chatbotFeatureIconContainer}>
                        <Ionicons name="time" size={24} color="#4ECDC4" />
                      </View>
                      <Text style={styles.chatbotFeatureTitle}>7/24 Hizmet</Text>
                      <Text style={styles.chatbotFeatureText}>
                        Her an erişilebilir asistan
              </Text>
                    </View>

                    <View style={styles.chatbotFeatureCard}>
                      <View style={styles.chatbotFeatureIconContainer}>
                        <Ionicons name="information" size={24} color="#4ECDC4" />
                      </View>
                      <Text style={styles.chatbotFeatureTitle}>Güncel Bilgi</Text>
                      <Text style={styles.chatbotFeatureText}>
                        Sürekli güncellenen veritabanı
              </Text>
                    </View>
                  </View>
                </View>

                <LinearGradient
                  colors={['rgba(78,205,196,0.1)', 'rgba(78,205,196,0.05)']}
                  style={styles.chatbotCapabilitiesSection}
                >
                  <Text style={styles.chatbotSectionTitle}>Neler Yapabilir?</Text>
                  <View style={styles.chatbotCapabilitiesList}>
                    <View style={styles.chatbotCapabilityItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                      <Text style={styles.chatbotCapabilityText}>Akademik süreçler hakkında bilgilendirme</Text>
                    </View>
                    <View style={styles.chatbotCapabilityItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                      <Text style={styles.chatbotCapabilityText}>Kampüs yaşamı ve etkinlikler hakkında rehberlik</Text>
                    </View>
                    <View style={styles.chatbotCapabilityItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                      <Text style={styles.chatbotCapabilityText}>Öğrenci kulüpleri ve sosyal aktiviteler</Text>
                    </View>
                    <View style={styles.chatbotCapabilityItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                      <Text style={styles.chatbotCapabilityText}>Kırklareli şehir rehberi ve yaşam bilgileri</Text>
                    </View>
                  </View>
                </LinearGradient>
            </ScrollView>
            </LinearGradient>
          </BlurView>
        </View>
      </Modal>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4ECDC4" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <LinearGradient
                colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.profileImage}
                    />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                  {
<View style={styles.infoContainer}>
    <InfoItem
        icon="person-outline"
        title="İsim Soyisim"
        value={userInfo.isimSoyisim}
    />
    <InfoItem
        icon="school-outline"
        title="Fakülte"
        value={userInfo.fakulte}
    />
    <InfoItem
        icon="book-outline"
        title="Bölüm"
        value={userInfo.bolum}
    />

    {/* <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="pencil" size={20} color="#4ECDC4" />
        <Text style={styles.editButtonText}>Düzenle</Text>
    </TouchableOpacity> */}
</View>
}


                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => Linking.openURL('https://www.linkedin.com/in/batuhanslkmm/')}
                        >
                            <Ionicons name="logo-linkedin" size={24} color="#4ECDC4" />
                            <Text style={styles.actionButtonText}>İletişime Geç</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setAboutAppModalVisible(true)}
                        >
                            <Ionicons name="information-circle-outline" size={24} color="#4ECDC4" />
                            <Text style={styles.actionButtonText}>Uygulama Hakkında</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.longButton} onPress={() => setAddModalVisible(true)}>
                        <Text style={styles.longButtonText}>Uygulamaya Eklenecekler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chatbotButton]}
                        onPress={() => setShowChatbotModal(true)}
                    >
                        <LinearGradient
                            colors={['#1a1a1a', '#2d2d2d']}
                            style={styles.chatbotButtonGradient}
                        >
                            <Ionicons name="logo-android" size={32} color="#4ECDC4" />
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>

            {modalVisible && (
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <BlurView intensity={100} tint="dark" style={styles.modalContainer}>
                        <LinearGradient
                            colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.9)']}
                            style={styles.modalContent}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Profili Düzenle</Text>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Ionicons name="close-circle" size={32} color="#4ECDC4" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="person-outline" size={24} color="#4ECDC4" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="İsim Soyisim"
                                        value={editedInfo.fullName}
                                        onChangeText={(text) => updateEditedInfo('fullName', text)}
                                        placeholderTextColor="#aaa"
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Ionicons name="school-outline" size={24} color="#4ECDC4" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Fakülte"
                                        value={editedInfo.faculty}
                                        onChangeText={(text) => updateEditedInfo('faculty', text)}
                                        placeholderTextColor="#aaa"
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Ionicons name="book-outline" size={24} color="#4ECDC4" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Bölüm"
                                        value={editedInfo.department}
                                        onChangeText={(text) => updateEditedInfo('department', text)}
                                        placeholderTextColor="#aaa"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.modalSaveButton, !isFormValid() && styles.modalSaveButtonDisabled]}
                                onPress={updateUserData}
                                disabled={!isFormValid() || isSubmitting}
                            >
                                <LinearGradient
                                    colors={['#4ECDC4', '#45B7AF']}
                                    style={styles.saveButtonGradient}
                                >
                                    <Text style={styles.modalSaveButtonText}>
                                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </BlurView>
                </Modal>
            )}

            <AboutScreen modalVisible={aboutModalVisible} setModalVisible={setAboutModalVisible} />
            <AppAdd modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
            <AboutAppModal
                visible={aboutAppModalVisible}
                onClose={() => setAboutAppModalVisible(false)}
            />
            {renderChatbotModal()}
        </SafeAreaView>
    );
}

const InfoItem = ({ icon, title, value }) => (
    <View style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
            <Ionicons name={icon} size={24} color="#4ECDC4" />
        </View>
        <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>{title}</Text>
            <Text style={styles.infoText}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        paddingBottom: Platform.OS === 'ios' ? 85 : 60,
    },
    header: {
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : screenWidth * 0.08,
        paddingBottom: screenWidth * 0.05,
    },
    profileImage: {
        width: screenWidth * 0.25,
        height: screenWidth * 0.25,
        borderRadius: screenWidth * 0.125,
        borderWidth: 2,
        borderColor: '#4ECDC4',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        paddingHorizontal: screenWidth * 0.05,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    infoContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 15,
        padding: screenWidth * 0.04,
        marginTop: screenWidth * 0.03,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: screenWidth * 0.03,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: screenWidth * 0.035,
    },
    infoIconContainer: {
        width: screenWidth * 0.11,
        height: screenWidth * 0.11,
        borderRadius: screenWidth * 0.055,
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: screenWidth * 0.03,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: screenWidth * 0.035,
        fontWeight: '600',
        color: '#4ECDC4',
        marginBottom: screenWidth * 0.01,
    },
    infoText: {
        fontSize: screenWidth * 0.042,
        color: '#fff',
        fontWeight: '500',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(78,205,196,0.15)',
        borderRadius: 12,
        padding: screenWidth * 0.035,
        marginTop: screenWidth * 0.03,
    },
    editButtonText: {
        color: '#4ECDC4',
        fontSize: screenWidth * 0.04,
        fontWeight: '600',
        marginLeft: screenWidth * 0.02,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: screenWidth * 0.04,
    },
    actionButton: {
        backgroundColor: 'rgba(78,205,196,0.15)',
        borderRadius: 12,
        padding: screenWidth * 0.035,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
    },
    actionButtonText: {
        color: '#4ECDC4',
        fontSize: screenWidth * 0.035,
        fontWeight: '600',
        marginLeft: screenWidth * 0.02,
    },
    longButton: {
        backgroundColor: '#4ECDC4',
        borderRadius: 12,
        padding: screenWidth * 0.04,
        marginTop: screenWidth * 0.04,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    longButtonText: {
        fontSize: screenWidth * 0.04,
        fontWeight: '700',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    chatbotButton: {
        width: screenWidth * 0.15,
        height: screenWidth * 0.15,
        borderRadius: screenWidth * 0.075,
        alignSelf: 'center',
        marginTop: screenWidth * 0.04,
        marginBottom: Platform.OS === 'ios' ? 10 : screenWidth * 0.05,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#4ECDC4',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    chatbotButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#4ECDC4',
        borderRadius: screenWidth * 0.075,
    },
    aboutModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    aboutModalContent: {
        flex: 1,
        padding: screenWidth * 0.05,
        paddingTop: Platform.OS === 'ios' ? screenWidth * 0.1 : screenWidth * 0.05,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: screenWidth * 0.05,
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalTitleIcon: {
        marginRight: screenWidth * 0.02,
    },
    aboutModalTitle: {
        fontSize: screenWidth * 0.06,
        fontWeight: 'bold',
        color: '#4ECDC4',
    },
    modalCloseButton: {
        padding: screenWidth * 0.01,
    },
    modalScrollView: {
        flex: 1,
        padding: screenWidth * 0.05,
    },
    welcomeSection: {
        borderRadius: 15,
        padding: screenWidth * 0.05,
        marginBottom: screenWidth * 0.05,
    },
    aboutModalSubtitle: {
        fontSize: screenWidth * 0.045,
        fontWeight: '600',
        color: '#4ECDC4',
        marginBottom: screenWidth * 0.04,
        textAlign: 'center',
    },
    aboutModalText: {
        fontSize: screenWidth * 0.035,
        color: '#fff',
        lineHeight: screenWidth * 0.05,
        marginBottom: screenWidth * 0.04,
    },
    developerSection: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    featuresTitle: {
        fontSize: screenWidth * 0.05,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 20,
        marginTop: 10,
        textAlign: 'center',
    },
    featuresContainer: {
        marginBottom: 20,
    },
    featureCard: {
        flexDirection: 'row',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        alignItems: 'flex-start',
    },
    featureIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(78,205,196,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: screenWidth * 0.04,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 8,
    },
    featureDescription: {
        fontSize: screenWidth * 0.035,
        color: '#fff',
        opacity: 0.9,
        lineHeight: screenWidth * 0.05,
    },
    modalBottomButton: {
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10,
    },
    bottomButtonGradient: {
        padding: 15,
        alignItems: 'center',
    },
    modalBottomButtonText: {
        color: '#000',
        fontSize: screenWidth * 0.04,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: screenWidth * 0.9,
        borderRadius: 20,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(78,205,196,0.2)',
    },
    modalTitle: {
        fontSize: screenWidth * 0.06,
        fontWeight: 'bold',
        color: '#4ECDC4',
    },
    modalCloseButton: {
        padding: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(78,205,196,0.2)',
    },
    inputIcon: {
        marginRight: 10,
    },
    modalInput: {
        flex: 1,
        paddingVertical: 15,
        fontSize: screenWidth * 0.04,
        color: '#fff',
    },
    modalSaveButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    modalSaveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    modalSaveButtonText: {
        color: '#000',
        fontSize: screenWidth * 0.045,
        fontWeight: '600',
    },
    chatbotButton: {
        width: screenWidth * 0.15,
        height: screenWidth * 0.15,
        borderRadius: screenWidth * 0.075,
        alignSelf: 'center',
        marginTop: screenWidth * 0.04,
        marginBottom: Platform.OS === 'ios' ? 10 : screenWidth * 0.05,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#4ECDC4',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    chatbotButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#4ECDC4',
        borderRadius: 32.5,
    },
    chatbotModalContent: {
        flex: 1,
        margin: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    chatbotGradient: {
        flex: 1,
        padding: 20,
    },
    chatbotModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    chatbotTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatbotIconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    chatbotModalTitle: {
        fontSize: screenWidth * 0.06,
        fontWeight: 'bold',
        color: '#4ECDC4',
    },
    chatbotWelcomeSection: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    chatbotFeatureGrid: {
        marginBottom: 20,
    },
    chatbotFeatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    chatbotFeatureCard: {
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
    },
    chatbotFeatureIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(78,205,196,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    chatbotFeatureTitle: {
        fontSize: screenWidth * 0.04,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 8,
        textAlign: 'center',
    },
    chatbotFeatureText: {
        fontSize: screenWidth * 0.035,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
    },
    chatbotCapabilitiesSection: {
        borderRadius: 15,
        padding: 20,
    },
    chatbotSectionTitle: {
        fontSize: screenWidth * 0.045,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 15,
        textAlign: 'center',
    },
    chatbotCapabilitiesList: {
        marginTop: 10,
    },
    chatbotCapabilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    chatbotCapabilityText: {
        fontSize: screenWidth * 0.035,
        color: '#fff',
        marginLeft: 10,
        opacity: 0.9,
    },
    addButton: {
        position: 'absolute',
        right: screenWidth * 0.05,
        bottom: Platform.OS === 'ios' ? screenHeight * 0.2 : screenHeight * 0.12,
        backgroundColor: '#4ECDC4',
        width: screenWidth * 0.15,
        height: screenWidth * 0.15,
        borderRadius: screenWidth * 0.075,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
        zIndex: 999,
    },
});