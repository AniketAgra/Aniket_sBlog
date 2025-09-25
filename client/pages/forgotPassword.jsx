import { useState } from 'react';
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../src/utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  async function handleSubmit(e){
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      await requestPasswordReset(email);
      setStatus({ loading: false, error: '', success: 'If that email exists, a reset link has been sent.' });
    } catch (err){
      setStatus({ loading: false, error: err.message || 'Failed to send email', success: '' });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Forgot password</h1>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Enter your account email. We&apos;ll send a password reset link if it exists.</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Button type="submit" gradientDuoTone="purpleToPink" disabled={status.loading}>
            {status.loading ? <><Spinner size='sm'/><span className='pl-2'>Sending...</span></> : 'Send reset link'}
          </Button>
        </form>
        {status.error && <Alert className='mt-4' color='failure'>{status.error}</Alert>}
        {status.success && <Alert className='mt-4' color='success'>{status.success}</Alert>}
        <div className='text-xs mt-6 text-gray-500 dark:text-gray-400 flex justify-between'>
          <Link to='/signin' className='hover:underline'>Back to sign in</Link>
          <Link to='/' className='hover:underline'>Home</Link>
        </div>
      </div>
    </div>
  );
}
