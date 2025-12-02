import React, { useRef, useEffect, useState } from 'react'

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

import styles from './admin.module.css'

import Text from '../../components/text/Text';
import Float from '../../components/containers/Float';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import Button from '../../components/buttons/Button';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import IconButton from '../../components/buttons/IconButton';
import FloatButton from '../../components/buttons/FloatButton';
import { ListTable } from '../../components/tables/ListTable';
import Profile from '../../components/containers/profile';
import Popup from '../../components/containers/Popup';
import TextInput from '../../components/input/TextInput';
import SelectInput from '../../components/input/SelectInput';
import ImageInput from '../../components/input/ImageInput';
import ConfirmDialog from '../../components/containers/ConfirmDialog';
import { Students, Specialities, Groups } from '../../API'
import * as XLSX from 'xlsx'
import { useNotify } from '../../components/loaders/NotificationContext';

const AdminStudents = () => {

  document.title = "Unitime - Students";

  const [listLoading, setListLoading] = useState(false)
  const [dialogLoading, setDialogLoading] = useState(false)
  const [studentsList, setStudentsList] = useState({ total: 0, students: [] })
  const [specialitiesOptions, setSpecialitiesOptions] = useState([])
  const [groupsOptions, setGroupsOptions] = useState([])
  const [addmodal, setAddmodal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: 'normal', title: '', message: '', action: null, actionData: null })
  const [formData, setFormData] = useState({ fname: '', lname: '', number: '', level: '', departement: '', speciality: '', section: '', group: '', email: '', image: null })
  const fileInputRef = useRef(null)
  const { notify } = useNotify()
  const [importLoading, setImportLoading] = useState(false)
  
  const fetchStudents = async () => {
    try {
      setListLoading(true)
      const resp = await Students.getAll()
      const data = resp ?? []
      const items = Array.isArray(data) ? data : (data.data || data.items || data.students || [])
      setStudentsList({ total: items.length, students: items })
      console.log('Fetched students:', items)
    } catch (err) {
      console.error('Failed to fetch students', err)
      notify('error', 'Failed to fetch students')
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    fetchStudents()
    const loadExtras = async () => {
      try {
        const sp = await Specialities.getAll()
        const listS = Array.isArray(sp) ? sp : (sp.data || sp.items || sp.specialities || [])
        const sOptions = listS.map(item => ({ value: item.id || item.value || item.name, text: item.name || item.title || item.speciality || item }))
        if (mounted) setSpecialitiesOptions(sOptions)
      } catch (err) { console.warn('Failed to load specialities', err) }
      try {
        const gr = await Groups.getAll()
        const listG = Array.isArray(gr) ? gr : (gr.data || gr.items || gr.groups || [])
        const gOptions = listG.map(item => ({ value: item.id || item.value || item.name, text: item.name || item.title || item.group || item }))
        if (mounted) setGroupsOptions(gOptions)
      } catch (err) { console.warn('Failed to load groups', err) }
    }
    loadExtras()
    return () => { mounted = false }
  }, [])

  const layoutPath = useRef(null);
  const layoutHead = useRef(null);
  const layoutBody = useRef(null);

    useEffect(() => {
      const HH = layoutPath.current.offsetHeight + layoutHead.current.offsetHeight
      layoutBody.current.style.maxHeight = `calc(100vh - ${HH}px - 2.5em)`
      }, []);

  useGSAP(() => {
    gsap.from('.gsap-y', { 
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
    })
  });

  const submitAddStudent = async () => {
    if (!formData.fname || !formData.lname || !formData.number) {
      notify('error', 'Missing required fields')
      return
    }
    setDialogLoading(true)
    try {
      // Generate dicebear avatar URL if no image is provided
      const studentName = `${formData.fname} ${formData.lname}`.trim()
      const imageUrl = formData.image && typeof formData.image === 'string' ? formData.image : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}`
      
      const payload = {
        number: formData.number,
        fname: formData.fname,
        lname: formData.lname,
        email: formData.email || null,
        password: String(formData.number),
        phone: formData.phone || null,
        gender: formData.gender || null,
        image: imageUrl,
        group_code: formData.group ? formData.group : null,
        speciality_id: formData.speciality ? parseInt(formData.speciality) : null,
        level: formData.level || null,
      }

      await Students.add(payload)
      notify('success', 'Student added')
      await fetchStudents()
      setFormData({ fname: '', lname: '', number: '', level: '', departement: '', speciality: '', section: '', group: '', gender: '', email: '', image: null })
      setEditingStudent(null)
      setAddmodal(false)
    } catch (err) {
      console.error('Failed to add student', err)
      notify('error', err?.response?.data?.message || err?.message || 'Failed to add student')
    } finally {
      setDialogLoading(false)
    }
  }

  const submitEditStudent = async () => {
    if (!editingStudent || !editingStudent.number) return
    setDialogLoading(true)
    try {
      // Generate dicebear avatar URL if no image is provided
      const studentName = `${formData.fname} ${formData.lname}`.trim()
      const imageUrl = formData.image && typeof formData.image === 'string' ? formData.image : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}`
      
      const payload = {
        fname: formData.fname || undefined,
        lname: formData.lname || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        image: imageUrl,
        group_code: formData.group ? formData.group : undefined,
        speciality_id: formData.speciality ? parseInt(formData.speciality) : undefined,
        level: formData.level || undefined,
      }

      await Students.update(editingStudent.number, payload)
      notify('success', 'Student updated')
      await fetchStudents()
      setFormData({ fname: '', lname: '', number: '', level: '', departement: '', speciality: '', section: '', group: '', gender: '', email: '', image: null })
      setEditingStudent(null)
      setAddmodal(false)
    } catch (err) {
      console.error('Failed to update student', err)
      notify('error', err?.response?.data?.message || err?.message || 'Failed to update student')
    } finally {
      setDialogLoading(false)
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
        onConfirm={async () => {
          setDialogLoading(true)
          try {
            if (confirmDialog.action === 'delete') {
              await Students.remove(confirmDialog.actionData.number)
              notify('success', 'Student deleted')
              await fetchStudents()
            } else if (confirmDialog.action === 'add') {
              await submitAddStudent()
            } else if (confirmDialog.action === 'edit') {
              await submitEditStudent()
            }
          } catch (err) { console.error(err); notify('error', 'Action failed') } finally { setDialogLoading(false); setConfirmDialog({ ...confirmDialog, isOpen: false }) }
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
      <Popup isOpen={addmodal} blur={2} bg='rgba(0,0,0,0.1)' onClose={() => setAddmodal(false)}>
        <div className={`${styles.dashBGC}`} style={{ maxWidth: '700px', borderRadius: '0.8em', padding: '2em' }}>
          <div className="flex row a-center j-spacebet w100" style={{ marginBottom: '1.5em' }}>
            <Text text={editingStudent ? 'Edit Student' : 'Add Student'} size='var(--text-l)' w='600' />
            <IconButton icon='fa-solid fa-xmark' color='var(--text)' size='var(--text-l)' onClick={() => setAddmodal(false)} />
          </div>
          <div className="flex row a-center gap" style={{ gap: '2em' }}>
            <div className="flex column gap" style={{ flex: 1 }}>
              <div className="flex row a-center gap">
                <div style={{ flex: 1 }}>
                  <TextInput label="First Name" placeholder='First Name' value={formData.fname} width='100%' onchange={(e) => setFormData(prev => ({ ...prev, fname: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <TextInput label="Last Name" placeholder='Last Name' value={formData.lname} width='100%' onchange={(e) => setFormData(prev => ({ ...prev, lname: e.target.value }))} />
                </div>
              </div>
                <div className="flex row a-end gap">
                <TextInput label="Number" placeholder='Student Number' value={formData.number} width='80%' onchange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))} />
                <SelectInput label="Gender" value={formData.gender} options={[{text: "Male", value: "male"}, {text: "Female", value:"female"}]} onChange={(val) => setFormData(prev => ({ ...prev, gender: val }))} />
              </div>
              <div className="flex row a-end gap">
                <TextInput 
                  label="Level" 
                  placeholder='Level' 
                  value={formData.level} 
                  width='48%' 
                  onchange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  dataList={[
                    "Master 1",
                    "Master 2",
                    "Licence 1",
                    "Licence 2",
                    "Licence 3",
                    "Engineer 1",
                    "Engineer 2",
                    "Engineer 3",
                    "Engineer 4",
                    "Engineer 5",
                  ]}
                />
                <div style={{ width: '52%' }}>
                  <SelectInput value={formData.speciality} options={specialitiesOptions.length ? specialitiesOptions : [{ value: '', text: 'Select speciality' }]} onChange={(val) => setFormData(prev => ({ ...prev, speciality: val }))} />
                </div>
              </div>
            </div>
            <ImageInput label='Photo' width='140px' height='140px' onchange={(file) => setFormData(prev => ({ ...prev, image: file }))} />
          </div>
          <div className="flex row a-center gap w100" style={{ margin: "1em 0 2em 0" }}>
            <TextInput label="Phone" placeholder='Phone' value={formData.phone} width='40%' onchange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
            <TextInput label="Email" placeholder='Email' value={formData.email} width='60%' onchange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
          </div>
          <div className="flex row a-center gap mrt">
            <SecondaryButton text='Cancel' onClick={() => setAddmodal(false)} />
            <PrimaryButton text={editingStudent ? 'Update Student' : 'Add Student'} onClick={async () => {
              setConfirmDialog({ isOpen: true, type: 'normal', title: editingStudent ? 'Update Student' : 'Add Student', message: editingStudent ? `Update student ${formData.fname} ${formData.lname}?` : `Add new student ${formData.fname} ${formData.lname}?`, action: editingStudent ? 'edit' : 'add', actionData: null })
            }} />
          </div>
        </div>
      </Popup>
      <div ref={layoutPath} className={`${styles.teachersHeader} h4p`}>
        <div className={`${styles.teachersPath} flex`}>
          <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
          <Text css='h4p' align='left' mrg='0 0.25em' text='Students' color='var(--text)' size='var(--text-m)' />
        </div>
      </div>
      <div className={`${styles.teachersContent}`}>
        <div ref={layoutHead} className={`${styles.teachersHead} flex row a-center j-spacebet`}>
            <Text align='left' text='Students List' w='600' color='var(--text)' size='var(--text-l)'/>
              <div className="flex row h100 a-center gap h4p">
              <SecondaryButton isLoading={importLoading} text="Import List" icon="fa-regular fa-file-excel" onClick={() => fileInputRef.current && fileInputRef.current.click()} />
              <PrimaryButton text='Add Student' icon='fa-solid fa-plus' onClick={() => { setEditingStudent(null); setFormData({ fname: '', lname: '', number: '', level: '', departement: '', speciality: '', section: '', group: '', gender: '', email: '', image: null }); setAddmodal(true) }} />
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
                      let freshGroups = []
                      try {
                        const sp = await Specialities.getAll()
                        freshSpecialities = Array.isArray(sp) ? sp : (sp.data || sp.items || sp.specialities || [])
                      } catch (err) { console.warn('Failed to fetch specialities for mapping', err) }
                      try {
                        const gr = await Groups.getAll()
                        freshGroups = Array.isArray(gr) ? gr : (gr.data || gr.items || gr.groups || [])
                      } catch (err) { console.warn('Failed to fetch groups for mapping', err) }

                      const specMap = new Map()
                      freshSpecialities.forEach(s => {
                        const name = (s.name || s.title || s.speciality || '').toLowerCase().trim()
                        if (name) specMap.set(name, s.id || s.value || s.key || s)
                      })
                      const groupMap = new Map()
                      freshGroups.forEach(g => {
                        const name = (g.name || g.title || g.group || '').toLowerCase().trim()
                        if (name) groupMap.set(name, g.id || g.value || g.key || g)
                      })

                      const fieldMap = {
                        fname: ['fname', 'first name', 'firstname', 'first_name'],
                        lname: ['lname', 'last name', 'lastname', 'last_name'],
                        number: ['number', 'student number', 'id', 'code'],
                        level: ['level', 'lvl'],
                        departement: ['department', 'departement', 'faculty', 'dept'],
                        speciality: ['speciality', 'specialty', 'specialisation', 'speciality_id'],
                        section: ['section'],
                        image: ['image', 'photo', 'picture', 'img'],
                        group: ['group', 'group name', 'group_id'],
                        email: ['email', 'e-mail']
                      }

                      const normalizeRow = (row) => {
                        const normalized = {}
                        Object.entries(fieldMap).forEach(([apiField, possibles]) => {
                          const key = Object.keys(row).find(k => possibles.includes(String(k).toLowerCase().trim()))
                          if (key && row[key] != null) normalized[apiField] = row[key]
                        })

                        if (normalized.speciality && typeof normalized.speciality === 'string') {
                          const id = specMap.get(normalized.speciality.toLowerCase().trim())
                          normalized.speciality_id = id != null ? id : null
                          delete normalized.speciality
                        } else if (row.speciality_id != null) {
                          const n = parseInt(row.speciality_id, 10)
                          normalized.speciality_id = isNaN(n) ? null : n
                        }

                        if (normalized.group && typeof normalized.group === 'string') {
                          const gid = groupMap.get(normalized.group.toLowerCase().trim())
                          normalized.group_id = gid != null ? gid : null
                          delete normalized.group
                        } else if (row.group_id != null) {
                          const n = parseInt(row.group_id, 10)
                          normalized.group_id = isNaN(n) ? null : n
                        }

                        const num = normalized.number || row.number || row.Number || row.code || null
                        normalized.password = num != null ? String(num) : null

                        return normalized
                      }

                      const transformed = raw.map(normalizeRow)
                      console.log('Students import - parsed:', raw)
                      console.log('Students import - transformed:', transformed)

                      try {
                        const payload = { students: transformed }
                        const resp = await Students.bulkStore(payload)
                        console.log('Students bulk response:', resp)
                        notify('success', 'Students imported successfully')
                        await fetchStudents()
                      } catch (err) {
                        console.error('Students bulk import failed', err)
                        notify('error', err?.response?.data?.message || err?.message || 'Bulk import failed')
                      }

                    } catch (err) {
                      console.error('Failed reading file', err)
                      notify('error', 'Failed to read the selected file')
                    } finally {
                      setImportLoading(false)
                      e.target.value = ''
                    }
                  }
                  reader.onerror = () => {
                    console.error('FileReader error')
                    notify('error', 'Failed to read the selected file')
                    e.target.value = ''
                    setImportLoading(false)
                  }
                  reader.readAsBinaryString(f)
                }}
              />
              <Float css='flex column a-center gap h4pc' bottom="6em" right="1em">
                <FloatButton icon="fa-solid fa-file-arrow-up" onClick={() => fileInputRef.current && fileInputRef.current.click()} isLoading={importLoading} />
                <FloatButton icon='fa-solid fa-plus' onClick={() => { setEditingStudent(null); setFormData({ fname: '', lname: '', number: '', level: '', departement: '', speciality: '', section: '', group: '', gender: '', email: '', image: null }); setAddmodal(true) }} />
              </Float>
        </div>
        <div ref={layoutBody} className={`gsap-y ${styles.teachersTable} ${styles.dashBGC} full ${listLoading && "shimmer"}`}>
          {!listLoading && <ListTable
          title="Students"
          rowTitles={["Student", "Number", "Department", "Level", "Speciality", "Group", "Email", "Action"]}
          rowTemplate="0.4fr 0.2fr 0.3fr 0.2fr 0.4fr 0.3fr 0.5fr 0.2fr"

          dataList={{ total: studentsList.total, items: studentsList.students }}

          filterFunction={(s, text) =>
            `${s.fname} ${s.lname}`.toLowerCase().includes(text.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(text.toLowerCase()) ||
            (s.number || '').includes(text)
          }

          sortFunction={(a, b, sort) => {
            if (sort === "A-Z") return a.fname.localeCompare(b.fname);
            if (sort === "Z-A") return b.fname.localeCompare(a.fname);
            return 0;
          }}

          exportConfig={{
            title: "Students List",
            fileName: "students_list",
            headers: ["#", "Name", "Email", "Number", "Level", "Department", "Speciality", "Group"],
            mapRow: (s, i) => [
              i + 1,
              `${s.fname} ${s.lname}`,
              s.email,
              s.number,
              s.level,
              s.department,
              s.speciality,
              s.group
            ]
          }}

          rowRenderer={(student) => (
            <>
              <div className="flex row a-center gap">
                <Profile img={student.image} width='35px' classes='clickable' border="2px solid var(--bg)"/>
                <Text align='left' css='ellipsis' text={`${student.fname} ${student.lname}`} size='var(--text-m)'/>
              </div>

              <Text align='left' css='ellipsis' text={student.number} size='var(--text-m)'/>
              <Text align='left' css='ellipsis' text={student.department} size='var(--text-m)'/>
              <Text align='left' css='ellipsis' text={student.level} size='var(--text-m)'/>
              <Text align='left' css='ellipsis' text={student.speciality} size='var(--text-m)'/>
              {student.group_code?
              <Text align='left' css='ellipsis' text={student.group} size='var(--text-m)'/>:
              <Button mrg='0 0 0 0.25em' text="Attach Group" icon='fa-solid fa-plus'/>}
              <Text align='left' css='ellipsis' text={student.email} size='var(--text-m)'/>

              <div className="flex row center gap">
                <IconButton icon="fa-regular fa-pen-to-square" onClick={() => {
                  setEditingStudent(student)
                  setFormData({ fname: student.fname || '', lname: student.lname || '', number: student.number || '', level: student.level || '', departement: student.department || '', speciality: student.speciality_id || student.speciality || '', section: student.section || '', group: student.group_code || student.group || '', gender: student.gender || '', email: student.email || '', image: student.image || null })
                  setAddmodal(true)
                }} />
                <IconButton icon="fa-regular fa-trash-can" onClick={() => setConfirmDialog({ isOpen: true, type: 'danger', title: 'Delete Student', message: `Delete ${student.fname} ${student.lname}?`, action: 'delete', actionData: student })} />
              </div>
            </>
          )}
          />}

        </div>
      </div>
    </div>
  )
}

export default AdminStudents