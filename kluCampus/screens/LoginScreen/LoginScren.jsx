import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Switch, 
    Modal, 
    SafeAreaView,
    Platform,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Image,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TermsScreen from "../../components/TermsScreen";
import { userService } from '../../services/api';
import facultiesData from '../../data/faculties.json';

export default function LoginScreen({ onLogin }) {
    const [formData, setFormData] = useState({
        tam_ad: '',
        faculty: 'Mühendislik Fakültesi',
        department: 'Yazılım Mühendisliği',
        termsAccepted: false,
        eulaAccepted: false
    });
    const [showTerms, setShowTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showFacultyPicker, setShowFacultyPicker] = useState(false);
    const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);

    // formData değişikliklerini izle
    useEffect(() => {
        console.log('Form Verileri Güncellendi:', {
            tamAd: formData.tam_ad,
            tamAdUzunluk: formData.tam_ad.length,
            fakulte: formData.faculty,
            bolum: formData.department,
            sartlar: formData.termsAccepted,
            sozlesme: formData.eulaAccepted
        });
    }, [formData]);

    const handleInputChange = (name, value) => {
        console.log('handleInputChange çağrıldı:', { name, value });

        if (name === 'tam_ad') {
            // Sadece harf ve boşluklara izin ver
            let cleanedText = value;
            
            // Türkçe karakterleri ve boşlukları koru
            cleanedText = cleanedText.replace(/[^a-zA-ZğĞıİöÖüÜşŞçÇ ]/g, '');
            
            // Birden fazla boşluğu tek boşluğa indir, ama sondaki boşluğu koru
            if (value.endsWith(' ')) {
                cleanedText = cleanedText.replace(/\s+/g, ' ');
            } else {
                cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
            }

            console.log('Ad Soyad işleniyor:', {
                girilen: value,
                temizlenmis: cleanedText,
                uzunluk: cleanedText.length,
                boslukVar: cleanedText.includes(' '),
                sonKarakterBosluk: cleanedText.endsWith(' ')
            });

            setFormData(prevState => ({
                ...prevState,
                tam_ad: cleanedText
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleRegister = async () => {
        if (!isFormValid || isSubmitted) return;

        try {
            setLoading(true);
            setIsSubmitted(true);

            const requestData = {
                tam_ad: formData.tam_ad,
                faculty: formData.faculty,
                department: formData.department,
                termsAccepted: formData.termsAccepted,
                eulaAccepted: formData.eulaAccepted
            };

            console.log('Gönderilen veri:', requestData);

            const response = await userService.createUser(requestData);
            console.log('API yanıtı:', response);
            
            // Başarılı yanıt kontrolü - response.data yerine response'un kendisini kontrol ediyoruz
            if (response && response.success && response.data) {
                const userData = {
                    id: response.data.id.toString(),
                    tam_ad: response.data.tam_ad,
                    fakulte: response.data.fakulte,
                    bolum: response.data.bolum
                };
                
                try {
                    // AsyncStorage işlemleri
                    await Promise.all([
                        AsyncStorage.setItem('userData', JSON.stringify(userData)),
                        AsyncStorage.setItem('userLoggedIn', 'true')
                    ]);

                    // Yönlendirme işlemi
                    if (onLogin) {
                        onLogin();
                    }

                    // Başarı mesajı
                    setTimeout(() => {
                        Alert.alert(
                            'Başarılı',
                            'Kaydınız başarıyla tamamlandı!'
                        );
                    }, 100);

                } catch (storageError) {
                    console.error('Storage hatası:', storageError);
                    Alert.alert('Hata', 'Kullanıcı bilgileri kaydedilirken bir hata oluştu.');
                    setIsSubmitted(false);
                }
            } else {
                throw new Error('Geçersiz sunucu yanıtı');
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            setIsSubmitted(false);
            Alert.alert(
                'Hata',
                error.message || 'Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
            );
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.tam_ad && 
                       formData.faculty && 
                       formData.department && 
                       formData.termsAccepted && 
                       formData.eulaAccepted;

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4c669f" />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.gradient}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollViewContent} 
                        showsVerticalScrollIndicator={false} 
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={styles.headerContainer}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logo}
                            />
                            <Text style={styles.title}>Hoşgeldiniz</Text>
                            <Text style={styles.subtitle}>Bilgilerinizi doldurunuz.</Text>
                        </View>
                        
                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>İsim ve Soyisim</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="person-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, isSubmitted && styles.disabledInput]}
                                        placeholder="İsim ve soyisminizi giriniz"
                                        value={formData.tam_ad}
                                        onChangeText={(value) => {
                                            console.log('TextInput değeri:', value);
                                            // Boşluk tuşuna basıldığında ve önceki metin varsa boşluk ekle
                                            if (value.endsWith(' ') && formData.tam_ad.length > 0) {
                                                handleInputChange('tam_ad', formData.tam_ad + ' ');
                                            } else {
                                                handleInputChange('tam_ad', value);
                                            }
                                        }}
                                        placeholderTextColor="#999"
                                        editable={!isSubmitted}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Fakülte</Text>
                                {Platform.OS === 'ios' ? (
                                    <TouchableOpacity 
                                        style={[styles.inputWrapper, isSubmitted && styles.disabledInput]}
                                        onPress={() => !isSubmitted && setShowFacultyPicker(true)}
                                    >
                                        <Ionicons name="school-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                        <Text style={[styles.pickerText, !formData.faculty && styles.placeholderText]}>
                                            {formData.faculty ? facultiesData[formData.faculty]?.name : 'Fakülte Seçin'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={[styles.pickerContainer, Platform.OS === 'ios' && styles.pickerContainerIOS]}>
                                        <Ionicons name="school-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                        <Picker
                                            style={[styles.picker, Platform.OS === 'ios' && styles.pickerIOS, isSubmitted && styles.disabledPicker]}
                                            selectedValue={formData.faculty}
                                            onValueChange={(itemValue) => {
                                                if (!isSubmitted) {
                                                    handleInputChange('faculty', itemValue);
                                                    handleInputChange('department', '');
                                                }
                                            }}
                                            enabled={!isSubmitted}
                                        >
                                            <Picker.Item label="Fakülte Seçin" value="" />
                                            {Object.entries(facultiesData).map(([key, value]) => (
                                                <Picker.Item key={key} label={value.name} value={key} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bölüm</Text>
                                {Platform.OS === 'ios' ? (
                                    <TouchableOpacity 
                                        style={[styles.inputWrapper, isSubmitted && styles.disabledInput]}
                                        onPress={() => !isSubmitted && formData.faculty && setShowDepartmentPicker(true)}
                                    >
                                        <Ionicons name="book-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                        <Text style={[styles.pickerText, !formData.department && styles.placeholderText]}>
                                            {formData.department || 'Bölüm Seçin'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={[styles.pickerContainer, Platform.OS === 'ios' && styles.pickerContainerIOS]}>
                                        <Ionicons name="book-outline" size={20} color="#4c669f" style={styles.inputIcon} />
                                        <Picker
                                            style={[styles.picker, Platform.OS === 'ios' && styles.pickerIOS, isSubmitted && styles.disabledPicker]}
                                            selectedValue={formData.department}
                                            onValueChange={(itemValue) => !isSubmitted && handleInputChange('department', itemValue)}
                                            enabled={!!formData.faculty && !isSubmitted}
                                        >
                                            <Picker.Item label="Bölüm Seçin" value="" />
                                            {facultiesData[formData.faculty]?.departments.map((dept, index) => (
                                                <Picker.Item key={index} label={dept} value={dept} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                            </View>

                            <View style={styles.termsContainer}>
                                <View style={styles.switchContainer}>
                                    <Switch
                                        value={formData.termsAccepted}
                                        onValueChange={(value) => handleInputChange('termsAccepted', value)}
                                        trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
                                        thumbColor={formData.termsAccepted ? "#FFFFFF" : "#F5F5F5"}
                                        ios_backgroundColor="#E0E0E0"
                                    />
                                    <TouchableOpacity onPress={() => setShowTerms(true)} style={styles.switchLabel}>
                                        <Text style={styles.underlinedText}>
                                            Şartlar ve Koşulları Kabul Ediyorum
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.switchContainer}>
                                    <Switch
                                        value={formData.eulaAccepted}
                                        onValueChange={(value) => handleInputChange('eulaAccepted', value)}
                                        trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
                                        thumbColor={formData.eulaAccepted ? "#FFFFFF" : "#F5F5F5"}
                                        ios_backgroundColor="#E0E0E0"
                                    />
                                    <Text style={styles.switchLabel}>
                                        Son Kullanıcı Lisans Sözleşmesini (EULA) onaylıyorum.
                                    </Text>
                                </View>
                            </View>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.button, 
                                    { 
                                        opacity: isFormValid && !isSubmitted ? 1 : 0.5,
                                        backgroundColor: isFormValid && !isSubmitted ? '#4CAF50' : '#ccc' 
                                    }
                                ]}
                                disabled={!isFormValid || isSubmitted}
                                onPress={handleRegister}
                            >
                                <Text style={styles.buttonText}>
                                    {isSubmitted ? 'Gönderildi' : 'Gönder'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                <Modal visible={showTerms} animationType="slide">
                    <TermsScreen onClose={() => setShowTerms(false)} onAccept={() => {
                        handleInputChange('termsAccepted', true);
                        setShowTerms(false);
                    }} />
                </Modal>

                {Platform.OS === 'ios' && (
                    <>
                        <Modal
                            visible={showFacultyPicker}
                            animationType="slide"
                            transparent={true}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.pickerModalContent}>
                                    <View style={styles.pickerHeader}>
                                        <TouchableOpacity 
                                            onPress={() => setShowFacultyPicker(false)}
                                            style={styles.pickerHeaderButton}
                                        >
                                            <Text style={styles.pickerHeaderButtonText}>Kapat</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.pickerHeaderTitle}>Fakülte Seçin</Text>
                                        <TouchableOpacity 
                                            onPress={() => setShowFacultyPicker(false)}
                                            style={styles.pickerHeaderButton}
                                        >
                                            <Text style={styles.pickerHeaderButtonText}>Tamam</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Picker
                                        selectedValue={formData.faculty}
                                        onValueChange={(itemValue) => {
                                            if (!isSubmitted) {
                                                handleInputChange('faculty', itemValue);
                                                handleInputChange('department', '');
                                            }
                                        }}
                                    >
                                        <Picker.Item label="Fakülte Seçin" value="" />
                                        {Object.entries(facultiesData).map(([key, value]) => (
                                            <Picker.Item key={key} label={value.name} value={key} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </Modal>

                        <Modal
                            visible={showDepartmentPicker}
                            animationType="slide"
                            transparent={true}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.pickerModalContent}>
                                    <View style={styles.pickerHeader}>
                                        <TouchableOpacity 
                                            onPress={() => setShowDepartmentPicker(false)}
                                            style={styles.pickerHeaderButton}
                                        >
                                            <Text style={styles.pickerHeaderButtonText}>Kapat</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.pickerHeaderTitle}>Bölüm Seçin</Text>
                                        <TouchableOpacity 
                                            onPress={() => setShowDepartmentPicker(false)}
                                            style={styles.pickerHeaderButton}
                                        >
                                            <Text style={styles.pickerHeaderButtonText}>Tamam</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Picker
                                        selectedValue={formData.department}
                                        onValueChange={(itemValue) => !isSubmitted && handleInputChange('department', itemValue)}
                                        enabled={!!formData.faculty && !isSubmitted}
                                    >
                                        <Picker.Item label="Bölüm Seçin" value="" />
                                        {facultiesData[formData.faculty]?.departments.map((dept, index) => (
                                            <Picker.Item key={index} label={dept} value={dept} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </Modal>
                    </>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#4c669f',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: Platform.OS === 'ios' ? 50 : 20,
    },
    headerContainer: {
        marginBottom: 8,
        alignItems: 'center'
    },
    logo: {
        width: 150,
        height: 150,
        marginTop: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        marginTop:-30,
    },
    subtitle: {
        fontSize: 14,
        color: '#E0E0E0'
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginHorizontal: Platform.OS === 'ios' ? 10 : 0,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
        fontWeight: '500',
        color: '#333'
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#4c669f',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#FFF',
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        minHeight: Platform.OS === 'ios' ? 50 : 47,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: Platform.OS === 'ios' ? 50 : 47,
        color: '#333',
        fontSize: 14,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#4c669f',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FFF',
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        paddingHorizontal: 8,
        minHeight: Platform.OS === 'ios' ? 50 : 47,
    },
    pickerContainerIOS: {
        paddingRight: 0,
    },
    picker: {
        flex: 1,
        height: Platform.OS === 'ios' ? 180 : 50,
        color: '#333',
        fontSize: 14,
    },
    pickerIOS: {
        marginRight: -8,
        marginLeft: -8,
    },
    pickerItemIOS: {
        fontSize: 14,
        height: 120,
    },
    termsContainer: {
        marginVertical: 10
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    switchLabel: {
        marginLeft: 8,
        color: '#333',
        flex: 1,
        fontSize: 14
    },
    underlinedText: {
        textDecorationLine: 'underline',
        fontSize: 14
    },
    button: {
        marginTop: 15,
        paddingVertical: Platform.OS === 'ios' ? 14 : 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#4c669f',
        fontSize: 16,
    },
    disabledInput: {
        opacity: 0.7,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    disabledPicker: {
        opacity: 0.7,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    pickerText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    pickerModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    pickerHeaderButton: {
        paddingHorizontal: 15,
    },
    pickerHeaderButtonText: {
        color: '#4c669f',
        fontSize: 16,
        fontWeight: '600',
    },
    pickerHeaderTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
}); 