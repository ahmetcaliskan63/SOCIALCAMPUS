import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.14.242:5000/api';

const errorMessages = {
  tam_ad: 'Lütfen isminizi ve soyisminizi girin.',
  terms: 'Şartları kabul etmeden devam edemezsiniz.',
  eula: 'EULA sözleşmesini kabul etmeden devam edemezsiniz.',
};

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    tam_ad: '',
    faculty: 'Mühendislik Fakültesi',
    department: 'Yazılım Mühendisliği',
    termsAccepted: false,
    eulaAccepted: false
  });
  const [loading, setLoading] = useState(false);

  // formData değişikliklerini izle
  useEffect(() => {
    // Gereksiz logları kaldırdık
  }, [formData]);

  const handleInputChange = (name, value) => {
    console.log('handleInputChange başladı:', { name, value });
    
    if (name === 'tam_ad') {
      // Sadece harflere izin ver
      const isValidChar = (char) => /[a-zA-ZğĞıİöÖüÜşŞçÇ]/.test(char);
      
      // Metni karakterlere ayır
      const chars = value.split('');
      let newText = '';
      let lastCharWasSpace = false;

      // Her karakteri kontrol et
      chars.forEach((char, index) => {
        console.log(`Karakter işleniyor [${index}]:`, {
          karakter: char,
          boşlukMu: char === ' ',
          geçerliMi: isValidChar(char),
          öncekiBoşlukMu: lastCharWasSpace
        });

        if (char === ' ') {
          // Eğer önceki karakter boşluk değilse ve metin boş değilse boşluk ekle
          if (!lastCharWasSpace && newText.length > 0) {
            newText += ' ';
            lastCharWasSpace = true;
          }
        } else if (isValidChar(char)) {
          // Harf ise ekle
          newText += char;
          lastCharWasSpace = false;
        }

        console.log(`İşlem sonrası [${index}]:`, {
          şuAnkiMetin: newText,
          sonKarakterBoşlukMu: lastCharWasSpace
        });
      });

      console.log('Metin işleme tamamlandı:', {
        başlangıçDeğeri: value,
        sonDeğer: newText,
        uzunluk: newText.length,
        boşlukVar: newText.includes(' ')
      });

      setFormData(prevState => ({
        ...prevState,
        [name]: newText
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleRegister = async () => {
    // Form verilerini kontrol et
    console.log('Kayıt başlıyor, form verileri:', formData);

    const { tam_ad, faculty, department, termsAccepted, eulaAccepted } = formData;

    // Validation
    if (!tam_ad || tam_ad.trim().length < 5) {
      Alert.alert('Uyarı', 'Ad Soyad en az 5 karakter olmalıdır');
      return;
    }

    if (!tam_ad.includes(' ')) {
      Alert.alert('Uyarı', 'Lütfen hem adınızı hem soyadınızı girin');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        tam_ad: tam_ad.trim(),
        fakulte: faculty.toLowerCase().replace(' fakültesi', ''),
        fakulte_adi: faculty,
        bolum: department,
        sartlari_kabul: termsAccepted ? 1 : 0,
        sozlesmeyi_kabul: eulaAccepted ? 1 : 0
      };

      console.log('API isteği hazırlandı:', requestData);

      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();
      console.log('API Yanıtı:', responseText);

      const data = JSON.parse(responseText);
      
      if (response.ok && data.success) {
        // Kullanıcı bilgilerini AsyncStorage'a kaydet
        const userData = {
          id: data.data.userId,
          tam_ad: requestData.tam_ad,
          fakulte: requestData.fakulte,
          fakulte_adi: requestData.fakulte_adi,
          bolum: requestData.bolum
        };
        
        console.log('AsyncStorage\'a kaydediliyor:', userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        Alert.alert('Başarılı', 'Kayıt işlemi başarıyla tamamlandı');
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Hata', data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hoşgeldiniz</Text>
      <Text style={styles.subtitle}>Bilgilerinizi doldurunuz.</Text>

      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        value={formData.tam_ad}
        onChangeText={(text) => handleInputChange('tam_ad', text)}
        placeholderTextColor="#999"
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Fakülte Adı"
        value={formData.faculty}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Bölüm"
        value={formData.department}
        editable={false}
      />

      <View style={styles.switchContainer}>
        <Text>Şartları ve Koşulları Kabul Ediyorum</Text>
        <Switch
          value={formData.termsAccepted}
          onValueChange={(value) => setFormData(prev => ({ ...prev, termsAccepted: value }))}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text>Son Kullanıcı Lisans Sözleşmesini (EULA) onaylıyorum.</Text>
        <Switch
          value={formData.eulaAccepted}
          onValueChange={(value) => setFormData(prev => ({ ...prev, eulaAccepted: value }))}
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  button: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  nameInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nameInput: {
    width: '48%', // İki input yan yana
  },
});

export default LoginScreen; 