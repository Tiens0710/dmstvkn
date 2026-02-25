import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, shadows } from '../constants/theme';
import { getBudgets, deleteBudget, Budget } from '../database';

const BudgetScreen: React.FC = () => {
    const navigation = useNavigation();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadBudgets();
        }, [])
    );

    const loadBudgets = async () => {
        try {
            const data = await getBudgets();
            setBudgets(data);
            setTotalBudget(data.reduce((sum, b) => sum + b.amountLimit, 0));
            setTotalSpent(data.reduce((sum, b) => sum + (b.spent || 0), 0));
        } catch (error) {
            console.error('Error loading budgets:', error);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert('Xóa ngân sách', 'Bạn có chắc muốn xóa ngân sách này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    await deleteBudget(id);
                    await loadBudgets();
                },
            },
        ]);
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
        if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    const formatFull = (amount: number) => amount.toLocaleString('vi-VN') + 'đ';

    const overallPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

    const renderBudgetItem = ({ item }: { item: Budget }) => {
        const spent = item.spent || 0;
        const percent = item.amountLimit > 0 ? Math.min((spent / item.amountLimit) * 100, 100) : 0;
        const isOver = spent > item.amountLimit;
        const remaining = item.amountLimit - spent;

        return (
            <TouchableOpacity
                style={styles.budgetCard}
                onLongPress={() => handleDelete(item.id)}
            >
                <View style={styles.budgetHeader}>
                    <View style={styles.budgetCatRow}>
                        <Text style={styles.budgetIcon}>{item.categoryIcon || '📦'}</Text>
                        <View>
                            <Text style={styles.budgetCatName}>{item.categoryName || 'Không rõ'}</Text>
                            <Text style={styles.budgetPeriod}>Hàng tháng</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.budgetPercent, isOver && { color: '#DC2626' }]}>
                            {percent.toFixed(0)}%
                        </Text>
                        {isOver && (
                            <View style={styles.overBadge}>
                                <Text style={styles.overBadgeText}>Vượt</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBg}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${percent}%`,
                                backgroundColor: isOver ? '#DC2626' : percent > 80 ? '#D97706' : (item.categoryColor || colors.primary),
                            },
                        ]}
                    />
                </View>

                <View style={styles.budgetFooter}>
                    <Text style={styles.budgetSpent}>
                        Đã chi: <Text style={{ fontWeight: '700' }}>{formatFull(spent)}</Text>
                    </Text>
                    <Text style={styles.budgetLimit}>
                        {isOver ? (
                            <Text style={{ color: '#DC2626' }}>Vượt {formatFull(Math.abs(remaining))}</Text>
                        ) : (
                            <>Còn lại: <Text style={{ fontWeight: '700' }}>{formatFull(remaining)}</Text></>
                        )}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ngân sách</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Overall Summary */}
            <View style={styles.overallCard}>
                <Text style={styles.overallTitle}>Tổng ngân sách tháng này</Text>
                <View style={styles.overallRow}>
                    <View>
                        <Text style={styles.overallLabel}>Đã chi</Text>
                        <Text style={styles.overallAmount}>{formatFull(totalSpent)}</Text>
                    </View>
                    <View style={styles.overallDivider} />
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.overallLabel}>Hạn mức</Text>
                        <Text style={[styles.overallAmount, { color: '#64748B' }]}>{formatFull(totalBudget)}</Text>
                    </View>
                </View>
                <View style={styles.overallProgressBg}>
                    <View
                        style={[
                            styles.overallProgressFill,
                            {
                                width: `${overallPercent}%`,
                                backgroundColor: overallPercent > 100 ? '#DC2626' : overallPercent > 80 ? '#D97706' : '#059669',
                            },
                        ]}
                    />
                </View>
                <Text style={styles.overallPercent}>{overallPercent.toFixed(0)}% đã sử dụng</Text>
            </View>

            {/* Budget List */}
            <FlatList
                data={budgets}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={renderBudgetItem}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="pie-chart" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Chưa có ngân sách nào</Text>
                    </View>
                }
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
    overallCard: {
        backgroundColor: '#1E293B', margin: 16, borderRadius: 16, padding: 20,
        ...shadows.large,
    },
    overallTitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
    overallRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    overallLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
    overallAmount: { fontSize: 18, fontWeight: '700', color: '#fff' },
    overallDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)' },
    overallProgressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, marginBottom: 8 },
    overallProgressFill: { height: 6, borderRadius: 3 },
    overallPercent: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    budgetCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
    },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    budgetCatRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    budgetIcon: { fontSize: 28 },
    budgetCatName: { fontSize: 15, fontWeight: '700', color: colors.text },
    budgetPeriod: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    budgetPercent: { fontSize: 16, fontWeight: '800', color: colors.text },
    overBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
    overBadgeText: { fontSize: 10, fontWeight: '700', color: '#DC2626' },
    progressBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, marginBottom: 10, overflow: 'hidden' },
    progressFill: { height: 8, borderRadius: 4 },
    budgetFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    budgetSpent: { fontSize: 12, color: '#64748B' },
    budgetLimit: { fontSize: 12, color: '#64748B' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#94A3B8', marginTop: 12 },
});

export default BudgetScreen;
