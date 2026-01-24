import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  FileQuestion,
  Plus,
  LogOut,
  Brain,
  GraduationCap,
  Eye,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CourseManagement from "@/components/CourseManagement";

interface Category {
  id: string;
  name: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: string;
  category_id: string;
}

interface Course {
  id: string;
  published: boolean;
}

const InstructorDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

  // Question form
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel("instructor-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "modules" }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchData = async () => {
    const { data: cats } = await supabase.from("categories").select("*");
    if (cats) setCategories(cats);

    const { data: crs } = await supabase
      .from("courses")
      .select("id, published")
      .eq("instructor_id", user?.id);
    if (crs) setCourses(crs as Course[]);

    const { data: qs } = await supabase.from("questions").select("*").eq("created_by", user?.id);
    if (qs) setQuestions(qs as Question[]);
  };

  const handleSaveQuestion = async () => {
    if (!questionText || !categoryId || options.some(o => !o)) {
      toast({ variant: "destructive", title: "Please fill all fields" });
      return;
    }

    const { error } = await supabase.from("questions").insert([{
      question: questionText,
      options: options,
      correct_answer: correctAnswer,
      explanation: explanation || null,
      difficulty,
      category_id: categoryId,
      created_by: user?.id,
    }]);

    if (error) {
      toast({ variant: "destructive", title: "Error creating question" });
    } else {
      toast({ title: "Question created successfully" });
    }

    resetQuestionForm();
    setIsQuestionDialogOpen(false);
    fetchData();
  };

  const resetQuestionForm = () => {
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setExplanation("");
    setDifficulty("medium");
    setCategoryId("");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
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
            <Badge className="ml-2">
              <GraduationCap className="w-3 h-3 mr-1" />
              Instructor
            </Badge>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <strong>{profile?.full_name}</strong>
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Courses</p>
                  <p className="text-3xl font-display font-bold">{courses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-3xl font-display font-bold">{courses.filter(c => c.published).length}</p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Questions</p>
                  <p className="text-3xl font-display font-bold">{questions.length}</p>
                </div>
                <FileQuestion className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Courses & Modules
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <FileQuestion className="w-4 h-4" />
              Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileQuestion className="w-5 h-5" />
                  My Questions
                </CardTitle>
                <Dialog open={isQuestionDialogOpen} onOpenChange={(open) => { setIsQuestionDialogOpen(open); if (!open) resetQuestionForm(); }}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Question</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Difficulty</Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Question</Label>
                        <Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Enter the question..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input type="radio" name="correct" checked={correctAnswer === i} onChange={() => setCorrectAnswer(i)} className="w-4 h-4" />
                            <Input value={opt} onChange={(e) => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }} placeholder={`Option ${i + 1}`} />
                          </div>
                        ))}
                      </div>
                      <div>
                        <Label>Explanation</Label>
                        <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explain the answer..." />
                      </div>
                      <Button onClick={handleSaveQuestion} className="w-full">Create Question</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No questions created yet. Add your first question!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {questions.map((q) => (
                      <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{q.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{q.difficulty}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {categories.find(c => c.id === q.category_id)?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InstructorDashboard;
