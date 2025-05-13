"use client";

import { Plus, Edit, Trash2, Save, X, User, LogOut } from "lucide-react";
// import { useAuth } from "@/components/auth-provider";
import { useCourses } from "@/hooks/useCourses";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Course model with CRN, class name, year, and term
interface CourseModel {
  id: string;
  name: string;
  crn: string;
  year: string;
  term: string;
}

// Mock data for initial courses
const initialCourses: CourseModel[] = [
  {
    id: "1",
    name: "Introduction to Computer Science",
    crn: "12345",
    year: "2023",
    term: "Fall"
  },
  {
    id: "2",
    name: "Data Structures and Algorithms",
    crn: "23456",
    year: "2023",
    term: "Spring"
  },
  {
    id: "3",
    name: "Web Development",
    crn: "34567",
    year: "2024",
    term: "Summer"
  }
];

export default function DashboardPage() {
  // Comment out auth for now since we're disabling it temporarily
  // const { logout } = useAuth();
  
  // Use our custom hook for course management
  const {
    courses,
    editingCourse,
    editingId,
    isAddingCourse,
    newCourse,
    setIsAddingCourse,
    addCourse,
    resetNewCourse,
    deleteCourse,
    startEditing,
    saveEdit,
    cancelEdit,
    updateNewCourse,
    updateEditingCourse,
    MAX_COURSES
  } = useCourses();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Course Monitoring Dashboard</h1>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Courses (Max {MAX_COURSES})</h2>
          
          {courses.length < MAX_COURSES ? (
            <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      value={newCourse.name}
                      onChange={(e) => updateNewCourse('name', e.target.value)}
                      placeholder="e.g. Introduction to Computer Science"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="crn">CRN (5-digit number)</Label>
                    <Input
                      id="crn"
                      value={newCourse.crn}
                      onChange={(e) => updateNewCourse('crn', e.target.value)}
                      placeholder="e.g. 12345"
                      maxLength={5}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        value={newCourse.year}
                        onChange={(e) => updateNewCourse('year', e.target.value)}
                        placeholder="e.g. 2024"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="term">Term</Label>
                      <Select 
                        value={newCourse.term} 
                        onValueChange={(value: string) => updateNewCourse('term', value)}
                      >
                        <SelectTrigger id="term">
                          <SelectValue placeholder="Select a term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                          <SelectItem value="Fall">Fall</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={resetNewCourse}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={addCourse}>Add Course</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Maximum Courses Reached
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {courses.length > 0 ? (
            courses.map((course) => (
              <Card key={course.id} className="p-4">
                {editingId === course.id ? (
                  // Editing mode
                  <div className="flex flex-col space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`edit-name-${course.id}`}>Course Name</Label>
                        <Input
                          id={`edit-name-${course.id}`}
                          value={editingCourse?.name || ""}
                          onChange={(e) => updateEditingCourse('name', e.target.value)}
                          placeholder="Course name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-crn-${course.id}`}>CRN</Label>
                        <Input
                          id={`edit-crn-${course.id}`}
                          value={editingCourse?.crn || ""}
                          onChange={(e) => updateEditingCourse('crn', e.target.value)}
                          placeholder="CRN"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-year-${course.id}`}>Year</Label>
                        <Input
                          id={`edit-year-${course.id}`}
                          value={editingCourse?.year || ""}
                          onChange={(e) => updateEditingCourse('year', e.target.value)}
                          placeholder="Year"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-term-${course.id}`}>Term</Label>
                        <Select 
                          value={editingCourse?.term || ""} 
                          onValueChange={(value: string) => updateEditingCourse('term', value)}
                        >
                          <SelectTrigger id={`edit-term-${course.id}`}>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Spring">Spring</SelectItem>
                            <SelectItem value="Summer">Summer</SelectItem>
                            <SelectItem value="Fall">Fall</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={saveEdit}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Course Name</p>
                        <p className="font-medium">{course.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">CRN</p>
                        <p>{course.crn}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Year</p>
                        <p>{course.year}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Term</p>
                        <p>{course.term}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => startEditing(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCourse(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No courses available. Add a course to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 