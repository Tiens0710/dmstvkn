import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Auth Stack types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Main App
  MainApp: undefined;
  Dashboard: undefined;

  // Core Finance Screens
  Transactions: undefined;
  AddTransaction: { type?: 'income' | 'expense' };
  TransactionDetail: { transactionId: number };
  Budget: undefined;
  Wallets: undefined;
  AddWallet: undefined;
  Reports: undefined;
  Home: undefined; // Kiến thức tài chính

  // Settings & Profile
  Profile: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}