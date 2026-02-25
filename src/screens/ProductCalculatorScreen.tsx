import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    FlatList,
    Keyboard,
    Animated,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { callGeminiOrder, OrderData, OrderItem } from '../services/geminiService';
import VoiceRecognitionModal from '../components/VoiceRecognitionModal';

interface ProductCalculatorScreenProps {
    onGoBack: () => void;
    onSaveOrder: (orderData: OrderData) => void;
}

interface ProductItem {
    id: string;
    name: string;
    unitPrice: number;
    unit: string;
    quantity: number;
    totalPrice: number;
}

const ProductCalculatorScreen = ({ onGoBack, onSaveOrder }: ProductCalculatorScreenProps) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [products, setProducts] = useState<ProductItem[]>([]);

    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductQuantity, setNewProductQuantity] = useState('');
    const [newProductUnit, setNewProductUnit] = useState('kg');

    const [totalAmount, setTotalAmount] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [partialText, setPartialText] = useState('');
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const demoPartialRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const newTotal = products.reduce((sum, product) => sum + product.totalPrice, 0);
        setTotalAmount(newTotal);
    }, [products]);

    // ========== VOICE DEMO ==========
    const handleVoiceInput = async (text: string) => {
        setIsProcessing(true);
        try {
            const parsed = await callGeminiOrder(text);
            if (parsed) {
                if (parsed.customerName) setCustomerName(parsed.customerName);
                if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
                if (parsed.products && parsed.products.length > 0) {
                    const newItems: ProductItem[] = parsed.products.map((p: OrderItem) => ({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        name: p.name,
                        unitPrice: p.unitPrice,
                        quantity: p.quantity,
                        unit: p.unit,
                        totalPrice: p.totalPrice,
                    }));
                    setProducts(prev => [...prev, ...newItems]);
                }
            } else {
                Alert.alert('AI', 'Không thể phân tích giọng nói. Hãy thử nói rõ tên khách và mặt hàng.');
            }
        } catch (error) {
            console.error('Voice process error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const startListening = () => {
        setIsListening(true);
        setShowVoiceModal(true);
        setPartialText('');
        // Demo: simulate partial text appearing
        demoPartialRef.current = setTimeout(() => {
            setPartialText('Khách Thành mua 2kg táo 120k');
        }, 1000);
        // Demo: simulate final result after 2.5s
        demoTimerRef.current = setTimeout(() => {
            handleVoiceInput('Khách Thành mua 2kg táo 120k');
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

    // ========== PRODUCT LOGIC ==========
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleAddProduct = () => {
        Keyboard.dismiss();
        if (!newProductName.trim() || !newProductPrice.trim() || !newProductQuantity.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Tên, Đơn giá và Số lượng sản phẩm.');
            return;
        }

        const price = parseFloat(newProductPrice);
        const quantity = parseFloat(newProductQuantity);

        if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
            Alert.alert('Lỗi', 'Đơn giá và số lượng phải là số và lớn hơn 0.');
            return;
        }

        const newProduct: ProductItem = {
            id: Date.now().toString(),
            name: newProductName.trim(),
            unitPrice: price,
            quantity: quantity,
            unit: newProductUnit.trim() || 'cái',
            totalPrice: price * quantity,
        };

        setProducts(prev => [...prev, newProduct]);
        setNewProductName('');
        setNewProductPrice('');
        setNewProductQuantity('');
        setNewProductUnit('kg');
    };

    const handleRemoveProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const handleSaveOrder = () => {
        if (!customerName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng');
            return;
        }
        if (products.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
            return;
        }

        const orderData: OrderData = {
            customerName,
            customerPhone,
            products: products as any,
            totalAmount,
            orderDate: new Date().toLocaleDateString('vi-VN'),
        };

        onSaveOrder(orderData);
        Alert.alert('Thành công', 'Đơn hàng đã được lưu thành công!', [
            { text: 'OK', onPress: onGoBack },
        ]);
    };

    const clearOrder = () => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa toàn bộ thông tin đơn hàng này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: () => {
                    setCustomerName('');
                    setCustomerPhone('');
                    setProducts([]);
                    setNewProductName('');
                    setNewProductPrice('');
                    setNewProductQuantity('');
                    setNewProductUnit('kg');
                },
            },
        ]);
    };

    const renderAddedProductItem = ({ item }: { item: ProductItem }) => (
        <View style={styles.productItem}>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>
                    {`${formatCurrency(item.unitPrice)} x ${item.quantity} ${item.unit}`}
                </Text>
            </View>
            <View style={styles.totalSection}>
                <Text style={styles.totalPrice}>{formatCurrency(item.totalPrice)}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveProduct(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={22} color="#c14b4b" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={onGoBack}>
                    <Ionicons name="arrow-back" size={24} color="#181113" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo đơn hàng</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TouchableOpacity
                        style={[styles.headerButton, isListening && styles.micActive]}
                        onPress={isListening ? stopListening : startListening}
                    >
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <Ionicons
                                name={isListening ? 'stop-circle' : 'mic-outline'}
                                size={24}
                                color={isListening ? '#ef4444' : '#181113'}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton} onPress={clearOrder}>
                        <Ionicons name="refresh" size={24} color="#181113" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* AI Processing Indicator */}
            {isProcessing && (
                <View style={styles.processingBar}>
                    <ActivityIndicator size="small" color="#895d69" />
                    <Text style={styles.processingText}>AI đang phân tích giọng nói...</Text>
                </View>
            )}

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Customer Info */}
                <View style={styles.customerSection}>
                    <Text style={styles.sectionHint}>💡 Bạn có thể nhấn 🎤 để nói: "Khách là Thành, mua 2kg táo 120k"</Text>
                    <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Tên khách hàng *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={customerName}
                            onChangeText={setCustomerName}
                            placeholder="Nhập tên khách hàng"
                            placeholderTextColor="#895d69"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Số điện thoại</Text>
                        <TextInput
                            style={styles.textInput}
                            value={customerPhone}
                            onChangeText={setCustomerPhone}
                            placeholder="Nhập số điện thoại"
                            placeholderTextColor="#895d69"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Add Product Form */}
                <View style={styles.addProductSection}>
                    <Text style={styles.sectionTitle}>Thêm sản phẩm</Text>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Tên sản phẩm"
                            placeholderTextColor="#895d69"
                            value={newProductName}
                            onChangeText={setNewProductName}
                        />
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Đơn giá"
                                placeholderTextColor="#895d69"
                                keyboardType="numeric"
                                value={newProductPrice}
                                onChangeText={setNewProductPrice}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="SL"
                                placeholderTextColor="#895d69"
                                keyboardType="numeric"
                                value={newProductQuantity}
                                onChangeText={setNewProductQuantity}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Đơn vị"
                                placeholderTextColor="#895d69"
                                value={newProductUnit}
                                onChangeText={setNewProductUnit}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                        <Text style={styles.addButtonText}>Thêm vào đơn</Text>
                    </TouchableOpacity>
                </View>

                {/* Products List */}
                <View style={styles.productsSection}>
                    <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
                    {products.length === 0 ? (
                        <Text style={styles.emptyListText}>Chưa có sản phẩm nào trong đơn hàng.</Text>
                    ) : (
                        <FlatList
                            data={products}
                            renderItem={renderAddedProductItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    )}
                </View>

                {/* Total */}
                {totalAmount > 0 && (
                    <View style={styles.totalContainer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tổng cộng:</Text>
                            <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onGoBack}>
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveOrder}>
                        <Text style={styles.saveButtonText}>Lưu đơn hàng</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

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
    container: { flex: 1, backgroundColor: '#fbf9f9' },
    scrollView: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#fbf9f9', borderBottomWidth: 1, borderBottomColor: '#f1eaec',
    },
    headerButton: { padding: 8, borderRadius: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#181113' },
    micActive: { backgroundColor: '#fee2e2', borderRadius: 20 },
    recordingBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FEF2F2', paddingVertical: 10, gap: 8,
        borderBottomWidth: 1, borderBottomColor: '#FECACA',
    },
    recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
    recordingText: { fontSize: 13, color: '#DC2626', fontWeight: '500' },
    processingBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 10, backgroundColor: '#fdf2f8', gap: 8,
    },
    processingText: { fontSize: 13, color: '#895d69', fontWeight: '500' },
    sectionHint: { fontSize: 12, color: '#895d69', fontStyle: 'italic', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#181113', marginBottom: 16 },
    customerSection: { paddingHorizontal: 16, paddingTop: 16 },
    inputGroup: { marginBottom: 12 },
    inputLabel: { fontSize: 14, fontWeight: '500', color: '#181113', marginBottom: 8 },
    textInput: {
        backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 16, color: '#181113', borderWidth: 1, borderColor: '#f1eaec',
    },
    addProductSection: {
        backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12,
        borderWidth: 1, borderColor: '#f1eaec',
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    addButton: { backgroundColor: '#895d69', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    addButtonText: { fontSize: 16, fontWeight: '500', color: 'white' },
    productsSection: { paddingHorizontal: 16 },
    emptyListText: { textAlign: 'center', color: '#895d69', marginTop: 16, marginBottom: 16 },
    productItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#f1eaec',
    },
    productInfo: { flex: 1 },
    productName: { fontSize: 16, fontWeight: '500', color: '#181113', marginBottom: 4 },
    productPrice: { fontSize: 14, color: '#895d69' },
    totalSection: { minWidth: 80, alignItems: 'flex-end' },
    totalPrice: { fontSize: 16, fontWeight: '600', color: '#181113' },
    deleteButton: { paddingLeft: 12, paddingVertical: 8 },
    separator: { height: 8 },
    totalContainer: { paddingHorizontal: 16, marginBottom: 16 },
    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#ebc5cf', padding: 16, borderRadius: 8,
    },
    totalLabel: { fontSize: 18, fontWeight: '600', color: '#181113' },
    totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#181113' },
    actionButtons: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
    cancelButton: { flex: 1, backgroundColor: '#f1eaec', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    cancelButtonText: { fontSize: 16, fontWeight: '500', color: '#181113' },
    saveButton: { flex: 1, backgroundColor: '#895d69', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    saveButtonText: { fontSize: 16, fontWeight: '500', color: 'white' },
    bottomPadding: { height: 32 },
});

export default ProductCalculatorScreen;
