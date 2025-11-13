import React from 'react'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from '../views/Home'
import Login from '../views/Login'

import StudentLayout from '../views/student/StudentLayout'
import StudentHome from '../views/student/StudentHome'
import StudentSchedule from '../views/student/StudentSchedule'
import StudentModules from '../views/student/StudentModules'
import StudentProfile from '../views/student/StudentProfile'

import TeacherHome from '../views/teacher/TeacherHome'

import AdminDashboard from '../views/admin/AdminDashboard'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: "/Login",
    element: <Login />,
  },
  {
    path: "/student",
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentHome /> },
      { path: "home", element: <StudentHome /> },
      { path: "profile", element: <StudentProfile /> },
      { path: "schedule", element: <StudentSchedule /> },
      { path: "modules", element: <StudentModules /> },
    ],
  },
  {
    path: "/teacher/*",
    element: <TeacherHome />,
  },
  {
    path: "/admin/*",
    element: <AdminDashboard />,
  },
]);

const Router = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default Router