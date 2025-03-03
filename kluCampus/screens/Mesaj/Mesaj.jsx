import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const API_URL = 'http://192.168.14.242:5000/api/messages';  // Backend sunucunuzun IP adresi ve portu
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Cache sabitleri
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat
const MESSAGES_PER_PAGE = 3; // Sayfa başına 3 mesaj
const COMMENTS_PER_PAGE = 2; // Sayfa başına 2 yorum

export default function MessageScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [refreshingComments, setRefreshingComments] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [agendaTopics, setAgendaTopics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showCommentOptionsModal, setShowCommentOptionsModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showMessageOptionsModal, setShowMessageOptionsModal] = useState(false);
  const [selectedMessageForOptions, setSelectedMessageForOptions] = useState(null);

  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Kullanıcı bilgisini al
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }
      const user = JSON.parse(userData);

      // Kullanıcı ID'sini query parametresi olarak ekle
      const response = await fetch(`${API_URL}?kullanici_id=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        // Her mesaj için scale animasyonunu başlat
        const messagesWithScale = result.data.map(message => ({
          ...message,
          scale: new Animated.Value(1),
          // API'den gelen isLiked değerini koru
          isLiked: message.isLiked || false,
          likes: message.likes || 0
        }));
        setMessages(messagesWithScale);
      }
    } catch (error) {
      console.error('Mesaj yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }

      const user = JSON.parse(userData);
      console.log('Kullanıcı bilgisi:', user);

      const messageToSend = {
        kullanici_id: user.id,
        kullanici_adi: user.tam_ad,
        icerik: messageData.text
      };

      console.log('Gönderilecek mesaj:', messageToSend);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageToSend)
      });

      console.log('API yanıt status:', response.status);
      const responseText = await response.text();
      console.log('API ham yanıt:', responseText);

      if (!response.ok) {
        throw new Error(`API yanıt vermedi: ${response.status} ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('API yanıt data:', result);

      if (!result.success) {
        throw new Error(result.message || 'Mesaj gönderilemedi');
      }

      // Yeni mesaj için scale animasyonunu başlat
      const newMessage = {
        ...result.data,
          scale: new Animated.Value(1),
        isLiked: false,
        likes: 0
      };

      // Cache'i güncelle
      const cachedMessages = await AsyncStorage.getItem('cached_messages');
      if (cachedMessages) {
        const messages = JSON.parse(cachedMessages);
        messages.unshift(newMessage);
        await AsyncStorage.setItem('cached_messages', JSON.stringify(messages));
      }

      setMessages(prevMessages => [newMessage, ...prevMessages]);
      return newMessage;
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi: ' + error.message);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/${messageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('API yanıt vermedi');
      }

      // Cache'i güncelle
      const cachedMessages = await AsyncStorage.getItem('cached_messages');
      if (cachedMessages) {
        const messages = JSON.parse(cachedMessages);
        const filteredMessages = messages.filter(message => message.id !== messageId);
        await AsyncStorage.setItem('cached_messages', JSON.stringify(filteredMessages));
      }
      
      setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      Alert.alert('Hata', 'Mesaj silinemedi');
      throw error;
    }
  };

  // İlk yükleme için useEffect
  useEffect(() => {
    const initializeData = async () => {
      try {
        await getCurrentUser();
        await fetchMessages();
    } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initializeData();
  }, []); // Boş dependency array ile sadece component mount olduğunda çalışır

  // Yenileme işlemi için
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMessages();
      } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Kullanıcı bilgisini al
  const getCurrentUser = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem("userData");
      console.log('Kullanıcı verisi (raw):', userDataStr);

      if (!userDataStr) {
        console.log('Kullanıcı verisi bulunamadı');
        setCurrentUser(null);
        return;
      }

      const userData = JSON.parse(userDataStr);
      console.log('Kullanıcı verisi (parsed):', userData);

      // Kullanıcı verisi doğru formatta mı kontrol et
      if (!userData.id || !userData.tam_ad) {
        console.log('Kullanıcı verisi eksik:', userData);
        setCurrentUser(null);
        return;
      }

      setCurrentUser(userData);
      console.log('Current user set:', userData);
    } catch (error) {
      console.error("getCurrentUser hatası:", error);
      setCurrentUser(null);
    }
  };

  // Mesaj gönderme optimizasyonu
  const handleSend = async () => {
    if (!currentUser || !newMessage.trim()) return;

    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }
      const user = JSON.parse(userData);

      const messageData = {
        kullanici_id: user.id,
        kullanici_adi: user.tam_ad,
        icerik: newMessage.trim()
      };

      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Mesaj gönderilemedi');
      }

      const result = await response.json();
      
      if (result.success) {
        setNewMessage('');
        // Mesajları yeniden yükle
        fetchMessages();
      } else {
        throw new Error(result.message || 'Mesaj gönderilemedi');
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    }
  };

  // Beğeni işlemi
  const handleLikeMessage = async (message) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }

      const user = JSON.parse(userData);
      const response = await fetch(`${API_URL}/${message.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kullanici_id: user.id })
      });

      if (!response.ok) {
        throw new Error('API yanıt vermedi');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Beğeni işlemi başarısız');
      }

      // Animasyonu başlat
      const newScale = result.data.isLiked ? 1.5 : 1;
      Animated.sequence([
        Animated.spring(message.scale, {
          toValue: newScale,
          useNativeDriver: true,
          friction: 3
        }),
        Animated.spring(message.scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3
        })
      ]).start();

      // State'i güncelle
      setMessages(prevMessages => prevMessages.map(msg => {
          if (msg.id === message.id) {
            return {
              ...msg,
            likes: result.data.likes,
            isLiked: result.data.isLiked
            };
          }
          return msg;
      }));

    } catch (error) {
      console.error('Beğeni hatası:', error);
      Alert.alert('Hata', 'Beğeni işlemi başarısız oldu');
    }
  };

  // Yorum gönderme fonksiyonu
  const handleAddComment = async () => {
    try {
      if (!newComment.trim()) {
        return;
      }

      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }

      const user = JSON.parse(userData);
      const commentData = {
        kullanici_id: user.id,
        kullanici_adi: user.tam_ad,
        icerik: newComment.trim()
      };

      const response = await fetch(`${API_URL}/${selectedMessage.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData)
      });

      if (!response.ok) {
        throw new Error('Yorum gönderilemedi');
      }

      const result = await response.json();
      if (result.success) {
        // Yorum listesini güncelle
        setSelectedMessage(prevMessage => ({
          ...prevMessage,
          commentList: [result.data, ...prevMessage.commentList]
        }));
        
        // Yorum input'unu temizle
        setNewComment('');
      }
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      Alert.alert('Hata', 'Yorum gönderilemedi');
    }
  };

  // Yorumları dinleme fonksiyonu
  const listenToComments = async (messageId) => {
    if (!messageId) return;

    try {
      const response = await fetch(`${API_URL}/${messageId}/comments`);
      if (!response.ok) return;

      const result = await response.json();
      if (result.success) {
        setSelectedMessage(prev => ({
          ...prev,
          commentList: result.data || []
        }));
      }
    } catch (error) {
      console.error('Yorum yükleme hatası:', error);
    }
  };

  // Mesaj silme optimizasyonu
  const handleDeleteMessage = async (messageId) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }
      const user = JSON.parse(userData);

      const response = await fetch(`${API_URL}/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kullanici_id: user.id })
      });

      if (!response.ok) {
        throw new Error('Mesaj silinemedi');
      }

      // UI'dan mesajı kaldır
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      setShowMessageOptionsModal(false);

    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      Alert.alert('Hata', 'Mesaj silinirken bir hata oluştu');
    }
  };

  const handleMoreOptions = (message) => {
    console.log("Options menu opened for:", message.text); // Hangi mesaj için açıldığını kontrol edin
    setCurrentMessage(message);
    setShowOptions(true);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }
      const user = JSON.parse(userData);

      const response = await fetch(`${API_URL}/${selectedMessage.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kullanici_id: user.id })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Yorum silme hatası:', errorText);
        throw new Error('Yorum silinemedi');
      }

      // Yorumu listeden kaldır
      setSelectedMessage(prevMessage => ({
        ...prevMessage,
        commentList: prevMessage.commentList.filter(comment => comment.id !== commentId)
      }));

      setShowCommentOptionsModal(false);
    } catch (error) {
      console.error('Yorum silme hatası:', error);
      Alert.alert('Hata', 'Yorum silinirken bir hata oluştu');
    }
  };

  const handleCommentOptions = (comment) => {
    // Kullanıcı yetkisini kontrol et
    const userData = AsyncStorage.getItem('userData')
      .then(data => {
        if (!data) {
          Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
          return;
        }
        const user = JSON.parse(data);
        
        // Sadece kullanıcının kendi yorumları için silme seçeneğini göster
        if (user.id === comment.kullanici_id) {
          setSelectedComment(comment);
          setShowCommentOptionsModal(true);
        } else {
          Alert.alert('Uyarı', 'Sadece kendi yorumlarınızı silebilirsiniz');
        }
      })
      .catch(error => {
        console.error('Kullanıcı bilgisi alınırken hata:', error);
        Alert.alert('Hata', 'Kullanıcı bilgisi alınamadı');
      });
  };

  // Yorumları yenileme fonksiyonu
  const onRefreshComments = React.useCallback(async () => {
    if (!selectedMessage) return;

    setRefreshingComments(true);
    try {
      // Yorumları getir
      const commentsRef = collection(
        FIRESTORE_DB,
        `messages/${selectedMessage.id}/comments`
      );
      const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
      const commentsSnapshot = await getDocs(commentsQuery);

      const updatedComments = commentsSnapshot.docs.map((commentDoc) => {
        const commentData = { id: commentDoc.id, ...commentDoc.data() };
        commentData.isLiked = currentUser
          ? commentData.likedBy?.includes(currentUser.id)
          : false;
        return commentData;
      });

      // Seçili mesajı güncelle
      setSelectedMessage((prev) => ({
        ...prev,
        commentList: updatedComments,
        comments: updatedComments.length,
      }));
    } catch (error) {
      console.error("Yorumlar yenilenirken hata:", error);
    } finally {
      setRefreshingComments(false);
    }
  }, [selectedMessage, currentUser]);

  // Gündem konularını getir
    const loadAgendaTopics = async () => {
      try {
      console.log('Gündem konuları getiriliyor...');
      const response = await fetch(`${API_URL}/gundem_konulari`);
      console.log('Gündem API response status:', response.status);
      
      const responseText = await response.text();
      console.log('Gündem API raw response:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = JSON.parse(responseText);
      if (result.success) {
        setAgendaTopics(result.data);
      } else {
        setAgendaTopics([]);
      }
      } catch (error) {
      console.error('Gündem konuları hatası:', error);
      setAgendaTopics([]);
      }
    };

  // useEffect içinde çağır
  useEffect(() => {
    loadAgendaTopics();
  }, []);

  // Firebase ile ilgili useEffect'i kaldır ve yeni bir beğeni kontrol sistemi ekle
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Her 15 dakikada bir beğenileri güncelle
    const interval = setInterval(async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) return;
        
        const result = await response.json();
        if (result.success) {
          setMessages(result.data);
        }
      } catch (error) {
        console.error('Beğeni güncelleme hatası:', error);
      }
    }, 15 * 60 * 1000); // 15 dakika

    return () => clearInterval(interval);
  }, [messages.length]);

  // Mesaj seçme işlemi
  const handleMessagePress = async (message) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }
      const user = JSON.parse(userData);
      console.log('Kullanıcı bilgisi:', user); // Debug log

      setSelectedMessage({
        ...message,
        commentList: [], // Initialize empty commentList
      });
      setShowCommentModal(true);
      
      const url = `${API_URL}/${message.id}/comments?kullanici_id=${user.id}`;
      console.log('API çağrısı yapılıyor:', url); // Debug log
      
      const response = await fetch(url);
      console.log('API yanıtı:', response.status); // Debug log
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('API hata detayı:', errorText); // Debug log
        throw new Error('Yorumlar yüklenemedi');
      }
      
      const result = await response.json();
      console.log('API sonucu:', result); // Debug log
      
      if (result.success) {
        setSelectedMessage(prev => ({
              ...prev,
          commentList: result.data || []
        }));
      }
    } catch (error) {
      console.error('Yorum yükleme hatası:', error);
      Alert.alert('Hata', 'Yorumlar yüklenirken bir hata oluştu');
    }
  };

  // FlatList optimizasyonları
  const memoizedRenderItem = React.useCallback(
    ({ item }) => {
      if (!item) return null;

      return (
        <View style={styles.messageContainer}>
          <View style={styles.messageHeader}>
            <Text style={styles.userName}>{item.kullanici_adi}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.messageTime}>
                {new Date(item.olusturma_tarihi).toLocaleString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              {currentUser && currentUser.id === item.kullanici_id && (
                <TouchableOpacity 
                  style={{ padding: 5, marginLeft: 10 }}
                  onPress={() => handleMessageOptions(item)}
                >
                  <MaterialIcons name="menu" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.messageText}>{item.icerik}</Text>
          <View style={styles.messageFooter}>
              <TouchableOpacity
                style={styles.actionButton}
              onPress={() => handleLikeMessage(item)}
              >
                <Animated.View style={{ transform: [{ scale: item.scale }] }}>
                <Text style={[styles.actionText, item.isLiked && styles.liked]}>
                  {item.isLiked ? '❤️' : '🤍'} {item.likes || 0}
                </Text>
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
              onPress={() => handleMessagePress(item)}
              >
              <Text style={styles.actionText}>
                💬 {item.comments || 0}
              </Text>
              </TouchableOpacity>
            </View>
          </View>
      );
    },
    [currentUser]
  );

  const keyExtractor = React.useCallback((item) => item.id, []);

  const getItemLayout = React.useCallback(
    (data, index) => ({
      length: 120, // Tahmini yükseklik
      offset: 120 * index,
      index,
    }),
    []
  );

  // Performans için ayrı Message bileşeni
  const MessageItem = React.memo(
    ({ item, currentUser, onLike, onComment, onOptions }) => (
      <TouchableOpacity onPress={() => onComment(item)}>
        <BlurView intensity={80} tint="dark" style={styles.messageContainer}>
          <View style={styles.messageContent}>
            <View style={styles.headerRow}>
              <Text style={styles.username}>{item.userName}</Text>
              <Text style={styles.timestamp}>
                {item.createdAt instanceof Date
                  ? item.createdAt.toLocaleString("tr-TR")
                  : new Date(item.createdAt).toLocaleString("tr-TR")}
              </Text>
            </View>
            <Text style={styles.messageText}>{item.text}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => onLike(item)}
                style={styles.actionButton}
              >
                <Animated.View style={{ transform: [{ scale: item.scale }] }}>
                  <Animated.Text
                    style={[
                      styles.actionText,
                      item.isLiked ? styles.liked : null,
                    ]}
                  >
                    {item.isLiked ? "❤️" : "🤍"} {item.likes}
                  </Animated.Text>
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onComment(item)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>💬 {item.comments}</Text>
              </TouchableOpacity>

              {currentUser && currentUser.id === item.userId && (
                <TouchableOpacity
                  onPress={() => onOptions(item)}
                  style={styles.moreOptionsButton}
                >
                  <Ionicons name="menu" size={24} color="#aaa" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    )
  );

  const renderComments = () => (
    <LinearGradient
      colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.4)"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <BlurView intensity={100} tint="dark" style={styles.commentsHeader}>
          <TouchableOpacity
            onPress={() => setShowComments(false)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#4ECDC4" />
          </TouchableOpacity>
          <Text style={styles.commentsTitle}>Yorumlar</Text>
        </BlurView>

        <BlurView intensity={80} tint="dark" style={styles.selectedMessageContainer}>
          <View style={styles.selectedMessageContent}>
            <Text style={styles.selectedMessageUsername}>
              {selectedMessage?.kullanici_adi}
            </Text>
            <Text style={styles.selectedMessageText}>
              {selectedMessage?.icerik}
            </Text>
          </View>
        </BlurView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Yorumlar yükleniyor...</Text>
          </View>
        ) : selectedMessage?.commentList ? (
          <FlatList
            data={selectedMessage.commentList}
            renderItem={({ item }) => (
              <View style={[styles.commentContainer, { 
                backgroundColor: '#1C1C1E',
                marginHorizontal: 10,
                marginVertical: 5,
                padding: 15,
                borderRadius: 8,
                flexDirection: 'column'
              }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={[styles.commentUsername, { 
                    color: '#4ECDC4', 
                    fontSize: 16
                  }]}>
                    {item.kullanici_adi}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ 
                      color: '#666',
                      fontSize: 12,
                      marginRight: 10
                    }}>
                      {new Date(item.olusturma_tarihi).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      }).replace(',', '')}
                    </Text>
                    {currentUser && currentUser.id === item.kullanici_id && (
                      <TouchableOpacity 
                        style={{ padding: 5 }}
                        onPress={() => handleCommentOptions(item)}
                      >
                        <MaterialIcons name="menu" size={20} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={[styles.commentText, { 
                  color: '#fff', 
                  fontSize: 14,
                  marginBottom: 8
                }]}>
                  {item.icerik}
                </Text>
                <View style={[styles.commentFooter, {
                  marginTop: 'auto'
                }]}>
                  <TouchableOpacity 
                    style={styles.likeButton}
                    onPress={() => handleLikeComment(item)}
                  >
                    <Text style={{ color: item.isLiked ? '#ff0000' : '#666', fontSize: 14 }}>
                      {item.isLiked ? '❤️' : '🤍'} {item.likes || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.commentsList, {
              paddingBottom: 60
            }]}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noCommentsContainer}>
            <Text style={styles.noCommentsText}>Henüz yorum yapılmamış</Text>
          </View>
        )}

        {Platform.OS === "ios" ? (
          <TouchableOpacity
            style={styles.addCommentButton}
            onPress={() => setShowCommentModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.commentInputWrapper}>
            <BlurView intensity={100} tint="dark" style={styles.inputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Yorumunuzu yazın..."
                placeholderTextColor="#aaa"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={styles.commentButton}
                onPress={handleAddComment}
              >
                <Ionicons name="send" size={24} color="#fff" />
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );

  // Klavye event listener'ları
  useEffect(() => {
    if (Platform.OS === "ios") {
      const keyboardWillShowListener = Keyboard.addListener(
        "keyboardWillShow",
        (e) => {
          setKeyboardVisible(true);
          navigation.getParent()?.setOptions({
            tabBarStyle: { display: "none" },
          });
        }
      );

      const keyboardWillHideListener = Keyboard.addListener(
        "keyboardWillHide",
        () => {
          setKeyboardVisible(false);
          navigation.getParent()?.setOptions({
            tabBarStyle: { display: "flex" },
          });
        }
      );

      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: "flex" },
        });
      };
    }
  }, [navigation]);

  // Modal render fonksiyonları
  const renderOptionsModal = () => (
    <Modal
      transparent={true}
      animationType="fade"
      visible={showOptions}
      onRequestClose={() => setShowOptions(false)}
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={100} tint="dark" style={styles.modalContent}>
          <TouchableOpacity
            onPress={handleDeleteMessage}
            style={styles.optionButton}
          >
            <Text style={styles.optionText}>Sil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowOptions(false)}
            style={styles.optionButton}
          >
            <Text style={styles.optionText}>Kapat</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );

  const renderCommentItem = ({ item }) => {
    if (!item) return null; // Null kontrolü ekle

    return (
      <BlurView intensity={80} tint="dark" style={styles.commentContainer}>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUsername}>
              {item.userName || "Anonim"}
            </Text>
            <View style={styles.commentHeaderRight}>
              <Text style={styles.commentTimestamp}>
                {item.createdAt instanceof Date
                  ? item.createdAt.toLocaleString("tr-TR")
                  : new Date(item.createdAt).toLocaleString("tr-TR")}
              </Text>
              {currentUser && currentUser.id === item.userId && (
                <TouchableOpacity
                  onPress={() => handleCommentOptions(item)}
                  style={styles.commentOptionsButton}
                >
                  <Ionicons name="menu" size={20} color="#aaa" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
          <TouchableOpacity
            style={styles.commentLikeButton}
            onPress={() => handleLikeComment(item)}
          >
            <Text
              style={[
                styles.commentLikeText,
                item.isLiked ? styles.commentLiked : null,
              ]}
            >
              {item.isLiked ? "❤️" : "🤍"} {item.likes || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    );
  };

  const renderCommentOptionsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showCommentOptionsModal}
      onRequestClose={() => setShowCommentOptionsModal(false)}
    >
          <TouchableOpacity
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        activeOpacity={1}
        onPress={() => setShowCommentOptionsModal(false)}
      >
        <View style={{ 
          backgroundColor: '#1C1C1E',
          borderRadius: 10,
          width: '80%',
          overflow: 'hidden'
        }}>
          <TouchableOpacity
            style={{
              paddingVertical: 15,
              borderBottomWidth: 0.5,
              borderBottomColor: '#333',
              alignItems: 'center'
            }}
            onPress={() => {
              if (selectedComment) {
                handleDeleteComment(selectedComment.id);
              }
            }}
          >
            <Text style={{ color: '#ff3b30', fontSize: 16 }}>Sil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              alignItems: 'center'
            }}
            onPress={() => setShowCommentOptionsModal(false)}
          >
            <Text style={{ color: '#666', fontSize: 16 }}>Kapat</Text>
          </TouchableOpacity>
      </View>
      </TouchableOpacity>
    </Modal>
  );

  // Daha fazla mesaj yükle
  const loadMoreMessages = async () => {
    if (loadingMore || allLoaded || loading) return;
    setLoadingMore(true);
    await fetchMessagesPaginated(true);
  };

  const renderMainScreen = () => (
    <LinearGradient
      colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.4)"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Gündem Konuları */}
        <View style={styles.agendaContainer}>
          <View style={styles.agendaHeader}>
            <Text style={styles.agendaTitle}>🎯 Gündem Konuları</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={agendaTopics}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.agendaCard}>
                <Text>{item.icon}</Text>
                <Text style={styles.agendaItemText}>{item.baslik}</Text>
              </View>
            )}
            contentContainerStyle={styles.agendaTopics}
          />
        </View>

        {/* Mesajlar Listesi */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
          </View>
        ) : messages && messages.length > 0 ? (
          <FlatList
            data={messages}
            renderItem={memoizedRenderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.messageList}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz mesaj yok</Text>
          </View>
        )}

        {/* Mesaj Gönderme Alanı */}
          <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Mesajınızı yazın..."
                placeholderTextColor="#666"
                value={newMessage}
                onChangeText={setNewMessage}
              />
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={() => {
                  if (newMessage.trim()) {
                    sendMessage({ text: newMessage });
                    setNewMessage('');
                  }
                }}
              >
                <MaterialIcons name="send" size={24} color="#4ECDC4" />
              </TouchableOpacity>
          </View>

          <Modal
            animationType="slide"
            transparent={false}
            visible={showCommentModal}
            onRequestClose={() => setShowCommentModal(false)}
          >
            {selectedMessage && (
              <View style={[styles.modalContainer, { backgroundColor: '#000' }]}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => setShowCommentModal(false)}
                  >
                    <Text style={[styles.modalTitle, { color: '#4ECDC4', fontSize: 20, marginLeft: 15 }]}>
                      Yorumlar
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalUsername, { color: '#4ECDC4', fontSize: 16, marginLeft: 15, marginTop: 10 }]}>
                  {selectedMessage.kullanici_adi}
                </Text>
                
                <Text style={[styles.messageContent, { color: '#fff', fontSize: 14, marginLeft: 15, marginTop: 5 }]}>
                  {selectedMessage.icerik}
                </Text>

                <FlatList
                  data={selectedMessage.commentList}
                  renderItem={({ item }) => (
                    <View style={[styles.commentContainer, { 
                      backgroundColor: '#1C1C1E',
                      marginHorizontal: 10,
                      marginVertical: 5,
                      padding: 15,
                      borderRadius: 8,
                      flexDirection: 'column'
                    }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={[styles.commentUsername, { 
                          color: '#4ECDC4', 
                          fontSize: 16
                        }]}>
                          {item.kullanici_adi}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ 
                            color: '#666',
                            fontSize: 12,
                            marginRight: 10
                          }}>
                            {new Date(item.olusturma_tarihi).toLocaleString('tr-TR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false
                            }).replace(',', '')}
                          </Text>
                          {currentUser && currentUser.id === item.kullanici_id && (
                            <TouchableOpacity 
                              style={{ padding: 5 }}
                              onPress={() => handleCommentOptions(item)}
                            >
                              <MaterialIcons name="menu" size={20} color="#666" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <Text style={[styles.commentText, { 
                        color: '#fff', 
                        fontSize: 14,
                        marginBottom: 8
                      }]}>
                        {item.icerik}
                      </Text>
                      <View style={[styles.commentFooter, {
                        marginTop: 'auto'
                      }]}>
                        <TouchableOpacity 
                          style={styles.likeButton}
                          onPress={() => handleLikeComment(item)}
                        >
                          <Text style={{ color: item.isLiked ? '#ff0000' : '#666', fontSize: 14 }}>
                            {item.isLiked ? '❤️' : '🤍'} {item.likes || 0}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={[styles.commentsList, {
                    paddingBottom: 60
                  }]}
                  showsVerticalScrollIndicator={false}
                />

                <View style={[styles.commentInputContainer, { 
                  backgroundColor: '#1C1C1E',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  flexDirection: 'row',
                  alignItems: 'center'
                }]}>
                  <TextInput
                    style={[styles.commentInput, {
                      flex: 1,
                      backgroundColor: '#333',
                      borderRadius: 25,
                      paddingHorizontal: 15,
                      paddingVertical: 8,
                      color: '#fff',
                      marginRight: 10,
                      height: 40
                    }]}
                    placeholder="Yorumunuzu yazın..."
                    placeholderTextColor="#666"
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity 
                    style={[styles.sendButton, {
                      backgroundColor: '#4ECDC4',
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }]}
                    onPress={handleAddComment}
                  >
                    <MaterialIcons name="send" size={20} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Modal>
      </SafeAreaView>
    </LinearGradient>
  );

  // Yorumları yükleme fonksiyonu - optimize edilmiş
  const loadComments = async (messageId) => {
    if (!messageId) return;

    try {
      const cacheKey = `comments_${messageId}`;
      const cachedComments = await AsyncStorage.getItem(cacheKey);

      if (cachedComments) {
        setSelectedMessage((prev) => ({
          ...prev,
          commentList: JSON.parse(cachedComments),
        }));
      }

      // Firebase'den son yorumları çek
      const commentsRef = collection(
        FIRESTORE_DB,
        `messages/${messageId}/comments`
      );
      const q = query(commentsRef, orderBy("createdAt", "desc"), limit(10));
      const snapshot = await getDocs(q);

      const comments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache'e kaydet
      await AsyncStorage.setItem(cacheKey, JSON.stringify(comments));

      setSelectedMessage((prev) => ({
        ...prev,
        commentList: comments,
      }));
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleLikeComment = async (comment) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }

      const user = JSON.parse(userData);
      console.log('Beğeni isteği gönderiliyor:', comment.id, user.id);

      // API endpoint'ini düzelttim
      const response = await fetch(`${API_URL}/${selectedMessage.id}/comments/${comment.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kullanici_id: user.id })
      });

      console.log('API yanıtı:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('API hata detayı:', errorText);
        throw new Error('API yanıt vermedi');
      }

      const result = await response.json();
      console.log('API sonucu:', result);

      if (!result.success) {
        throw new Error(result.message || 'Beğeni işlemi başarısız');
      }

      // Yorumlar listesini güncelle
      setSelectedMessage(prevMessage => ({
        ...prevMessage,
        commentList: prevMessage.commentList.map(item => {
          if (item.id === comment.id) {
            return {
              ...item,
              likes: result.data.likes,
              isLiked: result.data.isLiked
            };
          }
          return item;
        })
      }));

    } catch (error) {
      console.error('Yorum beğeni hatası:', error);
      Alert.alert('Hata', 'Beğeni işlemi başarısız oldu');
    }
  };

  // useEffect ekle
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Kullanıcı bilgisi yüklenirken hata:', error);
      }
    };

    loadUserData();
  }, []);

  // Mesaj seçenekleri için fonksiyon
  const handleMessageOptions = (message) => {
    setSelectedMessageForOptions(message);
    setShowMessageOptionsModal(true);
  };

  // Mesaj seçenekleri modalı
  const renderMessageOptionsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showMessageOptionsModal}
      onRequestClose={() => setShowMessageOptionsModal(false)}
    >
      <TouchableOpacity 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        activeOpacity={1}
        onPress={() => setShowMessageOptionsModal(false)}
      >
        <View style={{ 
          backgroundColor: '#1C1C1E',
          borderRadius: 10,
          width: '80%',
          overflow: 'hidden'
        }}>
          <TouchableOpacity
            style={{
              paddingVertical: 15,
              borderBottomWidth: 0.5,
              borderBottomColor: '#333',
              alignItems: 'center'
            }}
            onPress={() => {
              if (selectedMessageForOptions) {
                handleDeleteMessage(selectedMessageForOptions.id);
              }
            }}
          >
            <Text style={{ color: '#ff3b30', fontSize: 16 }}>Sil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              alignItems: 'center'
            }}
            onPress={() => setShowMessageOptionsModal(false)}
          >
            <Text style={{ color: '#666', fontSize: 16 }}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <>
      {showComments ? renderComments() : renderMainScreen()}
      {renderOptionsModal()}
      {renderCommentOptionsModal()}
      {renderMessageOptionsModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  agendaContainer: {
    backgroundColor: '#000',
    borderRadius: 15,
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  agendaTitle: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  agendaTopics: {
    paddingHorizontal: 5,
  },
  agendaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  agendaItemText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  messageList: {
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === "ios" ? 70 : 60,
  },
  messageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageTime: {
    color: '#666',
    fontSize: 12,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    marginVertical: 5,
  },
  messageFooter: {
    flexDirection: 'row',
    marginTop: 5,
  },
  actionButton: {
    marginRight: 15,
  },
  actionText: {
    color: '#666',
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#fff',
    marginRight: 10,
    height: 40,
  },
  sendButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    marginRight: 15,
  },
  commentsTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
    color: "#4ECDC4",
  },
  selectedMessageContainer: {
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  selectedMessageContent: {
    padding: 10,
  },
  selectedMessageUsername: {
    fontSize: screenWidth * 0.04,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginBottom: 5,
  },
  selectedMessageText: {
    fontSize: screenWidth * 0.04,
    color: "#fff",
  },
  commentsList: {
    paddingHorizontal: 15,
    paddingBottom: 120,
  },
  commentContainer: {
    flexDirection: "row",
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  commentContent: {
    flex: 1,
    padding: 10,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  commentUsername: {
    fontWeight: "bold",
    color: "#4ECDC4",
    fontSize: screenWidth * 0.035,
  },
  commentTimestamp: {
    fontSize: screenWidth * 0.03,
    color: "#aaa",
  },
  commentText: {
    fontSize: screenWidth * 0.035,
    color: "#fff",
    marginBottom: 5,
  },
  commentInputWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 110 : 60,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    zIndex: 999,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: screenWidth * 0.04,
    color: "#fff",
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: "#4ECDC4",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  loadingText: {
    color: "#fff",
    fontSize: screenWidth * 0.04,
    marginTop: 10,
  },
  noMessagesText: {
    color: "#aaa",
    fontSize: screenWidth * 0.04,
    textAlign: "center",
  },
  commentHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentOptionsButton: {
    marginLeft: 10,
    padding: 5,
  },
  noTopicsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  noTopicsText: {
    color: "#aaa",
    fontSize: screenWidth * 0.04,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#2C2C2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: screenHeight * 0.3,
  },
  optionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: screenWidth * 0.04,
    fontWeight: "500",
  },
  keyboardAvoidingView: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 999,
  },
  inputWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 130 : 60, // iOS için daha yukarı taşı
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    zIndex: 999,
    elevation: 999,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    height: 60,
    zIndex: 999,
    elevation: 999,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: screenWidth * 0.04,
    color: "#fff",
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#4ECDC4",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMore: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  addMessageButton: {
    position: "absolute",
    right: screenWidth * 0.05,
    bottom: Platform.OS === "ios" ? screenHeight * 0.2 : screenHeight * 0.12,
    backgroundColor: "#4ECDC4",
    width: screenWidth * 0.15,
    height: screenWidth * 0.15,
    borderRadius: screenWidth * 0.075,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 999,
  },
  addCommentButton: {
    position: "absolute",
    right: screenWidth * 0.05,
    bottom: Platform.OS === "ios" ? screenHeight * 0.13 : screenHeight * 0.12,
    backgroundColor: "#4ECDC4",
    width: screenWidth * 0.15,
    height: screenWidth * 0.15,
    borderRadius: screenWidth * 0.075,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 999,
  },
  messageModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  messageModalContent: {
    backgroundColor: "#2C2C2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: screenHeight * 0.3,
  },
  messageModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  messageModalTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
    color: "#4ECDC4",
  },
  messageModalClose: {
    padding: 5,
  },
  messageModalInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 15,
    color: "#fff",
    fontSize: screenWidth * 0.04,
    minHeight: screenHeight * 0.15,
    textAlignVertical: "top",
  },
  messageModalSend: {
    backgroundColor: "#4ECDC4",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
  },
  messageModalSendText: {
    color: "#000",
    fontSize: screenWidth * 0.045,
    fontWeight: "600",
  },
  commentModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  commentModalContent: {
    backgroundColor: "#2C2C2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: screenHeight * 0.3,
  },
  commentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  commentModalTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
    color: "#4ECDC4",
  },
  commentModalClose: {
    padding: 5,
  },
  commentModalInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 15,
    color: "#fff",
    fontSize: screenWidth * 0.04,
    minHeight: screenHeight * 0.15,
    textAlignVertical: "top",
  },
  commentModalSend: {
    backgroundColor: "#4ECDC4",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
  },
  commentModalSendText: {
    color: "#000",
    fontSize: screenWidth * 0.045,
    fontWeight: "600",
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  noCommentsText: {
    color: "#aaa",
    fontSize: screenWidth * 0.04,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#aaa",
    fontSize: screenWidth * 0.04,
    textAlign: "center",
  },
  closeButton: {
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#4ECDC4",
    fontSize: screenWidth * 0.04,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    padding: 10,
  },
  modalProfileImage: {
    width: screenWidth * 0.2,
    height: screenWidth * 0.2,
    borderRadius: screenWidth * 0.1,
  },
  modalUsername: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginBottom: 10,
  },
  modalText: {
    fontSize: screenWidth * 0.04,
    color: "#fff",
  },
  modalTimestamp: {
    fontSize: screenWidth * 0.03,
    color: "#aaa",
  },
  commentTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginBottom: 10,
  },
  commentItem: {
    fontSize: screenWidth * 0.04,
    color: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
    color: "#4ECDC4",
  },
  messageContent: {
    padding: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  username: {
    fontWeight: "bold",
    color: "#4ECDC4",
    fontSize: screenWidth * 0.035,
  },
  timestamp: {
    fontSize: screenWidth * 0.03,
    color: "#aaa",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  moreOptionsButton: {
    marginLeft: 10,
    padding: 5,
  },
  commentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeButton: {
    padding: 5,
  },
});
