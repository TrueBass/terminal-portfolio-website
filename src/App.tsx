import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="flex h-full flex-col bg-bg">
      <Header />

      <main className="grid min-h-0 flex-1 place-items-center p-4 sm:p-6 lg:p-8">
        <p className="font-mono text-sm text-muted">terminal coming online…</p>
      </main>

      <Footer />
    </div>
  );
}
