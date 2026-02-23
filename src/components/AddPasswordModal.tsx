import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { generatePassword } from '../services/crypto';
import { cn } from '../lib/utils';

interface AddPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  platform: string;
  initialData?: any;
}

export const AddPasswordModal: React.FC<AddPasswordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  platform,
  initialData,
}) => {
  const [formData, setFormData] = useState(initialData || {
    platform: platform,
    accountName: '',
    username: '',
    password: '',
    notes: '',
    category: 'Social',
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        platform: platform,
        accountName: '',
        username: '',
        password: '',
        notes: '',
        category: 'Social',
      });
      setIsSaved(false);
    }
  }, [isOpen, platform, initialData]);

  const handleGenerate = () => {
    setFormData({ ...formData, password: generatePassword() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const brandColors: Record<string, string> = {
    Facebook: 'bg-[#1877F2]',
    Twitter: 'bg-[#1DA1F2]',
    Instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
    TikTok: 'bg-[#000000]',
    YouTube: 'bg-[#FF0000]',
    Gmail: 'bg-[#EA4335]',
    LinkedIn: 'bg-[#0A66C2]',
    Spotify: 'bg-[#1DB954]',
    Netflix: 'bg-[#E50914]',
    Amazon: 'bg-[#FF9900]',
  };

  const iconUrl = (platform || '').toLowerCase() === 'telegram'
    ? 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'
    : `https://www.google.com/s2/favicons?domain=${(platform || '').toLowerCase()}.com&sz=128`;

  const brandBg = brandColors[platform] || 'bg-indigo-600';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80"
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative w-full h-full md:h-auto md:max-w-md md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col transition-colors duration-500",
              platform === 'TikTok' ? 'bg-black text-white' : 'bg-white text-slate-900',
              isSaved && "bg-slate-950"
            )}
          >
            {/* Brand Background Accent */}
            {!isSaved && (
              <div className={cn("absolute top-0 left-0 right-0 h-32 opacity-10", brandBg)} />
            )}

            {/* Header */}
            <div className="p-6 flex items-center justify-between relative z-10">
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-40">Secure Vault</h2>
              <div className="w-10" />
            </div>

            {/* Content */}
            <div className="flex-1 p-8 flex flex-col items-center relative z-10">
              {/* Large Logo */}
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8"
              >
                <div className="w-24 h-24 rounded-[22%] bg-white shadow-2xl flex items-center justify-center p-4 border border-slate-100 overflow-hidden">
                  <img 
                    src={iconUrl} 
                    alt={platform} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${platform}&background=random&color=fff&size=128`;
                    }}
                  />
                </div>
              </motion.div>

              {!isSaved ? (
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold tracking-tight">{platform} Account</h3>
                    <p className="text-sm opacity-40 mt-1">Enter your credentials to save</p>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="Profile Name (e.g. My Account)"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="Mobile number or email address"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <input
                      type="text"
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all pr-12 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>

                  <div className="pt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={cn(
                        "w-full text-white font-bold py-4 rounded-xl shadow-xl transition-all text-lg",
                        brandBg
                      )}
                    >
                      Save
                    </motion.button>
                  </div>

                  <div className="text-center pt-4">
                    <button type="button" className="text-indigo-600 text-sm font-medium hover:underline">
                      Forgotten password?
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center py-12"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/20">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-green-500">Saved</h3>
                  <p className="text-slate-400 mt-2">Credentials stored securely</p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 text-center">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                <Shield size={12} />
                End-to-End Encrypted
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
