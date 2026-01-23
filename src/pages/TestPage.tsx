import Navbar from "@/components/Navbar";
import TestInterface from "@/components/TestInterface";

const TestPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <TestInterface />
      </main>
    </div>
  );
};

export default TestPage;
