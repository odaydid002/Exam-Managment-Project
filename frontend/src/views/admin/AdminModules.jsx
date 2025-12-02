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
import ConfirmDialog from '../../components/containers/ConfirmDialog';

import { useAnimateNumber } from "../../hooks/useAnimateNumber";
import { ListTable } from '../../components/tables/ListTable';
import { Modules } from '../../API'
import { useNotify } from '../../components/loaders/NotificationContext';
import { useGSAP } from '@gsap/react';

import gsap from 'gsap';
import Popup from '../../components/containers/Popup';
import TextInput from '../../components/input/TextInput';
gsap.registerPlugin(useGSAP);


const AdminModules = () => {
  document.title = "Unitime - Modules";
  const [staticsLoading, setStaticsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null)
  const [modulesList, setModulesList] = useState({ total: 0, modules: [] })
  const [stats, setStats] = useState({ total: 0, fundamental: 0, methodological: 0, transversal: 0 })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: 'normal', title: '', message: '', action: null, actionData: null })
  const [formData, setFormData] = useState({ code: '', name: '', short_name: '', type: '', factor: '', credits: '' })
  const { notify } = useNotify()
  
  const animatedTotal = useAnimateNumber(0, stats.total, 1000)
  const animatedFundamental = useAnimateNumber(0, stats.fundamental, 1000)
  const animatedMethodological = useAnimateNumber(0, stats.methodological, 1000)
  const animatedTransversal = useAnimateNumber(0, stats.transversal, 1000)

  const testList = {
    total: 20,
    modules: [
      {
        code: "L1ANS1",
        name: "Analyses 1",
        shortcut: "ANS1",
        type: "fundamental",
        factor: 2,
        credit: 6,
        teachers: [
          { adj: "Mr", fname: "Amine", lname: "Belkacem", image: "https://avatar.iran.liara.run/public/36" },
          { adj: "Ms", fname: "Imane", lname: "Merabet", image: "https://avatar.iran.liara.run/public/15" },
          { adj: "Ms", fname: "Lina", lname: "Benali", image: "https://avatar.iran.liara.run/public/12" },
        ]
      },
      {
        code: "L1ALG1",
        name: "Algebra 1",
        shortcut: "ALG1",
        type: "fundamental",
        factor: 2,
        credit: 5,
        teachers: [
        ]
      },
      {
        code: "M1ASDS1",
        name: "Algorithms and Data Structures",
        shortcut: "ASD",
        type: "methodological",
        factor: 3,
        credit: 6,
        teachers: [
          { adj: "Mr", fname: "Karim", lname: "Saidi", image: "https://avatar.iran.liara.run/public/44" }
        ]
      },
      {
        code: "L2DBS1",
        name: "Database Systems",
        shortcut: "DB",
        type: "methodological",
        factor: 2,
        credit: 4,
        teachers: [
        ]
      },
      {
        code: "L3AIS2",
        name: "Artificial Intelligence",
        shortcut: "AI",
        type: "methodological",
        factor: 3,
        credit: 6,
        teachers: [
          { adj: "Mr", fname: "Yacine", lname: "Berrabah", image: "https://avatar.iran.liara.run/public/19" },
          { adj: "Mr", fname: "Karim", lname: "Saidi", image: "https://avatar.iran.liara.run/public/44" }
        ]
      },
      {
        code: "M2ML01",
        name: "Machine Learning",
        shortcut: "ML",
        type: "methodological",
        factor: 3,
        credit: 6,
        teachers: [
          { adj: "Mrs", fname: "Nour", lname: "Hachemi", image: "https://avatar.iran.liara.run/public/57" }
        ]
      },
      {
        code: "L2NETS1",
        name: "Computer Networks",
        shortcut: "NET",
        type: "methodological",
        factor: 2,
        credit: 5,
        teachers: [
          { adj: "Mr", fname: "Samir", lname: "Boumediene", image: "https://avatar.iran.liara.run/public/21" }
        ]
      },
      {
        code: "L1PHY1",
        name: "Physics 1",
        shortcut: "PHY1",
        type: "fundamental",
        factor: 2,
        credit: 5,
        teachers: [
          { adj: "Mr", fname: "Rachid", lname: "Zerrouki", image: "https://avatar.iran.liara.run/public/7" }
        ]
      },
      {
        code: "L1CHEM1",
        name: "Chemistry 1",
        shortcut: "CHEM1",
        type: "fundamental",
        factor: 2,
        credit: 5,
        teachers: [
          { adj: "Mr", fname: "Hassan", lname: "Mokhtar", image: "https://avatar.iran.liara.run/public/18" }
        ]
      },
      {
        code: "L2STAT1",
        name: "Statistics",
        shortcut: "STAT",
        type: "methodological",
        factor: 2,
        credit: 4,
        teachers: [
          { adj: "Mrs", fname: "Nadia", lname: "Boukercha", image: "https://avatar.iran.liara.run/public/3" }
        ]
      },
      {
        code: "M1CYB01",
        name: "Cybersecurity",
        shortcut: "CYB",
        type: "methodological",
        factor: 3,
        credit: 5,
        teachers: [
          { adj: "Ms", fname: "Imane", lname: "Merabet", image: "https://avatar.iran.liara.run/public/15" }
        ]
      },
      {
        code: "L3OS01",
        name: "Operating Systems",
        shortcut: "OS",
        type: "methodological",
        factor: 2,
        credit: 5,
        teachers: [
          { adj: "Mr", fname: "Omar", lname: "Lakhdar", image: "https://avatar.iran.liara.run/public/11" }
        ]
      },
      {
        code: "M2CC01",
        name: "Cloud Computing",
        shortcut: "CC",
        type: "methodological",
        factor: 3,
        credit: 5,
        teachers: [
          { adj: "Ms", fname: "Amina", lname: "Saheb", image: "https://avatar.iran.liara.run/public/50" }
        ]
      },
      {
        code: "L2BIO1",
        name: "Genetics",
        shortcut: "GEN",
        type: "fundamental",
        factor: 2,
        credit: 4,
        teachers: [
          { adj: "Ms", fname: "Yasmina", lname: "Cherif", image: "https://avatar.iran.liara.run/public/31" }
        ]
      },
      {
        code: "M1OPT01",
        name: "Optics",
        shortcut: "OPT",
        type: "fundamental",
        factor: 2,
        credit: 4,
        teachers: [
          { adj: "Mr", fname: "Karim", lname: "Saidi", image: "https://avatar.iran.liara.run/public/44" }
        ]
      },
      {
        code: "L3MIC01",
        name: "Microbiology",
        shortcut: "MIC",
        type: "fundamental",
        factor: 2,
        credit: 4,
        teachers: [
          { adj: "Ms", fname: "Sara", lname: "Khelifi", image: "https://avatar.iran.liara.run/public/41" }
        ]
      },
      {
        code: "M1ALG02",
        name: "Advanced Algorithms",
        shortcut: "AALG",
        type: "methodological",
        factor: 3,
        credit: 6,
        teachers: [
          { adj: "Mr", fname: "Walid", lname: "Haddad", image: "https://avatar.iran.liara.run/public/66" }
        ]
      },
      {
        code: "L2HCI01",
        name: "Human–Computer Interaction",
        shortcut: "HCI",
        type: "transversal",
        factor: 1,
        credit: 3,
        teachers: [
          { adj: "Ms", fname: "Rania", lname: "Chergui", image: "https://avatar.iran.liara.run/public/9" }
        ]
      },
      {
        code: "M2BIOC1",
        name: "Biochemistry",
        shortcut: "BIOC",
        type: "fundamental",
        factor: 2,
        credit: 4,
        teachers: [
          { adj: "Mr", fname: "Fouad", lname: "Messaoudi", image: "https://avatar.iran.liara.run/public/27" }
        ]
      },
      {
        code: "M1QM01",
        name: "Quantum Mechanics",
        shortcut: "QM",
        type: "fundamental",
        factor: 3,
        credit: 6,
        teachers: [
          { adj: "Mr", fname: "Mohamed", lname: "Hamadi", image: "https://avatar.iran.liara.run/public/38" }
        ]
      }
    ]
  };

  const layoutPath = useRef(null);
  const layoutHead = useRef(null);
  const layoutBody = useRef(null);
  useEffect(() => {
    const HH = layoutPath.current.offsetHeight + layoutHead.current.offsetHeight
    layoutBody.current.style.maxHeight = `calc(50vh - ${HH}px - 2.5em)`
  
    let mounted = true
    const load = async () => {
      try {
        setTableLoading(true)
        setStaticsLoading(true)
        
        const resp = await Modules.getAll()
        const data = resp ?? {}
        const items = Array.isArray(data) ? data : (data.modules || data.items || [])
        if (mounted) setModulesList({ total: data.total || items.length, modules: items })
        
        const statsResp = await Modules.stats()
        if (mounted) setStats(statsResp)
      } catch (err) {
        console.error('Failed to load modules', err)
        notify('error', 'Failed to load modules')
      } finally {
        if (mounted) {
          setTableLoading(false)
          setStaticsLoading(false)
        }
      }
    }

    load()
    return () => { mounted = false }
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
      <Popup isOpen={addModal} blur={2} bg='rgba(0,0,0,0.3)' onClose={()=>setAddModal(false)}>
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

            dataList={{ total: modulesList.total || testList.total, items: modulesList.modules.length ? modulesList.modules : testList.modules }}

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
                    <div className="flex row a-center gap">
                      {(!module.teachers || module.teachers.length == 0) && <Button text='Attach Teacher' icon='fa-solid fa-plus' />}
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