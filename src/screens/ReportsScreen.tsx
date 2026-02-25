import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Card } from '../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import {
  getMonthlyTotal,
  getCategorySpending,
  getDailySpending,
  getTransactions,
  Transaction as DbTransaction,
} from '../database';
import { getAIForecast } from '../services/geminiService';

const screenWidth = Dimensions.get('window').width;

interface KPIData {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [spendingChartData, setSpendingChartData] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<DbTransaction[]>([]);
  const [forecast, setForecast] = useState<string | null>(null);
  const [isForecasting, setIsForecasting] = useState(false);
  const [allTransactions, setAllTransactions] = useState<DbTransaction[]>([]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // KPIs
      const expense = await getMonthlyTotal(year, month, 'expense');
      const income = await getMonthlyTotal(year, month, 'income');
      const savings = income - expense;
      const txns = await getTransactions(100);
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      const monthTxns = txns.filter(t => t.date.startsWith(monthStr));

      const formatM = (v: number) => {
        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000) return (v / 1000).toFixed(0) + 'K';
        return v.toLocaleString('vi-VN');
      };

      setKpiData([
        { title: 'Chi tiêu tháng', value: formatM(expense), icon: 'money-off', color: colors.danger },
        { title: 'Thu nhập', value: formatM(income), icon: 'account-balance-wallet', color: colors.success },
        { title: 'Tiết kiệm', value: formatM(savings), icon: 'savings', color: colors.primary },
        { title: 'Giao dịch', value: String(monthTxns.length), icon: 'swap-horiz', color: colors.warning },
      ]);

      // Category spending for pie chart
      const catSpending = await getCategorySpending(year, month);
      const totalExpense = catSpending.reduce((s, c) => s + c.total, 0);
      if (catSpending.length > 0 && totalExpense > 0) {
        setCategoryData(catSpending.slice(0, 5).map(c => ({
          name: c.categoryName,
          value: Math.round((c.total / totalExpense) * 100),
          color: c.categoryColor || colors.primary,
          legendFontColor: colors.text,
          legendFontSize: 12,
        })));
      }

      // Daily spending for line chart
      const daily = await getDailySpending(year, month);
      if (daily.length > 0) {
        setSpendingChartData({
          labels: daily.map(d => {
            const day = d.date.split('-')[2];
            return day;
          }),
          datasets: [{
            data: daily.map(d => d.total / 1000000), // Convert to millions
            color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
            strokeWidth: 3,
          }],
        });
      }

      // Recent transactions
      setRecentTransactions(txns.slice(0, 5));
      setAllTransactions(txns);
    } catch (error) {
      console.error('Error loading report data:', error);
    }
  };

  const handleGenerateForecast = async () => {
    if (allTransactions.length === 0) {
      Alert.alert('Thông báo', 'Cần có dữ liệu giao dịch để tạo dự báo.');
      return;
    }
    setIsForecasting(true);
    try {
      const result = await getAIForecast(allTransactions);
      setForecast(result);
    } catch (error) {
      console.error('Forecast error:', error);
      Alert.alert('Lỗi', 'Không thể tạo dự báo tài chính.');
    } finally {
      setIsForecasting(false);
    }
  };

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: () => colors.textSecondary,
    style: { borderRadius: borderRadius.md },
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
    propsForBackgroundLines: { strokeDasharray: '', stroke: colors.divider },
  };

  const renderKPICard = (item: KPIData) => (
    <Card key={item.title} style={styles.kpiCard} shadowLevel="small">
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIcon, { backgroundColor: item.color + '20' }]}>
          <Icon name={item.icon} size={20} color={item.color} />
        </View>
      </View>
      <Text style={styles.kpiValue}>{item.value}</Text>
      <Text style={styles.kpiTitle}>{item.title}</Text>
    </Card>
  );

  const renderTransaction = ({ item }: { item: DbTransaction }) => (
    <View style={styles.transactionRow}>
      <View style={[styles.transactionIcon, { backgroundColor: item.type === 'income' ? colors.success + '20' : colors.danger + '20' }]}>
        <Icon name={item.type === 'income' ? 'arrow-downward' : 'arrow-upward'} size={16} color={item.type === 'income' ? colors.success : colors.danger} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionCustomer}>{item.note || item.categoryName || 'Giao dịch'}</Text>
        <Text style={styles.transactionTime}>{item.date} • {item.categoryName}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.type === 'income' ? colors.success : colors.danger }]}>
        {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString('vi-VN')}đ
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* KPI Cards */}
          <View style={styles.kpiContainer}>
            {kpiData.map(renderKPICard)}
          </View>

          {/* Spending Trend Chart */}
          {spendingChartData && (
            <Card style={styles.chartCard} shadowLevel="small">
              <Text style={styles.chartTitle}>Chi tiêu theo ngày (triệu đồng)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={spendingChartData}
                  width={Math.max(screenWidth - 64, spendingChartData.labels.length * 40)}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </ScrollView>
            </Card>
          )}

          {/* Category Pie Chart */}
          {categoryData.length > 0 && (
            <Card style={styles.chartCard} shadowLevel="small">
              <Text style={styles.chartTitle}>Chi tiêu theo danh mục (%)</Text>
              <PieChart
                data={categoryData}
                width={screenWidth - 64}
                height={180}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card>
          )}

          {/* AI Forecasting Card */}
          <Card style={styles.listCard} shadowLevel="small">
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="psychology" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.cardTitle}>Dự báo AI (Demo)</Text>
              </View>
              {isForecasting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <TouchableOpacity onPress={handleGenerateForecast} style={styles.forecastBtn}>
                  <Text style={styles.forecastBtnText}>{forecast ? 'Cập nhật' : 'Tạo dự báo'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {forecast ? (
              <View style={styles.forecastContent}>
                <Text style={styles.forecastText}>{forecast}</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>Bấm để AI phân tích dòng tiền của bạn</Text>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card style={styles.listCard} shadowLevel="small">
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Giao dịch gần đây</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Transactions')}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentTransactions}
              renderItem={renderTransaction}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={<Text style={styles.emptyText}>Chưa có giao dịch</Text>}
            />
          </Card>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  headerTitle: { ...typography.h2, color: colors.text },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.md },
  kpiContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.lg },
  kpiCard: { width: '48%', padding: spacing.md, marginBottom: spacing.sm },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  kpiIcon: { borderRadius: borderRadius.sm, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  kpiValue: { ...typography.h2, color: colors.text, fontWeight: 'bold', marginBottom: spacing.xs },
  kpiTitle: { ...typography.small, color: colors.textSecondary },
  chartCard: { padding: spacing.md, marginBottom: spacing.lg },
  chartTitle: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: spacing.md },
  chart: { borderRadius: borderRadius.sm },
  listCard: { padding: spacing.md, marginBottom: spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  viewAllText: { ...typography.small, color: colors.primary, fontWeight: '500' },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  transactionIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  transactionInfo: { flex: 1 },
  transactionCustomer: { ...typography.body, color: colors.text, marginBottom: 2 },
  transactionTime: { ...typography.small, color: colors.textSecondary },
  transactionAmount: { ...typography.body, color: colors.primary, fontWeight: '600' },
  separator: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.xs },
  forecastBtn: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  forecastBtnText: { ...typography.small, color: colors.primary, fontWeight: '600' },
  forecastContent: { backgroundColor: colors.primary + '08', borderRadius: borderRadius.sm, padding: spacing.md, marginTop: spacing.sm },
  forecastText: { ...typography.body, color: colors.text, lineHeight: 22 },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.lg },
});