import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import styles from './admin.module.css';
import Text from '../../components/text/Text';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import Button from '../../components/buttons/Button';
import SelectInput from '../../components/input/SelectInput';
import TextInput from '../../components/input/TextInput';
import IconButton from '../../components/buttons/IconButton';
import { useNotify } from '../../components/loaders/NotificationContext';
import DangerAction from '../../components/buttons/DangerAction';
import LineBreak from '../../components/shapes/LineBreak';
import { authCheck } from '../../API/auth';
import * as Users from '../../API/users';
import * as Images from '../../API/images';
import * as GeneralSettingsAPI from '../../API/generalSettings';
import * as SemestersAPI from '../../API/semesters';
import * as AcademicYearsAPI from '../../API/academicYears';
import * as DepartmentsAPI from '../../API/departments';
import * as RoomsAPI from '../../API/rooms';
import { ListTable } from '../../components/tables/ListTable';
import Profile from '../../components/containers/Profile';
import Switchbox from '../../components/input/Switchbox';
import Circle from '../../components/shapes/Circle';
import {setMainColor, forceDark, forceLight} from './../../hooks/apearance';
import DarkUI from '../../components/svg/DarkUI';
import LightUI from '../../components/svg/LightUI';
import SystemUI from '../../components/svg/SystemUI';
import Popup from '../../components/containers/Popup';

gsap.registerPlugin(useGSAP);

{/*
const maxOdd = (n) => {
  return [...String(n).split('').filter(d => d % 2 !== 0).map(Number)].length == String(n).split('').length
};
*/}

const General = ({settings, setSettings, semesters, onSave, userRole}) => {
  const semOptions = (semesters || []).map(s => ({ value: s.id, text: `${s.name} (${s.academic_year?.start_year || ''}-${s.academic_year?.end_year || ''})` }))
  return (
  userRole === 'admin' ? (
    <>
      <div className="flex row a-end gap">
        <SelectInput label='Current Semester' options={semOptions.length ? semOptions : [{ value: '', text: 'Select semester' }]} value={settings.semester_id || ''} onChange={(v) => { setSettings({...settings, semester_id: v}); onSave && onSave({ semester_id: v }) }} />
        <Text align='left' text='Defines the semester used for modules, groups, and exams.' size='var(--text-m)'/>
      </div>
      <Text align='left' text='Period' size='var(--text-m)' color='var(--text-low)' mrg='1em 0 0 0'/>
      <div className="flex column gap w100">
          <div className="flex row gap a-end">
          <div className="flex row a-center" style={{textWrap: 'nowrap'}}>
            <Text mrg='0 0 0.5em 0' align='left' text='Semester 1' size='var(--text-m)' color='var(--text-low)' />
          </div>
          <TextInput width='30%' label="Start Date" type='datetime-local' value={settings.s1_start || ''} onChange={(e) => { setSettings({...settings, s1_start: e.target.value}); onSave && onSave({ s1_start: e.target.value }) }} />
          <TextInput width='30%' label="End Date" type='datetime-local' value={settings.s1_end || ''} onChange={(e) => { setSettings({...settings, s1_end: e.target.value}); onSave && onSave({ s1_end: e.target.value }) }} />
        </div>
        <div className="flex row gap a-end">
          <div className="flex row a-center" style={{textWrap: 'nowrap'}}>
            <Text mrg='0 0 0.5em 0' align='left' text='Semester 2' size='var(--text-m)' color='var(--text-low)' />
          </div>
          <TextInput width='30%' label="Start Date" type='datetime-local' value={settings.s2_start || ''} onChange={(e) => { setSettings({...settings, s2_start: e.target.value}); onSave && onSave({ s2_start: e.target.value }) }} />
          <TextInput width='30%' label="End Date" type='datetime-local' value={settings.s2_end || ''} onChange={(e) => { setSettings({...settings, s2_end: e.target.value}); onSave && onSave({ s2_end: e.target.value }) }} />
        </div>
      </div>
      <Text align='left' text='Export / Backup' size='var(--text-m)' color='var(--text-low)' mrg='1em 0 0 0'/>
      <div className="flex column gap w100">
        <div className="flex row gap">
          <PrimaryButton text='Export Database' onClick={() => { /* implement export */ }} />
          <SecondaryButton text='Backup Now' onClick={() => { /* implement backup */ }} />
        </div>
      </div>
    </>
  ) : (
  <div className='flex full center'>
    <Text text='Not Authorized' align='center' size='var(--text-m)' color='var(--text-low)' />
  </div>
  )
)
}

