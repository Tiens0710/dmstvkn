import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VoiceRecognitionModal from '../components/VoiceRecognitionModal';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import {
    addTransaction,
    getCategories,
    getAccounts,
    Category,
    Account,
} from '../database';
import {
    callGeminiText,
    callGeminiWithImage,
    parseTransactionFromResponse,
    GeminiMessage,
    ParsedTransaction,
} from '../services/geminiService';

const GEMINI_AVATAR = '🤖';
const USER_AVATAR = '👤';

const WELCOME_MESSAGE: GeminiMessage = {
    role: 'model',
    text: 'Xin chào! Tôi là trợ lý FinWise 💰\n\nBạn có thể:\n• Nhập mô tả: *"ăn sáng 35k"*, *"lương 18 triệu"*\n• Chụp ảnh hóa đơn để tôi đọc tự động\n\nHãy bắt đầu nhé! 😊',
};

const AddTransactionScreen: React.FC = () => {
    const navigation = useNavigation();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<GeminiMessage[]>([WELCOME_MESSAGE]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [pendingTransaction, setPendingTransaction] = useState<ParsedTransaction | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [partialText, setPartialText] = useState('');
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cats, accs] = await Promise.all([getCategories(), getAccounts()]);
            setCategories(cats);
            setAccounts(accs);
            if (accs.length > 0) setSelectedAccount(accs[0]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    // ========== VOICE INPUT (Demo) ==========
    const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const demoPartialRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startListening = () => {
        setIsListening(true);
        setShowVoiceModal(true);
        setPartialText('');
        // Demo: simulate partial text appearing
        demoPartialRef.current = setTimeout(() => {
            setPartialText('cà phê 35k');
        }, 1000);
        // Demo: simulate final result after 2s
        demoTimerRef.current = setTimeout(() => {
            setInputText('cà phê 35k');
            stopListening();
        }, 2500);
    };

    const stopListening = () => {
        if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
        if (demoPartialRef.current) clearTimeout(demoPartialRef.current);
        setIsListening(false);
        setShowVoiceModal(false);
        setPartialText('');
        pulseAnim.setValue(1);
    };

    const toggleVoice = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const addMessage = useCallback((msg: GeminiMessage) => {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
    }, [scrollToBottom]);

    const updateLastMessage = useCallback((updater: (msg: GeminiMessage) => GeminiMessage) => {
        setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = updater(updated[updated.length - 1]);
            return updated;
        });
    }, []);

    const handleSendText = async () => {
        if (!inputText.trim() || isSending) return;

        const userText = inputText.trim();
        setInputText('');
        setIsSending(true);

        // Add user message
        addMessage({ role: 'user', text: userText });

        // Add loading bot message
        const loadingMsg: GeminiMessage = { role: 'model', text: '', loading: true };
        setMessages(prev => [...prev, loadingMsg]);
        scrollToBottom();

        try {
            const response = await callGeminiText(userText, messages);
            const parsed = parseTransactionFromResponse(response);

            // Remove JSON block from displayed text
            const displayText = response.replace(/```json[\s\S]*?```/g, '').trim();

            updateLastMessage(() => ({
                role: 'model',
                text: displayText,
                parsedTransaction: parsed || undefined,
            }));

            if (parsed) {
                setPendingTransaction(parsed);
                // Find matching category
                const matchedCat = categories.find(c =>
                    c.name.toLowerCase().includes(parsed.categoryName.toLowerCase()) ||
                    parsed.categoryName.toLowerCase().includes(c.name.toLowerCase())
                );
                if (matchedCat) setSelectedCategory(matchedCat);
                setTimeout(() => setShowConfirmModal(true), 800);
            }
        } catch (error) {
            updateLastMessage(() => ({
                role: 'model',
                text: '❌ Không kết nối được với AI. Hãy kiểm tra API key trong `geminiService.ts`.',
            }));
        } finally {
            setIsSending(false);
            scrollToBottom();
        }
    };

    const handlePickImage = async (fromCamera: boolean) => {
        setShowImageOptions(false);
        const options = { mediaType: 'photo' as const, includeBase64: true, quality: 0.8 as const, maxWidth: 1024, maxHeight: 1024 };

        try {
            const result = fromCamera
                ? await launchCamera(options)
                : await launchImageLibrary(options);

            if (!result.assets || result.assets.length === 0) return;
            const asset = result.assets[0];
            if (!asset.base64 || !asset.uri) return;

            // Add user image message
            addMessage({ role: 'user', text: '📷 Đã gửi ảnh hóa đơn', imageBase64: asset.uri });

            // Loading
            const loadingMsg: GeminiMessage = { role: 'model', text: '', loading: true };
            setMessages(prev => [...prev, loadingMsg]);
            scrollToBottom();
            setIsSending(true);

            const response = await callGeminiWithImage(asset.base64, asset.type || 'image/jpeg');
            const parsed = parseTransactionFromResponse(response);
            const displayText = response.replace(/```json[\s\S]*?```/g, '').trim();

            updateLastMessage(() => ({
                role: 'model',
                text: displayText,
                parsedTransaction: parsed || undefined,
            }));

            if (parsed) {
                setPendingTransaction(parsed);
                const matchedCat = categories.find(c =>
                    c.name.toLowerCase().includes(parsed.categoryName.toLowerCase()) ||
                    parsed.categoryName.toLowerCase().includes(c.name.toLowerCase())
                );
                if (matchedCat) setSelectedCategory(matchedCat);
                setTimeout(() => setShowConfirmModal(true), 800);
            }
        } catch (error) {
            updateLastMessage(() => ({
                role: 'model',
                text: '❌ Không đọc được ảnh. Vui lòng thử lại.',
            }));
        } finally {
            setIsSending(false);
            scrollToBottom();
        }
    };

    const handleConfirmSave = async () => {
        if (!pendingTransaction || !selectedAccount) return;

        setSaving(true);
        try {
            const catList = await getCategories(pendingTransaction.type);
            const cat = selectedCategory ||
                catList.find(c => c.name.toLowerCase().includes(pendingTransaction.categoryName.toLowerCase())) ||
                catList[0];

            if (!cat) {
                Alert.alert('Lỗi', 'Không tìm thấy danh mục phù hợp');
                return;
            }

            await addTransaction({
                amount: pendingTransaction.amount,
                type: pendingTransaction.type,
                categoryId: cat.id,
                accountId: selectedAccount.id,
                note: pendingTransaction.note,
                date: pendingTransaction.date,
            });

            setShowConfirmModal(false);
            setPendingTransaction(null);

            addMessage({
                role: 'model',
                text: `✅ Đã lưu giao dịch!\n\n• **${pendingTransaction.type === 'expense' ? 'Chi' : 'Thu'}:** ${pendingTransaction.amount.toLocaleString('vi-VN')}đ\n• **Danh mục:** ${cat.name}\n• **Ghi chú:** ${pendingTransaction.note}\n\nBạn muốn ghi thêm giao dịch nào nữa không?`,
            });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu giao dịch');
        } finally {
            setSaving(false);
        }
    };

    const renderMessage = ({ item }: { item: GeminiMessage }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
                {!isUser && (
                    <View style={styles.avatar}>
                        <Ionicons name="sparkles" size={18} color={colors.primary} />
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot, item.loading && styles.bubbleLoading]}>
                    {/* User image preview */}
                    {item.imageBase64 && item.imageBase64.startsWith('file') && (
                        <Image source={{ uri: item.imageBase64 }} style={styles.imagePreview} resizeMode="cover" />
                    )}

                    {item.loading ? (
                        <View style={styles.typingRow}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.typingText}>Đang phân tích...</Text>
                        </View>
                    ) : (
                        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                            {item.text}
                        </Text>
                    )}

                    {/* Parsed transaction preview chip */}
                    {item.parsedTransaction && !item.loading && (
                        <TouchableOpacity
                            style={[styles.transactionChip, { backgroundColor: item.parsedTransaction.type === 'expense' ? '#FEE2E2' : '#D1FAE5' }]}
                            onPress={() => { setPendingTransaction(item.parsedTransaction!); setShowConfirmModal(true); }}
                        >
                            <Text style={styles.transactionChipIcon}>
                                {item.parsedTransaction.type === 'expense' ? '📤' : '📥'}
                            </Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.transactionChipAmount, { color: item.parsedTransaction.type === 'expense' ? '#DC2626' : '#059669' }]}>
                                    {item.parsedTransaction.type === 'expense' ? '-' : '+'}{item.parsedTransaction.amount.toLocaleString('vi-VN')}đ
                                </Text>
                                <Text style={styles.transactionChipNote}>{item.parsedTransaction.note || item.parsedTransaction.categoryName}</Text>
                            </View>
                            <Text style={styles.transactionChipSave}>Lưu →</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {isUser && (
                    <View style={[styles.avatar, styles.avatarUser]}>
                        <Ionicons name="person" size={18} color="#2563EB" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>FinWise AI</Text>
                    <Text style={styles.headerSub}>🟡 Trợ lý tài chính thông minh</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={0}>
                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={scrollToBottom}
                />



                {/* Input Bar */}
                <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setShowImageOptions(true)}>
                        <Ionicons name="camera-outline" size={26} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconBtn, isListening && styles.micBtnActive]}
                        onPress={toggleVoice}
                    >
                        <Ionicons name={isListening ? "stop-circle" : "mic-outline"} size={26} color={isListening ? "#EF4444" : "#64748B"} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập hoặc nói... (vd: cafe 45k)"
                        placeholderTextColor="#94A3B8"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!inputText.trim() || isSending) && styles.sendBtnDisabled]}
                        onPress={handleSendText}
                        disabled={!inputText.trim() || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={18} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Image Options Sheet */}
            <Modal visible={showImageOptions} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} onPress={() => setShowImageOptions(false)} />
                <View style={styles.sheet}>
                    <Text style={styles.sheetTitle}>Chọn ảnh hóa đơn</Text>
                    <TouchableOpacity style={styles.sheetBtn} onPress={() => handlePickImage(true)}>
                        <Text style={styles.sheetBtnIcon}>📸</Text>
                        <Text style={styles.sheetBtnText}>Chụp ảnh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetBtn} onPress={() => handlePickImage(false)}>
                        <Text style={styles.sheetBtnIcon}>🖼️</Text>
                        <Text style={styles.sheetBtnText}>Chọn từ thư viện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sheetBtn, { marginTop: 4 }]} onPress={() => setShowImageOptions(false)}>
                        <Text style={[styles.sheetBtnText, { color: '#6B7280', fontWeight: '500' }]}>Hủy</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Confirm Transaction Modal */}
            <Modal visible={showConfirmModal} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowConfirmModal(false)} />
                <View style={styles.confirmSheet}>
                    <View style={styles.confirmHandle} />
                    <Text style={styles.confirmTitle}>Xác nhận giao dịch</Text>

                    {pendingTransaction && (
                        <>
                            <View style={[styles.amountBadge, { backgroundColor: pendingTransaction.type === 'expense' ? '#FEF2F2' : '#F0FDF4' }]}>
                                <Text style={[styles.amountBadgeText, { color: pendingTransaction.type === 'expense' ? '#DC2626' : '#059669' }]}>
                                    {pendingTransaction.type === 'expense' ? '- ' : '+ '}
                                    {pendingTransaction.amount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>

                            <View style={styles.confirmRow}>
                                <Text style={styles.confirmLabel}>Danh mục</Text>
                                <Text style={styles.confirmValue}>{pendingTransaction.categoryName}</Text>
                            </View>
                            <View style={styles.confirmRow}>
                                <Text style={styles.confirmLabel}>Ghi chú</Text>
                                <Text style={styles.confirmValue}>{pendingTransaction.note || '—'}</Text>
                            </View>
                            <View style={styles.confirmRow}>
                                <Text style={styles.confirmLabel}>Ngày</Text>
                                <Text style={styles.confirmValue}>{pendingTransaction.date}</Text>
                            </View>

                            {/* Account picker */}
                            <Text style={[styles.confirmLabel, { marginTop: 12, marginBottom: 6 }]}>Tài khoản</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {accounts.map(acc => (
                                    <TouchableOpacity
                                        key={acc.id}
                                        style={[styles.accChip, selectedAccount?.id === acc.id && styles.accChipActive]}
                                        onPress={() => setSelectedAccount(acc)}
                                    >
                                        <Text>{acc.icon}</Text>
                                        <Text style={[styles.accChipText, selectedAccount?.id === acc.id && styles.accChipTextActive]}>
                                            {acc.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    <View style={styles.confirmActions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirmModal(false)}>
                            <Text style={styles.cancelBtnText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleConfirmSave} disabled={saving}>
                            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>✓ Lưu</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Voice Recognition Modal */}
            <VoiceRecognitionModal
                visible={showVoiceModal}
                onClose={stopListening}
                partialText={partialText}
                isListening={isListening}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
        ...shadows.small,
    },
    headerBtn: { padding: 8, borderRadius: 20 },
    backArrow: { fontSize: 22, color: colors.text, fontWeight: '600', paddingRight: 4 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
    headerSub: { fontSize: 11, color: '#10B981', marginTop: 1 },
    messageList: { padding: 12, paddingBottom: 8 },
    messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', maxWidth: '100%' },
    messageRowUser: { justifyContent: 'flex-end' },
    messageRowBot: { justifyContent: 'flex-start' },
    avatar: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF',
        justifyContent: 'center', alignItems: 'center', marginHorizontal: 6,
    },
    avatarUser: { backgroundColor: '#DBEAFE' },
    avatarText: { fontSize: 16 },
    bubble: {
        maxWidth: '78%', borderRadius: 18, padding: 12,
        ...shadows.small,
    },
    bubbleBot: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
    bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    bubbleLoading: { paddingVertical: 14 },
    bubbleText: { fontSize: 14, color: '#1E293B', lineHeight: 20 },
    bubbleTextUser: { color: '#fff' },
    typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    typingText: { fontSize: 13, color: '#64748B' },
    imagePreview: { width: '100%', height: 160, borderRadius: 10, marginBottom: 8 },
    transactionChip: {
        flexDirection: 'row', alignItems: 'center', borderRadius: 12,
        padding: 10, marginTop: 10, gap: 8,
    },
    transactionChipIcon: { fontSize: 20 },
    transactionChipAmount: { fontSize: 16, fontWeight: '800' },
    transactionChipNote: { fontSize: 12, color: '#64748B', marginTop: 2 },
    transactionChipSave: { fontSize: 12, color: colors.primary, fontWeight: '700' },
    inputBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        paddingHorizontal: 12, paddingVertical: 8, gap: 8,
        borderTopWidth: 1, borderTopColor: '#E2E8F0',
    },
    iconBtn: { padding: 6 },
    iconBtnText: { fontSize: 22 },
    input: {
        flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#F1F5F9',
        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
        fontSize: 14, color: '#1E293B',
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: '#CBD5E1' },
    sendBtnText: { color: '#fff', fontSize: 16 },
    micBtnActive: { backgroundColor: '#FEE2E2', borderRadius: 20 },
    recordingBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FEF2F2', paddingVertical: 8, gap: 8,
        borderTopWidth: 1, borderTopColor: '#FECACA',
    },
    recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
    recordingText: { fontSize: 13, color: '#DC2626', fontWeight: '500' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 20, paddingBottom: 36,
    },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16, textAlign: 'center' },
    sheetBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    sheetBtnIcon: { fontSize: 24 },
    sheetBtnText: { fontSize: 16, color: '#1E293B', fontWeight: '600' },
    confirmSheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 20, paddingBottom: 36,
    },
    confirmHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
    confirmTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 16, textAlign: 'center' },
    amountBadge: { borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 16 },
    amountBadgeText: { fontSize: 28, fontWeight: '900' },
    confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    confirmLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    confirmValue: { fontSize: 14, color: '#1E293B', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
    accChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1.5, borderColor: 'transparent',
    },
    accChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    accChipText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    accChipTextActive: { color: colors.primary, fontWeight: '700' },
    confirmActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F1F5F9',
        alignItems: 'center',
    },
    cancelBtnText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
    saveBtn: {
        flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.primary,
        alignItems: 'center', ...shadows.small,
    },
    saveBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },
});

export default AddTransactionScreen;
