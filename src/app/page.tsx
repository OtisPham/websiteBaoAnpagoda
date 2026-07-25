import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const THEME = {
  bgLight: '#EEF5F7',
  textPrimary: '#0D3A4B',
  accentGold: '#D69F4C',
  accentTeal: '#5DA8A8',
  darkTeal: '#2B697D',
  white: '#FFFFFF',
};

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bgLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder} />
          <View>
            <Text style={styles.headerTitle}>Chùa Báo Ân</Text>
            <Text style={styles.headerSubtitle}>BÁO ÂN CỔ TỰ • PHÁP ẤN</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.headerButtonText}>Đăng Nhập</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80' }}
          style={styles.heroBackground}
          imageStyle={{ opacity: 0.8 }}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.eyebrowContainer}>
              <Text style={styles.eyebrowText}>CHỐN TỔ THIỀN MÔN • BÌNH AN GIA ĐẠO</Text>
            </View>
            
            <Text style={styles.heroTitle}>Nơi Tìm Thấy Sự Bình An</Text>
            <Text style={styles.heroTitleHighlight}>Giữa Lòng Đời</Text>
            
            <Text style={styles.heroDescription}>
              Chào mừng quý Phật tử và thiện hữu xa gần bước vào chốn thanh tịnh Chùa Báo Ân — điểm
              tựa tâm linh ấm cúng, nơi lắng nghe pháp thoại và tìm về chánh niệm vững vàng.
            </Text>

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Lịch Pháp Sự & Khóa Tu</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Highlights */}
        <View style={styles.highlightsContainer}>
          <HighlightCard 
            title="Tu Học Chánh Niệm" 
            desc="Khóa Tu Tỉnh Thức Định Kỳ" 
          />
          <HighlightCard 
            title="Hoằng Pháp Lợi Sinh" 
            desc="Pháp Thoại & Kế Thừa Di Sản" 
          />
          <HighlightCard 
            title="Từ Bi Thiện Nguyện" 
            desc="Lan Tỏa Yêu Thương" 
          />
        </View>

        {/* Lịch Pháp Sự */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionSubtitle}>LỊCH PHÁP SỰ & KHÓA TU</Text>
          <Text style={styles.sectionTitle}>Sự Kiện Sắp Diễn Ra</Text>
          
          <EventCard 
            date="15 Tháng 4, Giáp Thìn"
            title="Đại Lễ Phật Đản PL.2570"
            desc="Kỷ niệm ngày Đức Thế Tôn đản sinh với nghi thức tắm Phật trang nghiêm và đàn lễ cầu nguyện quốc thái dân an."
          />
          <EventCard 
            date="Chủ Nhật Hàng Tuần"
            title="Khóa Tu Tỉnh Thức Một Ngày An Lạc"
            desc="Thời gian tu tập thanh tịnh dành cho quý cư sĩ Phật tử, thiền tọa chánh niệm và lắng nghe pháp thoại."
          />
        </View>

        {/* Tin Tức & Thông Báo */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionSubtitle}>BẢN TIN & PHÁP THOẠI</Text>
          <Text style={styles.sectionTitle}>Tin Tức & Thông Báo Phật Sự</Text>

          <NewsCard 
            category="THÔNG BÁO PHẬT SỰ"
            date="2026-07-10"
            title="Thông báo lịch tu tập và thời khóa hành lễ định kỳ dịp Đại lễ"
            desc="Chùa Báo Ân trân trọng kính báo đến toàn thể thiện nam tín nữ phật tử xa gần lịch trình khóa lễ và các buổi giảng pháp thoại..."
            image="https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=400&q=80"
          />
          <NewsCard 
            category="PHÁP THOẠI"
            date="2026-07-08"
            title="Hạnh phúc đích thực đến từ tâm xả ly và bình an nội tại"
            desc="Chia sẻ sâu sắc từ chốn thiền môn về nghệ thuật sống chánh niệm giữa những biến động của đời sống thường nhật..."
            image="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const HighlightCard = ({ title, desc }: { title: string, desc: string }) => (
  <View style={styles.highlightCard}>
    <View style={styles.iconPlaceholder} />
    <View>
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightDesc}>{desc}</Text>
    </View>
  </View>
);

