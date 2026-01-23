import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const learningModules = [
  {
    id: 1,
    title: "Number Systems & HCF/LCM",
    category: "Quantitative",
    lessons: 8,
    completed: 5,
    duration: "2 hours",
    description: "Master the fundamentals of number systems, HCF, LCM, and divisibility rules.",
  },
  {
    id: 2,
    title: "Percentage & Profit/Loss",
    category: "Quantitative",
    lessons: 10,
    completed: 3,
    duration: "2.5 hours",
    description: "Learn to solve percentage, profit, loss, and discount problems with ease.",
  },
  {
    id: 3,
    title: "Logical Patterns & Series",
    category: "Logical",
    lessons: 6,
    completed: 6,
    duration: "1.5 hours",
    description: "Decode number series, letter series, and complex logical patterns.",
  },
  {
    id: 4,
    title: "Reading Comprehension Mastery",
    category: "Verbal",
    lessons: 12,
    completed: 0,
    duration: "3 hours",
    description: "Develop strategies for quick and accurate reading comprehension.",
  },
  {
    id: 5,
    title: "Data Analysis Techniques",
    category: "Data Interpretation",
    lessons: 8,
    completed: 2,
    duration: "2 hours",
    description: "Learn to interpret charts, graphs, tables, and complex data sets.",
  },
  {
    id: 6,
    title: "Time, Speed & Distance",
    category: "Quantitative",
    lessons: 7,
    completed: 0,
    duration: "2 hours",
    description: "Master problems involving trains, boats, and relative motion.",
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Quantitative":
      return "bg-primary text-primary-foreground";
    case "Logical":
      return "bg-accent text-accent-foreground";
    case "Verbal":
      return "bg-success text-success-foreground";
    case "Data Interpretation":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const Learn = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="level" className="mb-4">
              <BookOpen className="w-3 h-3 mr-1" />
              Learning Center
            </Badge>
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">
              Learn & Improve
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Structured learning modules with video tutorials, practice exercises, and detailed explanations.
            </p>
          </div>

          {/* Modules grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningModules.map((module, index) => (
              <Card 
                key={module.id} 
                variant="interactive"
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(module.category)}>
                      {module.category}
                    </Badge>
                    {module.completed === module.lessons && (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        {module.completed} of {module.lessons} lessons
                      </span>
                      <span className="font-semibold text-foreground">
                        {Math.round((module.completed / module.lessons) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(module.completed / module.lessons) * 100} 
                      variant="gradient" 
                      size="sm" 
                    />
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{module.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{module.duration}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <Button className="w-full" asChild>
                    <Link to={`/learn/${module.id}`}>
                      {module.completed === 0 ? (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Start Learning
                        </>
                      ) : module.completed === module.lessons ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Review
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;
