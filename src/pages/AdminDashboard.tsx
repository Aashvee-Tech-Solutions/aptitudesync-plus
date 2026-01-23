import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Users,
  BookOpen,
  FileQuestion,
  TrendingUp,
  Plus,
  Settings,
  LogOut,
  Brain,
  Shield,
  Trash2,
  Edit,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [stats, setStats] = useState({ users: 0, questions: 0, courses: 0, attempts: 0 });
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  // Question form state
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    fetchData();
    
    // Real-time subscription
    const channel = supabase
      .channel("admin-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    // Fetch categories
    const { data: cats } = await supabase.from("categories").select("*");
    if (cats) setCategories(cats);

    // Fetch questions
    const { data: qs } = await supabase.from("questions").select("*");
    if (qs) setQuestions(qs as Question[]);

    // Fetch profiles
    const { data: profs } = await supabase.from("profiles").select("*");
    if (profs) setUsers(profs);

    // Fetch user roles
    const { data: roles } = await supabase.from("user_roles").select("*");
    if (roles) setUserRoles(roles as UserRole[]);

    // Fetch stats
    const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: questionCount } = await supabase.from("questions").select("*", { count: "exact", head: true });
    const { count: courseCount } = await supabase.from("courses").select("*", { count: "exact", head: true });
    const { count: attemptCount } = await supabase.from("test_attempts").select("*", { count: "exact", head: true });
    
    setStats({
      users: userCount || 0,
      questions: questionCount || 0,
      courses: courseCount || 0,
      attempts: attemptCount || 0,
    });
  };

  const handleSaveQuestion = async () => {
    if (!questionText || !categoryId || options.some(o => !o)) {
      toast({ variant: "destructive", title: "Please fill all fields" });
      return;
    }

    const questionData = {
      question: questionText,
      options: options,
      correct_answer: correctAnswer,
      explanation: explanation || null,
      difficulty,
      category_id: categoryId,
    };

    if (editingQuestion) {
      const { error } = await supabase
        .from("questions")
        .update(questionData)
        .eq("id", editingQuestion.id);
      
      if (error) {
        toast({ variant: "destructive", title: "Error updating question" });
      } else {
        toast({ title: "Question updated successfully" });
      }
    } else {
      const { error } = await supabase.from("questions").insert([questionData]);
      
      if (error) {
        toast({ variant: "destructive", title: "Error creating question" });
      } else {
        toast({ title: "Question created successfully" });
      }
    }

    resetForm();
    setIsQuestionDialogOpen(false);
    fetchData();
  };

  const handleDeleteQuestion = async (id: string) => {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error deleting question" });
    } else {
      toast({ title: "Question deleted" });
      fetchData();
    }
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQuestionText(q.question);
    setOptions(q.options);
    setCorrectAnswer(q.correct_answer);
    setExplanation(q.explanation || "");
    setDifficulty(q.difficulty);
    setCategoryId(q.category_id);
    setIsQuestionDialogOpen(true);
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole as "admin" | "instructor" | "student" })
      .eq("user_id", userId);
    
    if (error) {
      toast({ variant: "destructive", title: "Error updating role" });
    } else {
      toast({ title: "Role updated successfully" });
      fetchData();
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
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

  const getUserRole = (userId: string) => {
    return userRoles.find(r => r.user_id === userId)?.role || "student";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">
              Aptitude<span className="text-primary">Pro</span>
            </span>
            <Badge variant="destructive" className="ml-2">
              <Shield className="w-3 h-3 mr-1" />
              Admin
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
            { label: "Questions", value: stats.questions, icon: FileQuestion, color: "text-accent" },
            { label: "Courses", value: stats.courses, icon: BookOpen, color: "text-success" },
            { label: "Test Attempts", value: stats.attempts, icon: TrendingUp, color: "text-warning" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-display font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Questions Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5" />
                Questions
              </CardTitle>
              <Dialog open={isQuestionDialogOpen} onOpenChange={(open) => { setIsQuestionDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
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
                      <Label>Options (Select the correct answer)</Label>
                      {options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct"
                            checked={correctAnswer === i}
                            onChange={() => setCorrectAnswer(i)}
                            className="w-4 h-4"
                          />
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...options];
                              newOpts[i] = e.target.value;
                              setOptions(newOpts);
                            }}
                            placeholder={`Option ${i + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label>Explanation (optional)</Label>
                      <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explain the answer..." />
                    </div>
                    <Button onClick={handleSaveQuestion} className="w-full">
                      {editingQuestion ? "Update Question" : "Create Question"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {questions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No questions yet. Add your first question!</p>
                ) : (
                  questions.map((q) => (
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
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditQuestion(q)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <Badge variant={getUserRole(user.user_id) === "admin" ? "destructive" : getUserRole(user.user_id) === "instructor" ? "default" : "secondary"}>
                        {getUserRole(user.user_id)}
                      </Badge>
                    </div>
                    <Select
                      value={getUserRole(user.user_id)}
                      onValueChange={(value: string) => handleUpdateUserRole(user.user_id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
