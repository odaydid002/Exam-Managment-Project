import React from 'react'
import { Outlet } from 'react-router-dom'

import StudentSidebar from './StudentSidebar';
import StudentAppbar from './StudentAppbar';

const StudentLayout = () => {

  document.title = "Unitime - Home";
  
  return (
    <section className='page-row'>
        <div className="nav">
          <StudentSidebar />
          <StudentAppbar />
        </div>
        <div className="content">
          <Outlet />
        </div>
    </section>
  )
}

export default StudentLayout