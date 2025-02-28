import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function TermsScreen({ onAccept, onClose }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close-outline" size={32} color="#1a1a1a" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Ionicons name="shield-checkmark-outline" size={32} color="#1a1a1a" />
                        <Text style={styles.title}>Kullanıcı Sözleşmesi</Text>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        <Text style={styles.lastUpdated}>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</Text>

                        <Text style={styles.introduction}>
                            Bu kullanıcı sözleşmesi ("Sözleşme"), SocialCampus uygulamasını ("Uygulama") kullanımınızı düzenleyen yasal bir belgedir. Uygulamayı kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
                        </Text>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>1. Veri Toplama ve Kullanımı</Text>
                            <Text style={styles.sectionContent}>
                                Uygulama, hizmetlerimizi sağlamak için aşağıdaki verileri toplar ve işler:
                            </Text>
                            <View style={styles.bulletPoints}>
                                <Text style={styles.bulletPoint}>• Profil Bilgileri: Ad-soyad, fakülte, bölüm, e-posta adresi</Text>
                                <Text style={styles.bulletPoint}>• Kullanıcı İçeriği: Profil fotoğrafı, kitap ilanları ve fotoğrafları</Text>
                                <Text style={styles.bulletPoint}>• İletişim Verileri: Uygulama içi mesajlaşma kayıtları</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>2. Gizlilik ve Güvenlik</Text>
                            <Text style={styles.sectionContent}>
                                Verilerinizin güvenliği bizim için önceliktir. Tüm veriler:
                            </Text>
                            <View style={styles.bulletPoints}>
                                <Text style={styles.bulletPoint}>• SSL/TLS protokolleri ile şifrelenir</Text>
                                <Text style={styles.bulletPoint}>• Güvenli sunucularda saklanır</Text>
                                <Text style={styles.bulletPoint}>• Düzenli olarak yedeklenir</Text>
                                <Text style={styles.bulletPoint}>• Yetkisiz erişime karşı korunur</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>3. Kullanıcı Yükümlülükleri</Text>
                            <Text style={styles.sectionContent}>
                                Uygulama kullanıcıları:
                            </Text>
                            <View style={styles.bulletPoints}>
                                <Text style={styles.bulletPoint}>• Doğru ve güncel bilgi sağlamakla</Text>
                                <Text style={styles.bulletPoint}>• Telif haklarına saygı göstermekle</Text>
                                <Text style={styles.bulletPoint}>• Diğer kullanıcıların haklarına saygı göstermekle</Text>
                                <Text style={styles.bulletPoint}>• Yasadışı veya uygunsuz içerik paylaşmamakla yükümlüdür</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>4. Fikri Mülkiyet Hakları</Text>
                            <Text style={styles.sectionContent}>
                                Uygulama ve içeriğine ilişkin tüm fikri mülkiyet hakları SocialCampus'e aittir. Kullanıcılar, uygulamayı yalnızca kişisel ve ticari olmayan amaçlarla kullanabilir.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>5. Sorumluluk Reddi</Text>
                            <Text style={styles.sectionContent}>
                                Uygulama "olduğu gibi" sunulmaktadır. Yasaların izin verdiği ölçüde, SocialCampus herhangi bir garanti vermemektedir. Kullanıcılar uygulamayı kendi sorumluluklarında kullanır.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>6. Değişiklikler</Text>
                            <Text style={styles.sectionContent}>
                                SocialCampus, bu sözleşmeyi önceden bildirmeksizin değiştirme hakkını saklı tutar. Değişiklikler uygulamada yayınlandığı anda yürürlüğe girer.
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <LinearGradient
                    colors={['rgba(255,255,255,0)', '#FFFFFF']}
                    style={styles.buttonGradient}
                >
                    <TouchableOpacity
                        style={styles.button}
                        onPress={onAccept}
                    >
                        <Text style={styles.buttonText}>Kabul Ediyorum</Text>
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </LinearGradient>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    gradient: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: width * 0.05,
        paddingBottom: height * 0.12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        backgroundColor: '#FFFFFF',
    },
    closeButton: {
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -40, // Başlığı ortala
    },
    title: {
        fontSize: width * 0.06,
        fontWeight: '600',
        color: '#1a1a1a',
        marginLeft: 10,
    },
    lastUpdated: {
        fontSize: width * 0.035,
        color: '#666',
        marginBottom: height * 0.02,
        fontStyle: 'italic',
    },
    introduction: {
        fontSize: width * 0.04,
        color: '#333',
        lineHeight: width * 0.06,
        marginBottom: height * 0.03,
        textAlign: 'justify',
    },
    contentContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: width * 0.05,
        marginTop: height * 0.02,
    },
    section: {
        marginBottom: height * 0.03,
    },
    sectionTitle: {
        fontSize: width * 0.045,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: height * 0.015,
    },
    sectionContent: {
        fontSize: width * 0.038,
        color: '#333',
        lineHeight: width * 0.055,
        marginBottom: height * 0.01,
    },
    bulletPoints: {
        marginLeft: width * 0.03,
    },
    bulletPoint: {
        fontSize: width * 0.038,
        color: '#333',
        lineHeight: width * 0.055,
        marginBottom: height * 0.01,
    },
    buttonGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.15,
        justifyContent: 'center',
        paddingHorizontal: width * 0.05,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: height * 0.02,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: width * 0.045,
        fontWeight: '600',
        marginRight: 10,
    },
});