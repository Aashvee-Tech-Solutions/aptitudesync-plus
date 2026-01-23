import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target, TrendingUp, Award, Star } from "lucide-react";

const ProgressDashboard = () => {
  const stats = {
    testsCompleted: 24,
    totalQuestions: 480,
    accuracy: 78,
    streak: 7,
    level: 12,
    xp: 2450,
    xpToNext: 3000,
  };

  const categoryProgress = [
    { name: "Quantitative", progress: 85, color: "bg-primary" },
    { name: "Logical", progress: 72, color: "bg-accent" },
    { name: "Verbal", progress: 68, color: "bg-success" },
    { name: "Data Interpretation", progress: 45, color: "bg-warning" },
  ];

  const achievements = [
    { icon: Trophy, title: "First Test", description: "Complete your first test", unlocked: true },
    { icon: Flame, title: "Week Streak", description: "7 days of practice", unlocked: true },
    { icon: Star, title: "Perfect Score", description: "Get 100% on any test", unlocked: false },
    { icon: Award, title: "Master", description: "Complete all categories", unlocked: false },
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <Badge variant="level" className="mb-4">Dashboard</Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Track Your Progress
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitor your learning journey with detailed analytics and achievements
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main stats card */}
          <Card variant="gradient" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-background/80 text-center">
                  <span className="text-3xl font-display font-bold text-foreground">{stats.testsCompleted}</span>
                  <p className="text-sm text-muted-foreground mt-1">Tests Done</p>
                </div>
                <div className="p-4 rounded-xl bg-background/80 text-center">
                  <span className="text-3xl font-display font-bold text-foreground">{stats.totalQuestions}</span>
                  <p className="text-sm text-muted-foreground mt-1">Questions</p>
                </div>
                <div className="p-4 rounded-xl bg-background/80 text-center">
                  <span className="text-3xl font-display font-bold text-primary">{stats.accuracy}%</span>
                  <p className="text-sm text-muted-foreground mt-1">Accuracy</p>
                </div>
                <div className="p-4 rounded-xl bg-background/80 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 text-accent" />
                    <span className="text-3xl font-display font-bold text-accent">{stats.streak}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
                </div>
              </div>

              {/* Category progress */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Category Progress</h4>
                {categoryProgress.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{category.name}</span>
                      <span className="text-muted-foreground">{category.progress}%</span>
                    </div>
                    <Progress value={category.progress} variant="gradient" size="sm" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Level & Achievements */}
          <div className="space-y-6">
            {/* Level card */}
            <Card variant="gradient">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Badge variant="gold" className="px-4 py-1.5 text-sm mb-4">
                    <Star className="w-4 h-4 mr-1" />
                    Level {stats.level}
                  </Badge>
                  <div className="mb-2">
                    <span className="text-2xl font-display font-bold text-foreground">
                      {stats.xp.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground"> / {stats.xpToNext.toLocaleString()} XP</span>
                  </div>
                  <Progress value={(stats.xp / stats.xpToNext) * 100} variant="gradient" size="lg" className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {stats.xpToNext - stats.xp} XP to Level {stats.level + 1}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Achievements card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-center transition-all ${
                        achievement.unlocked
                          ? "bg-primary/10 border-2 border-primary/20"
                          : "bg-muted/50 opacity-50"
                      }`}
                    >
                      <achievement.icon
                        className={`w-6 h-6 mx-auto mb-1 ${
                          achievement.unlocked ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <p className="text-xs font-semibold text-foreground">{achievement.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressDashboard;
