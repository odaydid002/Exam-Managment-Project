import React from 'react'
import { Outlet } from 'react-router-dom'

import TeacherSidebar from './TeacherSidebar';
import TeacherAppbar from './TeacherAppbar';

const TeacherLayout = () => {

  document.title = "Unitime - Home";

  return (
    <section className='page-row'>
        <div className="nav">
          <TeacherSidebar />
          <TeacherAppbar />
        </div>
        <div className="content">
          <Outlet />
        </div>
    </section>
  )
}

export default TeacherLayout