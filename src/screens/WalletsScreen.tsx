import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, shadows } from '../constants/theme';
import {
    getAccounts,
    addAccount,
    deleteAccount,
    getTotalBalance,
    Account,
    CreateAccountInput,
} from '../database';

const ACCOUNT_TYPES = [
    { value: 'cash', label: 'Tiền mặt', icon: '💵', color: '#059669' },
    { value: 'bank', label: 'Ngân hàng', icon: '🏦', color: '#1D4ED8' },
    { value: 'ewallet', label: 'Ví điện tử', icon: '📱', color: '#D946EF' },
    { value: 'credit', label: 'Thẻ tín dụng', icon: '💳', color: '#DC2626' },
];

const WalletsScreen: React.FC = () => {
    const navigation = useNavigation();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'cash' | 'bank' | 'ewallet' | 'credit'>('bank');
    const [newBalance, setNewBalance] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const accs = await getAccounts();
            const total = await getTotalBalance();
            setAccounts(accs);
            setTotalBalance(total);
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

    const handleAdd = async () => {
        if (!newName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên tài khoản');
            return;
        }
        const typeInfo = ACCOUNT_TYPES.find(t => t.value === newType);
        try {
            await addAccount({
                name: newName,
                type: newType,
                balance: parseFloat(newBalance.replace(/[,.]/g, '')) || 0,
                icon: typeInfo?.icon || '💰',
                color: typeInfo?.color || '#4F46E5',
            });
            setNewName('');
            setNewBalance('');
            setShowAddModal(false);
            await loadData();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể thêm tài khoản');
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert('Xóa tài khoản', `Bạn có chắc muốn xóa "${name}"?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    await deleteAccount(id);
                    await loadData();
                },
            },
        ]);
    };

    const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + 'đ';

    const getTypeLabel = (type: string) => ACCOUNT_TYPES.find(t => t.value === type)?.label || type;

    const renderAccount = ({ item }: { item: Account }) => (
        <TouchableOpacity
            style={styles.accountCard}
            onLongPress={() => handleDelete(item.id, item.name)}
        >
            <View style={[styles.accountIconContainer, { backgroundColor: item.color + '15' }]}>
                <Text style={styles.accountIcon}>{item.icon}</Text>
            </View>
            <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{item.name}</Text>
                <Text style={styles.accountType}>{getTypeLabel(item.type)}</Text>
            </View>
            <Text style={[styles.accountBalance, { color: item.balance >= 0 ? '#059669' : '#DC2626' }]}>
                {formatCurrency(item.balance)}
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
                <Text style={styles.headerTitle}>Ví & Tài khoản</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)}>
                    <Icon name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Total Balance */}
            <View style={styles.totalCard}>
                <Icon name="account-balance-wallet" size={28} color="#34D399" />
                <View style={{ marginLeft: 14 }}>
                    <Text style={styles.totalLabel}>Tổng tài sản</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(totalBalance)}</Text>
                </View>
            </View>

            {/* Accounts by Type */}
            <FlatList
                data={accounts}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={renderAccount}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="account-balance-wallet" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Chưa có tài khoản nào</Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAddModal(true)}>
                            <Text style={styles.emptyBtnText}>+ Thêm tài khoản</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Add Modal */}
            <Modal visible={showAddModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm tài khoản</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Icon name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Account Type Picker */}
                        <Text style={styles.fieldLabel}>Loại tài khoản</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typePicker}>
                            {ACCOUNT_TYPES.map((t) => (
                                <TouchableOpacity
                                    key={t.value}
                                    style={[styles.typeItem, newType === t.value && { backgroundColor: t.color + '15', borderColor: t.color }]}
                                    onPress={() => setNewType(t.value as any)}
                                >
                                    <Text style={styles.typeItemIcon}>{t.icon}</Text>
                                    <Text style={[styles.typeItemLabel, newType === t.value && { color: t.color, fontWeight: '700' }]}>
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Name */}
                        <Text style={styles.fieldLabel}>Tên tài khoản</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="VD: Vietcombank, MoMo..."
                            placeholderTextColor="#94A3B8"
                            value={newName}
                            onChangeText={setNewName}
                        />

                        {/* Balance */}
                        <Text style={styles.fieldLabel}>Số dư ban đầu</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={newBalance}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, '');
                                setNewBalance(cleaned ? parseInt(cleaned, 10).toLocaleString('vi-VN') : '');
                            }}
                        />

                        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                            <Text style={styles.addBtnText}>Thêm tài khoản</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    totalCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1E293B', margin: 16, borderRadius: 16, padding: 20,
        ...shadows.large,
    },
    totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
    totalAmount: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 2 },
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    accountCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        padding: 16, borderRadius: 14, marginBottom: 10,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
    },
    accountIconContainer: {
        width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    accountIcon: { fontSize: 24 },
    accountInfo: { flex: 1 },
    accountName: { fontSize: 15, fontWeight: '700', color: colors.text },
    accountType: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    accountBalance: { fontSize: 15, fontWeight: '700' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#94A3B8', marginTop: 12 },
    emptyBtn: {
        marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
    },
    emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 4 },
    typePicker: { marginBottom: 16 },
    typeItem: {
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 8,
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    },
    typeItemIcon: { fontSize: 18 },
    typeItemLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    input: {
        backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, fontSize: 14,
        color: colors.text, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16,
    },
    addBtn: {
        backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14,
        alignItems: 'center', marginTop: 8,
    },
    addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default WalletsScreen;
