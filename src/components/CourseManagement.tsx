import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Layers,
  GripVertical,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
  instructor_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  isAdmin?: boolean;
}

const CourseManagement = ({ isAdmin = false }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Course form
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseContent, setCourseContent] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseDuration, setCourseDuration] = useState(30);
  const [coursePublished, setCoursePublished] = useState(false);

  // Module form
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleContent, setModuleContent] = useState("");
  const [moduleVideoUrl, setModuleVideoUrl] = useState("");
  const [moduleLevel, setModuleLevel] = useState(1);
  const [moduleDuration, setModuleDuration] = useState(15);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("course-management")
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "modules" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  const fetchData = async () => {
    const { data: cats } = await supabase.from("categories").select("*");
    if (cats) setCategories(cats);

    let courseQuery = supabase.from("courses").select("*");
    if (!isAdmin && user) {
      courseQuery = courseQuery.eq("instructor_id", user.id);
    }
    const { data: crs } = await courseQuery;
    if (crs) setCourses(crs as Course[]);

    const { data: mods } = await supabase.from("modules").select("*").order("level").order("order_index");
    if (mods) setModules(mods as Module[]);
  };

  const handleSaveCourse = async () => {
    if (!courseTitle) {
      toast({ variant: "destructive", title: "Please enter a course title" });
      return;
    }

    const courseData = {
      title: courseTitle,
      description: courseDescription || null,
      content: courseContent || null,
      category_id: courseCategory || null,
      duration_minutes: courseDuration,
      published: coursePublished,
      instructor_id: editingCourse?.instructor_id || user?.id,
    };

    if (editingCourse) {
      const { error } = await supabase.from("courses").update(courseData).eq("id", editingCourse.id);
      if (error) {
        toast({ variant: "destructive", title: "Error updating course" });
      } else {
        toast({ title: "Course updated successfully" });
      }
    } else {
      const { error } = await supabase.from("courses").insert([courseData]);
      if (error) {
        toast({ variant: "destructive", title: "Error creating course" });
      } else {
        toast({ title: "Course created successfully" });
      }
    }

    resetCourseForm();
    setIsCourseDialogOpen(false);
    fetchData();
  };

  const handleSaveModule = async () => {
    if (!moduleTitle || !selectedCourseId) {
      toast({ variant: "destructive", title: "Please fill required fields" });
      return;
    }

    const existingModules = modules.filter(m => m.course_id === selectedCourseId && m.level === moduleLevel);
    const maxOrderIndex = existingModules.length > 0 
      ? Math.max(...existingModules.map(m => m.order_index)) + 1 
      : 0;

    const moduleData = {
      course_id: selectedCourseId,
      title: moduleTitle,
      description: moduleDescription || null,
      content: moduleContent || null,
      video_url: moduleVideoUrl || null,
      level: moduleLevel,
      duration_minutes: moduleDuration,
      order_index: editingModule?.order_index ?? maxOrderIndex,
    };

    if (editingModule) {
      const { error } = await supabase.from("modules").update(moduleData).eq("id", editingModule.id);
      if (error) {
        toast({ variant: "destructive", title: "Error updating module" });
      } else {
        toast({ title: "Module updated successfully" });
      }
    } else {
      const { error } = await supabase.from("modules").insert([moduleData]);
      if (error) {
        toast({ variant: "destructive", title: "Error creating module" });
      } else {
        toast({ title: "Module created successfully" });
      }
    }

    resetModuleForm();
    setIsModuleDialogOpen(false);
    fetchData();
  };

  const handleDeleteCourse = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (!error) {
      toast({ title: "Course deleted" });
      fetchData();
    }
  };

  const handleDeleteModule = async (id: string) => {
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (!error) {
      toast({ title: "Module deleted" });
      fetchData();
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    setCourseDescription(course.description || "");
    setCourseContent(course.content || "");
    setCourseCategory(course.category_id || "");
    setCourseDuration(course.duration_minutes);
    setCoursePublished(course.published);
    setIsCourseDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setSelectedCourseId(module.course_id);
    setModuleTitle(module.title);
    setModuleDescription(module.description || "");
    setModuleContent(module.content || "");
    setModuleVideoUrl(module.video_url || "");
    setModuleLevel(module.level);
    setModuleDuration(module.duration_minutes);
    setIsModuleDialogOpen(true);
  };

  const openAddModuleDialog = (courseId: string) => {
    setSelectedCourseId(courseId);
    resetModuleForm();
    setIsModuleDialogOpen(true);
  };

  const resetCourseForm = () => {
    setEditingCourse(null);
    setCourseTitle("");
    setCourseDescription("");
    setCourseContent("");
    setCourseCategory("");
    setCourseDuration(30);
    setCoursePublished(false);
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setModuleTitle("");
    setModuleDescription("");
    setModuleContent("");
    setModuleVideoUrl("");
    setModuleLevel(1);
    setModuleDuration(15);
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

  return (
    <div className="space-y-6">
      {/* Course Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={(open) => { setIsCourseDialogOpen(open); if (!open) resetCourseForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Title *</Label>
              <Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="Course title" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={courseCategory} onValueChange={setCourseCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} placeholder="Course description" />
            </div>
            <div>
              <Label>Overview Content</Label>
              <Textarea value={courseContent} onChange={(e) => setCourseContent(e.target.value)} placeholder="Course overview content..." className="min-h-24" />
            </div>
            <div>
              <Label>Estimated Duration (minutes)</Label>
              <Input type="number" value={courseDuration} onChange={(e) => setCourseDuration(parseInt(e.target.value) || 30)} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={coursePublished} onCheckedChange={setCoursePublished} />
              <Label>Publish Course</Label>
            </div>
            <Button onClick={handleSaveCourse} className="w-full">
              {editingCourse ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={(open) => { setIsModuleDialogOpen(open); if (!open) resetModuleForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Add New Module"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Title *</Label>
              <Input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Module title" />
            </div>
            <div>
              <Label>Level</Label>
              <Select value={moduleLevel.toString()} onValueChange={(v) => setModuleLevel(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(level => (
                    <SelectItem key={level} value={level.toString()}>Level {level} - {level === 1 ? "Beginner" : level === 2 ? "Elementary" : level === 3 ? "Intermediate" : level === 4 ? "Advanced" : "Expert"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={moduleDescription} onChange={(e) => setModuleDescription(e.target.value)} placeholder="Module description" />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={moduleContent} onChange={(e) => setModuleContent(e.target.value)} placeholder="Module content (supports markdown)..." className="min-h-32" />
            </div>
            <div>
              <Label>Video URL (optional)</Label>
              <Input value={moduleVideoUrl} onChange={(e) => setModuleVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" value={moduleDuration} onChange={(e) => setModuleDuration(parseInt(e.target.value) || 15)} />
            </div>
            <Button onClick={handleSaveModule} className="w-full">
              {editingModule ? "Update Module" : "Add Module"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Course Management
        </h2>
        <Button onClick={() => { resetCourseForm(); setIsCourseDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> New Course
        </Button>
      </div>

      {/* Course List */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No courses yet. Create your first course!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const modulesByLevel = getModulesByLevel(course.id);
            const levels = Object.keys(modulesByLevel).map(Number).sort((a, b) => a - b);
            const totalModules = getCourseModules(course.id).length;

            return (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        {course.published ? (
                          <Badge variant="default" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                            <Eye className="w-3 h-3 mr-1" />Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="w-3 h-3 mr-1" />Draft
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{course.description || "No description"}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{course.duration_minutes} mins</span>
                        <span>{totalModules} module{totalModules !== 1 ? "s" : ""}</span>
                        <span>{categories.find(c => c.id === course.category_id)?.name || "Uncategorized"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => openAddModuleDialog(course.id)}>
                        <Layers className="w-4 h-4 mr-1" /> Add Module
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditCourse(course)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {totalModules > 0 && (
                  <CardContent className="pt-0">
                    <Accordion type="multiple" className="w-full">
                      {levels.map((level) => (
                        <AccordionItem key={level} value={`level-${level}`}>
                          <AccordionTrigger className="py-2 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Level {level}</Badge>
                              <span className="text-sm font-medium">
                                {level === 1 ? "Beginner" : level === 2 ? "Elementary" : level === 3 ? "Intermediate" : level === 4 ? "Advanced" : "Expert"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({modulesByLevel[level].length} module{modulesByLevel[level].length !== 1 ? "s" : ""})
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {modulesByLevel[level]
                                .sort((a, b) => a.order_index - b.order_index)
                                .map((module, idx) => (
                                  <div key={module.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm font-medium">{module.title}</p>
                                        <p className="text-xs text-muted-foreground">{module.duration_minutes} mins</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditModule(module)}>
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteModule(module.id)}>
                                        <Trash2 className="w-3 h-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
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

export default CourseManagement;
