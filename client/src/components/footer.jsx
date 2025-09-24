import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsTwitter, BsGithub, BsDribbble } from 'react-icons/bs';
import styles from '../styles/components/Footer.module.css';

export default function FooterComponent() {
    const year = new Date().getFullYear();
    return (
        <footer className={styles.footerRoot}>
            <div className={styles.container}>
                <div className={styles.topRow}>
                    <div className={styles.brandWrap}>
                        <Link to='/' className={styles.brand}>
                            <span className={styles.brandBadge}>Aniket&apos;s</span>
                            {' '}Blog
                        </Link>
                    </div>

                    <div className={styles.linksGrid}>
                        <div>
                            <h3 className={styles.colTitle}>ABOUT</h3>
                            <ul className={styles.linkCol}>
                                <li><a href="https://www.100jsprojects.com" target="_blank" rel="noopener noreferrer" className={styles.link}>Projects</a></li>
                                <li><Link to='/about' className={styles.link}>Aniket&apos;s Blog</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className={styles.colTitle}>FOLLOW US</h3>
                            <ul className={styles.linkCol}>
                                <li><a href="https://www.github.com/AniketAgra" target="_blank" rel="noopener noreferrer" className={styles.link}>Github</a></li>
                                <li><a href="#" className={styles.link}>Discord</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className={styles.colTitle}>LEGAL</h3>
                            <ul className={styles.linkCol}>
                                <li><a href="#" className={styles.link}>Privacy Policy</a></li>
                                <li><a href="#" className={styles.link}>Terms &amp; Conditions</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <hr className={styles.divider} />

                <div className={styles.bottomRow}>
                    <p className={styles.copyright}>
                        &copy; {year} <span className={styles.copyBrand}>Aniket&apos;s blog</span>
                    </p>
                    <div className={styles.socialRow}>
                        <a href="#" aria-label='Facebook' className={styles.iconLink}><BsFacebook/></a>
                        <a href="#" aria-label='Instagram' className={styles.iconLink}><BsInstagram/></a>
                        <a href="#" aria-label='Twitter' className={styles.iconLink}><BsTwitter/></a>
                        <a href="#" aria-label='GitHub' className={styles.iconLink}><BsGithub/></a>
                        <a href="#" aria-label='Dribbble' className={styles.iconLink}><BsDribbble/></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
