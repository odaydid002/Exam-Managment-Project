import React, {useEffect, useState} from 'react'
import { useNavigate } from "react-router-dom";

import { authCheck, sendOtp, verifyOtp, resetPassword } from '../API/auth';
import { useNotify } from '../components/loaders/NotificationContext';

import styles from "./login.module.css"

import FullViewPage from '../components/containers/FullViewPage'
import ResetPassword from '../components/forms/ResetPassword'
import Eclipse from '../components/shapes/Eclipse'
import Text from '../components/text/Text'
import TextInput from '../components/input/TextInput'
import PrimaryButton from '../components/buttons/PrimaryButton'
import TextButton from '../components/buttons/TextButton'

import image from '../assets/pic.png'
import Otp from '../components/forms/Otp';
import Logo from '../components/images/Logo';

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

  const [step, setStep] = useState('email') // 'email', 'otp', 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    if (!email) {
      notify('error', 'Please enter your email')
      return
    }
    setLoading(true)
    try {
      await sendOtp(email)
      notify('success', 'OTP sent to your email')
      setStep('otp')
    } catch (err) {
      notify('error', 'Failed to send OTP: ' + (err?.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 5) {
      notify('error', 'Please enter the 5-digit OTP')
      return
    }
    setLoading(true)
    try {
      await verifyOtp(email, otp)
      notify('success', 'OTP verified')
      setStep('reset')
    } catch (err) {
      notify('error', 'Invalid OTP: ' + (err?.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (password, confirmPassword) => {
    if (password !== confirmPassword) {
      notify('error', 'Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await resetPassword(email, otp, password, confirmPassword)
      notify('success', 'Password reset successfully')
      navigate('/login')
    } catch (err) {
      notify('error', 'Failed to reset password: ' + (err?.response?.data?.message || err.message))
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
        {step === 'email' && (
          <form className={`${styles.minW} flex column  full ${styles.signIn}`}>
            <div className="mrta h4pc"></div>
            <div className={`flex row a-center ${styles.jst}`}>
                <Logo w='35' wc='fit-content' />
            </div>
            <Text align='left' text="Forgot your password?" size="var(--text-l)" w="bold" mrg="0.5em 0 0 0" color="var(--text)" />
            <Text align="left" text="Enter your email to receive a reset code" size='0.7rem' opacity='0.6'/>
            <div className="mrta h4p"></div>
            <TextInput label="Email" placeholder="Enter your email" value={email} onchange={(e) => setEmail(e.target.value)} />
            <div className="mrta h4p"></div>
            <PrimaryButton w='100%' text='Send OTP' onClick={handleSendOtp} isLoading={loading} />
            <div className="w100 flex row a-center">
              <Text text="Remember your password?" mrg='0 0.5em 0 0' size='var(--text-m)' opacity='0.6' />
              <TextButton text='Sign In' textColor='var(--color-main)' onClick={() => navigate('/login')} />
            </div>
          </form>
        )}
        {step === 'otp' && (
          <Otp css={`${styles.minW}`} email={email} onSubmit={handleVerifyOtp} onOtpChange={setOtp} isLoading={loading} onBack={() => setStep('email')} />
        )}
        {step === 'reset' && (
          <ResetPassword css={`${styles.minW}`} isLoading={loading} onSubmit={handleResetPassword} />
        )}
      </div>
    </FullViewPage>
  )
}

export default ForgetPassword