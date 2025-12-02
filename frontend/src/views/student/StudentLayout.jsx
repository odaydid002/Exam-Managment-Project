import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import StudentSidebar from './StudentSidebar';
import StudentAppbar from './StudentAppbar';

import styles from './student.module.css';
import { authCheck } from '../../API/auth'

const StudentLayout = () => {

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
        if (role === 'student') {
          setVerified(true)
          return
        }
        // redirect others to their layout
        if (role === 'teacher') navigate('/teacher')
        else if (role === 'admin' || role === 'employee') navigate('/admin')
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