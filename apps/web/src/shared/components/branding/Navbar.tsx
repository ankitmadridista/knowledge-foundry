import { Container } from "@/shared/components/layout";

export function Navbar() {
    return (
        <header className="border-b border-zinc-800">
            <Container>
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                        Knowledge Foundry
                    </h1>

                    <nav className="flex items-center gap-6">
                        <a
                            href="#"
                            className="text-sm text-zinc-400 hover:text-white"
                        >
                            Features
                        </a>

                        <a
                            href="#"
                            className="text-sm text-zinc-400 hover:text-white"
                        >
                            Architecture
                        </a>

                        <a
                            href="#"
                            className="text-sm text-zinc-400 hover:text-white"
                        >
                            GitHub
                        </a>
                    </nav>
                </div>
            </Container>
        </header>
    );
}
