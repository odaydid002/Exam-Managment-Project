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
import SelectInput from '../../components/input/SelectInput';
import TextInput from '../../components/input/TextInput';
import ImageInput from '../../components/input/ImageInput';
import ConfirmDialog from '../../components/containers/ConfirmDialog';

const AdminTeachers = () => {

  document.title = "Unitime - Teachers";

  const testList = {
    total: 20,
    teachers: [
      {
        fname: "Lina",
        lname: "Benali",
        adj: "Ms",
        number: "48291023",
        departement: "Mathematics",
        position: "Associate Professor",
        speciality: "Algebra",
        phone: "0654321987",
        email: "lina.benali@univ-alger.dz",
        image: "https://avatar.iran.liara.run/public/12"
      },
      {
        fname: "Karim",
        lname: "Saidi",
        adj: "Mr",
        number: "57382940",
        departement: "Physics",
        position: "Senior Lecturer",
        speciality: "Optics",
        phone: "0776543210",
        email: "karim.saidi@univ-oran.dz",
        image: "https://avatar.iran.liara.run/public/44"
      },
      {
        fname: "Nour",
        lname: "Hachemi",
        adj: "Mrs",
        number: "23987456",
        departement: "Computer Science",
        position: "Assistant Professor",
        speciality: "Artificial Intelligence",
        phone: "0667812345",
        email: "nour.hachemi@univ-tlemcen.dz",
        image: "https://avatar.iran.liara.run/public/57"
      },
      {
        fname: "Samir",
        lname: "Boumediene",
        adj: "Mr",
        number: "90213487",
        departement: "IT",
        position: "Lecturer",
        speciality: "Networks",
        phone: "0678123490",
        email: "samir.boumediene@univ-annaba.dz",
        image: "https://avatar.iran.liara.run/public/21"
      },
      {
        fname: "Yasmina",
        lname: "Cherif",
        adj: "Ms",
        number: "78340219",
        departement: "Biology",
        position: "Professor",
        speciality: "Genetics",
        phone: "0692347812",
        email: "yasmina.cherif@univ-algiers.dz",
        image: "https://avatar.iran.liara.run/public/31"
      },
      {
        fname: "Hassan",
        lname: "Mokhtar",
        adj: "Mr",
        number: "65439821",
        departement: "Chemistry",
        position: "Assistant Professor",
        speciality: "Organic Chemistry",
        phone: "0778234901",
        email: "hassan.mokhtar@univ-setif.dz",
        image: "https://avatar.iran.liara.run/public/18"
      },
      {
        fname: "Sofia",
        lname: "Ait Kaci",
        adj: "Ms",
        number: "31298745",
        departement: "IT",
        position: "Lecturer",
        speciality: "Software Engineering",
        phone: "0654987123",
        email: "sofia.aitkaci@univ-boumerdes.dz",
        image: "https://avatar.iran.liara.run/public/60"
      },
      {
        fname: "Rachid",
        lname: "Zerrouki",
        adj: "Mr",
        number: "90871234",
        departement: "Physics",
        position: "Professor",
        speciality: "Thermodynamics",
        phone: "0770192834",
        email: "rachid.zerrouki@univ-oran.dz",
        image: "https://avatar.iran.liara.run/public/7"
      },
      {
        fname: "Meriem",
        lname: "Djedidi",
        adj: "Mrs",
        number: "41523987",
        departement: "Mathematics",
        position: "Senior Lecturer",
        speciality: "Statistics",
        phone: "0698123745",
        email: "meriem.djedidi@univ-tiziouzou.dz",
        image: "https://avatar.iran.liara.run/public/5"
      },
      {
        fname: "Walid",
        lname: "Haddad",
        adj: "Mr",
        number: "56219087",
        departement: "Computer Science",
        position: "Assistant Professor",
        speciality: "Databases",
        phone: "0667123450",
        email: "walid.haddad@univ-algiers.dz",
        image: "https://avatar.iran.liara.run/public/66"
      },
      {
        fname: "Imane",
        lname: "Merabet",
        adj: "Ms",
        number: "78123409",
        departement: "IT",
        position: "Lecturer",
        speciality: "Cybersecurity",
        phone: "0679912345",
        email: "imane.merabet@univ-oran.dz",
        image: "https://avatar.iran.liara.run/public/15"
      },
      {
        fname: "Farid",
        lname: "Bensalem",
        adj: "Mr",
        number: "99451230",
        departement: "Chemistry",
        position: "Senior Lecturer",
        speciality: "Analytical Chemistry",
        phone: "0776234980",
        email: "farid.bensalem@univ-setif.dz",
        image: "https://avatar.iran.liara.run/public/22"
      },
      {
        fname: "Sara",
        lname: "Khelifi",
        adj: "Ms",
        number: "21345987",
        departement: "Biology",
        position: "Assistant Professor",
        speciality: "Microbiology",
        phone: "0698321457",
        email: "sara.khelifi@univ-bejaia.dz",
        image: "https://avatar.iran.liara.run/public/41"
      },
      {
        fname: "Yacine",
        lname: "Berrabah",
        adj: "Mr",
        number: "84521903",
        departement: "Computer Science",
        position: "Professor",
        speciality: "Machine Learning",
        phone: "0667189234",
        email: "yacine.berrabah@univ-tlemcen.dz",
        image: "https://avatar.iran.liara.run/public/19"
      },
      {
        fname: "Amina",
        lname: "Saheb",
        adj: "Ms",
        number: "10495823",
        departement: "IT",
        position: "Lecturer",
        speciality: "Cloud Computing",
        phone: "0672341985",
        email: "amina.saheb@univ-guelma.dz",
        image: "https://avatar.iran.liara.run/public/50"
      },
      {
        fname: "Mohamed",
        lname: "Hamadi",
        adj: "Mr",
        number: "67542189",
        departement: "Physics",
        position: "Assistant Professor",
        speciality: "Quantum Mechanics",
        phone: "0779432109",
        email: "mohamed.hamadi@univ-batna.dz",
        image: "https://avatar.iran.liara.run/public/38"
      },
      {
        fname: "Nadia",
        lname: "Boukercha",
        adj: "Mrs",
        number: "59281734",
        departement: "Mathematics",
        position: "Professor",
        speciality: "Topology",
        phone: "0694312875",
        email: "nadia.boukercha@univ-annaba.dz",
        image: "https://avatar.iran.liara.run/public/3"
      },
      {
        fname: "Omar",
        lname: "Lakhdar",
        adj: "Mr",
        number: "32981047",
        departement: "Computer Science",
        position: "Lecturer",
        speciality: "Operating Systems",
        phone: "0668721934",
        email: "omar.lakhdar@univ-tlemcen.dz",
        image: "https://avatar.iran.liara.run/public/11"
      },
      {
        fname: "Rania",
        lname: "Chergui",
        adj: "Ms",
        number: "74019283",
        departement: "IT",
        position: "Assistant Professor",
        speciality: "Human–Computer Interaction",
        phone: "0671923845",
        email: "rania.chergui@univ-skikda.dz",
        image: "https://avatar.iran.liara.run/public/9"
      },
      {
        fname: "Fouad",
        lname: "Messaoudi",
        adj: "Mr",
        number: "85123097",
        departement: "Chemistry",
        position: "Lecturer",
        speciality: "Biochemistry",
        phone: "0775219834",
        email: "fouad.messaoudi@univ-oran.dz",
        image: "https://avatar.iran.liara.run/public/27"
      }
    ]
  };
  const layoutPath = useRef(null);
  const layoutHead = useRef(null);
  const layoutBody = useRef(null);
  const [listLoading, setListLoading] = useState(false);
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
    phone: '',
    email: '',
    image: null
  });

  useEffect(() => {
    const HH = layoutPath.current.offsetHeight + layoutHead.current.offsetHeight
    layoutBody.current.style.maxHeight = `calc(100vh - ${HH}px - 2.5em)`
  }, []);

  useGSAP(() => {
    gsap.from('.gsap-y', {zIndex: 0});
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

  const handleAddTeacher = () => {
    console.log('Adding teacher:', formData);
    setFormData({
      title: '',
      fname: '',
      lname: '',
      number: '',
      position: '',
      speciality: '',
      phone: '',
      email: '',
      image: null
    });
    setEditingTeacher(null);
    setAddmodal(false);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      title: teacher.adj,
      fname: teacher.fname,
      lname: teacher.lname,
      number: teacher.number,
      position: teacher.position,
      speciality: teacher.speciality,
      phone: teacher.phone,
      email: teacher.email,
      image: teacher.image
    });
    setAddmodal(true);
  };

  const handleDeleteTeacher = (teacher) => {
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

  const handleConfirmAction = () => {
    const { action, actionData } = confirmDialog;

    if (action === 'add') {
      handleAddTeacher();
    } else if (action === 'edit') {
      handleAddTeacher();
    } else if (action === 'delete') {
      handleDeleteTeacher(actionData);
    }

    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  return (
    <div className={`${styles.teachersLayout} full scrollbar`}>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        type={confirmDialog.type}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.type === 'danger' ? 'Delete' : 'Confirm'}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirm}
      />
      <Popup isOpen={addmodal} blur={2} bg='rgba(0,0,0,0.1)' onClose={() => setAddmodal(false)}>
        <div className={`${styles.dashBGC}`} style={{ maxWidth: '700px', borderRadius: '0.8em', padding: '2em' }}>
          <div className="flex row a-center j-spacebet w100" style={{ marginBottom: '1.5em' }}>
            <Text text={editingTeacher ? 'Edit Teacher' : 'Add Teacher'} size='var(--text-l)' w='600'/>
            <IconButton icon='fa-solid fa-xmark' color='var(--text)' size='var(--text-l)' onClick={() => setAddmodal(false)}/>
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
              <div className="flex row a-center gap">
                <TextInput 
                  label="Position"
                  placeholder="Select Position"
                  value={formData.position}
                  dataList={["Assistant", "Lecturer", "Associate Professor", "Professor"]}
                  width='48%'
                  onchange={(e) => handleFormChange('position', e.target.value)}
                />
                <TextInput 
                  label="Speciality"
                  width='52%'
                  placeholder='Enter Speciality'
                  value={formData.speciality}
                  dataList={[
                    "Software Engineering",
                    "Artificial Intelligence",
                    "UX Design",
                    "Cyber Security",
                    "Data Science",
                    "Network Administration",
                    "Database Management",
                    "Web Development",
                    "Mobile Development",
                    "Cloud Computing",
                    "Game Development",
                    "Machine Learning",
                    "Robotics",
                    "Computer Vision",
                    "Human-Computer Interaction",
                    "Information Systems",
                  ]}
                  onchange={(e) => handleFormChange('speciality', e.target.value)}
                />
              </div>
            </div>
            <ImageInput 
              label='Photo'
              width='180px'
              height='180px'
              onchange={handleImageChange}
            />
          </div>
          <div className="flex row a-center gap w100" style={{margin: "1em 0 2em 0"}}>
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
              <SecondaryButton text="Import List" icon="fa-regular fa-file-excel" onClick={()=>{}}/>
              <PrimaryButton text='Add Teacher' icon='fa-solid fa-plus' onClick={() => setAddmodal(true)}/>
            </div>
              <Float css='flex column a-center gap h4pc' bottom="6em" right="1em">
                <FloatButton icon="fa-solid fa-file-arrow-up" onClick={()=>{}}/>
                <FloatButton icon='fa-solid fa-plus' onClick={() => setAddmodal(true)}/>
              </Float>
        </div>
        <div ref={layoutBody} className={`gsap-y ${styles.teachersTable} ${styles.dashBGC} ${listLoading && "shimmer"}`}>
          {!listLoading && <ListTable
            title="Teachers"
            rowTitles={["Teacher", "Number", "Department", "Position", "Speciality", "phone", "Email", "Action"]}
            rowTemplate="0.6fr repeat(4, 0.4fr) 0.3fr 0.6fr 0.2fr"

            dataList={{ total: testList.total, items: testList.teachers }}

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
                        <Profile img={teacher.image} width='35px' classes='clickable' border="2px solid var(--bg)"/>
                        <Text align='left' text={`${teacher.adj}. ${teacher.fname} ${teacher.lname}`} size='var(--text-m)'/>
                    </div>

                    <Text align='left' text={teacher.number} size='var(--text-m)'/>
                    <Text align='left' text={teacher.departement} size='var(--text-m)'/>
                    <Text align='left' text={teacher.position} size='var(--text-m)'/>
                    <Text align='left' text={teacher.speciality} size='var(--text-m)'/>
                    <Text align='left' text={teacher.phone} size='var(--text-m)'/>
                    <Text align='left' text={teacher.email} size='var(--text-m)'/>

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