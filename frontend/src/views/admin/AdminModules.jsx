import React, {useState, useRef, useEffect} from 'react'

import styles from './admin.module.css'

import Text from '../../components/text/Text';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import Float from '../../components/containers/Float';
import FloatButton from '../../components/buttons/FloatButton';
import IconButton from '../../components/buttons/IconButton';
import formatNumber from '../../hooks/formatNumber';
import StaticsCard from '../../components/containers/StaticsCard';
import Button from '../../components/buttons/Button';
import Profile from '../../components/containers/profile';
import Popup from '../../components/containers/Popup';
import TextInput from '../../components/input/TextInput';
import SelectInputImage from '../../components/input/SelectInputImage';
import SelectInput from '../../components/input/SelectInput';
import ConfirmDialog from '../../components/containers/ConfirmDialog';

import { useAnimateNumber } from "../../hooks/useAnimateNumber";
import { ListTable } from '../../components/tables/ListTable';
import { Modules, Specialities, Teachers } from '../../API'
import { useNotify } from '../../components/loaders/NotificationContext';
import { useGSAP } from '@gsap/react';

import gsap from 'gsap';
gsap.registerPlugin(useGSAP);


const AdminModules = () => {
  document.title = "Unitime - Modules";
  const [staticsLoading, setStaticsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [attachTeacherModal, setAttachTeacherModal] = useState(false);
  const [attachingModule, setAttachingModule] = useState(null)
  const [editingModule, setEditingModule] = useState(null)
  const [modulesList, setModulesList] = useState({ total: 0, modules: [] })
  const [stats, setStats] = useState({ total: 0, fundamental: 0, methodological: 0, transversal: 0 })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: 'normal', title: '', message: '', action: null, actionData: null })
  const [formData, setFormData] = useState({ code: '', name: '', short_name: '', type: '', factor: '', credits: '' })
  const [specialitiesList, setSpecialitiesList] = useState([])
  const [teachersList, setTeachersList] = useState([])
  const [selectedSpeciality, setSelectedSpeciality] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [attachedTeachers, setAttachedTeachers] = useState([])
  const [attachTeacherLoading, setAttachTeacherLoading] = useState(false)
  const { notify } = useNotify()
  const animatedTotal = useAnimateNumber(0, stats.total, 1000)
  const animatedFundamental = useAnimateNumber(0, stats.fundamental, 1000)
  const animatedMethodological = useAnimateNumber(0, stats.methodological, 1000)
  const animatedTransversal = useAnimateNumber(0, stats.transversal, 1000)



  const layoutPath = useRef(null);
  const layoutHead = useRef(null);
  const layoutBody = useRef(null);
  const isMountedRef = useRef(true);

  const loadModules = async () => {
    try {
      setTableLoading(true)
      setStaticsLoading(true)

      const resp = await Modules.getAll()
      const data = resp ?? {}
      const items = Array.isArray(data) ? data : (data.modules || data.items || [])
      if (isMountedRef.current) setModulesList({ total: data.total || items.length, modules: items })

      const statsResp = await Modules.stats()
      if (isMountedRef.current) setStats(statsResp)
    } catch (err) {
      console.error('Failed to load modules', err)
      notify('error', 'Failed to load modules')
    } finally {
      if (isMountedRef.current) {
        setTableLoading(false)
        setStaticsLoading(false)
      }
    }
  }
  useEffect(() => {
    const HH = layoutPath.current.offsetHeight + layoutHead.current.offsetHeight
    layoutBody.current.style.maxHeight = `calc(50vh - ${HH}px - 2.5em)`

    isMountedRef.current = true
    loadModules()
    return () => { isMountedRef.current = false }
  }, []);

  useGSAP(() => {
    gsap.from('.gsap-y', { 
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
    })
  });

  const submitAddModule = async () => {
    setDialogLoading(true)
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        short_name: formData.short_name,
        type: formData.type,
        factor: formData.factor,
        credits: formData.credits,
      }
      await Modules.add(payload)
      notify('success', 'Module added')
      const r = await Modules.getAll()
      const items = r.modules || r
      setModulesList({ total: r.total || items.length, modules: items })
      const statsResp = await Modules.stats()
      setStats(statsResp)
      setAddModal(false)
      setEditingModule(null)
      setFormData({ code: '', name: '', short_name: '', type: '', factor: '', credits: '' })
    } catch (err) {
      console.error(err)
      notify('error', 'Failed to add module')
    } finally {
      setDialogLoading(false)
    }
  }

  const submitEditModule = async () => {
    setDialogLoading(true)
    try {
      const code = editingModule ? (editingModule.code || formData.code) : formData.code
      const payload = {
        name: formData.name,
        short_name: formData.short_name,
        type: formData.type,
        factor: formData.factor,
        credits: formData.credits,
      }
      await Modules.update(code, payload)
      notify('success', 'Module updated')
      const r = await Modules.getAll()
      const items = r.modules || r
      setModulesList({ total: r.total || items.length, modules: items })
      const statsResp = await Modules.stats()
      setStats(statsResp)
      setAddModal(false)
      setEditingModule(null)
      setFormData({ code: '', name: '', short_name: '', type: '', factor: '', credits: '' })
    } catch (err) {
      console.error(err)
      notify('error', 'Failed to update module')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleAttachTeacher = (moduleCode) =>{
    setAttachingModule(moduleCode)
    setAttachTeacherModal(true)
    loadAttachTeacherData(moduleCode)
  }

  const loadAttachTeacherData = async (moduleCode) => {
    setAttachTeacherLoading(true)
    try {
      const specResp = await Specialities.getAll()
      const specs = Array.isArray(specResp) ? specResp : (specResp.specialities || specResp.items || [])
      setSpecialitiesList(specs)

      const moduleResp = await Modules.get(moduleCode)
      const teachers = moduleResp.teachers || []
      setAttachedTeachers(teachers)
    } catch (err) {
      console.error('Failed to load attach teacher data', err)
      notify('error', 'Failed to load data')
    } finally {
      setAttachTeacherLoading(false)
    }
  }

  const loadTeachersBySpeciality = async (specialityId) => {
    try {
      const teachersResp = await Teachers.getAll()
      const allTeachers = Array.isArray(teachersResp) ? teachersResp : (teachersResp.teachers || teachersResp.items || [])
      
      const attachedNumbers = attachedTeachers.map(t => t.number)
      const filtered = allTeachers.filter(t => 
        t.speciality_id === specialityId && !attachedNumbers.includes(t.number)
      )
      
      setTeachersList(filtered)
      setSelectedTeacher(null)
    } catch (err) {
      console.error('Failed to load teachers', err)
      notify('error', 'Failed to load teachers')
    }
  }

  const handleSpecialityChange = (specialityId) => {
    setSelectedSpeciality(specialityId)
    if (specialityId) {
      loadTeachersBySpeciality(specialityId)
    } else {
      setTeachersList([])
    }
  }

  const handleAddTeacherToModule = async () => {
    if (!selectedTeacher) {
      notify('error', 'Please select a teacher')
      return
    }

    setAttachTeacherLoading(true)
    try {
      await Modules.assignTeacher(attachingModule, { teacher_number: selectedTeacher.number, speciality_id: selectedSpeciality })
      notify('success', 'Teacher assigned successfully')
      
      const moduleResp = await Modules.get(attachingModule)
      const teachers = moduleResp.teachers || []
      setAttachedTeachers(teachers)
      
      if (selectedSpeciality) {
        await loadTeachersBySpeciality(selectedSpeciality)
      }
      
      setSelectedTeacher(null)
    } catch (err) {
      console.error('Failed to assign teacher', err)
      notify('error', 'Failed to assign teacher')
    } finally {
      setAttachTeacherLoading(false)
    }
  }

  const handleRemoveTeacherFromModule = async (teacherNumber) => {
    setAttachTeacherLoading(true)
    try {
      await Modules.unassignTeacher(attachingModule, teacherNumber)
      notify('success', 'Teacher removed successfully')
      
      const moduleResp = await Modules.get(attachingModule)
      const teachers = moduleResp.teachers || []
      setAttachedTeachers(teachers)
      
      if (selectedSpeciality) {
        await loadTeachersBySpeciality(selectedSpeciality)
      }
    } catch (err) {
      console.error('Failed to remove teacher', err)
      notify('error', 'Failed to remove teacher')
    } finally {
      setAttachTeacherLoading(false)
    }
  }

  return (
    <div className={`${styles.modulesLayout} full scrollbar`}>
      <Float bottom='6em' right="1em" css='h4pc'>
        <FloatButton icon="fa-solid fa-plus" onClick={()=>{ setEditingModule(null); setFormData({ code: '', name: '', short_name: '', type: '', factor: '', credits: '' }); setAddModal(true) }} />
      </Float>
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
            if (confirmDialog.action === 'delete' && confirmDialog.actionData) {
              await Modules.remove(confirmDialog.actionData.code)
              notify('success', 'Module deleted')
              // reload
              const r = await Modules.getAll()
              const items = r.modules || r
              setModulesList({ total: r.total || items.length, modules: items })
              const statsResp = await Modules.stats()
              setStats(statsResp)
            } else if (confirmDialog.action === 'add') {
              await submitAddModule()
            } else if (confirmDialog.action === 'edit') {
              await submitEditModule()
            }
          } catch (err) { console.error(err); notify('error', 'Action failed') } finally { setDialogLoading(false); setConfirmDialog({ ...confirmDialog, isOpen: false }) }
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
      <Popup isOpen={addModal} blur={2} bg='rgba(0,0,0,0.2)' onClose={()=>setAddModal(false)}>
          <div className={`${styles.dashBGC}`} style={{ maxWidth: '700px', padding: '2em' }}>
            <div className="flex row a-center j-spacebet">
              <Text text='Add New Module' size='var(--text-l)' color='var(--text)' align='left' />
              <IconButton icon='fa-solid fa-xmark' onClick={()=>setAddModal(false)} />
            </div>
            <div className="flex column gap mrv">
              <div className="flex row a-center gap">
                <TextInput width='70%' label='Module Name' placeholder='Enter module name' value={formData.name} onchange={(e)=>setFormData(prev=>({ ...prev, name: e.target.value }))} />
                <TextInput width='30%' label='Module Shortcut' placeholder='Ex: ASD' value={formData.short_name} onchange={(e)=>setFormData(prev=>({ ...prev, short_name: e.target.value }))} />
              </div>
              <div className="flex row a-center gap">
                <TextInput width='40%' label='Module Code' placeholder='Ex: L1ANS1' value={formData.code} onchange={(e)=>setFormData(prev=>({ ...prev, code: e.target.value }))} />
                <TextInput width='60%' label='Module Type' placeholder='Enter module type' value={formData.type} onchange={(e)=>setFormData(prev=>({ ...prev, type: e.target.value }))} dataList={["Fundamental", "Methodological", "Transversal"]}/>
              </div>
              <div className="flex row a-center gap">
                <TextInput type='number' label='Module Factor' placeholder='Enter module factor' value={formData.factor} onchange={(e)=>setFormData(prev=>({ ...prev, factor: e.target.value }))} />
                <TextInput type='number' label='Module Credit' placeholder='Enter module credit' value={formData.credits} onchange={(e)=>setFormData(prev=>({ ...prev, credits: e.target.value }))} />
              </div>
            </div>
            <div className="flex row a-center gap pdt">
              <SecondaryButton text='Cancel' onClick={()=>setAddModal(false)}/>
              <PrimaryButton isLoading={dialogLoading} text={editingModule ? 'Update Module' : 'Add Module'} onClick={async ()=>{ setConfirmDialog({ isOpen: true, type: editingModule ? 'normal' : 'normal', title: editingModule ? 'Update Module' : 'Add Module', message: editingModule ? `Update module ${formData.name}?` : `Add module ${formData.name}?`, action: editingModule ? 'edit' : 'add', actionData: null }) }} />
            </div>
          </div>
      </Popup>
      <Popup isOpen={attachTeacherModal} blur={2} bg='rgba(0,0,0,0.2)' onClose={async ()=>{ setAttachTeacherModal(false); setSelectedSpeciality(null); setSelectedTeacher(null); await loadModules(); }}>
        <div className={`${styles.dashBGC}`} style={{ minWidth: '500px', padding: '2em' }}>
            <div className="flex row a-center j-spacebet">
            <Text text='Attach Teachers to Module' size='var(--text-l)' color='var(--text)' align='left' />
            <IconButton icon='fa-solid fa-xmark' onClick={async ()=>{ setAttachTeacherModal(false); setSelectedSpeciality(null); setSelectedTeacher(null); await loadModules(); }} />
          </div>
          
          {attachTeacherLoading && !specialitiesList.length ? (
            <div style={{ textAlign: 'center', padding: '2em', marginTop: '1.5em' }}>
              <Text text='Loading teachers data...' align='center' color='var(--text-low)' />
            </div>
          ) : (
            <div className="flex column gap mrv" style={{ marginTop: '1.5em' }}>
              <div className="flex row a-end gap">

                <SelectInput 
                  bg='var(--bg)'
                  label='Select Speciality'
                  placeholder='Choose a speciality'
                  options={specialitiesList.length > 0 ? specialitiesList.map(s => ({ value: s.id, text: s.name })) : [{value: '', text: 'Loading specialities...'}]}
                  onChange={(val) => {
                    setSelectedSpeciality(val || null)
                    if (val) {
                      loadTeachersBySpeciality(val)
                    } else {
                      setTeachersList([])
                      setSelectedTeacher(null)
                    }
                  }}
                />

                {selectedSpeciality && teachersList.length > 0 && (
                  <div>
                    <Text text='Available Teachers' size='var(--text-m)' align='left' css='mgs' />
                    <SelectInputImage
                      bg='var(--bg)'
                      options={teachersList.map(teacher => ({
                        value: teacher.number,
                        text: `${teacher.fname} ${teacher.lname}`,
                        img: teacher.image
                      }))}
                      onChange={(index) => {
                        setSelectedTeacher(teachersList[index])
                      }}
                    />
                  </div>
                )}
              </div>

              {selectedSpeciality && teachersList.length === 0 && (
                <div style={{ padding: '1.5em', textAlign: 'center', backgroundColor: 'var(--bg)', borderRadius: '0.5em', border: '1px solid var(--border-low)' }}>
                  <Text text='No available teachers for this speciality' size='0.9em' color='var(--text-low)' align='center' />
                </div>
              )}

              {selectedSpeciality && selectedTeacher && (
                <div className="flex row a-center gap pdt">
                  <SecondaryButton text='Cancel' onClick={()=>{setSelectedTeacher(null); setTeachersList([])}}/>
                  <PrimaryButton 
                    text='Add Selected Teacher' 
                    onClick={handleAddTeacherToModule}
                    isLoading={attachTeacherLoading}
                  />
                </div>
              )}

              {attachedTeachers.length > 0 && (
                <div style={{ marginTop: '1.5em', paddingTop: '1.5em', borderTop: '1px solid var(--border-low)' }}>
                  <div className="flex row a-center j-spacebet mgs">
                    <Text text={`Attached Teachers (${attachedTeachers.length})`} size='var(--text-m)' align='left' />
                  </div>
                  <div className='mrt flex column gap scrollbar pdh overflow-y-a' style={{ maxHeight: "200px" }}>
                    {attachedTeachers.map((teacher) => (
                      <div 
                        key={teacher.number}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75em',
                          backgroundColor: 'var(--bg)',
                          borderRadius: '0.5em',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', flex: 1}}>
                          <Profile img={teacher.image} width="30px" />
                          <div style={{ flex: 1 }}>
                            <Text text={`${teacher.fname} ${teacher.lname}`} size='var(--text-m)' align='left' />
                            <Text text={teacher.number} size='var(--text-s)' color='var(--text-low)' align='left' />
                          </div>
                        </div>
                        <IconButton 
                          icon='fa-regular fa-trash-can' 
                          onClick={() => handleRemoveTeacherFromModule(teacher.number)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {attachedTeachers.length === 0 && selectedSpeciality && (
                <div style={{ padding: '1em', textAlign: 'center', backgroundColor: 'var(--bg)', borderRadius: '0.5em', border: '1px solid var(--border-low)' }}>
                  <Text text='No teachers attached yet' size='0.9em' color='var(--text-low)' align='center' />
                </div>
              )}
            </div>
          )}
          
          <div className="flex row a-center gap pdt" style={{ marginTop: '1.5em', paddingTop: '1.5em', borderTop: '1px solid var(--border-low)' }}>
            <SecondaryButton text='Close' onClick={async ()=>{ setAttachTeacherModal(false); setSelectedSpeciality(null); setSelectedTeacher(null); await loadModules(); }} />
          </div>
        </div>
      </Popup>
      <div ref={layoutPath} className={`${styles.modulesHeader}`}>
        <div className={`${styles.modulesPath} flex a-center h4p`}>
            <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
            <Text css='h4p' align='left' mrg='0 0.25em' text='Modules' color='var(--text)' size='var(--text-m)' />
        </div>
      </div>
      <div ref={layoutHead} className={`${styles.modulesStatics} flex row gap wrap j-center`}>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Total Modules' value={formatNumber(animatedTotal)} icon="fa-solid fa-book-bookmark" color='#2B8CDF'/>}

        </div>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Fundamental' value={formatNumber(animatedFundamental)} icon="fa-solid fa-book-open" color='#F1504A'/>}

        </div>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Methodological' value={formatNumber(animatedMethodological)} icon="fa-solid fa-person-chalkboard" color='#9A8CE5'/>}

        </div>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Transversal' value={formatNumber(animatedTransversal)} icon="fa-solid fa-flask-vial" color='#4FB6A3'/>}

        </div>
      </div>
      <div ref={layoutBody} className={`gsap-y ${styles.modulesContent} flex column`}>
        <div className="flex row a-center">
          <Text align='left' text='Modules List' size='var(--text-l)' />
          <PrimaryButton text='Add Module' icon='fa-solid fa-plus' onClick={()=>setAddModal(true)} mrg='0 0 0 auto' css='h4p'/>
        </div>
        <div className={`${styles.modulesTable} full ${styles.dashBGC} ${tableLoading && "shimmer"}`}>
          {!tableLoading &&
          <ListTable
            title="Modules"
            rowTitles={["Code", "Name", "Shortcut", "Teacher", "Type", "Factor", "Credit", "Action"]}
            rowTemplate="0.2fr 0.6fr 0.3fr 0.5fr 0.3fr repeat(3, 0.2fr)"

            dataList={{ total: modulesList.total, items: modulesList.modules }}

            filterFunction={(s, text) =>
                `${s.fname} ${s.lname}`.toLowerCase().includes(text.toLowerCase()) ||
                s.email.toLowerCase().includes(text.toLowerCase()) ||
                s.number.includes(text)
            }

            sortFunction={(a, b, sort) => {
                if (sort === "A-Z") return a.name.localeCompare(b.name);
                if (sort === "Z-A") return b.name.localeCompare(a.name);
                return 0;
            }}

            exportConfig={{
              title: "Modules List",
              fileName: "Modules_list"+new Date(),
              headers: ["#", "Code", "Name", "Shortcut", "Type", "Factor", "Credit"],
              mapRow: (s, i) => [
                i + 1,
                s.code,
                s.name,
                s.shortcut || s.short_name,
                s.type,
                s.factor,
                s.credits || s.credit
              ]
            }}

            rowRenderer={(module) => (
                <>
                    <Text align='left' text={module.code} size='var(--text-m)'/>
                    <Text align='left' text={module.name} size='var(--text-m)'/>
                    <Text align='left' text={module.shortcut || module.short_name} size='var(--text-m)'/>
                    <div className="flex row a-center gap" onClick={() => {handleAttachTeacher(module.code)}} style={{cursor: "pointer"}}>
                      {(!module.teachers || module.teachers.length == 0) && <Button text='Attach Teacher' onClick={() => {handleAttachTeacher(module.code)}} icon='fa-solid fa-plus' />}
                      {(module.teachers && module.teachers.length == 1) && 
                      <div className="flex row a-center gap">
                        <Profile img={module.teachers[0].image} width="35px" border="2px solid var(--bg)"/>
                        <Text align='left' text={`${module.teachers[0].fname} ${module.teachers[0].lname}`} size='var(--text-m)'/>
                      </div>}
                      {(module.teachers && module.teachers.length > 1) && 
                        <div className="flex row a-center gap pos-rel">
                          {module.teachers.map((teacher, index) => {
                            if (index > 3) return null;
                            return (
                              <Profile
                                key={index}
                                img={teacher.image}
                                width="35px"
                                classes="pos-abs pos-center-v"
                                left={`${index * 12}px`}
                                border="2px solid var(--bg)"
                              />
                            );
                          })}
                          
                          <Text
                            align="left"
                            text="+2 Teachers"
                            size="var(--text-m)"
                            mrg={`0 0 0 ${35 + module.teachers.length * 12}px`}
                          />
                      </div>}
                    </div>
                    <Text align='left' text={module.type} size='var(--text-m)'/>
                    <Text align='left' text={module.factor} size='var(--text-m)'/>
                    <Text align='left' text={module.credits || module.credit} size='var(--text-m)'/>
                    <div className="flex row center gap">
                        <IconButton icon="fa-regular fa-pen-to-square" onClick={() => {
                          setEditingModule(module)
                          setFormData({ code: module.code || '', name: module.name || '', short_name: module.shortcut || module.short_name || '', type: module.type || '', factor: module.factor || '', credits: module.credits || module.credit || '' })
                          setAddModal(true)
                        }} />
                        <IconButton icon="fa-regular fa-trash-can" onClick={() => setConfirmDialog({ isOpen: true, type: 'danger', title: 'Delete Module', message: `Delete ${module.name}?`, action: 'delete', actionData: module })} />
                    </div>
                </>
            )}
          />}
        </div>
      </div>
    </div>
  )
}

export default AdminModules