import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar';
import AdminAppbar from './AdminAppbar';

import styles from './admin.module.css';

const AdminLayout = () => {

  document.title = "Unitime - Home";
  
  return (
    <section className={`flex full-view column4p overflow-h ${styles.section}`}>
        <div className={`border-high-b ${styles.navigator}`}>
          <AdminSidebar />
          <AdminAppbar />
        </div>
        <div className={`full border-high-y ${styles.content}`}>
          <Outlet />
        </div>
    </section>
  )
}

export default AdminLayout