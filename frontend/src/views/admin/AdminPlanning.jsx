import React, { useState, useCallback } from 'react'

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

import styles from "./admin.module.css"
import { useEffect } from 'react'
import Text from '../../components/text/Text'
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import Button from '../../components/buttons/Button';
import Float from '../../components/containers/Float';
import FloatButton from '../../components/buttons/FloatButton';
import CalendarView from '../../components/calendar/CalendarView';
import SelectInput from '../../components/input/SelectInput';
import TextInput from '../../components/input/TextInput';
import Checkbox from '../../components/input/Checkbox';
import Popup from '../../components/containers/Popup';
import IconButton from '../../components/buttons/IconButton';
import Profile from '../../components/containers/profile';
import { Exams, Rooms, Modules, Teachers, Groups, Surveillance } from '../../API'
import * as ConflictsAPI from '../../API/conflicts'
import { useNotify } from '../../components/loaders/NotificationContext';

const AdminPlanning = () => {
  document.title = "Unitime - Planning";
  const { notify } = useNotify()
  
  useGSAP(() => {
    gsap.set('.gsap-y', {y:0,zIndex:1, opacity: 1})
    gsap.from('.gsap-y', { 
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
    })
  });

  const [examsList, setExamsList] = useState([])
  const [roomsList, setRoomsList] = useState([])
  const [modulesList, setModulesList] = useState([])
  const [teachersList, setTeachersList] = useState([])
  const [groupsList, setGroupsList] = useState([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)

  const [filterRoom, setFilterRoom] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterExamType, setFilterExamType] = useState('')
  const [filterStartdate, setFilterStartdate] = useState(null)
  const [filterEnddate, setFilterEnddate] = useState(null)
  const [conflicts, setConflicts] = useState([])

  const [addExamModal, setAddExamModal] = useState(false)
  const [editingExam, setEditingExam] = useState(null)
  const [surveillanceModal, setSurveillanceModal] = useState(false)
  const [selectedExamForSurveillance, setSelectedExamForSurveillance] = useState(null)
  const [assignedProctors, setAssignedProctors] = useState({})
  const [formLoading, setFormLoading] = useState(false)

  const [examFormData, setExamFormData] = useState({
    module_code: '',
    group_code: '',
    room_id: '',
    exam_type: 'Exam',
    date: '',
    start_hour: '',
    end_hour: '',
  })
  const [selectedSurveillance, setSelectedSurveillance] = useState([])

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 600)
  }

  const loadAllData = useCallback(async () => {
    setDataLoading(true)
    try {
      const [examsResp, roomsResp, modulesResp, teachersResp, groupsResp] = await Promise.all([
        Exams.getAll(),
        Rooms.getAll(),
        Modules.getAll(),
        Teachers.getAll(),
        Groups.getAll()
      ])

      const exams = Array.isArray(examsResp) ? examsResp : (examsResp.exams || [])
      const rooms = Array.isArray(roomsResp) ? roomsResp : (roomsResp.rooms || [])
      const modules = Array.isArray(modulesResp) ? modulesResp : (modulesResp.modules || [])
      const teachers = Array.isArray(teachersResp) ? teachersResp : (teachersResp.teachers || [])
      const groups = Array.isArray(groupsResp) ? groupsResp : (groupsResp.groups || [])

      setExamsList(exams)
      setRoomsList(rooms)
      setModulesList(modules)
      setTeachersList(teachers)
      setGroupsList(groups)
      setCalendarLoading(false)
    } catch (err) {
      console.error('Failed to load data', err)
      notify('error', 'Failed to load planning data')
      setCalendarLoading(false)
    } finally {
      setDataLoading(false)
    }
  }, [notify])

  useEffect(() => {
    loadAllData()
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [loadAllData])

  const filterEvents = (exams, filters = {}) => {
    const { room, level, examType } = filters

    return exams.filter(exam => {
      if (room && exam.room_name && !exam.room_name.toLowerCase().includes(room.toLowerCase())) return false
      if (level && exam.level && !exam.level.toLowerCase().includes(level.toLowerCase())) return false
      if (examType && exam.exam_type && !exam.exam_type.toLowerCase().includes(examType.toLowerCase())) return false
      return true
    })
  }

  const transformExamForCalendar = (exam) => {
    const startDate = new Date(exam.date)
    const group = groupsList.find(g => g.code === exam.group_code)
    return {
      day: startDate.toISOString().split('T')[0],
      startHour: parseFloat(exam.start_hour),
      endHour: parseFloat(exam.end_hour),
      type: exam.exam_type || 'Exam',
      room: exam.room_name || 'TBD',
      group: exam.group_code,
      module: exam.module_name,
      speciality: group?.speciality || 'N/A',
      level: group?.level || 'N/A',
      id: exam.id
    }
  }

  const handleAddExam = async () => {
    if (!examFormData.module_code || !examFormData.group_code || !examFormData.date || !examFormData.start_hour || !examFormData.end_hour) {
      notify('error', 'Please fill all required fields')
      return
    }

    if (parseFloat(examFormData.start_hour) >= parseFloat(examFormData.end_hour)) {
      notify('error', 'End hour must be after start hour')
      return
    }

    setFormLoading(true)
    try {
      await Exams.add({
        module_code: examFormData.module_code,
        group_code: examFormData.group_code,
        room_id: examFormData.room_id || null,
        exam_type: examFormData.exam_type,
        date: examFormData.date,
        start_hour: parseFloat(examFormData.start_hour),
        end_hour: parseFloat(examFormData.end_hour)
      })

      notify('success', 'Exam created successfully')
      setAddExamModal(false)
      resetExamForm()
      await loadAllData()
    } catch (err) {
      console.error('Failed to create exam', err)
      notify('error', err.response?.data?.message || 'Failed to create exam')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditExam = async () => {
    if (!editingExam || !examFormData.module_code || !examFormData.group_code) {
      notify('error', 'Please fill all required fields')
      return
    }

    setFormLoading(true)
    try {
      await Exams.update(editingExam.id, {
        module_code: examFormData.module_code,
        group_code: examFormData.group_code,
        room_id: examFormData.room_id || null,
        exam_type: examFormData.exam_type,
        date: examFormData.date,
        start_hour: parseFloat(examFormData.start_hour),
        end_hour: parseFloat(examFormData.end_hour)
      })

      notify('success', 'Exam updated successfully')
      setAddExamModal(false)
      setEditingExam(null)
      resetExamForm()
      await loadAllData()
    } catch (err) {
      console.error('Failed to update exam', err)
      notify('error', err.response?.data?.message || 'Failed to update exam')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteExam = async (exam) => {
    try {
      await Exams.remove(exam.id)
      notify('success', 'Exam deleted')
      await loadAllData()
    } catch (err) {
      console.error('Failed to delete exam', err)
      notify('error', 'Failed to delete exam')
    }
  }

  const openEditExam = async (exam) => {
    setEditingExam(exam)
    setExamFormData({
      module_code: exam.module_code,
      group_code: exam.group_code,
      room_id: exam.room_id || '',
      exam_type: exam.exam_type || 'Exam',
      date: exam.date ? exam.date.split('T')[0] : '',
      start_hour: exam.start_hour,
      end_hour: exam.end_hour
    })
    
    setAddExamModal(true)
    
    try {
      const proctorsResponse = await Surveillance.getByExam(exam.id)
      console.log('Proctors response:', proctorsResponse)
      
      if (proctorsResponse && Array.isArray(proctorsResponse) && proctorsResponse.length > 0) {
        const proctoraData = proctorsResponse.map(p => {
          if (p.teacher) {
            return {
              number: p.teacher.number,
              fname: p.teacher.fname,
              lname: p.teacher.lname,
              image: p.teacher.image
            }
          }
          const teacher = teachersList.find(t => t.number === p.teacher_number)
          return teacher ? { ...teacher } : null
        }).filter(Boolean)
        
        console.log('Processed proctors:', proctoraData)
        setAssignedProctors(prev => ({ ...prev, [exam.id]: proctoraData }))
      } else {
        setAssignedProctors(prev => ({ ...prev, [exam.id]: [] }))
      }
    } catch (err) {
      console.error('Failed to load proctors:', err)
      setAssignedProctors(prev => ({ ...prev, [exam.id]: [] }))
    }
  }

  const resetExamForm = () => {
    setExamFormData({
      module_code: '',
      group_code: '',
      room_id: '',
      exam_type: 'Exam',
      date: '',
      start_hour: '',
      end_hour: ''
    })
    setEditingExam(null)
  }

  const openSurveillanceModal = async (exam) => {
    setSelectedExamForSurveillance(exam)
    setSelectedSurveillance([])
    setSurveillanceModal(true)
    
    try {
      const proctors = await Surveillance.getByExam(exam.id)
      if (proctors && proctors.length > 0) {
        setSelectedSurveillance(proctors.map(p => p.teacher_number))
      }
    } catch (err) {
      console.error('Failed to load assigned proctors', err)
    }
  }

  const toggleTeacherForSurveillance = (teacherNumber) => {
    setSelectedSurveillance(prev => {
      if (prev.includes(teacherNumber)) return prev.filter(n => n !== teacherNumber)
      return [...prev, teacherNumber]
    })
  }

  const handleConflict = (event, dayKey) => {
    setConflicts(prev => {
      const exists = prev.some(c => c.room === event.room && c.day === dayKey && c.startHour === event.startHour)
      if (!exists) {
        return [...prev, { room: event.room, day: dayKey, startHour: event.startHour, type: 'room' }]
      }
      return prev
    })
  }

  // Detect all conflicts: room overlaps and group schedule conflicts
  const detectAllConflicts = useCallback(() => {
    const detectedConflicts = []
    
    // Check for room conflicts (same room, same day, overlapping time)
    for (let i = 0; i < examsList.length; i++) {
      for (let j = i + 1; j < examsList.length; j++) {
        const exam1 = examsList[i]
        const exam2 = examsList[j]
        
        const date1 = exam1.date ? exam1.date.split('T')[0] : ''
        const date2 = exam2.date ? exam2.date.split('T')[0] : ''
        
        // Check if same day and same room
        if (date1 === date2 && exam1.room_id && exam1.room_id === exam2.room_id) {
          const start1 = parseFloat(exam1.start_hour)
          const end1 = parseFloat(exam1.end_hour)
          const start2 = parseFloat(exam2.start_hour)
          const end2 = parseFloat(exam2.end_hour)
          
          // Check if times overlap
          if (start1 < end2 && end1 > start2) {
            const conflict = {
              day: date1,
              startHour: Math.min(start1, start2),
              type: 'room',
              description: `Room conflict: ${exam1.room_name} (${exam1.module_name} and ${exam2.module_name})`
            }
            
            const exists = detectedConflicts.some(c => 
              c.day === conflict.day && 
              c.type === conflict.type && 
              c.description === conflict.description
            )
            if (!exists) {
              detectedConflicts.push(conflict)
            }
          }
        }
        
        // Check for group schedule conflicts (same group, same day, overlapping time)
        if (date1 === date2 && exam1.group_code === exam2.group_code) {
          const start1 = parseFloat(exam1.start_hour)
          const end1 = parseFloat(exam1.end_hour)
          const start2 = parseFloat(exam2.start_hour)
          const end2 = parseFloat(exam2.end_hour)
          
          // Check if times overlap
          if (start1 < end2 && end1 > start2) {
            const conflict = {
              day: date1,
              startHour: Math.min(start1, start2),
              type: 'group',
              group: exam1.group_code,
              description: `Group schedule conflict: ${exam1.group_name} has overlapping exams (${exam1.module_name} ${start1}-${end1} and ${exam2.module_name} ${start2}-${end2})`
            }
            
            const exists = detectedConflicts.some(c => 
              c.day === conflict.day && 
              c.type === conflict.type && 
              c.group === conflict.group &&
              c.description === conflict.description
            )
            if (!exists) {
              detectedConflicts.push(conflict)
            }
          }
        }
      }
    }
    
    setConflicts(detectedConflicts)
  }, [examsList])

  // Run conflict detection whenever exam list changes
  useEffect(() => {
    detectAllConflicts()
  }, [detectAllConflicts])

  const handleCheckConflicts = async () => {
    try {
      // Run local detection to populate conflicts list
      detectAllConflicts()

      // Fetch backend stats
      const stats = await ConflictsAPI.getStats()
      const total = stats?.total_conflicts || 0
      const roomConflicts = stats?.room_conflicts || 0
      const groupConflicts = stats?.group_conflicts || 0

      if (total === 0) {
        notify('success', 'No conflicts detected! ✓')
      } else {
        notify('warning', `Found ${total} conflict(s): ${roomConflicts} room, ${groupConflicts} group`)
      }
    } catch (err) {
      console.error('Failed to check conflicts', err)
      notify('error', 'Failed to check conflicts')
    }
  }

  return (
    <div className={`${styles.modulesLayout} full scrollbar`}>
      <Popup isOpen={addExamModal} blur={2} bg='rgba(0,0,0,0.2)' onClose={()=>{ setAddExamModal(false); setEditingExam(null); resetExamForm() }}>
        <div className={`${styles.dashBGC}`} style={{ maxWidth: '700px', padding: '2em' }}>
          <div className="flex row a-center j-spacebet">
            <Text text={editingExam ? 'Edit Exam' : 'Add New Exam'} size='var(--text-l)' color='var(--text)' align='left' />
            <IconButton icon='fa-solid fa-xmark' onClick={()=>{ setAddExamModal(false); resetExamForm() }} />
          </div>
          <div className="flex column gap mrv">
            <div className="flex row a-center gap">
              <SelectInput
                bg='var(--bg)'
                label='Module'
                placeholder='Choose module'
                options={modulesList.map(m => ({ value: m.code, text: m.name }))}
                onChange={(val) => setExamFormData(prev => ({ ...prev, module_code: val || '' }))}
                value={examFormData.module_code}
              />
              <SelectInput
                bg='var(--bg)'
                label='Group'
                placeholder='Choose group'
                options={groupsList.map(g => ({ value: g.code, text: g.name }))}
                onChange={(val) => setExamFormData(prev => ({ ...prev, group_code: val || '' }))}
                value={examFormData.group_code}
              />
            </div>

            <div className="flex row a-center gap">
              <SelectInput
                bg='var(--bg)'
                label='Room'
                placeholder='Choose room (optional)'
                options={roomsList.map(r => ({ value: r.id, text: r.name }))}
                onChange={(val) => setExamFormData(prev => ({ ...prev, room_id: val || '' }))}
                value={examFormData.room_id}
              />
              <SelectInput
                bg='var(--bg)'
                label='Exam Type'
                placeholder='Choose type'
                options={[
                  { value: 'Exam', text: 'Exam' },
                  { value: 'TP', text: 'TP (Practical)' },
                  { value: 'TD', text: 'TD (Exercise)' },
                  { value: 'Catch-up', text: 'Catch-up' }
                ]}
                onChange={(val) => setExamFormData(prev => ({ ...prev, exam_type: val || 'Exam' }))}
                value={examFormData.exam_type}
              />
            </div>

            <div className="flex row a-center gap">
              <TextInput
                label='Date'
                type='date'
                width='50%'
                value={examFormData.date}
                onchange={(e) => setExamFormData(prev => ({ ...prev, date: e.target.value }))}
              />
              <div className="flex row gap" style={{ width: '50%' }}>
                <TextInput
                  label='Start Hour'
                  type='number'
                  step='0.5'
                  placeholder='Ex: 8.5'
                  width='50%'
                  value={examFormData.start_hour}
                  onchange={(e) => setExamFormData(prev => ({ ...prev, start_hour: e.target.value }))}
                />
                <TextInput
                  label='End Hour'
                  type='number'
                  placeholder='Ex: 11'
                  step='0.5'
                  width='50%'
                  value={examFormData.end_hour}
                  onchange={(e) => setExamFormData(prev => ({ ...prev, end_hour: e.target.value }))}
                />
              </div>
            </div>

            {editingExam && (
              <div className="flex column gap" style={{ borderTop: '1px solid var(--border-low)', paddingTop: '1em' }}>
                <Text text='Assigned Proctors' size='var(--text-m)' color='var(--text-low)' align='left' />
                {assignedProctors[editingExam.id] !== undefined && assignedProctors[editingExam.id].length > 0 ? (
                  <div className="flex column gap">
                    {assignedProctors[editingExam.id].map(teacher => (
                      <div key={teacher.number} className="flex row a-center j-spacebet" style={{ padding: '0.6em', backgroundColor: 'var(--bg)', borderRadius: '0.4em' }}>
                        <div className='flex row a-center gap'>
                          <Profile img={teacher.image} width='32px' />
                          <div>
                            <Text align='left' text={`${teacher.fname} ${teacher.lname}`} size='var(--text-m)' />
                            <Text align='left' text={teacher.number} size='var(--text-s)' color='var(--text-low)' />
                          </div>
                        </div>
                        <IconButton icon='fa-solid fa-trash' color='var(--text-low)' size='var(--text-m)' onClick={async () => {
                          try {
                            await Surveillance.unassign(editingExam.id, teacher.number)
                            notify('success', 'Proctor removed')
                            setAssignedProctors(prev => ({ 
                              ...prev, 
                              [editingExam.id]: prev[editingExam.id].filter(t => t.number !== teacher.number) 
                            }))
                          } catch {
                            notify('error', 'Failed to remove proctor')
                          }
                        }} />
                      </div>
                    ))}
                    <SecondaryButton text='Manage Proctors' onClick={() => openSurveillanceModal(editingExam)} mrg='0.5em 0 0 0' />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1em' }}>
                    <Text text='No proctors assigned' size='var(--text-m)' color='var(--text-low)' />
                    <SecondaryButton text='Assign Proctors' onClick={() => openSurveillanceModal(editingExam)} mrg='0.5em 0 0 0' />
                  </div>
                )}
              </div>
            )}

            <div className='flex row a-center gap pdt' style={{ marginTop: '1em' }}>
              <SecondaryButton text='Cancel' onClick={()=>{ setAddExamModal(false); resetExamForm() }} />
              {!editingExam && <PrimaryButton isLoading={formLoading} text='Create Exam' onClick={handleAddExam} />}
              {editingExam && <PrimaryButton isLoading={formLoading} text='Update Exam' onClick={handleEditExam} />}
            </div>
          </div>
        </div>
      </Popup>

      <Popup isOpen={surveillanceModal} blur={2} bg='rgba(0,0,0,0.2)' onClose={()=>{ setSurveillanceModal(false); setSelectedExamForSurveillance(null); setSelectedSurveillance([]) }}>
        <div className={`${styles.dashBGC}`} style={{ maxWidth: '700px', padding: '2em' }}>
          <div className="flex row a-center j-spacebet">
            <Text text={`Assign Proctors - ${selectedExamForSurveillance?.module_name || ''}`} size='var(--text-l)' color='var(--text)' align='left' />
            <IconButton icon='fa-solid fa-xmark' onClick={()=>{ setSurveillanceModal(false) }} />
          </div>
          <div className="flex column gap mrv">
            <Text text='Select teachers to proctor this exam' size='var(--text-s)' color='var(--text-low)' align='left' />
            
            <div>
              <Text text='Available Teachers' size='var(--text-m)' align='left' />
              <div className='mrt flex column gap scrollbar pdh overflow-y-a' style={{ maxHeight: '300px'}}>
                {teachersList.length === 0 && <Text text='No teachers available' size='0.9em' color='var(--text-low)' />}
                {teachersList.map(t => (
                  <label key={t.number} className='flex row a-center j-spacebet' style={{ padding: '0.8em', borderRadius: '0.4em', backgroundColor: 'var(--bg)', border: '1px solid var(--border-low)', cursor: 'pointer' }}>
                    <div className='flex row a-center gap'>
                      <Profile img={t.image} width='40px' />
                      <div className='flex column a-start'>
                        <Text text={`${t.fname} ${t.lname}`} size='var(--text-m)' />
                        <Text text={t.number} size='var(--text-s)' color='var(--text-low)' />
                      </div>
                    </div>
                    <input type='checkbox' checked={selectedSurveillance.includes(t.number)} onChange={()=>toggleTeacherForSurveillance(t.number)} />
                  </label>
                ))}
              </div>
            </div>

            <div className='flex row a-center gap pdt' style={{ marginTop: '1em' }}>
              <SecondaryButton text='Cancel' onClick={()=>{ setSurveillanceModal(false) }} />
              <PrimaryButton isLoading={formLoading} text='Assign Proctors' onClick={async () => {
                if (selectedSurveillance.length === 0) {
                  notify('error', 'Please select at least one teacher')
                  return
                }
                setFormLoading(true)
                try {
                  await Promise.all(selectedSurveillance.map(teacherNum => 
                    Surveillance.assign(selectedExamForSurveillance.id, teacherNum)
                  ))
                  
                  // Update the assigned proctors in the edit modal immediately
                  const updatedProctors = selectedSurveillance.map(teacherNum => {
                    return teachersList.find(t => t.number === teacherNum)
                  }).filter(Boolean)
                  
                  setAssignedProctors(prev => ({ 
                    ...prev, 
                    [selectedExamForSurveillance.id]: updatedProctors 
                  }))
                  
                  notify('success', 'Proctors assigned successfully')
                  setSurveillanceModal(false)
                  setSelectedExamForSurveillance(null)
                  setSelectedSurveillance([])
                } catch (err) {
                  console.error('Failed to assign proctors', err)
                  notify('error', 'Failed to assign proctors')
                } finally {
                  setFormLoading(false)
                }
              }} />
            </div>
          </div>
        </div>
      </Popup>

      <div className={`flex h4p ${styles.planningHead}`}>
        <div style={{display:'flex', alignItems:'center', gap:'0.5em'}}>
          {isMobile && (
            <button className={`sidebarToggle clickable ${styles.sidebarToggle}`} onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
              <i className="fa-solid fa-sliders" />
            </button>
          )}
          <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
          <Text css='h4p' align='left' mrg='0 0.25em' text='Planning' color='var(--text)' size='var(--text-m)' />
        </div>
      </div>
      <div className={`${styles.planningContent}`}>
        <div className={`${styles.planningSide} ${styles.plnn4pc}`}>
            <div className={`${styles.planningFilter} ${isMobile ? (sidebarOpen ? styles.mobileSidebarOpen : '') : ''}`}>
            <div className={`${styles.dashBGC} full gsap-y gap flex column`}>
              <Text text='Filters' size='var(--text-m)' opacity='0.5' align='left' />
                <TextInput 
                  label='Date Range Start'
                  type='date'
                  value={filterStartdate || ''}
                  oninput={(e) => {setFilterStartdate(e.target.value)}}
                />
                <TextInput 
                  label='Date Range End'
                  type='date'
                  value={filterEnddate || ''}
                  oninput={(e) => {setFilterEnddate(e.target.value)}}
                />
              <div className="flex row a-end gap">
                <SelectInput
                  bg='var(--bg)'
                  label='Room'
                  placeholder='Filter by room'
                  options={roomsList.map(r => ({ value: r.name, text: r.name }))}
                  onChange={(val) => setFilterRoom(val || '')}
                  value={filterRoom}
                />
                <TextInput 
                  label='Level'
                  placeholder='Filter by level'
                  value={filterLevel}
                  oninput={(e) => {setFilterLevel(e.target.value)}}
                />
              </div>
              <TextInput 
                label='Exam Type'
                placeholder='Filter by exam type'
                value={filterExamType}
                oninput={(e) => {setFilterExamType(e.target.value)}}
              />
            </div>
          </div>
          <div className={`${styles.planningConficts}`}>
            <div className={`${styles.dashBGC} full gsap-y`}>
              <Text text='Conflicts' size='var(--text-m)' opacity='0.5' align='left' />
              {isMobile && sidebarOpen && (
                <div className={styles.mobileBackdrop} onClick={() => setSidebarOpen(false)} />
              )}
              <div className="flex column gap mrt">
                {conflicts.length === 0 ? (
                  <Text text='No conflicts detected' size='var(--text-m)' color='var(--text-low)' align='left' />
                ) : (
                  conflicts.map((conflict, idx) => {
                    const isGroupConflict = conflict.type === 'group'
                    const bgColor = isGroupConflict ? 'rgba(245, 91, 91, 0.08)' : 'rgba(255, 81, 0, 0.08)'
                    const borderColor = isGroupConflict ? 'rgba(245, 91, 91, 0.2)' : 'rgba(255, 81, 0, 0.2)'
                    const iconColor = isGroupConflict ? 'rgb(245, 91, 91)' : 'rgb(255, 81, 0)'
                    const icon = isGroupConflict ? 'fa-people-group' : 'fa-door-open'
                    
                    return (
                      <div key={idx} style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75em 1em',
                        backgroundColor: bgColor,
                        borderRadius: '0.5em',
                        border: `1px solid ${borderColor}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', flex: 1 }}>
                          <i className={`fa-solid ${icon}`} style={{
                            color: iconColor,
                            fontSize: 'var(--text-l)',
                            flexShrink: 0
                          }}></i>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                            <Text text={conflict.description} size='var(--text-m)' color='var(--text)' align='left' />
                          </div>
                        </div>
                        <button style={{
                            background: 'none',
                            border: 'none',
                            color: iconColor,
                            cursor: 'pointer',
                            fontSize: 'var(--text-m)',
                            fontWeight: 'bold',
                            padding: '0 0 0 1em',
                            transition: 'opacity 0.3s',
                            flexShrink: 0
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                          onClick={() => setConflicts(prev => prev.filter((_, i) => i !== idx))}
                          >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.planningMain}`}>
          <div className={`${styles.planningCrl} gsap-y`}>
            <div className={`full flex a-center j-spacebet wrap ${styles.plnn4pc}`}>
              <div className={`flex a-center h100 gap wrap`}>
                <PrimaryButton text='Add Exam' icon='fa-solid fa-plus' onClick={()=>{ resetExamForm(); setAddExamModal(true) }} mrg='0 0.25em 0 0'/>
                <SecondaryButton text='Auto assign rooms' />
                <SecondaryButton text='Check conflicts' onClick={handleCheckConflicts} />
              </div>
              <div className={`flex a-center h100 gap wrap`}>
                <SecondaryButton text='Send Email' />
                <SecondaryButton text='Export PDF' />
                <Button text='Publish' mrg='0 0 0 0.25em'/>
              </div>
            </div>
            <Float top="1em" right="1em" css={`${styles.plnn4p} flex column gap`}>
              <FloatButton icon="fa-solid fa-arrow-down-wide-short" color="var(--border-low)" css="clickable"/>
              <FloatButton icon="fa-solid fa-pen-ruler" css="clickable"/>
            </Float>
          </div>
          <div className={`${styles.planningCalendar}`}>
            <div className={`${styles.dashBGC} full ${(calendarLoading || dataLoading) && "shimmer"} gsap-y`}>
              { !calendarLoading && !dataLoading && 
              <CalendarView  
                startDate={filterStartdate || "2026-01-01"}
                endDate={filterEnddate || "2026-12-31"}
                startHour={8}
                endHour={17}
                eventsList={
                  filterEvents(examsList, { 
                    room: filterRoom,
                    level: filterLevel,
                    examType: filterExamType
                  }).map(transformExamForCalendar)
                }
                onConflict={handleConflict}
                onEventClick={(exam) => {
                  const fullExam = examsList.find(e => e.id === exam.id)
                  if (fullExam) openEditExam(fullExam)
                }}
                onEventDelete={(exam) => {
                  const fullExam = examsList.find(e => e.id === exam.id)
                  if (fullExam) handleDeleteExam(fullExam)
                }}
                onEventSurveillance={(exam) => {
                  const fullExam = examsList.find(e => e.id === exam.id)
                  if (fullExam) openSurveillanceModal(fullExam)
                }}
              />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPlanning