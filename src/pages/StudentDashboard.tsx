import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  LogOut,
  Trophy,
  Flame,
  Target,
  BookOpen,
  Play,
  Star,
  TrendingUp,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CourseDisplay from "@/components/CourseDisplay";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
}

interface TestAttempt {
  id: string;
  category_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  earned_at: string;
}

const StudentDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    testsCompleted: 0,
    totalQuestions: 0,
    averageScore: 0,
    streak: 0,
    level: 1,
    xp: 0,
  });

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel("student-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "test_attempts" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "achievements" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "module_progress" }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchData = async () => {
    // Fetch categories
    const { data: cats } = await supabase.from("categories").select("*");
    if (cats) setCategories(cats);

    // Fetch user's attempts
    const { data: att } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("user_id", user?.id)
      .order("completed_at", { ascending: false });
    if (att) {
      setAttempts(att);
      
      // Calculate stats
      const testsCompleted = att.length;
      const totalQuestions = att.reduce((sum, a) => sum + a.total_questions, 0);
      const totalScore = att.reduce((sum, a) => sum + a.score, 0);
      const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
      const xp = totalScore * 10;
      const level = Math.floor(xp / 500) + 1;
      
      setStats({
        testsCompleted,
        totalQuestions,
        averageScore,
        streak: calculateStreak(att),
        level,
        xp,
      });
    }

    // Fetch achievements
    const { data: ach } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user?.id);
    if (ach) setAchievements(ach);
  };

  const calculateStreak = (attempts: TestAttempt[]) => {
    if (attempts.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attemptDates = attempts.map(a => {
      const date = new Date(a.completed_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    
    const uniqueDates = [...new Set(attemptDates)].sort((a, b) => b - a);
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      
      if (uniqueDates[i] === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getCategoryStats = (categoryId: string) => {
    const categoryAttempts = attempts.filter(a => a.category_id === categoryId);
    if (categoryAttempts.length === 0) return { attempts: 0, bestScore: 0 };
    
    const bestScore = Math.max(...categoryAttempts.map(a => Math.round((a.score / a.total_questions) * 100)));
    return { attempts: categoryAttempts.length, bestScore };
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">
              Aptitude<span className="text-primary">Pro</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Star className="w-3 h-3 mr-1" />
              Level {stats.level}
            </Badge>
            <span className="text-sm text-muted-foreground hidden sm:block">
              Hi, <strong>{profile?.full_name}</strong>
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome & Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold mb-2">Welcome back, {profile?.full_name?.split(" ")[0]}! 👋</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tests Completed</p>
                  <p className="text-3xl font-display font-bold">{stats.testsCompleted}</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                  <p className="text-3xl font-display font-bold">{stats.averageScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                  <p className="text-3xl font-display font-bold text-accent">{stats.streak}</p>
                </div>
                <Flame className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-3xl font-display font-bold">{stats.xp}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary"><Star className="w-3 h-3 mr-1" />Level {stats.level}</Badge>
                <span className="text-sm text-muted-foreground">{stats.xp} XP</span>
              </div>
              <span className="text-sm text-muted-foreground">{500 - (stats.xp % 500)} XP to Level {stats.level + 1}</span>
            </div>
            <Progress value={(stats.xp % 500) / 5} />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="tests" className="gap-2">
              <Target className="w-4 h-4" />
              Practice Tests
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Test Categories */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Take a Test
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const catStats = getCategoryStats(category.id);
                    return (
                      <Card key={category.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            {catStats.bestScore > 0 && (
                              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                                Best: {catStats.bestScore}%
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold mb-1">{category.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{category.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{catStats.attempts} attempts</span>
                            <Button size="sm" asChild>
                              <Link to={`/test/${category.id}`}>
                                <Play className="w-3 h-3 mr-1" />
                                Start
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attempts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No tests taken yet</p>
                    ) : (
                      <div className="space-y-3">
                        {attempts.slice(0, 5).map((attempt) => {
                          const category = categories.find(c => c.id === attempt.category_id);
                          const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
                          return (
                            <div key={attempt.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div>
                                <p className="text-sm font-medium">{category?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(attempt.completed_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"} 
                                     className={percentage >= 70 ? "bg-green-500/10 text-green-600" : ""}>
                                {percentage}%
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <CourseDisplay />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
