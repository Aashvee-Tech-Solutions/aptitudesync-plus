import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Lightbulb, MessageSquare, BarChart3, ArrowRight, Clock, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: "quantitative",
    title: "Quantitative Aptitude",
    description: "Master numbers, percentages, ratios, and mathematical problem-solving",
    icon: Calculator,
    questions: 2500,
    duration: "45 mins",
    color: "bg-primary",
    difficulty: "All Levels",
  },
  {
    id: "logical",
    title: "Logical Reasoning",
    description: "Develop critical thinking with puzzles, patterns, and deductions",
    icon: Lightbulb,
    questions: 1800,
    duration: "40 mins",
    color: "bg-accent",
    difficulty: "All Levels",
  },
  {
    id: "verbal",
    title: "Verbal Ability",
    description: "Enhance vocabulary, grammar, reading comprehension, and communication",
    icon: MessageSquare,
    questions: 2000,
    duration: "35 mins",
    color: "bg-success",
    difficulty: "All Levels",
  },
  {
    id: "data",
    title: "Data Interpretation",
    description: "Analyze charts, graphs, tables, and complex data sets",
    icon: BarChart3,
    questions: 1500,
    duration: "50 mins",
    color: "bg-warning",
    difficulty: "All Levels",
  },
];

const TestCategories = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <Badge variant="level" className="mb-4">Test Categories</Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive test categories covering all major aptitude areas. Start with any category and track your progress over time.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={category.id} 
              variant="interactive"
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${category.color} text-white shadow-lg`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary">{category.difficulty}</Badge>
                </div>
                <CardTitle className="mt-4 group-hover:text-primary transition-colors">
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5">
                    <FileQuestion className="w-4 h-4" />
                    <span>{category.questions.toLocaleString()} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{category.duration}</span>
                  </div>
                </div>
                <Button className="w-full group-hover:shadow-lg transition-shadow" asChild>
                  <Link to={`/test/${category.id}`}>
                    Start Test
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestCategories;
