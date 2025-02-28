import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsScreen = ({ onClose, onAccept }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Şartlar ve Koşullar</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.content}>
                <Text style={styles.paragraph}>
                    1. Giriş{'\n'}
                    Bu şartlar ve koşullar, KLÜ Kampüs uygulamasını kullanımınızı düzenler.
                </Text>
                
                <Text style={styles.paragraph}>
                    2. Kullanım Koşulları{'\n'}
                    Uygulamayı kullanarak, bu şartları kabul etmiş olursunuz.
                </Text>
                
                <Text style={styles.paragraph}>
                    3. Gizlilik{'\n'}
                    Kişisel bilgileriniz gizlilik politikamıza uygun olarak korunacaktır.
                </Text>
                
                <Text style={styles.paragraph}>
                    4. Sorumluluk{'\n'}
                    Uygulama içeriğinin doğruluğu ve güncelliği konusunda sorumluluk kullanıcıya aittir.
                </Text>
            </ScrollView>
            
            <View style={styles.footer}>
                <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                    <Text style={styles.acceptButtonText}>Kabul Ediyorum</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 15,
        color: '#333',
    },
    footer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TermsScreen; 