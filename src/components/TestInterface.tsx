import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
}

interface Category {
  id: string;
  name: string;
}

const TestInterface = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [category]);

  useEffect(() => {
    if (testSubmitted || loading) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testSubmitted, loading]);

  const fetchQuestions = async () => {
    if (!category) return;
    
    // Fetch category info
    const { data: catData } = await supabase
      .from("categories")
      .select("*")
      .eq("id", category)
      .maybeSingle();
    
    if (catData) {
      setCategoryInfo(catData);
    }

    // Fetch questions for this category
    const { data: questionsData } = await supabase
      .from("questions")
      .select("*")
      .eq("category_id", category)
      .limit(10);

    if (questionsData && questionsData.length > 0) {
      // Shuffle and select questions
      const shuffled = questionsData.sort(() => Math.random() - 0.5);
      setQuestions(shuffled as Question[]);
      setSelectedAnswers(new Array(shuffled.length).fill(null));
    } else {
      // Use sample questions if no questions in database
      const sampleQuestions: Question[] = [
        {
          id: "1",
          question: "If a train travels 360 km in 4 hours, what is its speed in km/h?",
          options: ["80 km/h", "90 km/h", "85 km/h", "95 km/h"],
          correct_answer: 1,
          explanation: "Speed = Distance / Time = 360 / 4 = 90 km/h",
        },
        {
          id: "2",
          question: "A shopkeeper sells an item for ₹450 with a profit of 25%. What was the cost price?",
          options: ["₹350", "₹360", "₹375", "₹400"],
          correct_answer: 1,
          explanation: "CP = SP / (1 + Profit%) = 450 / 1.25 = ₹360",
        },
        {
          id: "3",
          question: "If 8 workers can complete a job in 12 days, how many days will 6 workers take?",
          options: ["14 days", "16 days", "18 days", "15 days"],
          correct_answer: 1,
          explanation: "Work = 8 × 12 = 96 man-days. Time = 96 / 6 = 16 days",
        },
        {
          id: "4",
          question: "What is the next number in the series: 2, 6, 12, 20, 30, ?",
          options: ["40", "42", "44", "46"],
          correct_answer: 1,
          explanation: "Pattern: +4, +6, +8, +10, +12. So 30 + 12 = 42",
        },
        {
          id: "5",
          question: "A sum of money doubles itself in 10 years at simple interest. The rate of interest is:",
          options: ["8%", "10%", "12%", "15%"],
          correct_answer: 1,
          explanation: "SI = P (doubles means SI = P). Rate = (100 × SI) / (P × T) = 100/10 = 10%",
        },
      ];
      setQuestions(sampleQuestions);
      setSelectedAnswers(new Array(sampleQuestions.length).fill(null));
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = useCallback((optionIndex: number) => {
    if (testSubmitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  }, [currentQuestion, selectedAnswers, testSubmitted]);

  const handleSubmit = async () => {
    if (testSubmitted) return;
    setTestSubmitted(true);

    const score = selectedAnswers.reduce((acc, answer, index) => {
      return answer === questions[index]?.correct_answer ? acc + 1 : acc;
    }, 0);

    // Save attempt to database
    if (user && category) {
      const { error } = await supabase.from("test_attempts").insert([{
        user_id: user.id,
        category_id: category,
        score: score,
        total_questions: questions.length,
        time_taken_seconds: 30 * 60 - timeLeft,
        answers: selectedAnswers,
      }]);

      if (error) {
        console.error("Error saving attempt:", error);
      } else {
        toast({
          title: "Test Completed!",
          description: `You scored ${score} out of ${questions.length}`,
        });
      }
    }
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return answer === questions[index]?.correct_answer ? score + 1 : score;
    }, 0);
  };

  const getOptionStyle = (optionIndex: number) => {
    if (!testSubmitted) {
      return selectedAnswers[currentQuestion] === optionIndex
        ? "border-primary bg-primary/10 ring-2 ring-primary"
        : "border-border hover:border-primary/50 hover:bg-muted/50";
    }

    const isCorrect = optionIndex === questions[currentQuestion]?.correct_answer;
    const isSelected = selectedAnswers[currentQuestion] === optionIndex;

    if (isCorrect) return "border-success bg-success/10";
    if (isSelected && !isCorrect) return "border-destructive bg-destructive/10";
    return "border-border opacity-50";
  };

  const answeredCount = selectedAnswers.filter((a) => a !== null).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto pt-32 px-4 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">No Questions Available</h1>
          <p className="text-muted-foreground mb-6">There are no questions in this category yet.</p>
          <Button onClick={() => navigate("/tests")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container max-w-4xl mx-auto pt-24 pb-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/tests")} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {categoryInfo?.name || "Aptitude Test"}
            </h1>
            <p className="text-muted-foreground text-sm">{questions.length} Questions</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant={timeLeft < 300 ? "destructive" : "secondary"}
              className="px-4 py-2 text-base font-mono"
            >
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeLeft)}
            </Badge>
            {!testSubmitted && (
              <Button variant="hero" onClick={handleSubmit}>
                <Flag className="w-4 h-4 mr-2" />
                Submit
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {answeredCount} of {questions.length} answered
              </span>
              <span className="font-semibold text-foreground">
                {Math.round((answeredCount / questions.length) * 100)}%
              </span>
            </div>
            <Progress value={(answeredCount / questions.length) * 100} variant="gradient" size="sm" />
          </CardContent>
        </Card>

        {/* Results */}
        {testSubmitted && (
          <Card variant="gradient" className="mb-6 animate-scale-in">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/20">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground">Test Completed!</h3>
                    <p className="text-muted-foreground">
                      You scored {calculateScore()} out of {questions.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center px-4 py-2 rounded-lg bg-success/10">
                    <span className="text-2xl font-display font-bold text-success">{calculateScore()}</span>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-lg bg-destructive/10">
                    <span className="text-2xl font-display font-bold text-destructive">
                      {questions.length - calculateScore()}
                    </span>
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-lg bg-primary/10">
                    <span className="text-2xl font-display font-bold text-primary">
                      {Math.round((calculateScore() / questions.length) * 100)}%
                    </span>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="level">Question {currentQuestion + 1}</Badge>
              {testSubmitted && (
                <Button variant="ghost" size="sm" onClick={() => setShowExplanation(!showExplanation)}>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {showExplanation ? "Hide" : "Show"} Explanation
                </Button>
              )}
            </div>
            <CardTitle className="text-lg mt-4 font-normal leading-relaxed">
              {questions[currentQuestion]?.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {questions[currentQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={testSubmitted}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${getOptionStyle(index)}`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-foreground">{option}</span>
                  {testSubmitted && index === questions[currentQuestion]?.correct_answer && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                  {testSubmitted &&
                    selectedAnswers[currentQuestion] === index &&
                    index !== questions[currentQuestion]?.correct_answer && (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                </button>
              ))}
            </div>

            {testSubmitted && showExplanation && questions[currentQuestion]?.explanation && (
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Explanation
                </h4>
                <p className="text-muted-foreground">{questions[currentQuestion].explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                  index === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : selectedAnswers[index] !== null
                    ? testSubmitted
                      ? selectedAnswers[index] === questions[index]?.correct_answer
                        ? "bg-success/20 text-success"
                        : "bg-destructive/20 text-destructive"
                      : "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentQuestion === questions.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestInterface;
