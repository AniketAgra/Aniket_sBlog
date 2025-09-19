import { Footer } from "flowbite-react";
import {Link} from 'react-router-dom';
import {BsFacebook, BsInstagram, BsTwitter, BsGithub, BsDribbble} from 'react-icons/bs';
import styles from '../styles/components/Footer.module.css';

export default function FooterComponent() {
    return (
        <Footer container className={styles.footerRoot}>
                <div className={styles.container}>
                        <div className="grid w-full justify-between sm:flex md:grid-cols-1">
                                <div className="mt-5">
                    <Link
                                                to='/'
                                                className={styles.brand}
                    >
                                                <span className={styles.brandBadge}>
                            Aniket&apos;s
                        </span>
                        Blog
                    </Link>
                </div>
                                <div className={`${styles.linksGrid} mt-4`}>
                    <div>
                        <Footer.Title title="About"/>
                        <Footer.LinkGroup col>
                            <Footer.Link href="https://www.100jsprojects.com" target="_blank" rel="noopener noreferrer">
                                Projects
                            </Footer.Link>

                            <Footer.Link href="/about" target="_blank" rel="noopener noreferrer">
                                Aniket&apos;s Blog
                            </Footer.Link>
                        </Footer.LinkGroup>
                    </div>
                    <div>
                        <Footer.Title title="Follow us"/>
                        <Footer.LinkGroup col>
                            <Footer.Link href="https://www.github.com/AniketAgra" target="_blank" rel="noopener noreferrer">
                                Github
                            </Footer.Link>

                            <Footer.Link href="" target="_blank" rel="noopener noreferrer">
                                Discord
                            </Footer.Link>
                        </Footer.LinkGroup>
                    </div>
                    <div>
                        <Footer.Title title="Legal"/>
                        <Footer.LinkGroup col>
                            <Footer.Link href="#" target="_blank" rel="noopener noreferrer">
                                Privacy Policy
                            </Footer.Link>

                            <Footer.Link href="#" target="_blank" rel="noopener noreferrer">
                                Terms &amp; Conditions
                            </Footer.Link>
                        </Footer.LinkGroup>
                    </div>
                </div>
            </div>
            <Footer.Divider/>
            <div className={styles.responsiveRow}>
                <Footer.Copyright href="#" by="Aniket's blog" year={new Date().getFullYear()}/>

                <div className={`${styles.socialRow} sm:mt-0 mt-4 sm:justify-center`}>
                    <Footer.Icon href="#" icon={BsFacebook}/>
                    <Footer.Icon href="#" icon={BsInstagram}/>
                    <Footer.Icon href="#" icon={BsTwitter}/>
                    <Footer.Icon href="#" icon={BsGithub}/>
                    <Footer.Icon href="#" icon={BsDribbble}/>
                </div>
            </div>
        </div>
    </Footer>
  )
}
