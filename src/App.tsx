import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Terminal } from "./components/terminal/Terminal";

export default function App() {
  return (
    <div className="flex h-full flex-col bg-bg">
      <Header />

      <main className="grid min-h-0 flex-1 p-4 sm:p-6 lg:p-8">
        <section className="min-h-[60vh] lg:min-h-0">
          <Terminal />
        </section>
      </main>

      <Footer />
    </div>
  );
}
