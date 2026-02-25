import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../constants/theme';

interface FinanceTip {
  id: string; title: string; summary: string; icon: string; color: string;
  readTime: string; category: string; content: string;
}

const TIP_CATEGORIES = ['Tất cả', 'Tiết kiệm', 'Đầu tư', 'Ngân sách', 'Nợ', 'Bảo hiểm'];

const tips: FinanceTip[] = [
  { id: '1', title: 'Quy tắc 50/30/20', summary: 'Phân chia thu nhập khoa học nhất cho mọi hoàn cảnh', icon: 'pie-chart', color: '#4f46e5', readTime: '3 phút', category: 'Ngân sách', content: 'Dành 50% thu nhập cho nhu cầu thiết yếu (ăn uống, nhà ở, di chuyển), 30% cho mong muốn (giải trí, mua sắm) và 20% cho tiết kiệm/đầu tư.' },
  { id: '2', title: 'Quỹ khẩn cấp 6 tháng', summary: 'Tại sao bạn cần ít nhất 6 tháng chi phí sinh hoạt dự phòng', icon: 'shield', color: '#dc2626', readTime: '4 phút', category: 'Tiết kiệm', content: 'Quỹ khẩn cấp là tấm đệm tài chính giúp bạn đứng vững khi mất việc, bệnh tật hoặc sự cố không lường trước. Hãy bắt đầu từ 1 tháng chi phí rồi tăng dần.' },
  { id: '3', title: 'Đầu tư sớm, lãi kép hoạt động', summary: 'Hiểu về lãi kép và tại sao thời gian là tài sản quý nhất', icon: 'trending-up', color: '#059669', readTime: '5 phút', category: 'Đầu tư', content: 'Nếu bạn đầu tư 1 triệu đồng/tháng từ năm 25 tuổi với lãi suất 10%/năm, đến năm 55 tuổi bạn sẽ có khoảng 2.3 tỷ đồng nhờ lãi kép.' },
  { id: '4', title: 'Cắt giảm chi phí không cần thiết', summary: '10 khoản chi tiêu thường bị lãng phí mà bạn chưa để ý', icon: 'content-cut', color: '#f59e0b', readTime: '4 phút', category: 'Ngân sách', content: 'Subscription không dùng, ăn ngoài quá nhiều, phí ngân hàng, mua đồ impulsive... Hãy theo dõi chi tiêu 1 tháng để nhận ra các khoản có thể cắt giảm.' },
  { id: '5', title: 'Trả nợ thẻ tín dụng đúng hạn', summary: 'Lãi suất thẻ tín dụng có thể lên đến 30%/năm', icon: 'credit-card', color: '#7c3aed', readTime: '3 phút', category: 'Nợ', content: 'Thanh toán toàn bộ số dư thẻ tín dụng mỗi tháng để tránh lãi suất cao. Nếu không thể, hãy ưu tiên trả khoản có lãi suất cao nhất trước (phương pháp Avalanche).' },
  { id: '6', title: 'Bảo hiểm nhân thọ bao nhiêu là đủ?', summary: 'Hướng dẫn chọn mức bảo hiểm phù hợp với thu nhập', icon: 'health-and-safety', color: '#0ea5e9', readTime: '6 phút', category: 'Bảo hiểm', content: 'Quy tắc thông thường là bảo hiểm tử kỳ nên bằng 10-12 lần thu nhập hàng năm. Ưu tiên bảo hiểm sức khỏe trước, sau đó mới đến nhân thọ.' },
  { id: '7', title: 'Đa dạng hóa danh mục đầu tư', summary: 'Đừng bỏ tất cả trứng vào một giỏ', icon: 'account-balance', color: '#d946ef', readTime: '4 phút', category: 'Đầu tư', content: 'Phân bổ tiền vào nhiều tài sản khác nhau: cổ phiếu, trái phiếu, bất động sản, vàng, tiết kiệm... để giảm rủi ro. Tỷ lệ tùy thuộc vào khả năng chịu rủi ro và tuổi tác.' },
  { id: '8', title: 'Tiết kiệm tự động hóa', summary: 'Chuyển tiền tiết kiệm ngay khi nhận lương', icon: 'autorenew', color: '#10b981', readTime: '2 phút', category: 'Tiết kiệm', content: 'Thiết lập STANDING ORDER để tự động chuyển 10-20% lương sang tài khoản tiết kiệm ngay khi nhận lương. Bạn chỉ tiêu từ phần còn lại.' },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = tips.filter(t => selectedCategory === 'Tất cả' || t.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top:10,bottom:10,left:10,right:10 }}>
          <Icon name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiến thức tài chính</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.heroBanner}>
        <Icon name="lightbulb" size={28} color="#fbbf24" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.heroTitle}>Mẹo tài chính hôm nay</Text>
          <Text style={styles.heroSub}>Đọc ít nhất 1 bài mỗi ngày để cải thiện sức khoẻ tài chính</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catContent}>
        {TIP_CATEGORIES.map(c => (
          <TouchableOpacity key={c} style={[styles.catTab, selectedCategory === c && styles.catTabActive]} onPress={() => setSelectedCategory(c)}>
            <Text style={[styles.catTabText, selectedCategory === c && styles.catTabTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList data={filtered} keyExtractor={i => i.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const expanded = expandedId === item.id;
          return (
            <TouchableOpacity onPress={() => setExpandedId(expanded ? null : item.id)}>
              <View style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <View style={[styles.tipIcon, { backgroundColor: item.color + '20' }]}>
                    <Icon name={item.icon} size={22} color={item.color} />
                  </View>
                  <View style={styles.tipMeta}>
                    <View style={styles.tipTopRow}>
                      <View style={[styles.catBadge, { backgroundColor: item.color + '15' }]}>
                        <Text style={[styles.catBadgeText, { color: item.color }]}>{item.category}</Text>
                      </View>
                      <Text style={styles.readTime}><Icon name="schedule" size={10} color="#94A3B8" /> {item.readTime}</Text>
                    </View>
                    <Text style={styles.tipTitle}>{item.title}</Text>
                    <Text style={styles.tipSummary}>{item.summary}</Text>
                  </View>
                  <Icon name={expanded ? 'expand-less' : 'expand-more'} size={20} color="#94A3B8" />
                </View>
                {expanded && (
                  <View style={[styles.tipContent, { borderTopColor: item.color + '30' }]}>
                    <Text style={styles.tipContentText}>{item.content}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  heroBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', marginHorizontal: 16, marginTop: 14, borderRadius: 16, padding: 16 },
  heroTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  catRow: { flexGrow: 0, marginTop: 12 },
  catContent: { paddingHorizontal: 16, gap: 8 },
  catTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: 'transparent' },
  catTabActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  catTabText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  catTabTextActive: { color: colors.primary, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 100 },
  tipCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  tipHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  tipIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 },
  tipMeta: { flex: 1 },
  tipTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  catBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  catBadgeText: { fontSize: 10, fontWeight: '700' },
  readTime: { fontSize: 10, color: '#94A3B8' },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 3 },
  tipSummary: { fontSize: 12, color: '#64748B' },
  tipContent: { borderTopWidth: 1, padding: 14, backgroundColor: '#F8FAFC' },
  tipContentText: { fontSize: 13, color: '#475569', lineHeight: 20 },
});

export default HomeScreen;
