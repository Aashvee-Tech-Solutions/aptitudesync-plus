import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "If a train travels 360 km in 4 hours, what is its speed in km/h?",
    options: ["80 km/h", "90 km/h", "85 km/h", "95 km/h"],
    correct: 1,
    explanation: "Speed = Distance / Time = 360 / 4 = 90 km/h",
  },
  {
    id: 2,
    question: "A shopkeeper sells an item for ₹450 with a profit of 25%. What was the cost price?",
    options: ["₹350", "₹360", "₹375", "₹400"],
    correct: 1,
    explanation: "CP = SP / (1 + Profit%) = 450 / 1.25 = ₹360",
  },
  {
    id: 3,
    question: "If 8 workers can complete a job in 12 days, how many days will 6 workers take?",
    options: ["14 days", "16 days", "18 days", "15 days"],
    correct: 1,
    explanation: "Work = 8 × 12 = 96 man-days. Time = 96 / 6 = 16 days",
  },
  {
    id: 4,
    question: "What is the next number in the series: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correct: 1,
    explanation: "Pattern: +4, +6, +8, +10, +12. So 30 + 12 = 42",
  },
  {
    id: 5,
    question: "A sum of money doubles itself in 10 years at simple interest. The rate of interest is:",
    options: ["8%", "10%", "12%", "15%"],
    correct: 1,
    explanation: "SI = P (doubles means SI = P). Rate = (100 × SI) / (P × T) = 100/10 = 10%",
  },
];

const TestInterface = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(sampleQuestions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Timer
  useEffect(() => {
    if (testSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTestSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testSubmitted]);

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

  const handleSubmit = () => {
    setTestSubmitted(true);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return answer === sampleQuestions[index].correct ? score + 1 : score;
    }, 0);
  };

  const getOptionStyle = (optionIndex: number) => {
    if (!testSubmitted) {
      return selectedAnswers[currentQuestion] === optionIndex
        ? "border-primary bg-primary/10 ring-2 ring-primary"
        : "border-border hover:border-primary/50 hover:bg-muted/50";
    }

    const isCorrect = optionIndex === sampleQuestions[currentQuestion].correct;
    const isSelected = selectedAnswers[currentQuestion] === optionIndex;

    if (isCorrect) return "border-success bg-success/10";
    if (isSelected && !isCorrect) return "border-destructive bg-destructive/10";
    return "border-border opacity-50";
  };

  const answeredCount = selectedAnswers.filter((a) => a !== null).length;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Quantitative Aptitude</h1>
            <p className="text-muted-foreground text-sm">Practice Test • {sampleQuestions.length} Questions</p>
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
                Submit Test
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Progress: {answeredCount} of {sampleQuestions.length} answered
              </span>
              <span className="font-semibold text-foreground">
                {Math.round((answeredCount / sampleQuestions.length) * 100)}%
              </span>
            </div>
            <Progress value={(answeredCount / sampleQuestions.length) * 100} variant="gradient" size="sm" />
          </CardContent>
        </Card>

        {/* Results banner */}
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
                    <p className="text-muted-foreground">You scored {calculateScore()} out of {sampleQuestions.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center px-4 py-2 rounded-lg bg-success/10">
                    <span className="text-2xl font-display font-bold text-success">{calculateScore()}</span>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-lg bg-destructive/10">
                    <span className="text-2xl font-display font-bold text-destructive">
                      {sampleQuestions.length - calculateScore()}
                    </span>
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-lg bg-primary/10">
                    <span className="text-2xl font-display font-bold text-primary">
                      {Math.round((calculateScore() / sampleQuestions.length) * 100)}%
                    </span>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="level">Question {currentQuestion + 1}</Badge>
              {testSubmitted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {showExplanation ? "Hide" : "Show"} Explanation
                </Button>
              )}
            </div>
            <CardTitle className="text-lg mt-4 font-normal leading-relaxed">
              {sampleQuestions[currentQuestion].question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {sampleQuestions[currentQuestion].options.map((option, index) => (
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
                  {testSubmitted && index === sampleQuestions[currentQuestion].correct && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                  {testSubmitted &&
                    selectedAnswers[currentQuestion] === index &&
                    index !== sampleQuestions[currentQuestion].correct && (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {testSubmitted && showExplanation && (
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Explanation
                </h4>
                <p className="text-muted-foreground">{sampleQuestions[currentQuestion].explanation}</p>
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

          {/* Question dots */}
          <div className="hidden sm:flex items-center gap-2">
            {sampleQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                  index === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : selectedAnswers[index] !== null
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.min(sampleQuestions.length - 1, prev + 1))}
            disabled={currentQuestion === sampleQuestions.length - 1}
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
