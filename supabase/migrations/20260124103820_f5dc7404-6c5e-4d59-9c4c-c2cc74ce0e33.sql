-- Create modules table for level-wise course content
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  duration_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Policies for modules
CREATE POLICY "Anyone can view modules of published courses" 
ON public.modules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = modules.course_id 
    AND (courses.published = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'instructor'))
  )
);

CREATE POLICY "Instructors can manage modules of own courses" 
ON public.modules 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin') OR 
  (has_role(auth.uid(), 'instructor') AND EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = modules.course_id 
    AND courses.instructor_id = auth.uid()
  ))
);

-- Create module_progress table
CREATE TABLE public.module_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress_percent INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

-- Policies for module_progress
CREATE POLICY "Users can manage own module progress" 
ON public.module_progress 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Instructors can view all module progress" 
ON public.module_progress 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'instructor'));

-- Update trigger for modules
CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON public.modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for modules
ALTER PUBLICATION supabase_realtime ADD TABLE public.modules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.module_progress;