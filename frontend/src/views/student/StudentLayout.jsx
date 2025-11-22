import React from 'react'
import { Outlet } from 'react-router-dom'

import StudentSidebar from './StudentSidebar';
import StudentAppbar from './StudentAppbar';

import styles from './student.module.css';

const StudentLayout = () => {

  document.title = "Unitime - Home";
  
  return (
    <section>
        <div className="nav">
          <StudentSidebar />
          <StudentAppbar />
        </div>
        <div className={`${styles.mainDoc} full border-high`}>
          <Outlet />
        </div>
    </section>
  )
}

export default StudentLayout