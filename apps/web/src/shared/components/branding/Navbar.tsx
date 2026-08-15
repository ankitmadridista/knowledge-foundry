import { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/shared/components/layout";

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md">
            <Container>
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Title */}
                    <Link
                        to="/"
                        onClick={closeMenu}
                        className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-100 hover:text-white transition-colors"
                    >
                        Knowledge Foundry
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/templates"
                            className="text-sm font-medium text-zinc-400 hover:text-indigo-400 transition-colors"
                        >
                            Prompt Library
                        </Link>

                        <Link
                            to="/context-packs"
                            className="text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors"
                        >
                            Context Packs
                        </Link>

                        <a
                            href="https://github.com/ankitmadridista/knowledge-foundry"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            GitHub
                        </a>
                    </nav>

                    {/* Mobile Menu Toggle Button */}
                    <button
                        className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? (
                            // Close (X) Icon
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            // Hamburger Icon
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </Container>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-zinc-800 bg-zinc-900/95 shadow-xl">
                    <Container>
                        <nav className="flex flex-col py-4 space-y-4">
                            <Link
                                to="/templates"
                                onClick={closeMenu}
                                className="block text-base font-medium text-zinc-300 hover:text-indigo-400 transition-colors"
                            >
                                Prompt Library
                            </Link>

                            <Link
                                to="/context-packs"
                                onClick={closeMenu}
                                className="block text-base font-medium text-zinc-300 hover:text-emerald-400 transition-colors"
                            >
                                Context Packs
                            </Link>

                            <a
                                href="https://github.com/ankitmadridista/knowledge-foundry"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-base font-medium text-zinc-300 hover:text-white transition-colors"
                            >
                                GitHub
                            </a>
                        </nav>
                    </Container>
                </div>
            )}
        </header>
    );
}
