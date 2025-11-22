import React from 'react'

import styles from "./admin.module.css"

const AdminDashboard = () => {
  return (
    <div className={`${styles.dashboardLayout} full`}>
      <div className={`${styles.dashboardHeader}`}>
        <div className="view-test"></div>
      </div>
      <div className={`${styles.dashboardContent}`}>
        <div className="view-test"></div>
      </div>
    </div>
  )
}

export default AdminDashboard