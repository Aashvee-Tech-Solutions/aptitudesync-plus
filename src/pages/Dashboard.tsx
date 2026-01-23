import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role) {
      switch (role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "instructor":
          navigate("/instructor", { replace: true });
          break;
        case "student":
        default:
          navigate("/student", { replace: true });
          break;
      }
    }
  }, [role, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
