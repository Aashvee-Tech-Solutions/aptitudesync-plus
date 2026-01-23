import Navbar from "@/components/Navbar";
import Leaderboard from "@/components/Leaderboard";
import Footer from "@/components/Footer";

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <Leaderboard />
      </main>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
