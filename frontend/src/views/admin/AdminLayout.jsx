import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar';
import AdminAppbar from './AdminAppbar';

import styles from './admin.module.css';

import {forceDark, forceLight, setMainColor} from "../../hooks/apearance"
import { authCheck } from '../../API/auth'

const AdminLayout = () => {

  document.title = "Unitime - Home";

  const navigate = useNavigate()
  const [verified, setVerified] = useState(false)
  useEffect(()=>{
    let mounted = true
    const check = async () => {
      try {
        const data = await authCheck()
        if (!mounted) return
        const user = data?.user || data || {}
        const role = (user.role || user.type || user.role_name || '').toString().toLowerCase()
        if (role === 'admin' || role === 'employee') {
          setVerified(true)
          return
        }
        if (role === 'teacher') navigate('/teacher')
        else if (role === 'student') navigate('/student')
        else navigate('/login')
      } catch (err) {
        if (!mounted) return
        navigate('/login')
      }
    }
    check()
    return () => { mounted = false }
  }, [navigate])

  if (!verified) return null

  return (
    <section className={`flex full-view column4p overflow-h ${styles.section}`}>
        <div className={`${styles.navigator}`}>
          <AdminSidebar />
          <AdminAppbar />
        </div>
        <div className={`full ${styles.content}`}>
          <Outlet />
        </div>
    </section>
  )
}

export default AdminLayout