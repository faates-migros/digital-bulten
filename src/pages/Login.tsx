import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: (u: string, p: string) => Promise<string | null> }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await onLogin(username, password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="p-4 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-black text-white tracking-tight">Admin Girişi</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Dashboard Erişimi</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-600"
                placeholder="Kullanıcı adınız"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Şifre</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-600"
                  placeholder="Şifreniz"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {showPw
                    ? <EyeOff className="w-4 h-4 text-zinc-500" />
                    : <Eye className="w-4 h-4 text-zinc-500" />
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs font-bold text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all active:scale-[0.98]"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs font-bold text-zinc-500 hover:text-orange-500 transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" />
              Bültene Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
