import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {

  document.title = "Unitime - Home";
  
  return (
    <section className={`full overview-h flex`}>
        <AdminSidebar />
        <Outlet />
    </section>
  )
}

export default AdminLayout