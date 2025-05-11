import { 
  SIGNUP_URL, 
  VERIFY_ACCOUNT_URL, 
  SIGNIN_URL, 
  RESEND_CODE_URL,
  LOGOUT_URL,
  NEW_TOKEN_URL
} from './config';

export interface SignUpData {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface VerifyAccountData {
  email: string;
  confirmation_code: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  error?: string;
  message?: string;
  success?: boolean;
}

export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const response = await fetch(SIGNUP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to sign up');
    }
    
    return { ...result, success: true };
  } catch (error) {
    console.error('Signup error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false
    };
  }
};

export const verifyAccount = async (data: VerifyAccountData): Promise<AuthResponse> => {
  try {
    const response = await fetch(VERIFY_ACCOUNT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to verify account');
    }
    
    return { ...result, success: true };
  } catch (error) {
    console.error('Verification error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false
    };
  }
};

export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const response = await fetch(SIGNIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to sign in');
    }
    
    // Store tokens in localStorage
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
    }
    
    if (result.refresh_token) {
      localStorage.setItem('refresh_token', result.refresh_token);
    }
    
    if (result.id_token) {
      localStorage.setItem('id_token', result.id_token);
    }
    
    return { ...result, success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false
    };
  }
};

export const resendConfirmationCode = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(RESEND_CODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to resend confirmation code');
    }
    
    return { ...result, success: true };
  } catch (error) {
    console.error('Resend code error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false
    };
  }
};

export const logout = async (): Promise<AuthResponse> => {
  try {
    const access_token = localStorage.getItem('access_token');
    
    if (!access_token) {
      // Clear local storage and return if no token exists
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      return { success: true, message: 'Logged out successfully' };
    }
    
    const response = await fetch(LOGOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token }),
    });
    
    // Clear tokens regardless of response
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    
    if (!response.ok) {
      const result = await response.json();
      console.warn('Logout warning:', result);
    }
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Clear tokens even if there's an error
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      success: true, // Consider logout successful even if API call fails
      message: 'Logged out successfully'
    };
  }
};

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    
    if (!refresh_token) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch(NEW_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to refresh token');
    }
    
    // Update token in local storage
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
    }
    
    return { ...result, success: true };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false
    };
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
}; 