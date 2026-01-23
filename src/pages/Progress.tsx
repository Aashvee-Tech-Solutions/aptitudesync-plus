import Navbar from "@/components/Navbar";
import ProgressDashboard from "@/components/ProgressDashboard";
import Footer from "@/components/Footer";

const Progress = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <ProgressDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Progress;
