import { useState } from 'react'

export default function Header({ onSignIn }) {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className="site-header">
            <a className="brand" href="#home" aria-label="GreenGoals home">
                <span className="brand-mark">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z" />
                        <path d="M4 20c3-5 7-8 12-10" />
                    </svg>
                </span>
                <span>green<span>goals</span></span>
            </a>
            <button className="mobile-menu-trigger landing-menu-trigger" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
                <span aria-hidden="true">☰</span>
            </button>
            <nav className={`landing-nav${menuOpen ? ' landing-nav-open' : ''}`} aria-label="Main navigation">
                <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
                <a href="#community" onClick={() => setMenuOpen(false)}>Our community</a>
            </nav>
            <button className="button button-dark header-sign-in" type="button" onClick={onSignIn}>
                Sign in <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
        </header>
    )
}