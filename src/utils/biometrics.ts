/**
 * Biometric Utilities (Demo/Stub)
 * 
 * Stub implementation - always returns success for demo purposes.
 */

type BiometricType = 'fingerprint' | 'face' | 'voice';

const BiometricUtils = {
    isBiometricAvailable: async (): Promise<boolean> => {
        return true; // Demo: always available
    },

    getBiometricType: async (): Promise<'fingerprint' | 'face' | 'none'> => {
        return 'fingerprint'; // Demo: fingerprint
    },

    authenticateWithBiometric: async (type: BiometricType): Promise<boolean> => {
        console.log(`[BiometricUtils] Demo: ${type} auth success`);
        return true; // Demo: always success
    },

    getSupportedBiometrics: async (): Promise<BiometricType[]> => {
        return ['fingerprint', 'face'];
    },

    registerBiometric: async (type: BiometricType): Promise<boolean> => {
        return true;
    },

    hasRegisteredBiometric: async (type: BiometricType): Promise<boolean> => {
        return true;
    },
};

export default BiometricUtils;
