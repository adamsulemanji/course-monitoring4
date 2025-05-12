"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, BookOpen, Bell, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courses, notifications } from "@/lib/api";

interface Course {
  id: string;
  name: string;
  description: string;
  instructor: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { logout, accessToken } = useAuth();
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      router.push("/auth/signin");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesData = await courses.getAll(accessToken);
        setCourseList(coursesData || []);

        // Fetch notifications
        const notificationsData = await notifications.getAll(accessToken);
        setNotificationList(notificationsData || []);
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, accessToken, logout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="courses">
          <TabsList className="mb-8">
            <TabsTrigger value="courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {notificationList.filter(n => !n.read).length > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {notificationList.filter(n => !n.read).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {courseList.length > 0 ? (
                courseList.map((course) => (
                  <Card key={course.id} className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{course.name}</CardTitle>
                      <CardDescription>Instructor: {course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                      <div className="mt-4">
                        <p className="text-xs text-gray-500">
                          {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
                        </p>
                        <p className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.status === 'active' ? 'bg-green-100 text-green-800' : 
                            course.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No courses available</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="space-y-6">
              {notificationList.length > 0 ? (
                notificationList.map((notification) => (
                  <Card key={notification.id} className={notification.read ? "opacity-70" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{notification.title}</CardTitle>
                      <CardDescription>
                        {new Date(notification.created_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-gray-600">{notification.message}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 