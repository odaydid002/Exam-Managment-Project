import React from 'react'
import { Outlet } from 'react-router-dom'

import StudentSidebar from './StudentSidebar';
import StudentAppbar from './StudentAppbar';

import styles from './student.module.css';

const StudentLayout = () => {

  document.title = "Unitime - Home";
  
  return (
    <section className='flex full-view column4p overflow-h'>
        <div className="h100">
          <StudentSidebar />
          <StudentAppbar />
        </div>
        <div className={`${styles.mainDoc} full vh100`}>
          <Outlet />
        </div>
    </section>
  )
}

export default StudentLayout