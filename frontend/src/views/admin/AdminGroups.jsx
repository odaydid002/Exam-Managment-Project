import React,{useState, useRef, useEffect} from 'react'

import styles from './admin.module.css'

import Text from '../../components/text/Text';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import Float from '../../components/containers/Float';
import FloatButton from '../../components/buttons/FloatButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import StaticsCard from '../../components/containers/StaticsCard';
import formatNumber from '../../hooks/formatNumber';
import Popup from '../../components/containers/Popup';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Groups, Specialities, Students, Sections } from '../../API'

import Profile from '../../components/containers/profile';
import IconButton from '../../components/buttons/IconButton';
import Button from '../../components/buttons/Button';
import TextInput from '../../components/input/TextInput';
import SelectInput from '../../components/input/SelectInput';
import SelectInputImage from '../../components/input/SelectInputImage';
import ConfirmDialog from '../../components/containers/ConfirmDialog';
import { ListTable } from '../../components/tables/ListTable';
gsap.registerPlugin(useGSAP);

import { useNotify } from '../../components/loaders/NotificationContext';

const AdminGroups = () => {
  document.title = "Unitime - Groups";
  const [staticsLoading, setStaticsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  useGSAP(() => {
    gsap.from('.gsap-y', { 
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
    })
  });

  const layoutPath = useRef(null);
  const layoutHead = useRef(null);
  const layoutTHead = useRef(null);
  const layoutBody = useRef(null);

  const [groupsList, setGroupsList] = useState({ total: 0, groups: [] })
  const [addModal, setAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [dialogLoading, setDialogLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: 'danger', title: '', message: '', action: null, actionData: null })
  const [specialitiesList, setSpecialitiesList] = useState([])
  const [levelsList, setLevelsList] = useState([])
  const [sectionsList, setSectionsList] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [selectedSpeciality, setSelectedSpeciality] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])
  const [formData, setFormData] = useState({ code: '', name: '' })
  const [generateModal, setGenerateModal] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [generateFormData, setGenerateFormData] = useState({ speciality: null, level: '' })
  const [delegateModal, setDelegateModal] = useState(false)
  const [delegateLoading, setDelegateLoading] = useState(false)
  const [delegateGroup, setDelegateGroup] = useState(null)
  const [delegateStudentsList, setDelegateStudentsList] = useState([])
  const [selectedDelegates, setSelectedDelegates] = useState([])
  const { notify } = useNotify()
  useEffect(() => {
    const HH = layoutPath.current.offsetHeight + layoutHead.current.offsetHeight + layoutTHead.current.offsetHeight
    layoutBody.current.style.maxHeight = `calc(100vh - ${HH}px - 2em)`

    loadGroups()
    loadSpecialities()
  }, []);

  const loadGroups = async () => {
    try {
      setTableLoading(true)
      const resp = await Groups.getAll()
      const data = resp ?? {}
      const items = Array.isArray(data) ? data : (data.groups || [])
      setGroupsList({ total: data.total || items.length, groups: items })
    } catch (err) {
      console.error('Failed to load groups', err)
      notify('error', 'Failed to load groups')
    } finally {
      setTableLoading(false)
    }
  }

  const loadSpecialities = async () => {
    try {
      const resp = await Specialities.getAll()
      const items = Array.isArray(resp) ? resp : (resp.specialities || [])
      setSpecialitiesList(items)
      const sectionsResp = await Sections.getAll()
      const sections = Array.isArray(sectionsResp) ? sectionsResp : (sectionsResp.sections || [])
      setSectionsList(sections)
      const staticLevels = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Engineer 1', 'Engineer 2', 'Engineer 3', 'Engineer 4', 'Engineer 5']
      setLevelsList(staticLevels)
    } catch (err) {
      console.error('Failed to load specialities/sections', err)
    }
  }

  const loadStudentsFor = async (specialityId, level) => {
    try {
      setTableLoading(true)
      const params = {}
      if (specialityId) params.speciality_id = specialityId
      if (level) params.level = level
      const resp = await Students.getAll(params)
      const items = Array.isArray(resp) ? resp : (resp.students || [])
      setStudentsList(items)
    } catch (err) {
      console.error('Failed to load students', err)
      notify('error', 'Failed to load students')
    } finally {
      setTableLoading(false)
    }
  }

  const createSection = async (sectionName) => {
    if (!sectionName || !selectedSpeciality || !selectedLevel) {
      notify('error', 'Please provide section name, speciality and level')
      return null
    }

    try {
      const payload = { name: sectionName, level: selectedLevel, speciality_id: selectedSpeciality }
      const resp = await Sections.add(payload)
      const created = resp.section || resp
      setSectionsList(prev => [ ...prev.filter(s => s.id !== created.id), created ])
      notify('success', 'Section created')
      return created
    } catch (err) {
      console.error('Failed to create section', err)
      notify('error', 'Failed to create section')
      return null
    }
  }

  const toggleSelectStudent = (number) => {
    setSelectedStudents(prev => {
      if (prev.includes(number)) return prev.filter(n => n !== number)
      return [...prev, number]
    })
  }

  const submitCreateGroup = async () => {
    if (!formData.code || !formData.name || !selectedSpeciality || !selectedSection) {
      notify('error', 'Please fill code, name, speciality and section')
      return
    }

    setAddLoading(true)
    try {
      const createdGroup = await Groups.add({ code: formData.code, name: formData.name, section_id: selectedSection })

      if (selectedStudents.length > 0) {
        await Promise.all(selectedStudents.map(num => Students.update(num, { group_code: formData.code })))
      }

      notify('success', 'Group created and students assigned')
      setAddModal(false)
      setFormData({ code: '', name: '' })
      setSelectedSpeciality(null)
      setSelectedLevel('')
      setSelectedStudents([])
      setStudentsList([])
      await loadGroups()
    } catch (err) {
      console.error('Failed to create group', err)
      notify('error', 'Failed to create group')
    } finally {
      setAddLoading(false)
    }
  }

  const openEditGroup = (group) => {
    setEditingGroup(group)
    setFormData({ code: group.code, name: group.name })
    const spec = specialitiesList.find(s => s.name === group.speciality)
    const specId = spec ? spec.id : null
    setSelectedSpeciality(specId)
    setSelectedLevel(group.level || '')
    const sec = sectionsList.find(s => s.name === group.section && (!specId || s.speciality_id === specId) && ((s.level || '') === (group.level || '')))
    setSelectedSection(sec ? sec.id : null)
    if (specId && group.level) loadStudentsFor(specId, group.level)
    setAddModal(true)
  }

  const submitEditGroup = async () => {
    if (!editingGroup) return
    if (!formData.name || !selectedSection) {
      notify('error', 'Please fill name and section')
      return
    }

    setDialogLoading(true)
    try {
      await Groups.update(editingGroup.code, { name: formData.name, section_id: selectedSection })
      if (selectedStudents.length > 0) {
        await Promise.all(selectedStudents.map(num => Students.update(num, { group_code: editingGroup.code })))
      }
      notify('success', 'Group updated')
      setEditingGroup(null)
      setAddModal(false)
      setFormData({ code: '', name: '' })
      setSelectedSpeciality(null)
      setSelectedLevel('')
      setSelectedStudents([])
      setStudentsList([])
      await loadGroups()
    } catch (err) {
      console.error('Failed to update group', err)
      notify('error', 'Failed to update group')
    } finally {
      setDialogLoading(false)
    }
  }

  const confirmDeleteGroup = (group) => {
    setConfirmDialog({ isOpen: true, type: 'danger', title: 'Delete Group', message: `Delete ${group.name}?`, action: 'delete', actionData: group })
  }

  const handleConfirmAction = async () => {
    if (!confirmDialog || !confirmDialog.action) return
    setDialogLoading(true)
    try {
      if (confirmDialog.action === 'delete' && confirmDialog.actionData) {
        await Groups.remove(confirmDialog.actionData.code)
        notify('success', 'Group deleted')
        await loadGroups()
      }
    } catch (err) {
      console.error('Confirm action failed', err)
      notify('error', 'Action failed')
    } finally {
      setDialogLoading(false)
      setConfirmDialog({ ...confirmDialog, isOpen: false })
    }
  }

  const openDelegateModal = async (group) => {
    try {
      setDelegateGroup(group)
      setSelectedDelegates(group.delegate ? group.delegate.map(d => d.id) : [])
      
      const params = { group_code: group.code }
      const resp = await Students.getAll(params)
      const items = Array.isArray(resp) ? resp : (resp.students || [])
      setDelegateStudentsList(items)
      setDelegateModal(true)
    } catch (err) {
      console.error('Failed to load group students', err)
      notify('error', 'Failed to load group students')
    }
  }

  const submitDelegates = async () => {
    if (!delegateGroup) return

    setDelegateLoading(true)
    try {
      if (selectedDelegates.length === 0) {
        await Groups.removeDelegate(delegateGroup.code, {})
      } else {
        await Groups.setDelegate(delegateGroup.code, { student_numbers: selectedDelegates })
      }

      notify('success', 'Delegates updated successfully')
      setDelegateModal(false)
      setDelegateGroup(null)
      setSelectedDelegates([])
      setDelegateStudentsList([])
      await loadGroups()
    } catch (err) {
      console.error('Failed to update delegates', err)
      notify('error', 'Failed to update delegates')
    } finally {
      setDelegateLoading(false)
    }
  }

  const toggleDelegateStudent = (studentNumber) => {
    setSelectedDelegates(prev => {
      if (prev.includes(studentNumber)) return prev.filter(n => n !== studentNumber)
      return [...prev, studentNumber]
    })
  }

  const generateGroups = async () => {
    if (!generateFormData.speciality || !generateFormData.level) {
      notify('error', 'Please select speciality and level')
      return
    }

    setGenerateLoading(true)
    try {
      const params = {
        speciality_id: generateFormData.speciality,
        level: generateFormData.level
      }
      const resp = await Students.getAll(params)
      const students = Array.isArray(resp) ? resp : (resp.students || [])
      
      if (students.length === 0) {
        notify('error', 'No students found for selected speciality and level')
        setGenerateLoading(false)
        return
      }

      students.sort((a, b) => `${a.fname} ${a.lname}`.localeCompare(`${b.fname} ${b.lname}`))

      const groupsOfStudents = []
      for (let i = 0; i < students.length; i += 30) {
        groupsOfStudents.push(students.slice(i, i + 30))
      }

      const spec = specialitiesList.find(s => s.id === generateFormData.speciality)
      const specName = spec ? spec.name : 'Unknown'

      const sectionsToCreate = []
      const groupsToCreate = []
      let sectionLetter = 'A'
      let sectionNumber = 1
      let groupCounter = 1

      groupsOfStudents.forEach((studentGroup, index) => {
        if (index > 0 && index % 4 === 0) {
          sectionLetter = String.fromCharCode(sectionLetter.charCodeAt(0) + 1)
          sectionNumber = 1
          groupCounter = 1
        }

        const sectionName = `${sectionLetter}${sectionNumber}`
        const groupName = `G${groupCounter}`
        const groupCode = `${generateFormData.level.replace(/\s+/g, '')}${sectionName}${groupName}`

        let section = sectionsToCreate.find(s => s.name === sectionName)
        if (!section) {
          section = {
            name: sectionName,
            level: generateFormData.level,
            speciality_id: generateFormData.speciality
          }
          sectionsToCreate.push(section)
        }

        groupsToCreate.push({
          section,
          groupCode,
          groupName,
          students: studentGroup
        })

        groupCounter++
        if (groupCounter > 4) {
          sectionNumber++
          groupCounter = 1
        }
      })

      let createdSections = {}
      for (const section of sectionsToCreate) {
        try {
          const created = await Sections.add(section)
          const sectionObj = created.section || created
          createdSections[section.name] = sectionObj.id
        } catch (err) {
          console.error('Failed to create section', section.name, err)
        }
      }

      let successCount = 0
      for (const group of groupsToCreate) {
        try {
          const sectionId = createdSections[group.section.name]
          if (!sectionId) {
            console.error('Section ID not found for', group.section.name)
            continue
          }

          const createdGroup = await Groups.add({
            code: group.groupCode,
            name: group.groupName,
            section_id: sectionId
          })

          if (group.students.length > 0) {
            await Promise.all(group.students.map(s => Students.update(s.number, { group_code: group.groupCode })))
          }

          successCount++
        } catch (err) {
          console.error('Failed to create group', group.groupCode, err)
        }
      }

      notify('success', `Generated ${successCount} groups successfully`)
      setGenerateModal(false)
      setGenerateFormData({ speciality: null, level: '' })
      await loadGroups()
    } catch (err) {
      console.error('Failed to generate groups', err)
      notify('error', 'Failed to generate groups')
    } finally {
      setGenerateLoading(false)
    }
  }

  


  return (
    <div className={`${styles.modulesLayout} full scrollbar`}>
      <Popup isOpen={addModal} blur={2} bg='rgba(0,0,0,0.2)' onClose={()=>{ setAddModal(false); setFormData({ code: '', name: '' }); setSelectedSpeciality(null); setSelectedLevel(''); setStudentsList([]); setSelectedStudents([]) }}>
            <div className={`${styles.dashBGC}`} style={{ maxWidth: '800px', padding: '2em' }}>
              <div className="flex row a-center j-spacebet">
                <Text text={editingGroup ? 'Edit Group' : 'Create New Group'} size='var(--text-l)' color='var(--text)' align='left' />
                <IconButton icon='fa-solid fa-xmark' onClick={()=>{ setAddModal(false) }} />
              </div>
              <div className="flex column gap mrv">
                <div className="flex row a-center gap">
                  <SelectInput
                    bg='var(--bg)'
                    label='Speciality'
                    placeholder='Choose speciality'
                    options={specialitiesList.length > 0 ? specialitiesList.map(s => ({ value: s.id, text: s.name })) : [{ value: '', text: 'Loading...' }]}
                    onChange={(val) => { setSelectedSpeciality(val || null); setSelectedStudents([]); setStudentsList([]); setSelectedSection(null); if (val && selectedLevel) loadStudentsFor(val, selectedLevel) }}
                  />
                  <SelectInput
                    bg='var(--bg)'
                    label='Level'
                    placeholder='Choose level'
                    options={levelsList.length > 0 ? levelsList.map(l => ({ value: l, text: l })) : [{ value: '', text: 'Loading...' }]}
                    onChange={(val) => { setSelectedLevel(val || ''); setSelectedStudents([]); setStudentsList([]); setSelectedSection(null); if (selectedSpeciality && val) loadStudentsFor(selectedSpeciality, val) }}
                  />
                </div>
                <div className="flex row a-end gap" style={{ marginTop: '0.5em' }}>
                  <SelectInput
                    bg='var(--bg)'
                    label='Section'
                    placeholder='Choose or create section'
                    options={sectionsList.length > 0 ? sectionsList.filter(s => (!selectedSpeciality || s.speciality_id === selectedSpeciality) && (!selectedLevel || (s.level || '') === selectedLevel)).map(s => ({ value: s.id, text: s.name })) : [{ value: '', text: 'Loading...' }]}
                    onChange={(val) => { setSelectedSection(val || null) }}
                    value={selectedSection}
                  />
                  <div style={{ display: 'flex', gap: '0.5em', alignItems: 'flex-end' }}>
                    <TextInput width='220px' label='New section name' placeholder='New section name' value={formData._new_section_name || ''} onchange={(e)=>setFormData(prev=>({ ...prev, _new_section_name: e.target.value }))} />
                    <PrimaryButton isLoading={addLoading} text='Create Section' onClick={async ()=>{ const created = await createSection(formData._new_section_name); if (created) { setSelectedSection(created.id); setFormData(prev=>({ ...prev, _new_section_name: '' })); } }} />
                  </div>
                </div>
                <div className="flex row a-center gap">
                  <TextInput width='50%' label='Group Name' placeholder='Enter group name' value={formData.name} onchange={(e)=>setFormData(prev=>({ ...prev, name: e.target.value }))} />
                  <TextInput width='50%' label='Group Code' placeholder='Enter group code' value={formData.code} onchange={(e)=>setFormData(prev=>({ ...prev, code: e.target.value }))} disabled={!!editingGroup} />
                </div>

                <div>
                  <Text text='Students' size='var(--text-m)' align='left' />
                  <div className='mrt flex column gap scrollbar pdh overflow-y-a' style={{ maxHeight: '200px'}}>
                    {studentsList.length === 0 && <Text text='No students to show' size='0.9em' color='var(--text-low)' />}
                    {studentsList.map(s => (
                      <label key={s.number} className='flex row a-center j-spacebet' style={{ padding: '0.5em', borderRadius: '0.4em', backgroundColor: 'var(--bg)', border: '1px solid var(--border-low)' }}>
                        <div className='flex row a-center gap'>
                          <Profile img={s.image} width='30px' />
                          <div className='flex column a-start'>
                            <Text text={`${s.fname} ${s.lname}`} size='var(--text-m)' />
                            <Text text={s.number} size='var(--text-s)' color='var(--text-low)' />
                          </div>
                        </div>
                        <input type='checkbox' checked={selectedStudents.includes(s.number)} onChange={()=>toggleSelectStudent(s.number)} />
                      </label>
                    ))}
                  </div>
                </div>
                <div className='flex row a-center gap pdt' style={{ marginTop: '1em' }}>
                  <SecondaryButton text='Cancel' onClick={()=>{ setAddModal(false); setEditingGroup(null) }} />
                  {!editingGroup && <PrimaryButton isLoading={addLoading} text='Create Group' onClick={submitCreateGroup} />}
                  {editingGroup && <PrimaryButton isLoading={dialogLoading} text='Update Group' onClick={submitEditGroup} />}
                </div>
              </div>
            </div>
          </Popup>

          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            type={confirmDialog.type}
            title={confirmDialog.title}
            message={confirmDialog.message}
            isloading={dialogLoading}
            confirmText={confirmDialog.type === 'danger' ? 'Delete' : 'Confirm'}
            onConfirm={handleConfirmAction}
            onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          />

          <Popup isOpen={generateModal} blur={2} bg='rgba(0,0,0,0.2)' onClose={()=>{ setGenerateModal(false); setGenerateFormData({ speciality: null, level: '' }) }}>
            <div className={`${styles.dashBGC}`} style={{ maxWidth: '600px', padding: '2em' }}>
              <div className="flex row a-center j-spacebet">
                <Text text='Auto Generate Groups' size='var(--text-l)' color='var(--text)' align='left' />
                <IconButton icon='fa-solid fa-xmark' onClick={()=>{ setGenerateModal(false) }} />
              </div>
              <div className="flex column gap mrv">
                <Text text='This will automatically divide students into groups of 30, create sections (A1, A2, B1, etc.), and organize groups alphabetically. Each 4 groups will create a new section.' size='var(--text-s)' color='var(--text-low)' align='left' />
                <div className="flex row a-center gap">
                  <SelectInput
                    bg='var(--bg)'
                    label='Speciality'
                    placeholder='Choose speciality'
                    options={specialitiesList.length > 0 ? specialitiesList.map(s => ({ value: s.id, text: s.name })) : [{ value: '', text: 'Loading...' }]}
                    onChange={(val) => { setGenerateFormData(prev => ({ ...prev, speciality: val || null })) }}
                    value={generateFormData.speciality}
                  />
                  <SelectInput
                    bg='var(--bg)'
                    label='Level'
                    placeholder='Choose level'
                    options={levelsList.length > 0 ? levelsList.map(l => ({ value: l, text: l })) : [{ value: '', text: 'Loading...' }]}
                    onChange={(val) => { setGenerateFormData(prev => ({ ...prev, level: val || '' })) }}
                    value={generateFormData.level}
                  />
                </div>
                <div className='flex row a-center gap pdt' style={{ marginTop: '1em' }}>
                  <SecondaryButton text='Cancel' onClick={()=>{ setGenerateModal(false) }} />
                  <PrimaryButton isLoading={generateLoading} text='Generate Groups' onClick={generateGroups} />
                </div>
              </div>
            </div>
          </Popup>
      <Float bottom='6em' right="1em" css='h4pc flex column gap'>
        <FloatButton icon="fa-solid fa-file-arrow-up" color='var(--border-low)' onClick={()=>{}}/>
        <FloatButton icon="fa-solid fa-wand-sparkles" color='var(--border-low)' onClick={()=>{}}/>
        <FloatButton icon="fa-solid fa-plus" onClick={()=>{}}/>
      </Float>
      <div ref={layoutPath} className={`${styles.modulesHeader}`}>
        <div className={`${styles.modulesPath} flex a-center h4p`}>
            <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
            <Text css='h4p' align='left' mrg='0 0.25em' text='Groups' color='var(--text)' size='var(--text-m)' />
        </div>
      </div>
      <div ref={layoutHead} className={`${styles.modulesStatics} flex row gap wrap j-center`}>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Students' value={formatNumber(0)} icon="fa-solid fa-user-graduate" color='#2B8CDF'/>}
        </div>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Sections' value={formatNumber(0)} icon="fa-solid fa-users-viewfinder" color='#F1504A'/>}
        </div>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Groups' value={formatNumber(0)} icon="fa-solid fa-people-group" color='#9A8CE5'/>}

        </div>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Average' value={formatNumber(0)} icon="fa-solid fa-percent" color='#4FB6A3'/>}
        </div>
      </div>
      <div className={`${styles.modulesContent} flex column gsap-y`}>
          <div ref={layoutTHead} className="flex row a-center">
          <Text align='left' text='Groups List' size='var(--text-l)' />
          <div className="flex row a-center gap mrla">
            <PrimaryButton text='Add Group' icon='fa-solid fa-plus' onClick={()=>{ setEditingGroup(null); setFormData({ code: '', name: '' }); setSelectedSpeciality(null); setSelectedSection(null); setSelectedLevel(''); setStudentsList([]); setSelectedStudents([]); setAddModal(true) }} css='h4p'/>
            <PrimaryButton text='Generate' icon='fa-solid fa-wand-magic-sparkles' onClick={()=>{ setGenerateModal(true); setGenerateFormData({ speciality: null, level: '' }) }} css='h4p'/>
            <SecondaryButton text='Export' onClick={()=>{}} css='h4p'/>
          </div>
        </div>
        <div ref={layoutBody} className={`${styles.modulesTable} full ${styles.dashBGC} ${tableLoading && "shimmer"}`}>
          {!tableLoading &&
          <ListTable
            title="Groups"
            rowTitles={["Code", "Name", "Level", "Speciality", "Section", "Members", "Delegate", "Action"]}
            rowTemplate="repeat(3, 0.3fr) 0.5fr repeat(2, 0.2fr) 0.5fr 0.2fr"

            dataList={{ total: groupsList.total, items: groupsList.groups }}

            filterFunction={(s, text) =>
              `${s.name || ''}`.toLowerCase().includes(text.toLowerCase()) ||
              (s.speciality || '').toLowerCase().includes(text.toLowerCase()) ||
              (s.level || '').toLowerCase().includes(text.toLowerCase())
            }

            sortFunction={(a, b, sort) => {
                if (sort === "A-Z") return a.members.localeCompare(b.members);
                if (sort === "Z-A") return b.members.localeCompare(a.members);
                return 0;
            }}

            exportConfig={{
                title: "Modules List",
                fileName: "Modules_list"+new Date(),
                headers: ["#", "Code", "Name", "Level", "Speciality", "Section", "Members"],
                mapRow: (s, i) => [
                    i + 1,
                    s.code,
                    s.name,
                    s.level,
                    s.speciality,
                    s.section,
                    s.members
                ]
            }}

            rowRenderer={(group) => (
                <>
                    <Text align='left' text={group.code} size='var(--text-m)'/>
                    <Text align='left' text={group.name} size='var(--text-m)'/>
                    <Text align='left' text={group.level} size='var(--text-m)'/>
                    <Text align='left' text={group.speciality} size='var(--text-m)'/>
                    <Text align='left' text={group.section} size='var(--text-m)'/>
                    <Text align='left' text={group.members} size='var(--text-m)'/>
                    <div className="flex row a-center gap">
                      {group.delegate.length == 0 && <Button text='Attach Delegate' icon='fa-solid fa-plus' onClick={()=>openDelegateModal(group)} />}
                      {group.delegate.length == 1 && 
                      <div className="flex row a-center gap" style={{ cursor: 'pointer' }} onClick={()=>openDelegateModal(group)}>
                        <Profile img={group.delegate[0].image} width="35px" border="2px solid var(--bg)"/>
                        <Text align='left' text={`${group.delegate[0].fname} ${group.delegate[0].lname}`} size='var(--text-m)'/>
                      </div>}
                      {group.delegate.length > 1 && 
                        <div className="flex row a-center gap pos-rel" style={{ cursor: 'pointer' }} onClick={()=>openDelegateModal(group)}>
                          {group.delegate.map((d, index) => {
                            if (index > 3) return null;
                            return (
                              <Profile
                                key={index}
                                img={d.image}
                                width="35px"
                                classes="pos-abs pos-center-v"
                                left={`${index * 12}px`}
                                border="2px solid var(--bg)"
                              />
                            );
                          })}
                          
                          <Text
                            align="left"
                            text="+2 Students"
                            size="var(--text-m)"
                            mrg={`0 0 0 ${35 + group.delegate.length * 12}px`}
                          />
                      </div>}
                    </div>
                    <div className="flex row center gap">
                      <IconButton icon="fa-regular fa-pen-to-square" onClick={()=>openEditGroup(group)} />
                      <IconButton icon="fa-regular fa-trash-can" onClick={()=>confirmDeleteGroup(group)} />
                    </div>
                </>
            )}
          />}
        </div>
      </div>

      <Popup isOpen={delegateModal} blur={2} bg='rgba(0,0,0,0.2)' onClose={()=>{ setDelegateModal(false); setDelegateGroup(null); setSelectedDelegates([]); setDelegateStudentsList([]) }}>
        <div className={`${styles.dashBGC}`} style={{ maxWidth: '700px', padding: '2em' }}>
          <div className="flex row a-center j-spacebet">
            <Text text={`Manage Delegates - ${delegateGroup?.name || ''}`} size='var(--text-l)' color='var(--text)' align='left' />
            <IconButton icon='fa-solid fa-xmark' onClick={()=>{ setDelegateModal(false) }} />
          </div>
          <div className="flex column gap mrv">
            <Text text='Select one or more students from this group to be delegates' size='var(--text-s)' color='var(--text-low)' align='left' />
            
            <div>
              <Text text='Select Delegates' size='var(--text-m)' align='left' />
              <div className='mrt flex column gap scrollbar pdh overflow-y-a' style={{ maxHeight: '300px'}}>
                {delegateStudentsList.length === 0 && <Text text='No students in this group' size='0.9em' color='var(--text-low)' />}
                {delegateStudentsList.map(s => (
                  <label key={s.number} className='flex row a-center j-spacebet' style={{ padding: '0.8em', borderRadius: '0.4em', backgroundColor: 'var(--bg)', border: '1px solid var(--border-low)', cursor: 'pointer' }}>
                    <div className='flex row a-center gap'>
                      <Profile img={s.image} width='40px' />
                      <div className='flex column a-start'>
                        <Text text={`${s.fname} ${s.lname}`} size='var(--text-m)' />
                        <Text text={s.number} size='var(--text-s)' color='var(--text-low)' />
                      </div>
                    </div>
                    <input type='checkbox' checked={selectedDelegates.includes(s.number)} onChange={()=>toggleDelegateStudent(s.number)} />
                  </label>
                ))}
              </div>
            </div>

            <div className='flex row a-center gap pdt' style={{ marginTop: '1em' }}>
              <SecondaryButton text='Cancel' onClick={()=>{ setDelegateModal(false) }} />
              <PrimaryButton isLoading={delegateLoading} text='Update Delegates' onClick={submitDelegates} />
            </div>
          </div>
        </div>
      </Popup>
    </div>
  )
}

export default AdminGroups