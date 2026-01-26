import { loginWithGoogle } from './api';

const googleAuthService = {
    async redirectToGoogleAuth() {
        try {
            await loginWithGoogle();
        } catch (error) {
            throw new Error('Không thể khởi tạo đăng nhập Google: ' + error.message);
        }
    }
};

export default googleAuthService;