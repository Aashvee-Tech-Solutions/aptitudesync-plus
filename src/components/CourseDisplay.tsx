import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Layers,
  Video,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  order_index: number;
  level: number;
  duration_minutes: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  published: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

interface ModuleProgress {
  module_id: string;
  completed: boolean;
  progress_percent: number;
}

interface CourseProgress {
  course_id: string;
  completed: boolean;
  progress_percent: number;
}

const CourseDisplay = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isModuleViewOpen, setIsModuleViewOpen] = useState(false);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("course-display")
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "modules" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "module_progress" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchData = async () => {
    const { data: cats } = await supabase.from("categories").select("*");
    if (cats) setCategories(cats);

    const { data: crs } = await supabase.from("courses").select("*").eq("published", true);
    if (crs) setCourses(crs as Course[]);

    const { data: mods } = await supabase.from("modules").select("*").order("level").order("order_index");
    if (mods) setModules(mods as Module[]);

    if (user) {
      const { data: modProg } = await supabase.from("module_progress").select("*").eq("user_id", user.id);
      if (modProg) setModuleProgress(modProg as ModuleProgress[]);

      const { data: crsProg } = await supabase.from("course_progress").select("*").eq("user_id", user.id);
      if (crsProg) setCourseProgress(crsProg as CourseProgress[]);
    }
  };

  const getCourseModules = (courseId: string) => {
    return modules.filter(m => m.course_id === courseId);
  };

  const getModulesByLevel = (courseId: string) => {
    const courseModules = getCourseModules(courseId);
    const grouped: { [key: number]: Module[] } = {};
    courseModules.forEach(m => {
      if (!grouped[m.level]) grouped[m.level] = [];
      grouped[m.level].push(m);
    });
    return grouped;
  };

  const isModuleCompleted = (moduleId: string) => {
    return moduleProgress.find(p => p.module_id === moduleId)?.completed || false;
  };

  const getCourseProgressPercent = (courseId: string) => {
    const courseModules = getCourseModules(courseId);
    if (courseModules.length === 0) return 0;
    const completedCount = courseModules.filter(m => isModuleCompleted(m.id)).length;
    return Math.round((completedCount / courseModules.length) * 100);
  };

  const handleOpenModule = (module: Module) => {
    setSelectedModule(module);
    setIsModuleViewOpen(true);
  };

  const handleMarkComplete = async (moduleId: string) => {
    if (!user) return;

    const existing = moduleProgress.find(p => p.module_id === moduleId);
    
    if (existing) {
      const { error } = await supabase
        .from("module_progress")
        .update({ completed: true, progress_percent: 100, last_accessed: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("module_id", moduleId);
      
      if (error) {
        toast({ variant: "destructive", title: "Error updating progress" });
        return;
      }
    } else {
      const { error } = await supabase
        .from("module_progress")
        .insert([{ user_id: user.id, module_id: moduleId, completed: true, progress_percent: 100 }]);
      
      if (error) {
        toast({ variant: "destructive", title: "Error saving progress" });
        return;
      }
    }

    toast({ title: "Module marked as complete!" });
    fetchData();
    setIsModuleViewOpen(false);
  };

  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return "Beginner";
      case 2: return "Elementary";
      case 3: return "Intermediate";
      case 4: return "Advanced";
      case 5: return "Expert";
      default: return `Level ${level}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module View Dialog */}
      <Dialog open={isModuleViewOpen} onOpenChange={setIsModuleViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedModule && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Level {selectedModule.level}</Badge>
                  <Badge variant="secondary">{selectedModule.duration_minutes} mins</Badge>
                </div>
                <DialogTitle className="text-xl">{selectedModule.title}</DialogTitle>
                {selectedModule.description && (
                  <p className="text-muted-foreground">{selectedModule.description}</p>
                )}
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                {selectedModule.video_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      src={selectedModule.video_url.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allowFullScreen
                      title={selectedModule.title}
                    />
                  </div>
                )}
                
                {selectedModule.content && (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                      {selectedModule.content}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {isModuleCompleted(selectedModule.id) ? (
                    <Button disabled className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </Button>
                  ) : (
                    <Button onClick={() => handleMarkComplete(selectedModule.id)} className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Available Courses
        </h2>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No courses available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => {
            const modulesByLevel = getModulesByLevel(course.id);
            const levels = Object.keys(modulesByLevel).map(Number).sort((a, b) => a - b);
            const totalModules = getCourseModules(course.id).length;
            const progressPercent = getCourseProgressPercent(course.id);
            const category = categories.find(c => c.id === course.category_id);

            return (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {category && (
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {category.name}
                        </Badge>
                      )}
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="mt-1">{course.description || "No description"}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration_minutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {totalModules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      {levels.length} levels
                    </span>
                  </div>

                  {user && totalModules > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}
                </CardHeader>

                {totalModules > 0 && (
                  <CardContent className="pt-0">
                    <Accordion type="multiple" className="w-full">
                      {levels.map((level) => {
                        const levelModules = modulesByLevel[level];
                        const completedInLevel = levelModules.filter(m => isModuleCompleted(m.id)).length;

                        return (
                          <AccordionItem key={level} value={`level-${level}`}>
                            <AccordionTrigger className="py-2 hover:no-underline">
                              <div className="flex items-center gap-2 flex-1">
                                <Badge variant="outline" className="text-xs">L{level}</Badge>
                                <span className="text-sm font-medium">{getLevelName(level)}</span>
                                <span className="text-xs text-muted-foreground ml-auto mr-4">
                                  {completedInLevel}/{levelModules.length}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-1">
                                {levelModules
                                  .sort((a, b) => a.order_index - b.order_index)
                                  .map((module) => {
                                    const completed = isModuleCompleted(module.id);
                                    return (
                                      <button
                                        key={module.id}
                                        onClick={() => handleOpenModule(module)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                      >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completed ? "bg-green-500/10 text-green-600" : "bg-muted"}`}>
                                          {completed ? (
                                            <CheckCircle className="w-4 h-4" />
                                          ) : module.video_url ? (
                                            <Video className="w-3 h-3" />
                                          ) : (
                                            <FileText className="w-3 h-3" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-sm truncate ${completed ? "text-muted-foreground line-through" : ""}`}>
                                            {module.title}
                                          </p>
                                          <p className="text-xs text-muted-foreground">{module.duration_minutes} mins</p>
                                        </div>
                                        <Play className="w-4 h-4 text-muted-foreground" />
                                      </button>
                                    );
                                  })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseDisplay;
