'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';
import { withAuth } from '@/lib/auth/auth-context';
import { Loader2, LogOut, BookOpen, Plus, RefreshCw } from 'lucide-react';

const courseSchema = z.object({
  id: z.string().optional(), // For editing existing courses
  crn: z.string().length(5, { message: 'CRN must be 5 digits.' }).regex(/^[0-9]+$/, {message: "CRN must be a number"}),
  year: z.coerce.number().min(2000, { message: 'Year must be 2000 or later.' }).max(2100, { message: 'Year must be 2100 or earlier'}),
  term: z.enum(['Spring', 'Summer', 'Fall'], { message: 'Invalid term.' }),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface Course extends CourseFormValues {
  id: string; // Ensure id is always present after creation
}

const MAX_COURSES = 5;

function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();

  const courseForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      crn: '',
      year: new Date().getFullYear(),
      term: undefined,
    },
  });

  // TODO: Fetch courses from API on component mount
  useEffect(() => {
    // fetchCourses();
    // For now, using mock data
    const mockCourses: Course[] = [
      { id: '1', crn: '12345', year: 2024, term: 'Spring' },
      { id: '2', crn: '67890', year: 2024, term: 'Fall' },
    ];
    setCourses(mockCourses);
  }, []);

  const handleAddCourse = () => {
    setEditingCourse(null);
    courseForm.reset({
      crn: '',
      year: new Date().getFullYear(),
      term: undefined,
    });
    setIsCourseDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    courseForm.reset(course);
    setIsCourseDialogOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    setIsLoading(true);
    try {
      // TODO: API call to delete course
      // For now, just update local state
      setCourses(courses.filter(c => c.id !== courseId));
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Delete course error:', error);
      toast.error('Failed to delete course');
    } finally {
      setIsLoading(false);
    }
  };

  const onCourseSubmit = async (data: CourseFormValues) => {
    setIsLoading(true);
    try {
      if (editingCourse) {
        // TODO: API call to update course
        // For now, just update local state
        setCourses(
          courses.map((c) => (c.id === editingCourse.id ? { ...data, id: c.id } : c))
        );
        toast.success('Course updated successfully');
      } else {
        if (courses.length >= MAX_COURSES) {
          toast.error(`You can only add up to ${MAX_COURSES} courses.`);
          setIsCourseDialogOpen(false);
          setIsLoading(false);
          return;
        }
        // TODO: API call to add course
        // For now, just update local state
        const newCourse = { ...data, id: Date.now().toString() };
        setCourses([...courses, newCourse]);
        toast.success('Course added successfully');
      }
      setIsCourseDialogOpen(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Course submission error:', error);
      toast.error(editingCourse ? 'Failed to update course' : 'Failed to add course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Course Monitor</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Your Courses</h2>
            <p className="text-muted-foreground text-sm">Manage the courses you want to monitor</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleAddCourse} 
                  disabled={courses.length >= MAX_COURSES || isLoading}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                  <DialogDescription>
                    {editingCourse ? 'Update the details of your course.' : 'Enter the details for the new course.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...courseForm}>
                  <form onSubmit={courseForm.handleSubmit(onCourseSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={courseForm.control}
                      name="crn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRN (5-digit number)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="term"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a term" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Spring">Spring</SelectItem>
                              <SelectItem value="Summer">Summer</SelectItem>
                              <SelectItem value="Fall">Fall</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isLoading}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={isLoading} className="gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {editingCourse ? 'Saving...' : 'Adding...'}
                          </>
                        ) : (
                          editingCourse ? 'Save Changes' : 'Add Course'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {courses.length === 0 ? (
          <Card className="border-dashed bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No courses added yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Get started by adding your first course to monitor. You can add up to {MAX_COURSES} courses.
              </p>
              <Button onClick={handleAddCourse} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden border transition-all hover:shadow-md">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary font-mono">{course.crn}</span>
                  </CardTitle>
                  <CardDescription className="font-medium">
                    {course.term} {course.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="flex h-2 w-2 rounded-full bg-amber-500"></div>
                    <span>Status: Not Monitored</span>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full gap-2 mt-2">
                    <RefreshCw className="h-3 w-3" />
                    Check Availability
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/10 px-4 py-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditCourse(course)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteCourse(course.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap component with auth protection
export default withAuth(DashboardPage); 