import './student.css';

import {useState, useEffect, useRef} from 'react'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Switchbox from '../../components/input/Switchbox';
import Text from '../../components/text/Text';
import Circle from '../../components/shapes/Circle';
import {setMainColor, forceDark, forceLight} from './../../hooks/apearance';
import { authCheck } from '../../API/auth';
import * as Users from '../../API/users';
import { get as getStudent } from '../../API/students';
import * as Images from '../../API/images';
import { useNotify } from '../../components/loaders/NotificationContext';
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
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({});
  const [userId, setUserId] = useState(null);
  const fileRef = useRef(null);
  const { notify } = useNotify();

  const [currentColor, setCurrentColor] = useState(getComputedStyle(root).getPropertyValue('--color-main').trim());
  const [currentTheme, setCurrentTheme] = useState("system");

  const changeTheme = (theme, persist = false) => {
    setCurrentTheme(theme);
    if(theme !== "system"){
      theme === "dark" ? forceDark() : forceLight();
    }else{
      window.matchMedia('(prefers-color-scheme: dark)').matches ? forceDark() : forceLight();
    }
    if (persist) {
      saveSettings({ theme });
    }
  }

  const changeColor = (color) => {
    setCurrentColor(color);
    setMainColor(color);
    saveSettings({ theme_color: color });
  }

  useGSAP(() => {
    gsap.from('.gsap-y', {
      y: 50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
    })
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setProfileLoading(true);
      setSettingsLoading(true);
      try {
        const auth = await authCheck();
        const user = auth?.user || auth || null;
        let prof = null;
        let id = null;
        if (user) {
          id = user.id;
          if (id) {
            try {
              try {
                prof = await getStudent(id);
              } catch (err) {
                console.debug('students.get failed', err);
              }
            } catch (err) {
              console.debug('import students failed', err);
            }
          }
        }

        if (!prof) {
          try {
            const res = await fetch('/api/student/profile');
            if (res.ok) prof = await res.json();
          } catch (e) { /* ignore */ }
        }

        // fallback to user profile endpoint
        if (!prof && user && user.id) {
          try {
            const up = await Users.getProfile(user.id);
            // Users.getProfile returns { user: { ... } } per backend, unwrap if present
            prof = (up && up.user) ? up.user : (up || prof);
          } catch (err) {
            console.debug('users.getProfile failed', err);
          }
        }

        if (!mounted) return;
        if (user && user.id) setUserId(user.id);
        // normalize profile fields to expected keys (fname/lname/image)
        const normalizeProfile = (p) => {
          if (!p) return {};
          const out = { ...p };
          if (!out.fname && (out.first_name || out.firstName)) out.fname = out.first_name || out.firstName;
          if (!out.lname && (out.last_name || out.lastName)) out.lname = out.last_name || out.lastName;
          if (!out.image && (out.avatar || out.avatar_url || out.avatarUrl)) out.image = out.avatar || out.avatar_url || out.avatarUrl;
          return out;
        };
        if (prof) prof = normalizeProfile(prof);
        console.log(prof)
        setProfile(prof || {});

        try {
          const s = user?.id ? await Users.getSettings(user.id) : null;
          // unwrap wrapper returned by backend: { settings: {...} }
          const serverSettings = s && s.settings ? s.settings : s;
          const defaults = {
            two_factor: false,
            login_alerts: false,
            notify_exams: false,
            notify_schedule: false,
            notify_email: false,
            theme: 'system',
            theme_color: getComputedStyle(root).getPropertyValue('--color-main').trim() || currentColor
          };

          const mapServerToLocal = (srv) => {
            if (!srv) return {};
            return {
              two_factor: srv.two_factor_authentication ?? srv.two_factor ?? false,
              login_alerts: srv.login_alerts ?? false,
              notify_exams: srv.exam_reminder ?? false,
              notify_schedule: srv.schedule_updates ?? false,
              // server uses `notifications` as a general email toggle
              notify_email: srv.notifications ?? false,
              theme: srv.theme ?? 'system',
              theme_color: srv.main_color ?? srv.theme_color ?? (getComputedStyle(root).getPropertyValue('--color-main').trim() || currentColor)
            }
          }

          const mergedSrv = { ... (serverSettings || {}) };
          const mergedLocal = { ...defaults, ...mapServerToLocal(mergedSrv) };
          if (mounted) setSettings(mergedLocal);
          if (mergedLocal && mergedLocal.theme_color) {
            setCurrentColor(mergedLocal.theme_color);
            setMainColor(mergedLocal.theme_color);
          }
          setCurrentTheme((mergedLocal && mergedLocal.theme) || 'system');
        } catch (err) {
          console.debug('users.getSettings failed', err);
        }
      } catch (err) {
        console.error('Failed to load profile/settings', err);
        notify && notify('error', 'Failed to load profile or settings');
      } finally {
        if (mounted) setProfileLoading(false);
        if (mounted) setSettingsLoading(false);
      }
    }
    load();
    return () => { mounted = false }
  }, [])

  const handleProfileChange = (field, value) => {
    // merge locally and persist
    const merged = { ... (profile || {}), [field]: value };
    setProfile(merged);
    // if userId available, persist immediately
    if (userId) {
      (async () => {
        try {
          await Users.updateProfile(userId, merged);
          notify && notify('success', 'Profile saved');
        } catch (err) {
          console.error('Failed to save profile', err);
          notify && notify('error', 'Failed to save profile');
        }
      })();
    }
  }

  const handleSaveProfile = async () => {
    if (!userId) return notify && notify('error', 'No user');
    setProfileLoading(true);
    try {
      await Users.updateProfile(userId, profile);
      notify && notify('success', 'Profile saved');
    } catch (err) {
      console.error(err);
      notify && notify('error', 'Failed to save profile');
    } finally {
      setProfileLoading(false);
    }
  }

  const handleSaveSettings = async () => {
    if (!userId) return notify && notify('error', 'No user');
    setSettingsLoading(true);
    try {
      await Users.updateSettings(userId, settings);
      notify && notify('success', 'Settings saved');
    } catch (err) {
      console.error(err);
      notify && notify('error', 'Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  }

  // Auto-save helper: merge patch into settings locally then persist for the user
  const saveSettings = async (patch) => {
    const merged = { ... (settings || {}), ...patch };
    setSettings(merged);
    if (!userId) return; // nothing to persist yet
    // map frontend keys to server keys for partial update
    const mapLocalToServer = (p) => {
      const out = {};
      if (p.hasOwnProperty('theme')) out.theme = p.theme;
      if (p.hasOwnProperty('theme_color')) out.main_color = p.theme_color;
      if (p.hasOwnProperty('two_factor')) out.two_factor_authentication = p.two_factor;
      if (p.hasOwnProperty('login_alerts')) out.login_alerts = p.login_alerts;
      if (p.hasOwnProperty('notify_exams')) out.exam_reminder = p.notify_exams;
      if (p.hasOwnProperty('notify_schedule')) out.schedule_updates = p.notify_schedule;
      if (p.hasOwnProperty('notify_email')) out.notifications = p.notify_email;
      return out;
    }

    const serverPatch = mapLocalToServer(patch);
    if (Object.keys(serverPatch).length === 0) return;
    setSettingsLoading(true);
    try {
      await Users.updateSettings(userId, serverPatch);
      notify && notify('success', 'Settings saved');
    } catch (err) {
      console.error('Failed to save settings', err);
      notify && notify('error', 'Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  }

  const handleImageChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setProfileLoading(true);
    try {
      const res = await Images.upload(f);
      const imagePath = res?.path || res?.url || res?.data || null;
      if (imagePath) {
        // application expects `image` field for profile images
        handleProfileChange('image', imagePath);
        notify && notify('success', 'Image uploaded');
      }
    } catch (err) {
      console.error('Image upload failed', err);
      notify && notify('error', 'Image upload failed');
    } finally {
      setProfileLoading(false);
    }
  }

  return (
        <div className={`settingsLayout full scrollbar overflow-y-a gap`} style={{ padding: "1em 1em 1em 0" }}>
          <div className='settingsBody'>
            <div className={`BGC gsap-y pd ${profileLoading && "shimmer"}`}>
              {!profileLoading && <>
                <Text text='Profile Settings' align='left' size='var(--text-m)' opacity='0.8' mrg='0 0 1em 0'/>
                <div className='flex column center w100'>
                  <Profile width='5em'                   img={profile?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(((profile?.fname || '') + ' ' + (profile?.lname || '')).trim() || 'Student')}`} />
                  <label htmlFor='profile' className='text-m text-c-main mrth clickable' onClick={() => fileRef.current && fileRef.current.click()}>Upload Picture</label>
                  <input id='profile' type='file' hidden onChange={handleImageChange} ref={fileRef} />
                </div>
                <div className='flex column gap' style={{marginTop:'1em'}}>
                  <div className='flex row gap'>
                    <TextInput width='50%' label="First name" value={profile?.fname ?? ''} onChange={(e) => handleProfileChange('fname', e.target.value)} />
                    <TextInput width='50%' label="Last name" value={profile?.lname ?? ''} onChange={(e) => handleProfileChange('lname', e.target.value)} />
                  </div>
                  <div className='flex row gap'>
                    <TextInput width='50%' type='email' label="Email" value={profile?.email ?? '_'} readOnly />
                    <TextInput width='50%' type='phone' label="Phone" value={profile?.phone ?? '_'} placeholder='Ex: +213 69876543210' onChange={(e) => handleProfileChange('phone', e.target.value)} editable/>
                  </div>
                  <div className='flex row gap'>
                    <TextInput width='50%' label="Birthdate" value={profile?.birthdate ?? '_'} placeholder='Ex: 12-12-2012' onChange={(e) => handleProfileChange('birthdate', e.target.value)} editable/>
                    <TextInput width='50%' label="address" value={profile?.address ?? '_'} placeholder='Ex: Wilaya, City' onChange={(e) => handleProfileChange('address', e.target.value)} editable/>
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
                    <Switchbox label='Two-Factor Authentication (2FA)' desc='Extra security via OTP/email' value={settings?.two_factor ?? false} onChange={(v) => saveSettings({ two_factor: v })} />
                    <Switchbox label='Login Alerts' desc='Notify on new/unfamiliar logins' value={settings?.login_alerts ?? false} onChange={(v) => saveSettings({ login_alerts: v })} />
                </div>
              </>}
            </div>
          </div>
          <div className='settingsSide'>
            <div className={`BGC gsap-y pd ${settingsLoading && "shimmer"}`}>
              {!settingsLoading && <>
                <Text text='Notifications' align='left' size='var(--text-m)' opacity='0.8' mrg='0 0 1em 0'/>
                <div className='flex column gap'>
                  <Switchbox label='Exam remainders' desc='Get notified before exams' value={settings?.notify_exams ?? false} onChange={(v) => saveSettings({ notify_exams: v })} />
                  <Switchbox label='Schedule updates' desc='Receive updates about schedule changes' value={settings?.notify_schedule ?? false} onChange={(v) => saveSettings({ notify_schedule: v })} />
                  <Switchbox label='Email notifications' desc='Receive notifications via email' value={settings?.notify_email ?? false} onChange={(v) => saveSettings({ notify_email: v })} />
                  <Switchbox label='Login Alerts' desc='Notify on new/unfamiliar logins' value={settings?.login_alerts ?? false} onChange={(v) => saveSettings({ login_alerts: v })} />
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
                    <TextInput label="Custom Color" width='8em' placeholder={currentColor} onchange={(e) =>{changeColor(e.target.value)}}/>
                  </div>
                  <Text align='left' text='Interface theme' size='var(--text-m)' />
                  <Text align='left' text='Select or customize your UI theme' size='var(--text-s)' color='var(--text-low)' opacity='0.5'/>
                  <div className='flex row a-center gap' style={{marginTop: '1em'}}>
                    <div className='flex column center clickable' onClick={() => {changeTheme("dark", true)}}>
                      <DarkUI selected={currentTheme == "dark"}/>
                      <Text text='Dark theme' size='var(--text-m)' />
                    </div>
                    <div className='flex column center clickable' onClick={() => {changeTheme("light", true)}}>
                      <LightUI selected={currentTheme == "light"}/>
                      <Text text='Light theme' size='var(--text-m)' />
                    </div>
                    <div className='flex column center clickable' onClick={() => {changeTheme("system", true)}}>
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