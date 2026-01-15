import React, { useRef, useEffect, useState } from 'react'

import styles from './admin.module.css'

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

import Text from '../../components/text/Text';
import Float from '../../components/containers/Float';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import FloatButton from '../../components/buttons/FloatButton';
import IconButton from '../../components/buttons/IconButton';
import { ListTable } from '../../components/tables/ListTable';
import Profile from '../../components/containers/profile';
import Popup from '../../components/containers/Popup';
import TextInput from '../../components/input/TextInput';
import SelectInput from '../../components/input/SelectInput';
import { useNotify } from '../../components/loaders/NotificationContext';
import ImageInput from '../../components/input/ImageInput';
import ConfirmDialog from '../../components/containers/ConfirmDialog';

import { Teachers, Specialities } from '../../API'
import * as Users from '../../API/users'
import { authCheck } from '../../API/auth'
import * as XLSX from 'xlsx'


const fetchTeachers = async () => {
  try {
    const resp = await Teachers.getAll()
    const data = resp ?? []
    const items = Array.isArray(data)
      ? data
      : (data.data || data.items || data.teachers || [])
    return items
  } catch (err) {
    console.error('Failed fetching teachers', err.response || err.message)
    return []
  }
}

const AdminTeachers = () => {

  document.title = "Unitime - Teachers";

  const { notify } = useNotify();
  const [listLoading, setListLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [teachersList, setTeachersList] = useState({ total: 0, teachers: [] })
  const [specialitiesOptions, setSpecialitiesOptions] = useState([])
  const layoutPath = useRef(null);
  const layoutHead = useRef(null);
  const layoutBody = useRef(null);
  const fileInputRef = useRef(null);
  const [addmodal, setAddmodal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'normal',
    title: '',
    message: '',
    action: null,
    actionData: null
  });
  const [formData, setFormData] = useState({
    title: '',
    fname: '',
    lname: '',
    number: '',
    position: '',
    speciality: '',
    department: '',
    phone: '',
    email: '',
    image: null
  });
  const [adminProfile, setAdminProfile] = useState(null);

  const downloadTemplate = () => {
    const headers = ['firstname', 'lastname', 'adj', 'number', 'departement', 'position', 'speciality', 'phone', 'email', 'image', 'password']
    const sampleData = [
      ['Ryad', 'Mehrez', 'Mr', '991122331', 'Computer Science', 'Associate Professor', 'Data Science', '7417417411', 'ryad.mehrez@univ-alger.dz', 'https://api.dicebear.com/7.x/initials/svg?seed=RyadMehrez', '00112233'],
      ['Youcef', 'Atal', 'Mr', '112233442', 'Computer Science', 'Lecturer', 'DevOps Engineering', '7417417412', 'youcef.atal@univ-alger.dz', 'https://api.dicebear.com/7.x/initials/svg?seed=YoucefAtal', '11223344'],
      ['Ismail', 'Bennacer', 'Mr', '223344553', 'Computer Science', 'Assistant Professor', 'Web Technologies', '7417417413', 'ismail.Bennacer@univ-alger.dz', 'https://api.dicebear.com/7.x/initials/svg?seed=IsmailBennacer', '22334455']
    ]
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers Template')
    XLSX.writeFile(wb, 'teachers_import_template.xlsx')
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setListLoading(true)
      const items = await fetchTeachers()
      if (!mounted) return
      setTeachersList({ total: items.length, teachers: items })
      setListLoading(false)
    }
    load()
    let mountedSpecs = true
    const loadSpecs = async () => {
      // Load admin profile to get department_id
      try {
        const auth = await authCheck()
        const user = auth?.user || auth || null
        if (user && user.id) {
          const prof = await Users.getProfile(user.id)
          if (mounted && prof && prof.user) {
            setAdminProfile(prof.user)
            // set newbie flag to false
            if (user.newbie) {
              try { 
                await Users.setNewbie(user.id, false)
               } 
                catch(e){ console.debug('setNewbie failed', e) }
            }
          }
        }
      } catch (err) { 
        console.warn('Failed to load admin profile', err) 
      }

      // Load specialities with department data
      try {
        const resp = await Specialities.getAll()
        const data = resp ?? []
        const list = Array.isArray(data) ? data : (data.data || data.items || data.specialities || [])
        if (!mountedSpecs) return
        const options = list.map(item => {
          if (typeof item === 'string') return { value: item, text: item }
          if (item.id && (item.name || item.title)) return { 
            value: item.id, 
            text: item.name || item.title,
            department: item.department?.name || item.department || ''
          }
          if (item.code && item.label) return { value: item.code, text: item.label }
          if (item.name) return { value: item.name, text: item.name }
          if (item.speciality) return { value: item.speciality, text: item.speciality }
          return { value: JSON.stringify(item), text: String(item) }
        })
        setSpecialitiesOptions(options)
      } catch (err) {
        console.error('Failed to fetch specialities', err)
      }
    }
    loadSpecs()
    return () => { mounted = false }
  }, [])
  useEffect(() => {
    const HH = layoutPath.current.offsetHeight + layoutHead.current.offsetHeight
    layoutBody.current.style.maxHeight = `calc(100vh - ${HH}px - 2.5em)`
  }, []);
  useGSAP(() => {
    gsap.from('.gsap-y', { zIndex: 0 });
    gsap.from('.gsap-y', {
      y: 50,
      zIndex: 0,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
    })
  });

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleImageChange = (file) => {
    setFormData(prev => ({ ...prev, image: file }));
  };
  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      title: teacher.adj || '',
      fname: teacher.fname || '',
      lname: teacher.lname || '',
      number: teacher.number || '',
      position: teacher.position || '',
      speciality: teacher.speciality_id || teacher.speciality || '',
      department: teacher.department || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      image: teacher.image || null
    });
    setAddmodal(true);
  };
  const handleDeleteTeacher = (teacher) => {
    return (async () => {
      if (!teacher || !teacher.number) return;
      try {
        await Teachers.remove(teacher.number);
        const items = await fetchTeachers();
        setTeachersList({ total: items.length, teachers: items });
        notify("success", "Teacher deleted!");
      } catch (err) {
        console.error('Failed to delete teacher', err?.response || err?.message || err);
        throw err
      }
    })()
  };
  const openConfirmDialog = (type, title, message, action, actionData = null) => {
    setConfirmDialog({
      isOpen: true,
      type,
      title,
      message,
      action,
      actionData
    });
  };
  const handleConfirmAction = async () => {
    const { action, actionData } = confirmDialog;
    setDialogLoading(true)
    try {
      if (action === 'add') {
        setAddmodal(false)
        await submitAddTeacher()
      } else if (action === 'edit') {
        setAddmodal(false)
        await submitEditTeacher()
      } else if (action === 'delete') {
        await handleDeleteTeacher(actionData);
      }
    } catch (err) {
      console.error('Action failed', err)
    } finally {
      setDialogLoading(false)
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };
  const handleCancelConfirm = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };
  const submitAddTeacher = async () => {
    if (!formData.fname || !formData.lname || !formData.number) {
      console.error('Missing required fields')
      return
    }
    setAddmodal(false)
    try {
      const fullName = `${formData.fname} ${formData.lname}`.trim()
      const password = String(formData.number)

      let payload
      let useFormData = formData.image && typeof formData.image !== 'string' && !(formData.image instanceof String)

      if (useFormData) {
        payload = new FormData()
        payload.append('adj', formData.title || '')
        payload.append('fname', formData.fname || '')
        payload.append('lname', formData.lname || '')
        payload.append('number', formData.number || '')
        payload.append('position', formData.position || '')
        payload.append('speciality_id', formData.speciality ? parseInt(formData.speciality) : '')
        payload.append('phone', formData.phone || '')
        payload.append('email', formData.email || '')
        payload.append('password', password)
        payload.append('image', formData.image)
      } else {
        const imageUrl = formData.image && typeof formData.image === 'string'
          ? formData.image
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`

        payload = {
          adj: formData.title || '',
          fname: formData.fname || '',
          lname: formData.lname || '',
          number: formData.number || '',
          position: formData.position || '',
          speciality_id: formData.speciality ? parseInt(formData.speciality) : '',
          phone: formData.phone || '',
          email: formData.email || '',
          password,
          image: imageUrl
        }
      }

      await Teachers.add(payload)

      const items = await fetchTeachers()
      setTeachersList({ total: items.length, teachers: items })

      notify('success', 'Teacher added!')

      setFormData({
        title: '',
        fname: '',
        lname: '',
        number: '',
        position: '',
        speciality: '',
        department: '',
        phone: '',
        email: '',
        image: null
      })
      setEditingTeacher(null)
      setAddmodal(false)
    } catch (err) {
      console.error('Failed to add teacher', err?.response || err?.message || err)
      notify('error', err?.response?.data?.message || err?.message || 'Failed to add teacher')
    }
  }
  const submitEditTeacher = async () => {
    if (!editingTeacher || !editingTeacher.number) {
      console.error('No teacher selected for editing')
      return
    }
    if (!formData.fname || !formData.lname) {
      console.error('Missing required fields')
      return
    }
    try {
      const fullName = `${formData.fname} ${formData.lname}`.trim()
      const teacherNumber = editingTeacher.number

      let payload
      let useFormData = formData.image && typeof formData.image !== 'string' && !(formData.image instanceof String)

      if (useFormData) {
        payload = new FormData()
        payload.append('adj', formData.title || '')
        payload.append('fname', formData.fname || '')
        payload.append('lname', formData.lname || '')
        payload.append('position', formData.position || '')
        payload.append('speciality_id', formData.speciality ? parseInt(formData.speciality) : '')
        payload.append('phone', formData.phone || '')
        payload.append('email', formData.email || '')
        payload.append('image', formData.image)
      } else {
        const imageUrl = formData.image && typeof formData.image === 'string'
          ? formData.image
          : editingTeacher.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`

        payload = {
          adj: formData.title || '',
          fname: formData.fname || '',
          lname: formData.lname || '',
          position: formData.position || '',
          speciality_id: formData.speciality ? parseInt(formData.speciality) : '',
          phone: formData.phone || '',
          email: formData.email || '',
          image: imageUrl
        }
      }

      await Teachers.update(teacherNumber, payload)

      const items = await fetchTeachers()
      setTeachersList({ total: items.length, teachers: items })

      notify('success', 'Teacher updated!')
      // reset form
      setFormData({
        title: '',
        fname: '',
        lname: '',
        number: '',
        position: '',
        speciality: '',
        department: '',
        phone: '',
        email: '',
        image: null
      })
      setEditingTeacher(null)
      setAddmodal(false)
    } catch (err) {
      console.error('Failed to update teacher', err?.response || err?.message || err)
      notify('error', err?.response?.data?.message || err?.message || 'Failed to update teacher')
    }
  }

  return (
    <div className={`${styles.teachersLayout} full scrollbar`}>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        type={confirmDialog.type}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isloading={dialogLoading}
        confirmText={confirmDialog.type === 'danger' ? 'Delete' : 'Confirm'}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirm}
      />
      <Popup isOpen={addmodal} blur={2} bg='rgba(0,0,0,0.1)' onClose={() => setAddmodal(false)}>
        <div className={`${styles.dashBGC}`} style={{ maxWidth: '700px', borderRadius: '0.8em', padding: '2em' }}>
          <div className="flex row a-center j-spacebet w100" style={{ marginBottom: '1.5em' }}>
            <Text text={editingTeacher ? 'Edit Teacher' : 'Add Teacher'} size='var(--text-l)' w='600' />
            <IconButton icon='fa-solid fa-xmark' color='var(--text)' size='var(--text-l)' onClick={() => setAddmodal(false)} />
          </div>
          <div className="flex row a-center gap" style={{ gap: '2em' }}>
            <div className="flex column gap" style={{ flex: 1 }}>
              <div className="flex row a-center gap">
                <TextInput
                  label="Title"
                  placeholder='Mr'
                  value={formData.title}
                  dataList={["Mr", "Ms", "Mrs", "Dr", "Prof"]}
                  width='25%'
                  onchange={(e) => handleFormChange('title', e.target.value)}
                />
                <div style={{ flex: 1 }}>
                  <TextInput
                    label="First Name"
                    placeholder='First Name'
                    value={formData.fname}
                    width='100%'
                    onchange={(e) => handleFormChange('fname', e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <TextInput
                    label="Last Name"
                    placeholder='Last Name'
                    value={formData.lname}
                    width='100%'
                    onchange={(e) => handleFormChange('lname', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex row a-center gap">
                <TextInput
                  label="Number"
                  type='number'
                  placeholder='Enter Teacher Number'
                  value={formData.number}
                  width='100%'
                  onchange={(e) => handleFormChange('number', e.target.value)}
                />
              </div>
              <div className="flex row a-end gap">
                <TextInput
                  label="Position"
                  placeholder="Select Position"
                  value={formData.position}
                  dataList={["Assistant", "Lecturer", "Associate Professor", "Professor"]}
                  width='40%'
                  onchange={(e) => handleFormChange('position', e.target.value)}
                />
                  <TextInput 
                    label="Department" 
                    placeholder='Auto-filled from speciality'
                    value={formData.department} 
                    width='60%'
                    readOnly
                  />
              </div>
              <div className="flex row a-end gap">
                <div style={{width: '100%'}}>
                  <SelectInput
                    w='100%'
                    mrg='1em 0 0 0'
                    value={formData.speciality}
                    bg='var(--trans-grey)'
                    options={specialitiesOptions.length ? specialitiesOptions : [{ value: '', text: 'Select speciality' }]}
                    onChange={(val) => {
                      const selectedSpec = specialitiesOptions.find(s => s.value == val)
                      setFormData(prev => ({ ...prev, speciality: val, department: selectedSpec?.department || '' }))
                    }}
                  />
                </div>
              </div>
            </div>
            <ImageInput
              label='Photo'
              width='180px'
              height='180px'
              onchange={handleImageChange}
            />
          </div>
          <div className="flex row a-center gap w100" style={{ margin: "1em 0 2em 0" }}>
            <TextInput
              label="Email"
              placeholder='Enter Teacher Email'
              value={formData.email}
              width='60%'
              onchange={(e) => handleFormChange('email', e.target.value)}
            />
            <TextInput
              label="Phone"
              placeholder='Enter Teacher Phone Number'
              value={formData.phone}
              width='40%'
              onchange={(e) => handleFormChange('phone', e.target.value)}
            />
          </div>
          <div className="flex row a-center gap mrt">
            <SecondaryButton text='Cancel' onClick={() => setAddmodal(false)} />
            <PrimaryButton
              text={editingTeacher ? 'Update Teacher' : 'Add Teacher'}
              onClick={() => openConfirmDialog(
                'normal',
                editingTeacher ? 'Update Teacher' : 'Add Teacher',
                editingTeacher
                  ? `Update teacher ${formData.fname} ${formData.lname}?`
                  : `Add new teacher ${formData.fname} ${formData.lname}?`,
                editingTeacher ? 'edit' : 'add'
              )}
            />
          </div>
        </div>
      </Popup>
      <div ref={layoutPath} className={`${styles.teachersHeader} h4p`}>
        <div className={`${styles.teachersPath} flex`}>
          <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
          <Text css='h4p' align='left' mrg='0 0.25em' text='Teachers' color='var(--text)' size='var(--text-m)' />
        </div>
      </div>
      <div className={`${styles.teachersContent}`}>
        <div ref={layoutHead} className={`${styles.teachersHead} flex row a-center j-spacebet`}>
          <Text align='left' text='Teachers List' w='600' color='var(--text)' size='var(--text-l)' />
          <div className="flex row h100 a-center gap h4p">
            <IconButton icon="fa-solid fa-question" onClick={downloadTemplate} />
            <SecondaryButton id="importButton" isLoading={importLoading} text="Import List" icon="fa-regular fa-file-excel" onClick={() => fileInputRef.current && fileInputRef.current.click()} />
            <div><PrimaryButton id='addButton' text='Add Teacher' icon='fa-solid fa-plus' onClick={() => setAddmodal(true)} /></div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files && e.target.files[0]
              if (!f) return
              
              const reader = new FileReader()
              reader.onload = async (event) => {
                try {
                  const data = event.target.result
                  setImportLoading(true)
                  const workbook = XLSX.read(data, { type: 'binary' })
                  const firstSheetName = workbook.SheetNames[0]
                  const worksheet = workbook.Sheets[firstSheetName]
                  const raw = XLSX.utils.sheet_to_json(worksheet, { defval: null })

                  if (!raw || !raw.length) {
                    notify('error', 'Imported file is empty')
                    return
                  }


                  let freshSpecialities = []
                  try {
                    const resp = await Specialities.getAll()
                    freshSpecialities = Array.isArray(resp) ? resp : (resp.data || resp.items || resp.specialities || [])
                  } catch (err) {
                    console.warn('Could not fetch specialities, using cached:', err)
                  }

                  const nameToIdMap = new Map()
                  freshSpecialities.forEach(spec => {
                    if (spec && spec.id && (spec.name || spec.title || spec.speciality)) {
                      const name = (spec.name || spec.title || spec.speciality || '').toLowerCase().trim()
                      nameToIdMap.set(name, spec.id)
                    }
                  })

                  const transformed = raw.map(row => {
                    const r = { ...row }
                    
                    // Normalize keys
                    const normalized = {}
                    const fieldMap = {
                      'adj': ['adj', 'title', 'salutation'],
                      'fname': ['fname', 'first name', 'firstname', 'first_name', 'firstname'],
                      'lname': ['lname', 'last name', 'lastname', 'last_name', 'lastname'],
                      'number': ['number', 'teacher number', 'id', 'code'],
                      'image': ['image', 'img', 'photo', 'picture'],
                      'position': ['position', 'job title', 'job_title'],
                      'department': ['department', 'departement', 'dept'],
                      'speciality': ['speciality', 'speciality_id', 'specialty'],
                      'phone': ['phone', 'phone number', 'phone_number'],
                      'email': ['email', 'e-mail'],
                      'password': ['password']
                    }

                    Object.entries(fieldMap).forEach(([apiField, possibleNames]) => {
                      const rowKeyLower = Object.keys(r).find(key => 
                        possibleNames.includes(String(key).toLowerCase().trim())
                      )
                      if (rowKeyLower && r[rowKeyLower] != null) {
                        normalized[apiField] = r[rowKeyLower]
                      }
                    })

                    if (normalized.number && !normalized.password) {
                      normalized.password = String(normalized.number)
                    }

                    return normalized
                  })

                  // Now map speciality names to ids
                  const finalTransformed = transformed.map(r => {
                    
                    if (r.speciality != null && typeof r.speciality === 'string') {
                      const specialityName = r.speciality.toLowerCase().trim()
                      const mappedId = nameToIdMap.get(specialityName)
                      if (mappedId) {
                        r.speciality_id = mappedId
                        delete r.speciality
                      } else {
                        console.warn(`Could not map speciality name: "${r.speciality}"`)
                        r.speciality_id = null
                      }
                    } else if (r.speciality_id != null) {
                      if (typeof r.speciality_id === 'string' && r.speciality_id.trim() !== '') {
                        const n = parseInt(r.speciality_id, 10)
                        r.speciality_id = isNaN(n) ? null : n
                      }
                      delete r.speciality
                    }
                    
                    return r
                  })

                  const unmapped = finalTransformed
                    .filter(r => (r.speciality_id == null || r.speciality_id === ''))
                    .map((r, idx) => `Row ${idx + 1}`)


                  const normalizeRow = (row) => {
                    const normalized = {}
                    const fieldMap = {
                      'adj': ['adj', 'title', 'salutation'],
                      'fname': ['fname', 'first name', 'firstname', 'first_name', 'firstname'],
                      'lname': ['lname', 'last name', 'lastname', 'last_name', 'lastname'],
                      'number': ['number', 'teacher number', 'id', 'code'],
                      'image': ['image', 'img', 'photo', 'picture'],
                      'position': ['position', 'job title', 'job_title'],
                      'department': ['department', 'departement', 'dept'],
                      'speciality': ['speciality', 'speciality_id', 'specialty'],
                      'phone': ['phone', 'phone number', 'phone_number'],
                      'email': ['email', 'e-mail'],
                      'password': ['password']
                    }

                    Object.entries(fieldMap).forEach(([apiField, possibleNames]) => {
                      const rowKeyLower = Object.keys(row).find(key => 
                        possibleNames.includes(String(key).toLowerCase().trim())
                      )
                      if (rowKeyLower && row[rowKeyLower] != null) {
                        normalized[apiField] = row[rowKeyLower]
                      }
                    })

                    if (normalized.number) {
                      normalized.password = String(normalized.number)
                    }

                    if (normalized.speciality_id != null) {
                      const idNum = parseInt(normalized.speciality_id, 10)
                      normalized.speciality_id = isNaN(idNum) ? null : idNum
                    }

                    return normalized
                  }

                  const normalized = transformed.map(normalizeRow)

                  setDialogLoading(true)
                  try {
                    const payload = { teachers: finalTransformed }
                    const response = await Teachers.bulkStore(payload)
                    if (unmapped && unmapped.length) {
                      notify('success', 'Teachers imported successfully')
                    } else {
                      notify('success', 'Teachers imported successfully')
                    }
                    const items = await fetchTeachers()
                    setTeachersList({ total: items.length, teachers: items })
                  } catch (err) {
                    console.error('Bulk import failed:', err)
                    console.error('Error response data:', err?.response?.data)
                    console.error('Error status:', err?.response?.status)
                    console.error('Full error object:', JSON.stringify(err, null, 2))
                    notify('error', err?.response?.data?.message || err?.message || 'Bulk import failed')
                  } finally {
                    setDialogLoading(false)
                    setImportLoading(false)
                  }
                } catch (err) {
                  console.error('Failed reading file', err)
                  notify('error', 'Failed to read the selected file')
                } finally {
                  e.target.value = ''
                }
              }
              reader.onerror = () => {
                console.error('FileReader error')
                notify('error', 'Failed to read the selected file')
                e.target.value = ''
              }
              reader.readAsBinaryString(f)
            }}
          />
          <Float css='flex column a-center gap h4pc' bottom="6em" right="1em">
            <FloatButton icon="fa-solid fa-question" onClick={downloadTemplate} />
            <FloatButton icon="fa-solid fa-file-arrow-up" onClick={() => fileInputRef.current && fileInputRef.current.click()} isLoading={importLoading} />
            <FloatButton icon='fa-solid fa-plus' onClick={() => setAddmodal(true)} />
          </Float>
        </div>
        <div ref={layoutBody} className={`gsap-y ${styles.teachersTable} ${styles.dashBGC} ${listLoading && "shimmer"}`}>
          {!listLoading && <ListTable
            title="Teachers"
            rowTitles={["Teacher", "Number", "Department", "Position", "Speciality", "phone", "Email", "Action"]}
            rowTemplate="0.6fr repeat(4, 0.4fr) 0.3fr 0.6fr 0.2fr"

            dataList={{ total: teachersList.total, items: teachersList.teachers }}

            filterFunction={(s, text) =>
              `${s.fname} ${s.lname}`.toLowerCase().includes(text.toLowerCase()) ||
              s.email.toLowerCase().includes(text.toLowerCase()) ||
              s.number.includes(text)
            }

            sortFunction={(a, b, sort) => {
              if (sort === "A-Z") return a.fname.localeCompare(b.fname);
              if (sort === "Z-A") return b.fname.localeCompare(a.fname);
              return 0;
            }}

            exportConfig={{
              title: "Teachers List",
              fileName: "Teachers_list",
              headers: ["#", "Name", "Number", "Department", "Position", "Speciality", "Email", "Phone"],
              mapRow: (s, i) => [
                i + 1,
                `${s.adj}. ${s.fname} ${s.lname}`,
                s.number,
                s.departement,
                s.position,
                s.speciality,
                s.email,
                s.phone
              ]
            }}

            rowRenderer={(teacher) => (
              <>
                <div className="flex row a-center gap">
                  <Profile img={teacher.image} width='35px' classes='clickable' border="2px solid var(--bg)" />
                  <Text align='left' css='ellipsis' text={`${teacher.adj}. ${teacher.fname} ${teacher.lname}`} size='var(--text-m)' />
                </div>

                <Text align='left' css='ellipsis' text={teacher.number} size='var(--text-m)' />
                <Text align='left' css='ellipsis' text={teacher.departement} size='var(--text-m)' />
                <Text align='left' css='ellipsis' text={teacher.position} size='var(--text-m)' />
                <Text align='left' css='ellipsis' text={teacher.speciality} size='var(--text-m)' />
                <Text align='left' css='ellipsis' text={teacher.phone} size='var(--text-m)' />
                <Text align='left' css='ellipsis' text={teacher.email} size='var(--text-m)' />

                <div className="flex row center gap">
                  <IconButton icon="fa-regular fa-pen-to-square" onClick={() => handleEditTeacher(teacher)} />
                  <IconButton
                    icon="fa-regular fa-trash-can"
                    onClick={() => openConfirmDialog(
                      'danger',
                      'Delete Teacher',
                      `Delete ${teacher.adj}. ${teacher.fname} ${teacher.lname}? This action cannot be undone.`,
                      'delete',
                      teacher
                    )}
                  />
                </div>
              </>
            )}
          />}
        </div>
      </div>
    </div>
  )
}

export default AdminTeachers