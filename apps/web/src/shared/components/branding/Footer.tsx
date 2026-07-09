import { Container } from "@/shared/components/layout";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8">
      <Container>
        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} Knowledge Foundry
        </p>
      </Container>
    </footer>
  );
}