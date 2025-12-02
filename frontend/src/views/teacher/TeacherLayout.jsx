import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import TeacherSidebar from './TeacherSidebar';
import TeacherAppbar from './TeacherAppbar';
import { authCheck } from '../../API/auth'

const TeacherLayout = () => {

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
        if (role === 'teacher') {
          setVerified(true)
          return
        }
        // redirect other roles
        if (role === 'student') navigate('/student')
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
    <section className='page-row'>
        <div className="nav">
          <TeacherSidebar />
          <TeacherAppbar />
        </div>
        <div className={`full flex`}>
          <Outlet />
        </div>
    </section>
  )
}

export default TeacherLayout