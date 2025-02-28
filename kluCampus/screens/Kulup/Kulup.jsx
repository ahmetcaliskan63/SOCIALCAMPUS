import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, TextInput, KeyboardAvoidingView, Dimensions, ActivityIndicator, Platform, StatusBar, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import cheerio from 'cheerio-without-node-native';
import ClubDetailsModal from './ClubDetailsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat
const PAGE_SIZE = 8; // Sayfa başına gösterilecek kulüp sayısını azalttım

const Kulüp = ({ navigation }) => {
  const [clubs, setClubs] = useState([]);
  const [displayedClubs, setDisplayedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Debounced search için
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Önce önbellekten veriyi yükle
      const cachedData = await AsyncStorage.getItem('clubs_data');
      if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        // Son 24 saat içinde kaydedilmiş veriler varsa kullan
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log('Using cached clubs data');
          setClubs(data);
          setDisplayedClubs(data.slice(0, PAGE_SIZE));
          setHasMore(data.length > PAGE_SIZE);
          setLoading(false);
          return;
        }
      }
      
      // Önbellekte veri yoksa veya eski ise yeni veri çek
      await fetchClubs();
    } catch (error) {
      console.error('Initial data loading error:', error);
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await axios.get('https://ogrkulup.klu.edu.tr/', {
        signal: controller.signal,
        timeout: 20000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });

      clearTimeout(timeoutId);

      const $ = cheerio.load(response.data);
      const clubsData = [];

      $('.col-lg-4').each((index, element) => {
        try {
          const name = $(element).find('h3 a').text().trim();
          if (!name) return;

          const image = $(element).find('img').attr('src');
          const details = $(element).find('.card-text').text().trim().split('\n');

          // Benzersiz ID oluştur
          const uniqueId = `club_${name.toLowerCase().replace(/\s+/g, '_')}_${index}`;

          clubsData.push({
            id: uniqueId,
            name,
            image: image ? (image.startsWith('http') ? image : `https://ogrkulup.klu.edu.tr${image}`) : null,
            president: details[0]?.replace('Kulüp Başkanı:', '').trim() || 'Belirtilmemiş',
            advisor: details[1]?.replace('Kulüp Danışmanı:', '').trim() || 'Belirtilmemiş',
            instagram: $(element).find('a.btn-instagram').attr('href') || null
          });
        } catch (parseError) {
          console.warn(`Parsing error for club #${index}:`, parseError);
        }
      });

      if (clubsData.length === 0) throw new Error('Kulüp verisi bulunamadı');

      // Önbelleğe kaydet
      await AsyncStorage.setItem('clubs_data', JSON.stringify({
        timestamp: Date.now(),
        data: clubsData
      }));

      console.log('Total clubs loaded:', clubsData.length);
      
      setClubs(clubsData);
      setDisplayedClubs(clubsData.slice(0, PAGE_SIZE));
      setCurrentPage(1);
      setHasMore(clubsData.length > PAGE_SIZE);

    } catch (err) {
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchError = async (err) => {
    console.error('Club fetch error:', err);
      let errorMessage = 'Kulüp verileri yüklenirken bir hata oluştu';
      
      if (err.name === 'AbortError') {
      errorMessage = 'Bağlantı zaman aşımına uğradı';
      }

      setError(errorMessage);
      
      // Önbellekteki verileri kullan
      try {
        const cachedData = await AsyncStorage.getItem('clubs_data');
        if (cachedData) {
        const { data } = JSON.parse(cachedData);
            setClubs(data);
        setDisplayedClubs(data.slice(0, PAGE_SIZE));
            setError(errorMessage + ' (Önbellek verileri gösteriliyor)');
      }
    } catch (cacheError) {
      console.warn('Cache read error:', cacheError);
    }
  };

  // Debounced search
  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(setTimeout(() => {
      if (text) {
        const filtered = clubs.filter(club => 
          club.name.toLowerCase().includes(text.toLowerCase())
        );
        setDisplayedClubs(filtered);
        setCurrentPage(0);
        setHasMore(false);
      } else {
        setDisplayedClubs(clubs.slice(0, PAGE_SIZE));
        setCurrentPage(0);
        setHasMore(clubs.length > PAGE_SIZE);
      }
    }, 300));
  }, [clubs, searchTimeout]);

  const loadMoreClubs = useCallback(() => {
    if (loadingMore || !hasMore || searchQuery) return;

    setLoadingMore(true);
    const startIndex = currentPage * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    
    console.log('LoadMoreClubs:', { startIndex, endIndex, currentLength: displayedClubs.length, totalLength: clubs.length });
    
    const newClubs = clubs.slice(startIndex, endIndex);
    setDisplayedClubs(prevClubs => [...prevClubs, ...newClubs]);
    
    setCurrentPage(prev => prev + 1);
    setHasMore(endIndex < clubs.length);
    setLoadingMore(false);
  }, [currentPage, clubs, loadingMore, hasMore, searchQuery, displayedClubs.length]);

  const handleEndReached = useCallback(() => {
    console.log('handleEndReached called', { searchQuery, hasMore });
    if (!loadingMore && !searchQuery && hasMore) {
      console.log('Triggering loadMoreClubs');
      loadMoreClubs();
    }
  }, [searchQuery, hasMore, loadMoreClubs, loadingMore]);

  // Memoize renderItem for better performance
  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity onPress={() => handleClubPress(item)}>
      <BlurView intensity={80} tint="dark" style={styles.card}>
        {!item.image || item.image.includes('defaultLogo.jpg') ? (
          <View style={[styles.image, styles.letterContainer]}>
            <Text style={styles.letterText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        ) : (
          <Image 
            source={{ uri: item.image }} 
            style={styles.image}
            onError={(e) => {
              console.warn('Image loading error:', e.nativeEvent.error);
              // Hata durumunda otomatik olarak harf gösterecek
            }}
          />
        )}
        <Text style={styles.name}>{item.name}</Text>
      </BlurView>
    </TouchableOpacity>
  ), []);

  // Memoize footer component
  const ListFooterComponent = useMemo(() => {
    if (!loadingMore || searchQuery || !hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4ECDC4" />
      </View>
    );
  }, [loadingMore, searchQuery, hasMore]);

  const handleClubPress = (club) => {
    setSelectedClub(club);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedClub(null);
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = clubs.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedClubs(filtered);
      setCurrentPage(1);
    } else {
      loadMoreClubs();
    }
  }, [searchQuery]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (error && !displayedClubs.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
          style={styles.gradient}
        >
          <View style={styles.innerContainer}>
            <BlurView intensity={100} tint="dark" style={styles.searchContainer}>
              <Ionicons name="search" size={24} color="#4ECDC4" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Kulüp Ara..."
                placeholderTextColor="#aaa"
                value={searchQuery}
                onChangeText={handleSearch}
                onFocus={() => {
                  if (navigation) {
                    navigation.getParent()?.setOptions({
                      tabBarStyle: {
                        display: 'none'
                      }
                    });
                  }
                }}
                onBlur={() => {
                  if (navigation) {
                    navigation.getParent()?.setOptions({
                      tabBarStyle: {
                        display: 'flex',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        elevation: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        borderTopWidth: 0,
                        height: 60,
                        paddingBottom: 10
                      }
                    });
                  }
                }}
              />
            </BlurView>
            <FlatList
              data={displayedClubs}
              renderItem={renderItem}
              keyExtractor={(item, index) => item.id || index.toString()}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListFooterComponent={ListFooterComponent}
              initialNumToRender={PAGE_SIZE}
              maxToRenderPerBatch={PAGE_SIZE}
              windowSize={5}
            />
            <ClubDetailsModal visible={modalVisible} club={selectedClub} onClose={closeModal} />
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? screenHeight * 0.06 : screenHeight * 0.04,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.04,
    paddingTop: screenHeight * 0.02,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: screenWidth * 0.04,
    marginBottom: screenHeight * 0.02,
    overflow: 'hidden',
    height: screenHeight * 0.06,
    zIndex: 1,
  },
  searchIcon: {
    marginRight: screenWidth * 0.02,
  },
  searchInput: {
    flex: 1,
    fontSize: screenWidth * 0.04,
    color: '#fff',
    height: '100%',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: screenHeight * 0.12,
  },
  card: {
    marginVertical: screenHeight * 0.01,
    marginHorizontal: screenWidth * 0.02,
    padding: screenWidth * 0.04,
    borderRadius: 15,
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: screenHeight * 0.15,
  },
  image: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.25,
    borderRadius: screenWidth * 0.125,
    marginBottom: screenHeight * 0.01,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  name: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: screenWidth * 0.02,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: screenWidth * 0.04,
  },
  errorText: {
    color: '#ff0000',
    fontSize: screenWidth * 0.04,
    textAlign: 'center',
    marginBottom: screenHeight * 0.02,
  },
  letterContainer: {
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: screenWidth * 0.08,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  footerLoader: {
    marginVertical: 20,
    alignItems: 'center'
  }
});

export default Kulüp;