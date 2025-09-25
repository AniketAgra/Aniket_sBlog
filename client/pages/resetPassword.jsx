import { useEffect, useState } from 'react';
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../src/utils/api';

export default function ResetPassword(){
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const email = params.get('email');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(()=>{
    if(!token || !email){
      setStatus(s=>({ ...s, error: 'Reset link invalid'}));
    }
  },[token,email]);

  async function handleSubmit(e){
    e.preventDefault();
    if(password.length < 6) return setStatus({ loading:false, error:'Password too short', success:''});
    if(password !== confirm) return setStatus({ loading:false, error:'Passwords do not match', success:''});
    setStatus({ loading:true, error:'', success:''});
    try {
      await resetPassword({ email, token, password });
      setStatus({ loading:false, error:'', success:'Password reset successful. Redirecting...' });
      setTimeout(()=> navigate('/signin'), 1800);
    } catch(err){
      setStatus({ loading:false, error: err.message || 'Reset failed', success:''});
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Reset password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Enter and confirm your new password.</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="password" value="New Password" />
            <TextInput id="password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="confirm" value="Confirm Password" />
            <TextInput id="confirm" type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} />
          </div>
          <Button type="submit" gradientDuoTone="purpleToPink" disabled={status.loading || !token || !email}>
            {status.loading ? <><Spinner size='sm'/><span className='pl-2'>Resetting...</span></> : 'Reset password'}
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
