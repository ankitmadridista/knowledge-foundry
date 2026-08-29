import { useState } from "react";
import { Link } from "react-router-dom";
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/clerk-react";
import { Container } from "@/shared/components/layout";
import { NAV_LINKS } from "@/shared/data/nav-links";

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const closeMenu = () => setIsMobileMenuOpen(false);

    const renderNavLinks = (isMobile: boolean = false) => {
        const baseClasses = isMobile
            ? "block text-base font-medium text-zinc-300 transition-colors"
            : "text-sm font-medium text-zinc-400 hover:text-white transition-colors";

        return NAV_LINKS.map((link) =>
            link.isExternal ? (
                <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={baseClasses}
                    onClick={isMobile ? closeMenu : undefined}
                >
                    {link.label}
                </a>
            ) : (
                <Link
                    key={link.label}
                    to={link.href}
                    onClick={closeMenu}
                    className={baseClasses}
                >
                    {link.label}
                </Link>
            ),
        );
    };

    return (
        <header className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md">
            <Container>
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 transition-opacity hover:opacity-80"
                    >
                        <img
                            src="/favicon.svg"
                            alt="Knowledge Foundry Logo"
                            className="w-8 h-8"
                        />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                            Knowledge Foundry
                        </span>
                    </Link>

                    {/* Desktop Navigation & Auth */}
                    <div className="hidden md:flex items-center">
                        <nav className="flex items-center gap-6 pr-6 border-r border-zinc-800">
                            {renderNavLinks(false)}
                        </nav>

                        <div className="flex items-center gap-4 pl-6">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                        Log In
                                    </button>
                                </SignInButton>
                                <SignInButton mode="modal">
                                    <button className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md transition-colors shadow-sm">
                                        Get Started
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: { avatarBox: "w-8 h-8" },
                                    }}
                                />
                            </SignedIn>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            {isMobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </Container>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-zinc-800 bg-zinc-900/95 shadow-xl pb-4">
                    <Container>
                        <nav className="flex flex-col py-4 space-y-4 border-b border-zinc-800 mb-4">
                            {renderNavLinks(true)}
                        </nav>
                        <div className="flex flex-col gap-4">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="text-base font-medium text-zinc-300 text-left w-full">
                                        Log In
                                    </button>
                                </SignInButton>
                                <SignInButton mode="modal">
                                    <button className="text-base font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md transition-colors text-center w-full">
                                        Get Started
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="flex items-center gap-3">
                                    <UserButton afterSignOutUrl="/" />
                                    <span className="text-zinc-300 font-medium text-sm">
                                        Manage Account
                                    </span>
                                </div>
                            </SignedIn>
                        </div>
                    </Container>
                </div>
            )}
        </header>
    );
}
