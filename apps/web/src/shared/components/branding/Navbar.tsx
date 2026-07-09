import { Container } from "@/shared/components/layout";

export function Navbar() {
  return (
    <header className="border-b border-zinc-800">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-100">
            Knowledge Foundry
          </h1>

          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-400 hover:text-white">
              Features
            </a>

            <a href="#" className="text-sm text-zinc-400 hover:text-white">
              Architecture
            </a>

            <a href="#" className="text-sm text-zinc-400 hover:text-white">
              GitHub
            </a>
          </nav>
        </div>
      </Container>
    </header>
  );
}