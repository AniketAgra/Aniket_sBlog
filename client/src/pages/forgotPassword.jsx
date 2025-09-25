import React, { useState } from 'react';
import { forgotPassword } from '../utils/api.js';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ sent: false, error: null, loading: false });

  async function handleSubmit(e) {
    e.preventDefault();
    if (status.loading) return;
    setStatus({ sent: false, error: null, loading: true });
    try {
      await forgotPassword(email.trim());
      setStatus({ sent: true, error: null, loading: false });
    } catch (err) {
      // Even on error we just show generic message unless network failure
      const network = err?.status === undefined;
      setStatus({ sent: !network, error: network ? err.message : null, loading: false });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Forgot Password</h1>
      {status.sent ? (
        <div className="space-y-4 text-center">
          <p className="text-green-600 text-sm">If that email exists, we've sent a reset link.</p>
          <p className="text-xs text-gray-500">Please check your inbox (and spam folder). The link expires in 1 hour.</p>
          <Link className="text-blue-600 hover:underline text-sm" to="/signin">Back to Sign In</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <label className="block text-sm font-medium">Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              placeholder="you@example.com"
            />
          </label>
          {status.error && <p className="text-red-600 text-sm">{status.error}</p>}
          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >{status.loading ? 'Sending…' : 'Send Reset Link'}</button>
          <div className="text-xs text-gray-500">You'll receive an email with a link to reset your password.</div>
        </form>
      )}
    </div>
  );
}
