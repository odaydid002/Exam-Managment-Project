import React from 'react'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from '../views/Home'
import Login from '../views/Login'

import StudentLayout from '../views/student/StudentLayout'
import StudentHome from '../views/student/StudentHome'
import StudentSchedule from '../views/student/StudentSchedule'
import StudentModules from '../views/student/StudentModules'
import StudentProfile from '../views/student/StudentProfile'
import StudentSettings from '../views/student/StudentSettings'

import TeacherLayout from '../views/teacher/TeacherLayout'
import TeacherHome from '../views/teacher/TeacherHome'
import TeacherModules from '../views/teacher/TeacherModules'
import TeacherProfile from '../views/teacher/TeacherProfile'
import TeacherSchedule from '../views/teacher/TeacherSchedule'
import TeacherSettings from '../views/teacher/TeacherSettings'

import AdminLayout from '../views/admin/adminLayout'
import AdminDashboard from '../views/admin/AdminDashboard'
import AdminRooms from '../views/admin/AdminDashboard'
import AdminModules from '../views/admin/AdminModules'
import AdminPlanning from '../views/admin/AdminPlanning'
import AdminStudents from '../views/admin/AdminStudents'
import AdminTeachers from '../views/admin/AdminTeachers'
import AdminSettings from '../views/admin/AdminSettings'
import AdminGroups from '../views/admin/AdminGroups'

import ErrorPage from '../views/error/ErrorPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />
  },
  {
    path: "/Login",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "/student",
    element: <StudentLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <StudentHome /> },
      { path: "home", element: <StudentHome /> },
      { path: "profile", element: <StudentProfile /> },
      { path: "schedule", element: <StudentSchedule /> },
      { path: "modules", element: <StudentModules /> },
      { path: "settings", element: <StudentSettings /> },
    ],
  },
  {
    path: "/teacher",
    element: <TeacherLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <TeacherHome /> },
      { path: "home", element: <TeacherHome /> },
      { path: "profile", element: <TeacherProfile /> },
      { path: "schedule", element: <TeacherSchedule /> },
      { path: "modules", element: <TeacherModules /> },
      { path: "settings", element: <TeacherSettings /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "home", element: <AdminDashboard /> },
      { path: "rooms", element: <AdminRooms /> },
      { path: "modules", element: <AdminModules  /> },
      { path: "groups", element: <AdminGroups  /> },
      { path: "planning", element: <AdminPlanning /> },
      { path: "students", element: <AdminStudents /> },
      { path: "teachers", element: <AdminTeachers /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },
]);

const Router = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default Router