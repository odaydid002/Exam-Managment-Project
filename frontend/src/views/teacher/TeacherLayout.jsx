import React from 'react'
import { Outlet } from 'react-router-dom'

import TeacherSidebar from './TeacherSidebar';

const TeacherLayout = () => {

  document.title = "Unitime - Home";

  return (
    <section className={`full overview-h flex`}>
        <TeacherSidebar />
        <div className="page flex overflow-h">
          <Outlet />
        </div>
    </section>
  )
}

export default TeacherLayout