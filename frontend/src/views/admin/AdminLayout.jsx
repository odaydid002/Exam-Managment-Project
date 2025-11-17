import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar';
import AdminAppbar from './AdminAppbar';

const AdminLayout = () => {

  document.title = "Unitime - Home";
  
  return (
    <section className='page-row'>
        <div className="nav">
          <AdminSidebar />
          <AdminAppbar />
        </div>
        <div className="content">
          <Outlet />
        </div>
    </section>
  )
}

export default AdminLayout