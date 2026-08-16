import { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/shared/components/layout";
import { NAV_LINKS } from "@/shared/data/nav-links";

// --- Main Component ---
export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const closeMenu = () => setIsMobileMenuOpen(false);

    // Helper function to render links consistently
    const renderNavLinks = (isMobile: boolean = false) => {
        const baseClasses = isMobile 
            ? "block text-base font-medium text-zinc-300 transition-colors" 
            : "text-sm font-medium text-zinc-400 transition-colors";

        return NAV_LINKS.map((link) => {
            const className = `${baseClasses} ${link.hoverClass}`;

            return link.isExternal ? (
                <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    onClick={isMobile ? closeMenu : undefined}
                >
                    {link.label}
                </a>
            ) : (
                <Link
                    key={link.label}
                    to={link.href}
                    onClick={closeMenu}
                    className={className}
                >
                    {link.label}
                </Link>
            );
        });
    };

    return (
        <header className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md">
            <Container>
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Title */}
                    <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                        <img 
                            src="/favicon.svg" 
                            alt="Knowledge Foundry Logo" 
                            className="w-8 h-8" 
                        />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                            Knowledge Foundry
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {renderNavLinks(false)}
                    </nav>

                    {/* Mobile Menu Toggle Button */}
                    <button
                        className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            )}
                        </svg>
                    </button>
                </div>
            </Container>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-zinc-800 bg-zinc-900/95 shadow-xl">
                    <Container>
                        <nav className="flex flex-col py-4 space-y-4">
                            {renderNavLinks(true)}
                        </nav>
                    </Container>
                </div>
            )}
        </header>
    );
}