import { useState } from 'react';

// Course model with CRN, class name, year, and term
export interface CourseModel {
  id: string;
  name: string;
  crn: string;
  year: string;
  term: string;
}

// Initial courses data
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

export function useCourses() {
  // State for courses, editing, and form
  const [courses, setCourses] = useState<CourseModel[]>(initialCourses);
  const [editingCourse, setEditingCourse] = useState<CourseModel | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState<Omit<CourseModel, "id">>({
    name: "",
    crn: "",
    year: new Date().getFullYear().toString(),
    term: "Fall"
  });

  // Function to add a new course
  const addCourse = () => {
    if (courses.length >= 5) {
      alert("Maximum of 5 courses allowed.");
      return false;
    }
    
    // Validate CRN is 5 digits
    if (!/^\d{5}$/.test(newCourse.crn)) {
      alert("CRN must be a 5-digit number.");
      return false;
    }
    
    const courseToAdd = {
      id: Date.now().toString(),
      ...newCourse
    };
    
    setCourses([...courses, courseToAdd]);
    resetNewCourse();
    return true;
  };
  
  // Reset the new course form
  const resetNewCourse = () => {
    setNewCourse({
      name: "",
      crn: "",
      year: new Date().getFullYear().toString(),
      term: "Fall"
    });
    setIsAddingCourse(false);
  };
  
  // Function to delete a course
  const deleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };
  
  // Function to start editing a course
  const startEditing = (course: CourseModel) => {
    setEditingCourse({...course});
    setEditingId(course.id);
  };
  
  // Function to save edits
  const saveEdit = () => {
    if (!editingCourse) return false;
    
    // Validate CRN is 5 digits
    if (!/^\d{5}$/.test(editingCourse.crn)) {
      alert("CRN must be a 5-digit number.");
      return false;
    }
    
    setCourses(courses.map(course => 
      course.id === editingId ? editingCourse : course
    ));
    cancelEdit();
    return true;
  };
  
  // Function to cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingCourse(null);
  };

  // Handlers for form input changes
  const updateNewCourse = (field: keyof Omit<CourseModel, "id">, value: string) => {
    setNewCourse({...newCourse, [field]: value});
  };

  const updateEditingCourse = (field: keyof CourseModel, value: string) => {
    if (editingCourse) {
      setEditingCourse({...editingCourse, [field]: value});
    }
  };

  return {
    // State
    courses,
    editingCourse,
    editingId,
    isAddingCourse,
    newCourse,
    
    // Actions
    setIsAddingCourse,
    addCourse,
    resetNewCourse,
    deleteCourse,
    startEditing,
    saveEdit,
    cancelEdit,
    updateNewCourse,
    updateEditingCourse,
    
    // Constants
    MAX_COURSES: 5
  };
} 