import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../utils/api.js';

export default function ResetPasswordPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const token = sp.get('token') || '';
  const email = sp.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState({ done: false, error: null, loading: false });

  const disabled = !token || !email;

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) return setStatus(s => ({ ...s, error: 'Passwords do not match' }));
    setStatus({ done: false, error: null, loading: true });
    try {
      await resetPassword({ email, token, password });
      setStatus({ done: true, error: null, loading: false });
      setTimeout(() => navigate('/signin'), 1200);
    } catch (err) {
      setStatus({ done: false, error: err.message, loading: false });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Reset Password</h1>
      {disabled && (
        <p className="text-red-600 text-sm mb-4">Invalid or missing reset token.</p>
      )}
      {status.done ? (
        <p className="text-green-600 text-sm mb-4">Password updated. Redirecting…</p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="text-xs text-gray-500 break-all">Resetting for: {email}</div>
          <label className="block text-sm font-medium">New Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            />
          </label>
          <label className="block text-sm font-medium">Confirm Password
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            />
          </label>
          {status.error && <p className="text-red-600 text-sm">{status.error}</p>}
          <button
            type="submit"
            disabled={status.loading || disabled}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >{status.loading ? 'Saving…' : 'Reset Password'}</button>
          <div className="text-xs text-gray-500">After reset you'll be redirected to sign in.</div>
          <div className="text-xs"><Link to="/signin" className="text-blue-600 hover:underline">Back to Sign In</Link></div>
        </form>
      )}
    </div>
  );
}
