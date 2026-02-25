import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    Dimensions,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../constants/theme';
import {
    getTransactions,
    deleteTransaction,
    getMonthlyTotal,
    Transaction,
} from '../database';

const { width } = Dimensions.get('window');

const TransactionsScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const initialType = route.params?.type as 'expense' | 'income' | undefined;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [monthlyExpense, setMonthlyExpense] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>(initialType || 'all');

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [currentMonth])
    );

    const loadData = async () => {
        try {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;

            const txns = await getTransactions(100);
            // Filter by current month
            const monthStr = `${year}-${String(month).padStart(2, '0')}`;
            const filtered = txns.filter(t => t.date.startsWith(monthStr));
            setTransactions(filtered);

            const expense = await getMonthlyTotal(year, month, 'expense');
            const income = await getMonthlyTotal(year, month, 'income');
            setMonthlyExpense(expense);
            setMonthlyIncome(income);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleDelete = (id: number) => {
        Alert.alert('Xóa giao dịch', 'Bạn có chắc muốn xóa giao dịch này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    try {
                        await deleteTransaction(id);
                        await loadData();
                    } catch (error) {
                        Alert.alert('Lỗi', 'Không thể xóa giao dịch');
                    }
                },
            },
        ]);
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentMonth(newDate);
    };

    const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + 'đ';

    const monthName = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

    // Apply type filter
    const filteredTransactions = filterType === 'all'
        ? transactions
        : transactions.filter(t => t.type === filterType);

    // Group transactions by date
    const groupedByDate: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach((txn) => {
        if (!groupedByDate[txn.date]) groupedByDate[txn.date] = [];
        groupedByDate[txn.date].push(txn);
    });

    const dateGroups = Object.entries(groupedByDate)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, txns]) => ({ date, txns }));

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.getTime() === today.getTime()) return 'Hôm nay';
        if (d.getTime() === yesterday.getTime()) return 'Hôm qua';
        return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });
    };

    const renderTransaction = (txn: Transaction) => (
        <TouchableOpacity
            key={txn.id}
            style={styles.txnItem}
            onLongPress={() => handleDelete(txn.id)}
        >
            <View style={[styles.txnIcon, { backgroundColor: (txn.categoryColor || '#64748B') + '15' }]}>
                <Text style={styles.txnIconText}>{txn.categoryIcon || '📦'}</Text>
            </View>
            <View style={styles.txnInfo}>
                <Text style={styles.txnCategory}>{txn.categoryName || 'Không rõ'}</Text>
                <Text style={styles.txnNote} numberOfLines={1}>{txn.note || txn.accountName}</Text>
            </View>
            <Text style={[styles.txnAmount, { color: txn.type === 'income' ? '#059669' : '#DC2626' }]}>
                {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {filterType === 'expense' ? 'Chi tiêu' : filterType === 'income' ? 'Thu nhập' : 'Giao dịch'}
                </Text>
                <TouchableOpacity onPress={() => (navigation as any).navigate('AddTransaction', {})}>
                    <Icon name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                {(['all', 'expense', 'income'] as const).map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.filterTab, filterType === type && styles.filterTabActive]}
                        onPress={() => setFilterType(type)}
                    >
                        <Text style={[styles.filterTabText, filterType === type && styles.filterTabTextActive]}>
                            {type === 'all' ? 'Tất cả' : type === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Month Navigator */}
            <View style={styles.monthNav}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <Icon name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.monthText}>{monthName}</Text>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                    <Icon name="chevron-right" size={28} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                    <View style={styles.summaryDot}>
                        <Icon name="arrow-downward" size={12} color="#059669" />
                    </View>
                    <View>
                        <Text style={styles.summaryLabel}>Thu nhập</Text>
                        <Text style={[styles.summaryValue, { color: '#059669' }]}>{formatCurrency(monthlyIncome)}</Text>
                    </View>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <View style={[styles.summaryDot, { backgroundColor: '#FEE2E2' }]}>
                        <Icon name="arrow-upward" size={12} color="#DC2626" />
                    </View>
                    <View>
                        <Text style={styles.summaryLabel}>Chi tiêu</Text>
                        <Text style={[styles.summaryValue, { color: '#DC2626' }]}>{formatCurrency(monthlyExpense)}</Text>
                    </View>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <View style={[styles.summaryDot, { backgroundColor: '#EFF6FF' }]}>
                        <Icon name="account-balance-wallet" size={12} color="#4F46E5" />
                    </View>
                    <View>
                        <Text style={styles.summaryLabel}>Còn lại</Text>
                        <Text style={[styles.summaryValue, { color: '#4F46E5' }]}>
                            {formatCurrency(monthlyIncome - monthlyExpense)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Transaction List */}
            <FlatList
                data={dateGroups}
                keyExtractor={(item) => item.date}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="receipt-long" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
                        <Text style={styles.emptySubtext}>Nhấn + để thêm giao dịch mới</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.dateGroup}>
                        <Text style={styles.dateHeader}>{formatDate(item.date)}</Text>
                        {item.txns.map(renderTransaction)}
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.md, paddingVertical: 14,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    filterRow: {
        flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16,
        paddingBottom: 10, gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
        backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: 'transparent',
    },
    filterTabActive: {
        backgroundColor: colors.primary + '15', borderColor: colors.primary,
    },
    filterTabText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    filterTabTextActive: { color: colors.primary, fontWeight: '700' },
    monthNav: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.md, paddingVertical: 12, backgroundColor: '#fff',
    },
    monthText: { fontSize: 16, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
    summaryRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, marginBottom: 8,
        borderRadius: 14, padding: 14,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
    },
    summaryItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    summaryDot: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: '#ECFDF5',
        justifyContent: 'center', alignItems: 'center',
    },
    summaryDivider: { width: 1, height: 32, backgroundColor: '#E2E8F0' },
    summaryLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
    summaryValue: { fontSize: 12, fontWeight: '700' },
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    dateGroup: { marginTop: 16 },
    dateHeader: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8, textTransform: 'capitalize' },
    txnItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        padding: 12, borderRadius: 12, marginBottom: 6,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2,
    },
    txnIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    txnIconText: { fontSize: 20 },
    txnInfo: { flex: 1 },
    txnCategory: { fontSize: 14, fontWeight: '600', color: colors.text },
    txnNote: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    txnAmount: { fontSize: 14, fontWeight: '700' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#94A3B8', marginTop: 12 },
    emptySubtext: { fontSize: 13, color: '#CBD5E1', marginTop: 4 },
});

export default TransactionsScreen;
