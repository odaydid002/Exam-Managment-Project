import React, {useState} from 'react'

import styles from "./login.module.css"

import FullViewPage from '../components/containers/FullViewPage'
import SignIn from '../components/forms/SignIn'
import Eclipse from '../components/shapes/Eclipse'
import Text from '../components/text/Text'

import image from '../assets/pic.png'

const Login = () => {

  const [loading,setLoading] = useState(false);

  const submit = () => {
    setLoading(true);
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
        <SignIn css={`${styles.minW}`} isLoading={loading} onSubmit={submit}/>
      </div>
    </FullViewPage>
  )
}

export default Login