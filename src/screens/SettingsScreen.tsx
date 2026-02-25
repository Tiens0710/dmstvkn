import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/common';
import { Button } from '../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { detectCarrier, CarrierInfo } from '../utils/phoneCarrierUtils';

interface SettingSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'switch' | 'text' | 'action';
  value?: any;
  onPress?: () => void;
}

interface UserSettings {
  name: string;
  email: string;
  phone: string;
  currency: string;
  monthlyBudget: number;
  timezone: string;
}

const settingSections: SettingSection[] = [
  {
    id: 'account',
    title: 'Tài khoản cá nhân',
    icon: 'person',
    color: colors.primary,
    items: [
      { id: 'profile_info', title: 'Hồ sơ cá nhân', subtitle: 'Tên, email, số điện thoại', type: 'navigation' },
      { id: 'currency', title: 'Tiền tệ', subtitle: 'VND — Việt Nam Đồng', type: 'navigation' },
      { id: 'timezone', title: 'Múi giờ', subtitle: 'Asia/Ho_Chi_Minh (GMT+7)', type: 'navigation' },
    ]
  },
  {
    id: 'budget',
    title: 'Ngân sách & Chi tiêu',
    icon: 'pie-chart',
    color: colors.success,
    items: [
      { id: 'monthly_budget', title: 'Ngân sách tháng', subtitle: 'Giới hạn chi tiêu hàng tháng', type: 'navigation' },
      { id: 'categories', title: 'Danh mục chi tiêu', subtitle: 'Quản lý danh mục tùy chỉnh', type: 'navigation' },
      { id: 'recurring', title: 'Chi tiêu định kỳ', subtitle: 'Tiền thuê, điện nước, internet', type: 'navigation' },
    ]
  },
  {
    id: 'notifications',
    title: 'Thông báo',
    icon: 'notifications',
    color: colors.warning,
    items: [
      { id: 'push_notifications', title: 'Thông báo đẩy', subtitle: 'Nhận thông báo quan trọng', type: 'switch', value: true },
      { id: 'budget_alert', title: 'Cảnh báo ngân sách', subtitle: 'Nhắc khi gần vượt giới hạn', type: 'switch', value: true },
      { id: 'bill_reminder', title: 'Nhắc hóa đơn', subtitle: 'Nhắc thanh toán định kỳ', type: 'switch', value: true },
      { id: 'weekly_summary', title: 'Báo cáo tuần', subtitle: 'Tóm tắt chi tiêu cuối tuần', type: 'switch', value: false },
    ]
  },
  {
    id: 'linked_accounts',
    title: 'Tài khoản liên kết',
    icon: 'account-balance',
    color: colors.secondary,
    items: [
      { id: 'bank_accounts', title: 'Tài khoản ngân hàng', subtitle: 'Vietcombank, Techcombank...', type: 'navigation' },
      { id: 'e_wallets', title: 'Ví điện tử', subtitle: 'MoMo, ZaloPay, VNPay', type: 'navigation' },
      { id: 'auto_sync', title: 'Tự động đồng bộ', subtitle: 'Nhập giao dịch tự động', type: 'switch', value: false },
    ]
  },
  {
    id: 'backup',
    title: 'Sao lưu & Dữ liệu',
    icon: 'cloud-upload',
    color: colors.primary,
    items: [
      { id: 'auto_backup', title: 'Sao lưu tự động', subtitle: 'Hàng ngày lúc 23:00', type: 'switch', value: true },
      { id: 'backup_now', title: 'Sao lưu ngay', subtitle: 'Tạo bản sao lưu thủ công', type: 'action' },
      { id: 'export_data', title: 'Xuất dữ liệu', subtitle: 'Xuất Excel / CSV', type: 'action' },
      { id: 'restore_data', title: 'Khôi phục dữ liệu', subtitle: 'Từ bản sao lưu', type: 'navigation' },
    ]
  },
  {
    id: 'security',
    title: 'Bảo mật',
    icon: 'security',
    color: colors.danger,
    items: [
      { id: 'change_password', title: 'Đổi mật khẩu', subtitle: 'Cập nhật mật khẩu đăng nhập', type: 'navigation' },
      { id: 'pin_lock', title: 'Khóa PIN', subtitle: 'Bảo vệ ứng dụng bằng PIN', type: 'switch', value: false },
      { id: 'fingerprint', title: 'Vân tay/Face ID', subtitle: 'Đăng nhập sinh trắc học', type: 'switch', value: false },
      { id: 'logout', title: 'Đăng xuất', subtitle: 'Thoát khỏi tài khoản', type: 'action' },
    ]
  }
];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [sections, setSections] = useState(settingSections);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: 'Nguyễn Văn A',
    email: 'user@finwise.app',
    phone: '0901234567',
    currency: 'VND',
    monthlyBudget: 10000000,
    timezone: 'Asia/Ho_Chi_Minh'
  });
  const [detectedCarrier, setDetectedCarrier] = useState<CarrierInfo | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Detect carrier when phone number changes
  useEffect(() => {
    const carrier = detectCarrier(userSettings.phone);
    setDetectedCarrier(carrier);
  }, [userSettings.phone]);

  const handleSwitchChange = (sectionId: string, itemId: string, value: boolean) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId ? { ...item, value } : item
            )
          }
          : section
      )
    );
  };

  const handleActionPress = (itemId: string) => {
    switch (itemId) {
      case 'backup_now':
        Alert.alert(
          'Sao lưu dữ liệu',
          'Bạn có muốn tạo bản sao lưu ngay bây giờ?',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Sao lưu',
              onPress: () => {
                Alert.alert('Thành công', 'Đã sao lưu dữ liệu thành công');
              }
            }
          ]
        );
        break;
      case 'export_data':
        Alert.alert('Xuất dữ liệu', 'Xuất toàn bộ giao dịch ra file Excel/CSV?', [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xuất', onPress: () => Alert.alert('Thành công', 'Đã xuất dữ liệu') }
        ]);
        break;
      case 'logout':
        Alert.alert(
          'Đăng xuất',
          'Bạn có chắc chắn muốn đăng xuất?',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Đăng xuất',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Đăng xuất', 'Đã đăng xuất thành công');
              }
            }
          ]
        );
        break;
      default:
        Alert.alert('Thông báo', 'Tính năng đang phát triển');
    }
  };

  const handleNavigationPress = (itemId: string) => {
    switch (itemId) {
      case 'profile_info':
        setShowProfileInfo(true);
        break;
      default:
        Alert.alert('Thông báo', 'Tính năng đang phát triển');
    }
  };

  const saveProfileInfo = () => {
    Alert.alert('Thành công', 'Đã cập nhật hồ sơ cá nhân');
    setShowProfileInfo(false);
  };

  const renderSettingItem = (section: SettingSection, item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={() => {
          if (item.type === 'navigation') {
            handleNavigationPress(item.id);
          } else if (item.type === 'action') {
            handleActionPress(item.id);
          }
        }}
        disabled={item.type === 'switch'}
      >
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>

        <View style={styles.settingAction}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={(value) => handleSwitchChange(section.id, item.id, value)}
              trackColor={{ false: colors.cardBorder, true: section.color + '40' }}
              thumbColor={item.value ? section.color : colors.textLight}
            />
          )}
          {(item.type === 'navigation' || item.type === 'action') && (
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: SettingSection) => (
    <Card key={section.id} style={styles.sectionCard} shadowLevel="small">
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
          <Icon name={section.icon} size={20} color={section.color} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>

      <View style={styles.sectionContent}>
        {section.items.map(item => renderSettingItem(section, item))}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài đặt</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Settings Sections */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map(renderSection)}

          {/* App Info */}
          <Card style={styles.appInfoCard} shadowLevel="small">
            <Text style={styles.appInfoTitle}>Thông tin ứng dụng</Text>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Phiên bản:</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Cập nhật cuối:</Text>
              <Text style={styles.appInfoValue}>20/02/2026</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Hỗ trợ:</Text>
              <Text style={styles.appInfoValue}>support@finwise.app</Text>
            </View>
          </Card>
        </ScrollView>
      </Animated.View>

      {/* Profile Info Modal */}
      <Modal
        visible={showProfileInfo}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hồ sơ cá nhân</Text>
            <TouchableOpacity onPress={() => setShowProfileInfo(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Thông tin cá nhân</Text>

              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={userSettings.name}
                onChangeText={(text) => setUserSettings({ ...userSettings, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={userSettings.email}
                onChangeText={(text) => setUserSettings({ ...userSettings, email: text })}
                keyboardType="email-address"
              />

              <View style={styles.phoneInputContainer}>
                <TextInput
                  style={[styles.input, detectedCarrier && styles.phoneInputWithCarrier]}
                  placeholder="Số điện thoại"
                  value={userSettings.phone}
                  onChangeText={(text) => setUserSettings({ ...userSettings, phone: text })}
                  keyboardType="phone-pad"
                />
                {detectedCarrier && (
                  <View style={[styles.carrierBadge, { backgroundColor: detectedCarrier.color + '15' }]}>
                    <Text style={styles.carrierIcon}>{detectedCarrier.icon}</Text>
                  </View>
                )}
              </View>
            </Card>

            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Ngân sách hàng tháng</Text>
              <TextInput
                style={styles.input}
                placeholder="Ngân sách (VND)"
                value={userSettings.monthlyBudget.toString()}
                onChangeText={(text) => setUserSettings({ ...userSettings, monthlyBudget: parseInt(text) || 0 })}
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>Giới hạn chi tiêu tối đa mỗi tháng</Text>
            </Card>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={() => setShowProfileInfo(false)}
              style={styles.footerButton}
            />
            <Button
              title="Lưu"
              onPress={saveProfileInfo}
              style={styles.footerButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  sectionCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionIcon: {
    borderRadius: borderRadius.lg,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  sectionContent: {
    backgroundColor: colors.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  settingAction: {
    marginLeft: spacing.md,
  },
  appInfoCard: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  appInfoTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  appInfoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  appInfoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  formCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  formTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    ...typography.body,
    color: colors.text,
  },
  helperText: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  // Carrier logo styles
  phoneInputContainer: {
    position: 'relative',
  },
  phoneInputWithCarrier: {
    paddingLeft: 50,
  },
  carrierBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 32,
  },
  carrierLogo: {
    width: 20,
    height: 20,
  },
  carrierIcon: {
    fontSize: 16,
  },
});