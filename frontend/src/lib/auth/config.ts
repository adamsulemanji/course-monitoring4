// import { Amplify } from 'aws-amplify';

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const AUTH_API = `${API_BASE_URL}/auth`;

// Auth endpoints
export const SIGNUP_URL = `${AUTH_API}/signup`;
export const VERIFY_ACCOUNT_URL = `${AUTH_API}/verify_account`;
export const SIGNIN_URL = `${AUTH_API}/signin`;
export const RESEND_CODE_URL = `${AUTH_API}/resend_confirmation_code`;
export const FORGOT_PASSWORD_URL = `${AUTH_API}/forgot_password`;
export const CONFIRM_FORGOT_PASSWORD_URL = `${AUTH_API}/confirm_forgot_password`;
export const LOGOUT_URL = `${AUTH_API}/logout`;
export const NEW_TOKEN_URL = `${AUTH_API}/new_token`;