/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, Mail, Key, Plus, Search, 
  Filter, Clock, Settings, LogOut, ShieldCheck, 
  AlertTriangle, Fingerprint, Moon, Sun, ChevronRight,
  ArrowLeft, Edit2, Trash2, Eye, EyeOff, User, Copy
} from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import { DialPad } from './components/DialPad';
import { PasswordCard } from './components/PasswordCard';
import { AddPasswordModal } from './components/AddPasswordModal';
import { encrypt, decrypt, hash } from './services/crypto';
import { cn } from './lib/utils';

type View = 'splash' | 'login' | 'pin-login' | 'dashboard' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('splash');
  const [user, setUser] = useState<any>(null);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [passwords, setPasswords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  
  // PIN Logic
  
  const [pin, setPin] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<any>(null);
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    // Initial load
    const timer = setTimeout(() => {
      const savedUserJSON = localStorage.getItem('vault_user');
      if (savedUserJSON) {
        const savedUserData = JSON.parse(savedUserJSON);
        setUser(savedUserData.user);
        setHasPin(savedUserData.hasPin);
        setView('pin-login');
      } else {
        setView('login');
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const fetchPasswords = async (userId: number) => {
    try {
      const res = await fetch(`/api/passwords?userId=${userId}`);
      const data = await res.json();
      setPasswords(data);
    } catch (err) {
      console.error('Failed to fetch passwords');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, masterPasswordHash: hash(password) }),
      });
      const data = await res.json();

      if (data.success) {
        setMasterPassword(password);
        setUser(data.user);
        setHasPin(false); // New user, no PIN yet
        setView('pin-login'); // Go to PIN setup
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
      form.reset();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, masterPasswordHash: hash(password) }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMasterPassword(password);
        setUser(data.user);
        setHasPin(data.hasPin);
        setView('pin-login');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
      form.reset();
    }
  };

  const handlePinSetup = async (inputPin: string) => {
    if (inputPin.length !== 6) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, pinHash: hash(inputPin) }),
      });
      if (res.ok) {
        localStorage.setItem('vault_user', JSON.stringify({ user, hasPin: true }));
        setHasPin(true);
        setView('dashboard');
        fetchPasswords(user.id);
      }
    } catch (err) {
      setError('Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (inputPin: string) => {
    if (inputPin.length !== 6) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinHash: hash(inputPin) }),
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        // In a real app, we'd use the PIN to decrypt a stored vault key.
        // For this demo, we'll derive a session key from the PIN.
        setMasterPassword(inputPin + "_vault_key"); 
        setView('dashboard');
        fetchPasswords(data.user.id);
      } else {
        setError('Invalid PIN');
        setPin('');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (data: any) => {
    const encrypted = encrypt(data.password, masterPassword || 'demo-key'); // Fallback for demo
    const payload = { ...data, encryptedPassword: encrypted, userId: user.id };
    
    try {
      const url = editingPassword ? `/api/passwords/${editingPassword.id}` : '/api/passwords';
      const method = editingPassword ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        fetchPasswords(user.id);
        setEditingPassword(null);
      }
    } catch (err) {
      console.error('Save failed');
    }
  };

  const handleDeletePassword = async (id: number) => {
    if (!confirm('Are you sure you want to delete this password?')) return;
    try {
      await fetch(`/api/passwords/${id}`, { method: 'DELETE' });
      fetchPasswords(user.id);
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const groupedPasswords = useMemo(() => {
    const defaultPlatforms = [
      'Facebook', 'Instagram', 'Twitter', 'TikTok', 'YouTube', 
      'Gmail', 'LinkedIn', 'Spotify', 'Netflix', 'Amazon',
      'Apple', 'Microsoft', 'GitHub', 'Discord', 'Slack',
      'Pinterest', 'Reddit', 'Snapchat', 'WhatsApp', 'Telegram',
      'PayPal', 'Binance', 'Coinbase', 'Dropbox', 'Zoom'
    ];
    
    const groups: Record<string, any[]> = {};
    defaultPlatforms.forEach(p => groups[p] = []);
    
    passwords.forEach(p => {
      if (!groups[p.platform]) groups[p.platform] = [];
      groups[p.platform].push(p);
    });

    return groups;
  }, [passwords]);

  const filteredPlatforms = useMemo(() => {
    return Object.keys(groupedPasswords).filter(platform => 
      (platform || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [groupedPasswords, searchQuery]);

  const platformPasswords = useMemo(() => {
    if (!selectedPlatform) return [];
    return groupedPasswords[selectedPlatform] || [];
  }, [selectedPlatform, groupedPasswords]);

  if (view === 'splash') return <SplashScreen />;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-500/30",
      isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Decoration (Removed for performance) */}
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-4">
                  <Shield size={32} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">{isRegister ? 'Create Account' : 'Log In to your Vault'}</h2>
                <p className="text-white/40 mt-2">{isRegister ? 'Create a new secure vault.' : 'Access your secure vault'}</p>
              </div>

              <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                    <input
                      name="username"
                      type="text"
                      required
                      placeholder="Enter your username"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Master Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">{error}</p>}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Unlock Vault'}
                  <ChevronRight size={20} />
                </motion.button>

                <div className="text-center pt-4">
                  <button type="button" onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                    
                  }} className="text-indigo-400 text-sm hover:underline">
                    {isRegister ? 'Already have an account? Log In' : "Don't have an account? Create one"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {view === 'pin-login' && (
          <motion.div
            key="pin-login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="flex flex-col items-center mb-12">
              <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-6">
                <Lock size={40} />
              </div>
              <h2 className="text-3xl font-bold">{hasPin ? 'Welcome Back' : 'Create a PIN'}</h2>
              <p className="text-white/40 mt-2">{hasPin ? 'Enter PIN to unlock vault' : 'Create a 6-digit PIN for quick access'}</p>
            </div>

            <div className="flex gap-4 mb-12">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={pin.length > i ? { scale: 1.2, backgroundColor: '#6366f1' } : { scale: 1, backgroundColor: 'transparent' }}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 border-white/20 transition-all duration-200",
                    pin.length > i && "border-indigo-500"
                  )}
                />
              ))}
            </div>

            <DialPad
              onNumberClick={(n) => {
                if (pin.length < 6) {
                  const newPin = pin + n;
                  setPin(newPin);
                  if (newPin.length === 6) {
                    if (hasPin) {
                      handlePinLogin(newPin);
                    } else {
                      handlePinSetup(newPin);
                    }
                  }
                }
              }}
              onDelete={() => setPin(prev => prev.slice(0, -1))}
            />

            <div className="mt-12 flex items-center gap-8 text-white/40">
              <button className="flex flex-col items-center gap-2 hover:text-white transition-colors">
                <Fingerprint size={32} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Biometric</span>
              </button>
              <button 
                onClick={() => { localStorage.removeItem('vault_user'); setView('login'); }}
                className="flex flex-col items-center gap-2 hover:text-white transition-colors"
              >
                <LogOut size={32} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Log Out</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 py-8"
          >
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Shield size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">SecureVault</h1>
                  <div className="flex items-center gap-2 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Encrypted Session
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setView('settings')}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  title="Settings"
                >
                  <Settings size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            </header>

            {/* Search */}
            <div className="mb-12">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-center"
                />
              </div>
            </div>

            {/* Passwords Grid - Home Screen Style */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-4 gap-y-8 justify-items-center">
              <AnimatePresence>
                {filteredPlatforms.map((platform) => (
                  <PasswordCard
                    key={platform}
                    platform={platform}
                    count={groupedPasswords[platform].length}
                    onClick={() => setSelectedPlatform(platform)}
                  />
                ))}
              </AnimatePresence>
              
              {/* Add Button as an Icon */}
              <motion.div
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedPlatform('Custom'); setIsModalOpen(true); }}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[22%] bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl">
                  <Plus size={32} />
                </div>
                <p className="text-xs font-medium text-indigo-400">Add New</p>
              </motion.div>
            </div>
          </motion.div>
        )}
        {view === 'settings' && (
          <motion.div
            key="settings"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            <div className={cn("h-full w-full transition-colors duration-500", isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900")}>
              {/* Settings Header */}
              <div className={cn("p-6 flex items-center justify-between border-b sticky top-0", isDarkMode ? "border-white/5 bg-slate-950/80 backdrop-blur-xl" : "border-slate-200 bg-slate-50/80 backdrop-blur-xl")}>
                <button onClick={() => setView('dashboard')} className={cn("p-2 rounded-full transition-all", isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-200")}>
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold">Settings</h2>
                <div className="w-10" /> {/* Spacer */}
              </div>

              {/* Settings Content */}
              <div className="p-8 space-y-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={cn("w-full flex items-center justify-between p-4 rounded-2xl border transition-all", isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-slate-200 hover:bg-slate-100")}
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                  </div>
                  <ChevronRight size={16} className={cn(isDarkMode ? "text-white/20" : "text-slate-400")} />
                </button>
                <button
                  onClick={() => { localStorage.removeItem('vault_user'); window.location.reload(); }}
                  className="w-full flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all text-red-400"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={20} />
                    <span>Sign Out & Reset</span>
                  </div>
                  <ChevronRight size={16} className="text-red-400/20" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Detail View */}
      <AnimatePresence>
        {selectedPlatform && (
          <motion.div
            key="detail-view"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex flex-col bg-slate-950 overflow-hidden"
          >
              {/* Detail Header */}
              <div className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0">
                <button onClick={() => setSelectedPlatform(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <ArrowLeft size={24} />
                </button>
                
                <div className="flex flex-col items-center flex-1">
                  <h2 className="text-xl font-bold">{selectedPlatform}</h2>
                  <button 
                    onClick={() => { setEditingPassword(null); setIsModalOpen(true); }}
                    className="mt-2 flex items-center gap-2 px-4 py-1.5 bg-indigo-600 rounded-full text-white text-xs font-bold shadow-lg shadow-indigo-500/20"
                  >
                    <Plus size={16} />
                    Add Account
                  </button>
                </div>

                <div className="w-10" /> {/* Spacer for balance */}
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {platformPasswords.length > 0 ? (
                  platformPasswords.map((p) => {
                    const isRevealed = revealedPasswords[p.id];
                    const decryptedPass = decrypt(p.encrypted_password, masterPassword || 'demo-key');
                    
                    return (
                      <div 
                        key={p.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all"
                      >
                        <div className="flex flex-col flex-1">
                          <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{p.account_name}</span>
                          <span className="text-lg font-medium">{p.username}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white/20 font-mono tracking-widest">
                              {isRevealed ? decryptedPass : '••••••••••••'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => setRevealedPasswords(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-400"
                              >
                                {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(decryptedPass);
                                  alert('Password copied!');
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-400"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <AnimatePresence mode="wait">
                            {deleteConfirmId === p.id ? (
                              <motion.div 
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1"
                              >
                              <button 
                                onClick={() => handleDeletePassword(p.id)}
                                className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold rounded-lg"
                              >
                                Cancel
                              </button>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="actions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-1"
                              >
                              <button 
                                onClick={() => { setEditingPassword(p); setIsModalOpen(true); }}
                                className="p-2 hover:bg-white/10 rounded-lg"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(p.id)}
                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg"
                              >
                                <Trash2 size={18} />
                              </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
                      <Shield size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white/60">No accounts saved</h3>
                    <p className="text-white/30 mt-2">Click the + button to add your first {selectedPlatform} account</p>
                  </div>
                )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>



      <AddPasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePassword}
        platform={selectedPlatform || 'Custom'}
        initialData={editingPassword ? {
          platform: editingPassword.platform,
          accountName: editingPassword.account_name,
          username: editingPassword.username,
          password: decrypt(editingPassword.encrypted_password, masterPassword || 'demo-key'),
          notes: editingPassword.notes,
          category: editingPassword.category,
        } : undefined}
      />

      {/* Footer Info */}
      <footer className="fixed bottom-4 left-6 pointer-events-none opacity-20 hidden lg:block">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em]">
          <Shield size={12} />
          <span>AES-256 Encrypted</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>Zero Knowledge</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>v1.0.8</span>
        </div>
      </footer>

      {/* Watermark */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-50 text-[9px] font-medium whitespace-nowrap">
        © Copyright by Developer Bellal Hasan
      </div>
    </div>
  );
}
