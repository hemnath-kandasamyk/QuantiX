import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Store, User as UserIcon, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { registerShop, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field error state
  const [fieldErrors, setFieldErrors] = useState<{
    shopName?: string;
    ownerName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    let isValid = true;

    if (!shopName.trim()) {
      errors.shopName = 'Shop name is required.';
      isValid = false;
    }

    if (!ownerName.trim()) {
      errors.ownerName = 'Owner full name is required.';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Business email is required.';
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError(null);
    setLoading(true);

    try {
      await registerShop({
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        pass: password,
      });
      showToast('QuantiX Store Registered', `Welcome! ${shopName} store system initialized.`);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      showToast('Google Store Registration', 'Shop registered and connected to Google account.');
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message && err.message.includes('popup was closed')) {
        return;
      }
      setError(err.message || 'Google registration failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11161F] text-[#F5EFE6] flex items-center justify-center p-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #2E3B4E 1px, transparent 1px), linear-gradient(to bottom, #2E3B4E 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-stamp-amber)] text-[#11161F] flex items-center justify-center mx-auto mb-2 font-serif-heading text-2xl font-bold">
            Q
          </div>
          <h1 className="font-serif-heading text-2xl font-bold tracking-tight text-[#F5EFE6]">
            REGISTER NEW QUANTIX STORE
          </h1>
          <p className="font-mono-num text-[11px] uppercase tracking-widest text-[#9CA3AF]">
            Initialize QuantiX Store & Inventory
          </p>
        </div>

        <div className="ledger-card bg-[#1A222E] border-[#2E3B4E] p-6 rounded-lg shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded bg-[#3F1717] border border-[#EF4444] text-[#FCA5A5] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <label className="block section-label mb-1 text-[#9CA3AF]">
                Shop Name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 absolute left-3 top-3 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    if (fieldErrors.shopName) setFieldErrors({ ...fieldErrors, shopName: undefined });
                  }}
                  placeholder="e.g. Apex Electronics & Cafe"
                  required
                  className={`w-full pl-9 pr-3 py-2 bg-[#11161F] border ${
                    fieldErrors.shopName ? 'border-red-500' : 'border-[#2E3B4E]'
                  } rounded text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:border-[var(--color-stamp-amber)] focus:outline-none`}
                />
              </div>
              {fieldErrors.shopName && (
                <p className="mt-1 text-[11px] text-red-400 font-mono-num">{fieldErrors.shopName}</p>
              )}
            </div>

            <div>
              <label className="block section-label mb-1 text-[#9CA3AF]">
                Owner Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => {
                    setOwnerName(e.target.value);
                    if (fieldErrors.ownerName) setFieldErrors({ ...fieldErrors, ownerName: undefined });
                  }}
                  placeholder="e.g. Alex Morgan"
                  required
                  className={`w-full pl-9 pr-3 py-2 bg-[#11161F] border ${
                    fieldErrors.ownerName ? 'border-red-500' : 'border-[#2E3B4E]'
                  } rounded text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:border-[var(--color-stamp-amber)] focus:outline-none`}
                />
              </div>
              {fieldErrors.ownerName && (
                <p className="mt-1 text-[11px] text-red-400 font-mono-num">{fieldErrors.ownerName}</p>
              )}
            </div>

            <div>
              <label className="block section-label mb-1 text-[#9CA3AF]">
                Business Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#9CA3AF]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="owner@quantix.shop"
                  required
                  className={`w-full pl-9 pr-3 py-2 bg-[#11161F] border ${
                    fieldErrors.email ? 'border-red-500' : 'border-[#2E3B4E]'
                  } rounded text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:border-[var(--color-stamp-amber)] focus:outline-none`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-red-400 font-mono-num">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block section-label mb-1 text-[#9CA3AF]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#9CA3AF]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="At least 6 characters"
                  required
                  className={`w-full pl-9 pr-3 py-2 bg-[#11161F] border ${
                    fieldErrors.password ? 'border-red-500' : 'border-[#2E3B4E]'
                  } rounded text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:border-[var(--color-stamp-amber)] focus:outline-none`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-red-400 font-mono-num">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block section-label mb-1 text-[#9CA3AF]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#9CA3AF]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                  }}
                  placeholder="Re-enter password"
                  required
                  className={`w-full pl-9 pr-3 py-2 bg-[#11161F] border ${
                    fieldErrors.confirmPassword ? 'border-red-500' : 'border-[#2E3B4E]'
                  } rounded text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:border-[var(--color-stamp-amber)] focus:outline-none`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-400 font-mono-num">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[var(--color-stamp-amber)] hover:opacity-95 text-[#11161F] font-mono-num text-xs font-bold uppercase tracking-wider rounded transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Creating QuantiX Store...</span>
              ) : (
                <>
                  <span>Create QuantiX Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2E3B4E]"></div>
            </div>
            <span className="relative px-3 bg-[#1A222E] font-mono-num text-[10px] uppercase tracking-widest text-[#9CA3AF]">
              or register with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 font-medium text-xs rounded border border-gray-300 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-mono-num font-semibold">
              {googleLoading ? 'Registering with Google...' : 'Continue with Google'}
            </span>
          </button>

          <div className="mt-5 pt-4 border-t border-[#2E3B4E] text-center">
            <p className="text-xs text-[#9CA3AF]">
              Already registered?{' '}
              <Link to="/login" className="text-[var(--color-stamp-amber)] hover:underline font-semibold font-mono-num">
                Sign In to Existing Store →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
