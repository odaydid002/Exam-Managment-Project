import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import StudentSidebar from './StudentSidebar';
import StudentAppbar from './StudentAppbar';

import './student.css';
import { authCheck } from '../../API/auth'
import * as Users from '../../API/users'
import { setMainColor, forceDark, forceLight } from '../../hooks/apearance'

const StudentLayout = () => {

  document.title = "Unitime - Home";
  const navigate = useNavigate()
  const [verified, setVerified] = useState(false)
  useEffect(()=>{
    let mounted = true
    const applyDefaultTheme = () => {
      try {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) forceDark(); else forceLight();
        setMainColor('#F1504A');
      } catch (e) { /* ignore */ }
    }
    applyDefaultTheme();
    const check = async () => {
      try {
        const data = await authCheck()
        if (!mounted) return
        const user = data?.user || data || {}
        const role = (user.role || user.type || user.role_name || '').toString().toLowerCase()
        if (role === 'student') {
          setVerified(true)
          try {
            const settingsResp = await Users.getSettings(user.id)
            const srv = settingsResp && settingsResp.settings ? settingsResp.settings : settingsResp
            const theme = srv?.theme || srv?.theme || 'system'
            const color = srv?.main_color || srv?.theme_color || null
            if (theme === 'dark') forceDark()
            else if (theme === 'light') forceLight()
            if (color) setMainColor(color)
          } catch (err) {
            console.debug('users.getSettings failed', err)
          }
          return
        }
        if (role === 'teacher') navigate('/teacher')
        else if (role === 'admin' || role === 'employee') navigate('/admin')
        else navigate('/login')
      } catch (err) {
        console.error(err)
        if (!mounted) return
        navigate('/login')
      }
    }
    check()
    return () => { mounted = false }
  }, [navigate])
  
  if (!verified) return null

  return (
    <section className={`flex full-view column4p overflow-h section`}>
        <div className={`navigator z-top`}>
          <StudentSidebar />
          <StudentAppbar />
        </div>
        <div className={`full content`}>
          <Outlet />
        </div>
    </section>
  )
}

export default StudentLayout