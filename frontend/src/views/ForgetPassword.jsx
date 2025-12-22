import React, {useEffect, useState} from 'react'
import { useNavigate } from "react-router-dom";

import { authCheck, authLogin } from '../API/auth';
import { useNotify } from '../components/loaders/NotificationContext';

import styles from "./login.module.css"

import FullViewPage from '../components/containers/FullViewPage'
import ResetPassword from '../components/forms/ResetPassword'
import Eclipse from '../components/shapes/Eclipse'
import Text from '../components/text/Text'

import image from '../assets/pic.png'

const ForgetPassword = () => {

  const navigate = useNavigate();
  useEffect(()=>{
    let mounted = true
    const check = async () => {
      try {
        const data = await authCheck()
        if (!mounted) return
        const user = data?.user || data
        const role = user?.role || user?.type || user?.role_name
        if (role === 'teacher') navigate('/teacher')
        else if (role === 'student') navigate('/student')
        else if (role === 'employee' || role === 'admin') navigate('/admin')
        else navigate('/restore')
      } catch (err) {
        if (!mounted) return
        navigate('/restore')
      }
    }

    check()
    return () => { mounted = false }
  }, [navigate])

  const { notify } = useNotify()

  const [loading,setLoading] = useState(false);

  const goToRoleRoute = (user) => {
    const role = user?.role || user?.type || user?.role_name
    if (role === 'teacher') navigate('/teacher')
    else if (role === 'student') navigate('/student')
    else if (role === 'employee' || role === 'admin') navigate('/admin')
    else navigate('/admin')
  }

  const submit = async (email) => {
    setLoading(true)
    try {
      const resp = await authLogin({ email })
      let user = resp?.user || resp
      if (!user || !user.role) {
        const checked = await authCheck()
        user = checked?.user || checked
      }
      notify('success', 'Login successful')
      goToRoleRoute(user)
    } catch (err) {
      notify('error', 'Login failed: ' + (err?.message || 'Check credentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <FullViewPage pd='0' white css='pos-rel'>
      <div className={`flex a-center ${styles.container} pos-rel`}>
        <img src={image} alt="Picture" className={`pos-abs z-2 h4p ${styles.img}`}/>
        <div className={`${styles.containerBg} overflow-h pos-rel h4p`}>
          <Eclipse w='15em' size='2em' top="-20%" left="70%" css='pos-abs anim-float' color='var(--border)'/>
          <Eclipse w='40em' size='4em' top="50%" left="-60%" css='pos-abs' color='var(--border)'/>
          <div className={`flex column ${styles.floatText}`}>
            <Text css={styles.mxw1} text='Smart Access Smarter Learning' w="bold" size='1.7rem' color='white' align='left' mrg='0 0 0.25em 0'/>
            <Text css={styles.mxw2} text='With Unitime, organizing your studies and tracking modules becomes effortless. Save time, stay focused, and keep your academic life simple' size='0.8rem' color='white' align='left' mrg='1em 0 0 0'/>
          </div>
        </div>    
        <ResetPassword css={`${styles.minW}`} isLoading={loading} onSubmit={submit} onRemeber={() => navigate('/login')}/>
      </div>
    </FullViewPage>
  )
}

export default ForgetPassword