const Appearance = ({currentColor, currentTheme, changeColor, changeTheme}) => {
  return <>
    <div className='flex column j-center'>
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
  </>
}

const Account = ({profile, profileLoading, fileRef, handleImageChange, handleProfileChange, handleSaveProfile}) => {
  return <>
    <div className={`BGC pd ${profileLoading && "shimmer"}`}>
      {!profileLoading && <>
        <div className='flex column center w100'>
          <Profile width='5em' img={profile?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(((profile?.fname || '') + ' ' + (profile?.lname || '')).trim() || 'Admin')}`} />
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
            <TextInput width='50%' label="Birthdate" value={profile?.birth_date ?? '_'} placeholder='Ex: 2000-01-01' onChange={(e) => handleProfileChange('birth_date', e.target.value)} editable/>
            <TextInput width='50%' label="Address" value={profile?.address ?? '_'} placeholder='Ex: Wilaya, City' onChange={(e) => handleProfileChange('address', e.target.value)} editable/>
          </div>
          <div className='flex row j-end'>
            <SecondaryButton text='Save Profile' onClick={handleSaveProfile} />
          </div>
        </div>
      </>}
    </div>
  </>
}

const Security = ({settings, saveSettings}) => {
  return <>
    <div className='flex column gap'>
      <div className='flex row a-center j-spacebet w100'>
        <Text text='Password policy' align='left' size='var(--text-m)' />
        <SecondaryButton icon='fa-solid fa-key' text='Change Password' />
      </div>
      <Switchbox label='Enforce 2FA for admins' desc='Require two-factor for admin accounts' value={settings.enforce_2fa ?? false} onChange={(v) => saveSettings({ enforce_2fa: v })} />
      <Switchbox label='Login Alerts' desc='Notify on new/unfamiliar logins' value={settings.login_alerts ?? false} onChange={(v) => saveSettings({ login_alerts: v })} />
    </div>
  </>
}

const Notifications = ({settings, saveSettings}) => {
  return <>
    <div className='flex column gap'>
      <Switchbox label='Exam reminders' desc='Notify before exams' value={settings.notify_exams ?? false} onChange={(v) => saveSettings({ notify_exams: v })} />
      <Switchbox label='Schedule updates' desc='Receive updates about schedule changes' value={settings.notify_schedule ?? false} onChange={(v) => saveSettings({ notify_schedule: v })} />
      <Switchbox label='Email notifications' desc='Receive notifications via email' value={settings.notify_email ?? false} onChange={(v) => saveSettings({ notify_email: v })} />
      <Switchbox label='Login Alerts' desc='Notify on new/unfamiliar logins' value={settings.login_alerts ?? false} onChange={(v) => saveSettings({ login_alerts: v })} />
    </div>
  </>
}

const Rooms = ({rooms, onAddRoom, onEditRoom, onDeleteRoom, showAddForm, setShowAddForm, modalLoading = false}) => {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', capacity: '', disabled: false, type: 'classroom' });

  const handleAdd = async () => {
    if (!formData.name || !formData.capacity) return;
    try {
      await onAddRoom(formData);
      setFormData({ name: '', capacity: '', disabled: false, type: 'classroom' });
      setShowAddForm(false);
    } catch (err) {
      // errors handled by parent/onAddRoom
    }
  };

  const handleEdit = async () => {
    if (!formData.name || !formData.capacity) return;
    try {
      await onEditRoom(editingId, formData);
      setFormData({ name: '', capacity: '', disabled: false, type: 'classroom' });
      setEditingId(null);
      setShowAddForm(false);
    } catch (err) {
      // errors handled by parent/onEditRoom
    }
  };

  const handleStartEdit = (room) => {
    setFormData({ name: room.name, capacity: room.capacity, disabled: room.disabled, type: room.type || 'classroom' });
    setEditingId(room.id);
    setShowAddForm(true);
  };

  const handleCloseModal = () => {
    setEditingId(null);
    setFormData({ name: '', capacity: '', disabled: false });
    setShowAddForm(false);
  };

  return <>
    <div className='flex row a-center j-spacebet w100 mdb'>
      <div className='flex row a-center gap'>
      </div>
      <PrimaryButton icon='fa-solid fa-plus' text='Add Room' onClick={() => { setEditingId(null); setFormData({ name: '', capacity: '', disabled: false }); setShowAddForm(true); }} />
    </div>
    <div className="flex center w100" style={{maxHeight: "70vh", minHeight:"400px"}}>
      <ListTable
            title="Rooms"
            rowTitles={["Name", "Type", "Capacity", "Status", "Action"]}
            rowTemplate="0.4fr 0.2fr 0.2fr 0.15fr 0.05fr"
            dataList={{ total: rooms.length, items: rooms }}
            filterFunction={(room, text) => 
              room.name.toLowerCase().includes(text.toLowerCase())
            }
            sortFunction={(a, b, sort) => {
              if (sort === "A-Z") return a.name.localeCompare(b.name);
              if (sort === "Z-A") return b.name.localeCompare(a.name);
              return 0;
            }}
            rowRenderer={(room) => (
              <>
                <Text align='left' text={room.name} size='var(--text-m)' />
                <Text align='left' text={(room.type || 'classroom').replace(/^(.)/, s => s.toUpperCase())} size='var(--text-m)' />
                <Text align='left' text={String(room.capacity)} size='var(--text-m)' />
                <div className='flex row a-center gap'>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: room.disabled ? 'var(--text-low)' : '#1EA807'
                  }} />
                  <Text text={room.disabled ? 'Disabled' : 'Active'} size='var(--text-s)' color={room.disabled ? 'var(--text-low)' : 'var(--text)'} />
                </div>
                <div className='flex row a-center gap'>
                  <IconButton icon='fa-solid fa-pencil' onClick={() => handleStartEdit(room)} title='Edit' />
                  <IconButton icon='fa-solid fa-trash' onClick={() => onDeleteRoom(room.id)} title='Delete' />
                </div>
              </>
            )}
          />
        </div>
          
          <Popup isOpen={showAddForm} blur={2} bg='rgba(0,0,0,0.02)' onClose={handleCloseModal}>
            <div style={{ maxWidth: '520px', padding: '1.5em' }} className={`${styles.dashBGC}`}>
              <div className="flex row a-center j-spacebet">
                <Text text={editingId ? 'Edit Room' : 'Add New Room'} size='var(--text-l)' color='var(--text)' align='left' />
                {!modalLoading && <IconButton icon='fa-solid fa-xmark' onClick={handleCloseModal} />}
              </div>
              <div className="flex column gap" style={{marginTop: '1em'}}>
                <TextInput label='Room Name' val={formData.name} onchange={(e) => setFormData({...formData, name: e.target.value})} placeholder='Enter room name' editable={true} />
                <SelectInput label='Type' options={[{ value: 'classroom', text: 'Classroom' }, { value: 'laboratory', text: 'Laboratory' }, { value: 'amphitheater', text: 'Amphitheater' }]} value={formData.type} onChange={(v) => setFormData({...formData, type: v})} />
                <TextInput label='Capacity' type='number' val={formData.capacity} onchange={(e) => setFormData({...formData, capacity: e.target.value})} placeholder='Enter capacity' editable={true} />
                <Switchbox label='Disabled' value={formData.disabled} onChange={(v) => setFormData({...formData, disabled: v})} />
                <div className="flex row j-end gap">
                  <SecondaryButton text='Cancel' onClick={handleCloseModal} isLoading={modalLoading} />
                  <PrimaryButton text={editingId ? 'Update' : 'Create'} onClick={editingId ? handleEdit : handleAdd} isLoading={modalLoading} />
                </div>
              </div>
            </div>
          </Popup>
        </>
      };

const AdminSettings = () => {

  document.title = "Unitime - Settings";

  useGSAP(() => {
    gsap.set('.gsap-y', {y:0, zIndex:1, opacity: 1})
    gsap.from('.gsap-y', { 
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
    })
  });

  const notify = useNotify();
  const root = document.documentElement;
  const [profileLoading, setProfileLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [currentSubpage, setCurrentSubpage] = useState("General");
  const [settings, setSettings] = useState({});
  const [profile, setProfile] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [deptGeneral, setDeptGeneral] = useState(null);
  const [editingDept, setEditingDept] = useState(false);
  const [editingDeptGeneral, setEditingDeptGeneral] = useState(false);
  const [modalDeptGeneral, setModalDeptGeneral] = useState({ semester_id: null, academic_year_id: null });
  const [rooms, setRooms] = useState([]);
  const [showRoomAddForm, setShowRoomAddForm] = useState(false);
  const [roomModalLoading, setRoomModalLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const fileRef = useRef(null);
  const [userRole, setUserRole] = useState('');
  const [currentColor, setCurrentColor] = useState('#F1504A');
  const [currentTheme, setCurrentTheme] = useState('system');

  useEffect(() => {
    const defaults = {
      current_semester: 'S1',
      s1_start: '',
      s1_end: '',
      s2_start: '',
      s2_end: '',
      department_name: 'Computer Science',
      academic_year: '4 Sep 2025 - 28 May 2026'
    };
    setSettings(defaults);
  }, [])

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
              const up = await Users.getProfile(id);
              prof = (up && up.user) ? up.user : (up || prof);
            } catch (err) {
              console.debug('users.getProfile failed', err);
            }
          }
        }

        if (!prof) {
          try {
            const res = await fetch('/api/user/profile');
            if (res.ok) prof = await res.json();
          } catch { /* ignore */ }
        }

        if (!mounted) return;
        if (user && user.id) setUserId(user.id);
        if (user && user.role) setUserRole(user.role);

        const normalizeProfile = (p) => {
          if (!p) return {};
          const out = { ...p };
          if (!out.fname && (out.first_name || out.firstName)) out.fname = out.first_name || out.firstName;
          if (!out.lname && (out.last_name || out.lastName)) out.lname = out.last_name || out.lastName;
          if (!out.image && (out.avatar || out.avatar_url || out.avatarUrl)) out.image = out.avatar || out.avatar_url || out.avatarUrl;
          return out;
        };
        if (prof) prof = normalizeProfile(prof);
        setProfile(prof || {});

        // Load lookups (semesters, academic years)
        try {
          const [sres, ayres] = await Promise.all([SemestersAPI.getAll(), AcademicYearsAPI.getAll()]);
          if (!mounted) return;
          setSemesters(sres || []);
          setAcademicYears(ayres || []);
        } catch (err) {
          console.debug('Failed to load lookups', err);
        }

        // Load departments, rooms, and department general setting in parallel
        const deptId = prof?.department_id || prof?.department?.id || null;
        try {
          const promises = [
            DepartmentsAPI.getAll(),
            RoomsAPI.getAll()
          ];
          if (deptId) {
            promises.push(GeneralSettingsAPI.getByDepartment(deptId));
          }
          const [dres, rres, gres] = await Promise.all(promises);
          if (!mounted) return;
          setDepartments(dres || []);
          setRooms(rres || []);
          if (deptId && gres) {
            const g = (gres && (gres.general_setting || gres)) ? (gres.general_setting || gres) : null;
            setDeptGeneral(g);
          }
        } catch (err) {
          console.debug('Failed to load departments/rooms/general', err);
        }

        // Load user settings with defaults and field mapping
        try {
          const s = user?.id ? await Users.getSettings(user.id) : null;
          const serverSettings = s && s.settings ? s.settings : s;
          const defaults = {
            two_factor: false,
            login_alerts: false,
            notify_exams: false,
            notify_schedule: false,
            notify_email: false,
            theme: 'system',
            theme_color: getComputedStyle(root).getPropertyValue('--color-main').trim() || currentColor,
            semester_id: null,
            academic_year_id: null,
          };

          const mapServerToLocal = (srv) => {
            if (!srv) return {};
            return {
              two_factor: srv.two_factor_authentication ?? false,
              login_alerts: srv.login_alerts ?? false,
              notify_exams: srv.exam_reminder ?? false,
              notify_schedule: srv.schedule_updates ?? false,
              notify_email: srv.notifications ?? false,
              theme: srv.theme ?? 'system',
              theme_color: srv.main_color ?? (getComputedStyle(root).getPropertyValue('--color-main').trim() || currentColor),
              semester_id: srv.semester_id ?? null,
              academic_year_id: srv.academic_year_id ?? null,
            }
          }

          const mergedSrv = { ...(serverSettings || {}) };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notify]);

  const handleProfileChange = (field, value) => {
    const merged = { ...(profile || {}), [field]: value };
    setProfile(merged);
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

  const handleImageChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setProfileLoading(true);
    try {
      const res = await Images.upload(f);
      const imagePath = res?.path || res?.url || res?.data || null;
      if (imagePath) {
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

  const changeTheme = (theme, persist = false) => {
    setCurrentTheme(theme);
    if(theme !== 'system'){
      theme === 'dark' ? forceDark() : forceLight();
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

  const changeDepartment = async (deptId) => {
    setProfileLoading(true);
    try {
      const deptName = departments.find(d => d.id === deptId)?.name || '';
      setProfile({ ...profile, department_id: deptId, department: { id: deptId, name: deptName } });
      await Users.updateProfile(userId, { department_id: deptId });
      notify && notify('success', 'Department updated');
      // Refresh department general setting after switching
      try {
        const gres = await GeneralSettingsAPI.getByDepartment(deptId);
        const g = (gres && (gres.general_setting || gres)) ? (gres.general_setting || gres) : null;
        setDeptGeneral(g);
      } catch (err) {
        console.debug('Failed to refresh department general setting', err);
      }
      setEditingDept(false);
    } catch (err) {
      console.error('Failed to update department', err);
      notify && notify('error', 'Failed to update department');
    } finally {
      setProfileLoading(false);
    }
  }

  const saveSettings = async (patch) => {
    const merged = { ...(settings || {}), ...patch };
    setSettings(merged);
    if (!userId) return;

    const mapLocalToServer = (p) => {
      const out = {};
      if ('theme' in p) out.theme = p.theme;
      if ('theme_color' in p) out.main_color = p.theme_color;
      if ('two_factor' in p) out.two_factor_authentication = p.two_factor;
      if ('login_alerts' in p) out.login_alerts = p.login_alerts;
      if ('notify_exams' in p) out.exam_reminder = p.notify_exams;
      if ('notify_schedule' in p) out.schedule_updates = p.notify_schedule;
      if ('notify_email' in p) out.notifications = p.notify_email;
      if ('semester_id' in p) out.semester_id = p.semester_id;
      if ('academic_year_id' in p) out.academic_year_id = p.academic_year_id;
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

  const saveDeptGeneral = async () => {
    const deptId = profile?.department_id || profile?.department?.id || null;
    if (!deptId) return notify && notify('error', 'No department selected');
    setSettingsLoading(true);
    try {
      const payload = {
        semester_id: modalDeptGeneral.semester_id || null,
        academic_year_id: modalDeptGeneral.academic_year_id || null,
      };
      const res = await GeneralSettingsAPI.updateByDepartment(deptId, payload);
      const g = (res && (res.general_setting || res)) ? (res.general_setting || res) : null;
      setDeptGeneral(g);
      notify && notify('success', 'Department settings updated');
      setEditingDeptGeneral(false);
    } catch (err) {
      console.error('Failed to save department general setting', err);
      notify && notify('error', 'Failed to save department settings');
    } finally {
      setSettingsLoading(false);
    }
  }

  const handleAddRoom = async (data) => {
    setRoomModalLoading(true);
    try {
      const res = await RoomsAPI.add({
        name: data.name,
        capacity: parseInt(data.capacity),
        disabled: data.disabled,
        type: data.type || 'classroom'
      });
      const room = res.room || res;
      setRooms([...rooms, room]);
      notify && notify('success', 'Room added successfully');
      setShowRoomAddForm(false);
      return room;
    } catch (err) {
      console.error('Failed to add room', err);
      notify && notify('error', 'Failed to add room');
      return null;
    } finally {
      setRoomModalLoading(false);
    }
  };

  const handleEditRoom = async (id, data) => {
    setRoomModalLoading(true);
    try {
      const res = await RoomsAPI.update(id, {
        name: data.name,
        capacity: parseInt(data.capacity),
        disabled: data.disabled,
        type: data.type || 'classroom'
      });
      const updated = res.room || res;
      setRooms(rooms.map(r => r.id === id ? updated : r));
      notify && notify('success', 'Room updated successfully');
      setShowRoomAddForm(false);
      return updated;
    } catch (err) {
      console.error('Failed to update room', err);
      notify && notify('error', 'Failed to update room');
      return null;
    } finally {
      setRoomModalLoading(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await RoomsAPI.remove(id);
      setRooms(rooms.filter(r => r.id !== id));
      notify && notify('success', 'Room deleted successfully');
    } catch (err) {
      console.error('Failed to delete room', err);
      notify && notify('error', 'Failed to delete room');
    }
  };

  return (
    <div className={`${styles.settingsLayout} full scrollbar pdv`}>
      <div className={`${styles.settingsHeader}`} style={{paddingBottom:"0.5em "}}>
        <div className={`flex row a-center`}>
          <Text align='left' text='System /' color='var(--text-low)' size='var(--text-m)' />
          <Text align='left' mrg='0 0 0 0.25em' text='Settings' size='var(--text-m)' />
          <Text align='left' mrg='0 0 0 0.25em' text={`> ${currentSubpage}`} size='var(--text-m)' />
        </div>
      </div>
      <div className={`${styles.settingsContent} full`}>
        <div className={`${styles.settingsMain} full ${settingsLoading && "shimmer"} gsap-y ${styles.dashBGC}`}>
            {!settingsLoading && <div className="full flex column a-center">
              <div className="flex row a-center gap" style={{height: "2em"}}>
                <Text css='clickable' align='left' text="Account" high={currentSubpage == 'Account'} color={currentSubpage == 'Account'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("Account")}}/>
                <Text css='clickable' align='left' text="General" high={currentSubpage == 'General'} color={currentSubpage == 'General'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("General")}}/>
                <Text css='clickable' align='left' text="Security" high={currentSubpage == 'Security'} color={currentSubpage == 'Security'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("Security")}}/>
                <Text css='clickable' align='left' text="Appearance" high={currentSubpage == 'Appearance'} color={currentSubpage == 'Appearance'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("Appearance")}}/>
                <Text css='clickable' align='left' text="Notifications" high={currentSubpage == 'Notifications'} color={currentSubpage == 'Notifications'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("Notifications")}}/>
                <Text css='clickable' align='left' text="Rooms" high={currentSubpage == 'Rooms'} color={currentSubpage == 'Rooms'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("Rooms")}}/>
              </div>
              <LineBreak mrg='0.625em 0' w='40%' h='3px' color='var(--trans-grey)'/>
              <div className="flex column pdt gap w100">
                {currentSubpage == 'Account' && <Account settings={settings} setSettings={setSettings} profile={profile} profileLoading={profileLoading} fileRef={fileRef} handleImageChange={handleImageChange} handleProfileChange={handleProfileChange} handleSaveProfile={handleSaveProfile} />}
                {currentSubpage == 'General' && <General settings={settings} setSettings={setSettings} semesters={semesters} academicYears={academicYears} onSave={saveSettings} userRole={userRole} />}
                {currentSubpage == 'Security' && <Security settings={settings} saveSettings={saveSettings} />}
                {currentSubpage == 'Appearance' && <Appearance currentColor={currentColor} currentTheme={currentTheme} changeColor={changeColor} changeTheme={changeTheme} />}
                {currentSubpage == 'Notifications' && <Notifications settings={settings} saveSettings={saveSettings} />}
                {currentSubpage == 'Rooms' && <Rooms rooms={rooms} onAddRoom={handleAddRoom} onEditRoom={handleEditRoom} onDeleteRoom={handleDeleteRoom} showAddForm={showRoomAddForm} setShowAddForm={setShowRoomAddForm} modalLoading={roomModalLoading} />}
              </div>
            </div>}
        </div>
        <div className={`${styles.settingsSide} flex column gap full`}>
          {userRole === 'admin' ? (
            <>
              <div className={`${styles.settingsRect} full ${settingsLoading && "shimmer"} gsap-y ${styles.dashBGC}`}>
                {!settingsLoading && <div className="flex full column gap">
                    <div style={{cursor: 'pointer'}} onClick={() => setEditingDept(true)}>
                      <TextInput readOnly val={profile?.department?.name || ''} label='Department Name' editable = {true} />
                    </div>
                  <div className="flex row a-center gap" style={{cursor: 'pointer'}} onClick={() => {
                      const init = { semester_id: deptGeneral?.semester_id || deptGeneral?.semester?.id || settings.semester_id || null, academic_year_id: deptGeneral?.academic_year_id || deptGeneral?.academic_year?.id || settings.academic_year_id || null };
                      setModalDeptGeneral(init);
                      setEditingDeptGeneral(true);
                    }}>
                  </div>
                  <div className="flex row a-center gap" style={{cursor: 'pointer'}} onClick={() => {
                      const init = { semester_id: deptGeneral?.semester_id || deptGeneral?.semester?.id || settings.semester_id || null, academic_year_id: deptGeneral?.academic_year_id || deptGeneral?.academic_year?.id || settings.academic_year_id || null };
                      setModalDeptGeneral(init);
                      setEditingDeptGeneral(true);
                    }}>
                    <TextInput readOnly val={(deptGeneral?.academic_year && `${deptGeneral.academic_year.start_year} - ${deptGeneral.academic_year.end_year}`) || (academicYears.find(a => a.id === settings.academic_year_id) ? `${academicYears.find(a => a.id === settings.academic_year_id).start_year} - ${academicYears.find(a => a.id === settings.academic_year_id).end_year}` : '')} label='Academic Year' editable={true} />
                  </div>
                </div>}
              </div>
              <div className={`${styles.settingsCtr} full ${settingsLoading && "shimmer"} gsap-y ${styles.dashBGC}`}>
                  {!settingsLoading && <div className="flex full column gap">
                    <Text text='System maintenance' align='left' size='var(--text-m)' color='var(--text-low)'/>
                    <div className="flex column gap center w100">
                      <DangerAction css="w100" title='Reset all schedules (exams + monitoring)' onAction={() => {}} />
                      <DangerAction css="w100" title='Clean up orphaned groups' onAction={() => {}} />
                      <DangerAction css="w100" title='Clear old notifications' onAction={() => {}} />
                      <DangerAction css="w100" title='Clear old validation requests' onAction={() => {}} />
                    </div>
                  </div>}
              </div>
            </>
          ) : (
            <>
              <div className={`${styles.settingsRect} full gsap-y ${styles.dashBGC}`}>
                <div className='flex column full center'>
                  <i className="fa-solid fa-lock text-m" style={{color:"var(--text-low)"}}/>
                  <Text text='Not Authorized' align='center' size='var(--text-m)' color='var(--text-low)' />
                </div>
              </div>
              <div className={`${styles.settingsCtr} full gsap-y ${styles.dashBGC}`}>
                <div className='flex column full center'>
                  <i className="fa-solid fa-lock text-m" style={{color:"var(--text-low)"}}/>
                  <Text text='Not Authorized' align='center' size='var(--text-m)' color='var(--text-low)' />
                </div>
              </div>
            </>
          )}
        </div>
    
          <Popup isOpen={editingDept} blur={2} bg='rgba(0,0,0,0.2)' onClose={() => setEditingDept(false)}>
            <div className={`${styles.dashBGC}`} style={{ maxWidth: '480px', padding: '1.5em' }}>
              <div className="flex row a-center j-spacebet">
                <Text text='Select Department' size='var(--text-l)' color='var(--text)' align='left' />
                <IconButton icon='fa-solid fa-xmark' onClick={() => setEditingDept(false)} />
              </div>
              <div className="flex column gap" style={{marginTop: '1em'}}>
                <SelectInput
                  bg='var(--bg)'
                  label='Department'
                  placeholder='Choose department'
                  options={departments.length ? departments.map(d => ({ value: d.id, text: d.name })) : [{ value: '', text: 'Loading...' }]}
                  value={profile?.department_id || ''}
                  onChange={(v) => changeDepartment(v)}
                />
                <div className="flex row j-end">
                  <SecondaryButton text='Cancel' onClick={() => setEditingDept(false)} />
                </div>
              </div>
            </div>
          </Popup>
          <Popup isOpen={editingDeptGeneral} blur={2} bg='rgba(0,0,0,0.2)' onClose={() => setEditingDeptGeneral(false)}>
            <div className={`${styles.dashBGC}`} style={{ maxWidth: '520px', padding: '1.5em' }}>
              <div className="flex row a-center j-spacebet">
                <Text text='Edit Department Semester' size='var(--text-l)' color='var(--text)' align='left' />
                <IconButton icon='fa-solid fa-xmark' onClick={() => setEditingDeptGeneral(false)} />
              </div>
              <div className="flex column gap" style={{marginTop: '1em'}}>
                <SelectInput
                  bg='var(--bg)'
                  label='Current Semester'
                  placeholder='Choose semester'
                  options={semesters.length ? semesters.map(s => ({ value: s.id, text: `${s.name} (${s.academic_year?.start_year || ''}-${s.academic_year?.end_year || ''})` })) : [{ value: '', text: 'Loading...' }]}
                  value={modalDeptGeneral.semester_id || ''}
                  onChange={(v) => setModalDeptGeneral({ ...modalDeptGeneral, semester_id: v })}
                />
                <SelectInput
                  bg='var(--bg)'
                  label='Academic Year'
                  placeholder='Choose academic year'
                  options={academicYears.length ? academicYears.map(a => ({ value: a.id, text: `${a.start_year} - ${a.end_year}` })) : [{ value: '', text: 'Loading...' }]}
                  value={modalDeptGeneral.academic_year_id || ''}
                  onChange={(v) => setModalDeptGeneral({ ...modalDeptGeneral, academic_year_id: v })}
                />
                <div className="flex row j-end gap">
                  <SecondaryButton text='Cancel' onClick={() => setEditingDeptGeneral(false)} />
                  <PrimaryButton text='Save' onClick={saveDeptGeneral} />
                </div>
              </div>
            </div>
          </Popup>
          
      </div>
      
    </div>
  )
}

export default AdminSettings