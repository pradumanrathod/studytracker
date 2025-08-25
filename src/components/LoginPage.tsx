import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail, registerWithEmailAndUsername, sendPasswordReset, resendVerificationEmail } from '../services/firebaseAuth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pwdScore, setPwdScore] = useState(0); // 0-4
  const [pwdHelper, setPwdHelper] = useState('');

  const evalPassword = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9\d]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    // cap to 4 for our meter
    score = Math.min(score, 4);
    const helper = score < 3
      ? 'Use at least 8 chars with upper, lower, number, and symbol.'
      : 'Strong password.';
    setPwdScore(score);
    setPwdHelper(helper);
  };

  const mapAuthError = (e: any): string => {
    const code = (e?.code as string) || '';
    switch (code) {
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is disabled for this project. Enable it in Firebase Console → Authentication → Sign-in method.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. If you originally signed up with Google, use "Sign in with Google" or reset your password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      default:
        return e?.message || 'Authentication failed. Please try again.';
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setInfo(null);
    try {
      setLoading(true);
      const ok = await resendVerificationEmail();
      setInfo(ok ? 'Verification email sent again. Please check your inbox.' : 'You must be signed in to resend verification.');
    } catch (e: any) {
      setError(mapAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const user = await signInWithGoogle();
      if (user) navigate('/');
    } catch (e: any) {
      setError(mapAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const emailNorm = email.trim().toLowerCase();
      const pwdNorm = password.trim();
      if (isRegister) {
        // Enforce password policy
        evalPassword(pwdNorm);
        if (pwdScore < 3) {
          throw { code: 'auth/weak-password', message: 'Please use a stronger password.' };
        }
        await registerWithEmailAndUsername(emailNorm, pwdNorm, username.trim());
        setInfo('Account created. A verification email has been sent. Please verify your email before logging in.');
        return; // do not navigate until verified/login
      } else {
        const user = await signInWithEmail(emailNorm, pwdNorm);
        if (!user?.emailVerified) {
          setInfo('Your email is not verified. Please check your inbox or resend the verification email below.');
          return; // block navigation until verified
        }
      }
      navigate('/');
    } catch (e: any) {
      setError(mapAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);
    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm) {
      setError('Enter your email above, then click "Forgot password?"');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordReset(emailNorm);
      setInfo('Password reset email sent. Please check your inbox.');
    } catch (e: any) {
      setError(mapAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/models/logo.png"
            alt="StudyTracker"
            className="h-20 md:h-24 w-auto mb-3 rounded-lg shadow ring-1 ring-black/5"
          />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
            {isRegister ? 'Create your account' : 'Welcome back!'}
          </h2>
          <p className="text-gray-500 dark:text-gray-300 text-center text-sm">
            {isRegister ? 'Register to start tracking your study sessions.' : 'Sign in to continue to StudyTracker.'}
          </p>
        </div>
        {/* Emphasize Google sign-in */}
        <div className="w-full mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Quick Sign-in</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Recommended</span>
          </div>
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full px-6 py-2 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-lg shadow transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={loading}
            type="button"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.36 30.7 0 24 0 14.82 0 6.73 5.06 2.69 12.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.36 46.1 31.45 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.13-3.36-1.13-6.99 0-10.35l-7.98-6.2C.99 16.36 0 20.06 0 24c0 3.94.99 7.64 2.69 12.44l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.7 0 12.68-2.36 17.04-6.44l-7.19-5.6c-2.01 1.35-4.6 2.14-7.85 2.14-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.73 42.94 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            Sign in with Google
          </button>
        </div>
        {/* Divider OR between social and email/password */}
        <div className="my-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <div className="mx-3 flex flex-col items-center">
            <span className="px-2">or</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <form className="w-full space-y-4" onSubmit={handleEmailAuth}>
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); if (isRegister) evalPassword(e.target.value); }}
              className="w-full pr-10 px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {isRegister && (
            <div className="mt-1">
              <div className="w-full h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full ${pwdScore <= 1 ? 'bg-red-500' : pwdScore === 2 ? 'bg-yellow-500' : pwdScore === 3 ? 'bg-green-500' : 'bg-emerald-600'}`}
                  style={{ width: `${Math.max(10, pwdScore * 25)}%` }}
                />
              </div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{pwdHelper}</div>
            </div>
          )}
          {isRegister && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Create a new password for StudyTracker.</p>
          )}
          {!isRegister && (
            <div className="flex justify-end -mt-2 mb-1">
              <button
                type="button"
                className="text-xs text-primary-600 hover:underline dark:text-primary-400"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
          )}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {info && (
            <div className="text-green-600 text-sm text-center">
              {info}
              {!isRegister && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-xs text-primary-600 hover:underline dark:text-primary-400"
                    disabled={loading}
                  >
                    Resend verification email
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow transition-colors"
            disabled={loading}
          >
            {loading ? (isRegister ? 'Registering...' : 'Signing in...') : (isRegister ? 'Register' : 'Sign In')}
          </button>
        </form>
        <button
          className="mt-4 text-primary-600 dark:text-primary-400 hover:underline text-sm"
          onClick={() => setIsRegister(!isRegister)}
          disabled={loading}
        >
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
