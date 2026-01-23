import Navbar from "@/components/Navbar";
import TestCategories from "@/components/TestCategories";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

const Tests = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="level" className="mb-4">All Tests</Badge>
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">
              Choose Your Test
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select from our comprehensive range of aptitude tests. Each test is designed to challenge and improve your skills.
            </p>
          </div>
        </div>
        <TestCategories />
      </main>
      <Footer />
    </div>
  );
};

export default Tests;
