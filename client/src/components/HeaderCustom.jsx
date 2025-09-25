import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineMenu } from 'react-icons/ai';
import styles from '../styles/components/HeaderCustom.module.css';
import { signOut } from '../redux/user/userSlice';

export default function HeaderCustom(){
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarWrapRef = useRef(null);
  const sheetRef = useRef(null);
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector(s => s.user);

  const handleSignOut = async () => {
    try{
      const res = await fetch('/api/auth/signout', { method:'POST', credentials:'include' });
      if(res.ok){
        dispatch(signOut());
        setMenuOpen(false);
        navigate('/signin');
      }
    }catch(e){/* no-op */}
  };

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [path]);

  // Lock scroll when mobile menu is open and handle Escape
  useEffect(() => {
    const keyHandler = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', keyHandler);
      // focus the sheet for better a11y
      setTimeout(() => { sheetRef.current?.focus?.(); }, 0);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', keyHandler);
    }
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', keyHandler); };
  }, [open]);

  // Close avatar menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (!avatarWrapRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('click', onDocClick, true);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header className={styles.root}>
      <div className={styles.container}>
        <Link to='/' className={styles.brand}>
          <span className={styles.brandBadge}>Aniket&apos;s</span> Blog
        </Link>

        {/* Centered desktop nav */}
        <nav className={styles.desktopNav} aria-label='Primary'>
          <Link to='/' className={`${styles.navLink} ${path==='/' ? styles.active : ''}`}>Home</Link>
          <Link to='/about' className={`${styles.navLink} ${path==='/about' ? styles.active : ''}`}>About</Link>
          <Link to='/posts' className={`${styles.navLink} ${path==='/posts' ? styles.active : ''}`}>Blog</Link>
          <Link to='/projects' className={`${styles.navLink} ${path==='/projects' ? styles.active : ''}`}>Projects</Link>
        </nav>

        <div className={styles.controls}>
          {currentUser ? (
            <div className={styles.avatarWrap} ref={avatarWrapRef}>
              <button type="button" className={styles.avatarBtn} onClick={()=>setMenuOpen(v=>!v)} aria-haspopup='menu' aria-expanded={menuOpen}>
                <img className={styles.avatarImg} alt='user' src={currentUser.profilePicture} />
              </button>
              <div className={`${styles.menu} ${menuOpen ? styles.menuOpen : ''}`} role='menu'>
                <div className={styles.menuItem}>@{currentUser.username}</div>
                <div className={styles.menuItem} style={{opacity:.8}}>@{currentUser.email}</div>
                <hr className={styles.menuDivider}/>
                <Link to='/dashboard?tab=profile' className={styles.menuItem} onClick={()=>setMenuOpen(false)}>Profile</Link>
                <hr className={styles.menuDivider}/>
                <button type="button" className={styles.menuItem} onClick={handleSignOut}>Sign Out</button>
              </div>
            </div>
          ) : (
            <Link to='/signin'>
              <button type="button" className={styles.signInButton}>Sign In</button>
            </Link>
          )}

          <button className={styles.toggleBtn} aria-controls='mobile-nav' aria-expanded={open} aria-label='Toggle navigation' onClick={()=>setOpen(o=>!o)}>

            <AiOutlineMenu />
          </button>
        </div>
      </div>

    {/* Mobile overlay nav */}
    {open && <button type="button" aria-hidden className={styles.backdrop} onClick={()=>setOpen(false)} />}
    <nav
      id='mobile-nav'
      ref={sheetRef}
      tabIndex={-1}
      aria-label='Mobile'
      className={`${styles.sheet} ${open ? styles.sheetOpen : ''}`}
    > 
      <div className={styles.collapseInner}>
        <Link to='/' className={`${styles.navLink} ${path==='/' ? styles.active : ''}`}>Home</Link>
        <Link to='/about' className={`${styles.navLink} ${path==='/about' ? styles.active : ''}`}>About</Link>
        <Link to='/posts' className={`${styles.navLink} ${path==='/posts' ? styles.active : ''}`}>Blog</Link>
        <Link to='/projects' className={`${styles.navLink} ${path==='/projects' ? styles.active : ''}`}>Projects</Link>
        {currentUser && (
          <Link to='/dashboard?tab=profile' className={`${styles.navLink} ${styles.mobileOnly} ${path.startsWith('/dashboard') ? styles.active : ''}`}>Dashboard</Link>
        )}

      </div>
    </nav>
    </header>
  );
}
