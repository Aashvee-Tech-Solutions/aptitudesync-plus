import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Trophy, TrendingUp } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Priya Sharma", score: 9850, tests: 48, avatar: "PS", streak: 21 },
  { rank: 2, name: "Rahul Kumar", score: 9420, tests: 45, avatar: "RK", streak: 14 },
  { rank: 3, name: "Ananya Patel", score: 9180, tests: 52, avatar: "AP", streak: 18 },
  { rank: 4, name: "Arjun Singh", score: 8950, tests: 41, avatar: "AS", streak: 10 },
  { rank: 5, name: "Meera Reddy", score: 8720, tests: 38, avatar: "MR", streak: 12 },
  { rank: 6, name: "Vikram Joshi", score: 8510, tests: 35, avatar: "VJ", streak: 8 },
  { rank: 7, name: "Sneha Gupta", score: 8340, tests: 42, avatar: "SG", streak: 15 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30";
    case 2:
      return "bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-gray-400/30";
    case 3:
      return "bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30";
    default:
      return "hover:bg-muted/50";
  }
};

const Leaderboard = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <Badge variant="level" className="mb-4">
            <Trophy className="w-3 h-3 mr-1" />
            Leaderboard
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Top Performers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compete with fellow learners and climb the ranks. Updated in real-time.
          </p>
        </div>

        <Card variant="gradient">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                This Week's Rankings
              </CardTitle>
              <Badge variant="secondary">Updated live</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {leaderboardData.map((user, index) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-4 p-4 transition-colors border-l-4 border-transparent ${getRankStyle(user.rank)} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Rank */}
                  <div className="w-10 flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.tests} tests completed</p>
                    </div>
                  </div>

                  {/* Streak badge */}
                  <Badge variant="accent" className="hidden sm:flex">
                    🔥 {user.streak} day streak
                  </Badge>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-display font-bold text-foreground">
                      {user.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Leaderboard;
