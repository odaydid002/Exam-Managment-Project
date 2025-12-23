import './student.css';

import {useState} from 'react'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Switchbox from '../../components/input/Switchbox';
import Text from '../../components/text/Text';
import Circle from '../../components/shapes/Circle';
import {setMainColor, forceDark, forceLight} from './../../hooks/apearance';
import TextInput from '../../components/input/TextInput';
import DarkUI from '../../components/svg/DarkUI';
import LightUI from '../../components/svg/LightUI';
import SystemUI from '../../components/svg/SystemUI';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import Profile from '../../components/containers/profile';
import TextButton from '../../components/buttons/TextButton';

const StudentSettings = () => {
  const root = document.documentElement;
  document.title = "Unitime - Settings";

  const [profileLoading, setProfileLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [currentColor, setCurrentColor] = useState(getComputedStyle(root).getPropertyValue('--color-main').trim());
  const [currentTheme, setCurrentTheme] = useState("system");

  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    if(theme != "system"){
      theme == "dark"?forceDark():forceLight();
    }else{
      window.matchMedia('(prefers-color-scheme: dark)').matches ?forceDark():forceLight();
    }
  }

  const changeColor = (color) => {
    setCurrentColor(color);
    setMainColor(color);
  }

  useGSAP(() => {
    gsap.from('.gsap-y', {
      y: 50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
    })
  });

  return (
        <div className={`settingsLayout full scrollbar overflow-y-a gap`} style={{ padding: "1em 1em 1em 0" }}>
          <div className='settingsBody'>
            <div className={`BGC gsap-y pd ${profileLoading && "shimmer"}`}>
              {!profileLoading && <>
                <Text text='Profile Settings' align='left' size='var(--text-m)' opacity='0.8' mrg='0 0 1em 0'/>
                <div className='flex column center w100'>
                  <Profile width='5em' />
                  <label htmlFor='profile' className='text-m text-c-main mrth clickable'>Upload Picture</label>
                  <input id='profile' type='file' hidden/>
                </div>
                <div className='flex column gap' style={{marginTop:'1em'}}>
                  <div className='flex row gap'>
                    <TextInput width='50%' label="First name" value="Student name" readOnly/>
                    <TextInput width='50%' label="Last name" value='Student name' readOnly/>
                  </div>
                  <div className='flex row gap'>
                    <TextInput width='50%' type='email' label="Email" value="_" readOnly/>
                    <TextInput width='50%' type='phone' label="Phone" value="_" placeholder='Ex: +213 69876543210' editable/>
                  </div>
                  <div className='flex row gap'>
                    <TextInput width='50%' label="Birthdate" value="_" placeholder='Ex: 12-12-2012' editable/>
                    <TextInput width='50%' label="address" value="_" placeholder='Ex: Wilaya, City' editable/>
                  </div>
                </div>
              </>}
            </div>
            <div className={`BGC gsap-y pd ${settingsLoading && "shimmer"}`}>
              {!settingsLoading && <>
                <Text text='Account & Security' align='left' size='var(--text-m)' opacity='0.8' mrg='0 0 1em 0'/>
                <div className='flex column gap'>
                  <div className='flex row a-center j-spacebet w100'>
                    <Text text='Password' align='left' size='var(--text-m)' />
                    <SecondaryButton icon='fa-solid fa-key' text='Change Password' />
                  </div>
                  <Switchbox label='Two-Factor Authentication (2FA)' desc='Extra security via OTP/email'/>
                  <Switchbox label='Login Alerts' desc='Notify on new/unfamiliar logins'/>
                </div>
              </>}
            </div>
          </div>
          <div className='settingsSide'>
            <div className={`BGC gsap-y pd ${settingsLoading && "shimmer"}`}>
              {!settingsLoading && <>
                <Text text='Notifications' align='left' size='var(--text-m)' opacity='0.8' mrg='0 0 1em 0'/>
                <div className='flex column gap'>
                  <Switchbox label='Exam remainders' desc='Get notified before exams'/>
                  <Switchbox label='Schedule updates' desc='Receive updates about schedule changes'/>
                  <Switchbox label='Email notifications' desc='Receive notifications via email'/>
                  <Switchbox label='Login Alerts' desc='Notify on new/unfamiliar logins'/>
                </div>
              </>}
            </div>
            <div className={`BGC gsap-y pd ${settingsLoading && "shimmer"}`}>
              {!settingsLoading && <>
                <Text text='Appearance' align='left' size='var(--text-m)' opacity='0.8' mrg='0 0 1em 0'/>
                <div className='flex column'>
                  <Text align='left' text='Theme color' size='var(--text-m)' />
                  <Text align='left' text='Personalize your accent color for application' size='var(--text-s)' color='var(--text-low)' opacity='0.5'/>
                  <div className='flex row a-center j-spacebet'>
                    <div className='flex row a-center gap' style={{marginTop: "1em"}}>
                      <Circle clickable color='#0A43B1' active = {currentColor == "#0A43B1"} onClick = {() => {changeColor("#0A43B1")} }/>
                      <Circle clickable color='#0092FF' active = {currentColor == "#0092FF"} onClick = {() => {changeColor("#0092FF")} }/>
                      <Circle clickable color='#B33AEF' active = {currentColor == "#B33AEF"} onClick = {() => {changeColor("#B33AEF")} }/>
                      <Circle clickable color='#F1504A' active = {currentColor == "#F1504A"} onClick = {() => {changeColor("#F1504A")} }/>
                      <Circle clickable color='#FEB326' active = {currentColor == "#FEB326"} onClick = {() => {changeColor("#FEB326")} }/>
                      <Circle clickable color='#1EA807' active = {currentColor == "#1EA807"} onClick = {() => {changeColor("#1EA807")} }/>
                    </div>
                    <TextInput label="Custom Color" width='8em' placeholder='#000000' onchange={(e) =>{changeColor(e.target.value)}} value={currentColor}/>
                  </div>
                  <Text align='left' text='Interface theme' size='var(--text-m)' />
                  <Text align='left' text='Select or customize your UI theme' size='var(--text-s)' color='var(--text-low)' opacity='0.5'/>
                  <div className='flex row center gap' style={{marginTop: '1em'}}>
                    <div className='flex column center clickable' onClick={() => {changeTheme("dark")}}>
                      <DarkUI selected={currentTheme == "dark"}/>
                      <Text text='Dark theme' size='var(--text-m)' />
                    </div>
                    <div className='flex column center clickable' onClick={() => {changeTheme("light")}}>
                      <LightUI selected={currentTheme == "light"}/>
                      <Text text='Light theme' size='var(--text-m)' />
                    </div>
                    <div className='flex column center clickable' onClick={() => {changeTheme("system")}}>
                      <SystemUI selected={currentTheme == "system"}/>
                      <Text text='System' size='var(--text-m)' />
                    </div>
                  </div>
                </div>
              </>}
            </div>
          </div>
        </div>

  )
}

export default StudentSettings