const EventCard = ({ date, title, desc }: { date: string, title: string, desc: string }) => (
  <View style={styles.eventCard}>
    <View style={styles.dateBadge}>
      <Text style={styles.dateText}>{date}</Text>
    </View>
    <Text style={styles.eventTitle}>{title}</Text>
    <Text style={styles.eventDesc} numberOfLines={3}>{desc}</Text>
    <View style={styles.eventFooter}>
      <Text style={styles.eventFooterText}>Tại Chánh Điện Chùa Báo Ân</Text>
      <Text style={styles.eventLink}>Chi tiết →</Text>
    </View>
  </View>
);

const NewsCard = ({ category, date, title, desc, image }: { category: string, date: string, title: string, desc: string, image: string }) => (
  <View style={styles.newsCard}>
    <ImageBackground source={{ uri: image }} style={styles.newsImageContainer} imageStyle={styles.newsImage}>
      <View style={styles.newsCategoryBadge}>
        <Text style={styles.newsCategoryText}>{category}</Text>
      </View>
    </ImageBackground>
    <View style={styles.newsContent}>
      <Text style={styles.newsDate}>{date}</Text>
      <Text style={styles.newsTitle}>{title}</Text>
      <Text style={styles.newsDesc} numberOfLines={2}>{desc}</Text>
      <View style={styles.newsFooter}>
        <Text style={styles.newsLink}>Đọc toàn bộ bài viết →</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.accentGold,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  headerSubtitle: {
    fontSize: 10,
    color: THEME.darkTeal,
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerButton: {
    backgroundColor: THEME.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerButtonText: {
    color: THEME.white,
    fontWeight: '600',
    fontSize: 12,
  },
  heroBackground: {
    height: 450,
    justifyContent: 'center',
    backgroundColor: THEME.textPrimary,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 27, 36, 0.65)',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyebrowContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.accentTeal,
    marginBottom: 16,
  },
  eyebrowText: {
    color: THEME.accentGold,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.white,
    textAlign: 'center',
  },
  heroTitleHighlight: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.accentGold,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    color: '#e8f7fd',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: THEME.darkTeal,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: THEME.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  highlightsContainer: {
    padding: 16,
    marginTop: -30,
  },
  highlightCard: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(214, 159, 76, 0.2)',
    marginRight: 16,
  },
  highlightTitle: {
    fontSize: 12,
    color: THEME.accentTeal,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightDesc: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#F6FAFA',
    borderTopWidth: 1,
    borderTopColor: 'rgba(43, 105, 125, 0.1)',
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.accentTeal,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 24,
  },
  eventCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 105, 125, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateBadge: {
    backgroundColor: '#F6FAFA',
    borderWidth: 1,
    borderColor: 'rgba(93, 168, 168, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    color: THEME.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  eventDesc: {
    fontSize: 14,
    color: 'rgba(13, 58, 75, 0.75)',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(43, 105, 125, 0.1)',
  },
  eventFooterText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(13, 58, 75, 0.75)',
  },
  eventLink: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.accentTeal,
  },
  newsCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(43, 105, 125, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  newsImageContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'flex-start',
    padding: 12,
  },
  newsImage: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  newsCategoryBadge: {
    backgroundColor: 'rgba(13, 58, 75, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  newsCategoryText: {
    color: THEME.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  newsContent: {
    padding: 20,
  },
  newsDate: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.accentTeal,
    marginBottom: 6,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
    lineHeight: 22,
  },
  newsDesc: {
    fontSize: 13,
    color: 'rgba(13, 58, 75, 0.75)',
    lineHeight: 18,
    marginBottom: 16,
  },
  newsFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(43, 105, 125, 0.1)',
  },
  newsLink: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.accentTeal,
  }
});
