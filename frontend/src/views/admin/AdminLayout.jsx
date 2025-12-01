import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar';
import AdminAppbar from './AdminAppbar';
import { NotifyProvider } from "../../components/loaders/NotificationContext";

import styles from './admin.module.css';

import {forceDark, forceLight, setMainColor} from "../../hooks/apearance"

const AdminLayout = () => {

  document.title = "Unitime - Home";

  return (
    <section className={`flex full-view column4p overflow-h ${styles.section}`}>
        <div className={`${styles.navigator}`}>
          <AdminSidebar />
          <AdminAppbar />
        </div>
        <NotifyProvider>
          <div className={`full ${styles.content}`}>
            <Outlet />
          </div>
        </NotifyProvider>
    </section>
  )
}

export default AdminLayout