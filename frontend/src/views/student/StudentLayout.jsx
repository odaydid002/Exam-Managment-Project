import React from 'react'
import { Outlet } from 'react-router-dom'

import StudentSidebar from './StudentSidebar';

const StudentLayout = () => {

  document.title = "Unitime - Home";
  
  return (
    <section className={`full overview-h flex`}>
        <StudentSidebar />
        <Outlet />
    </section>
  )
}

export default StudentLayout