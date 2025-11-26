import React, { useRef, useEffect } from 'react'

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

import styles from './admin.module.css'

import Text from '../../components/text/Text';
import Float from '../../components/containers/Float';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import IconButton from '../../components/buttons/IconButton';
import FloatButton from '../../components/buttons/FloatButton';
import { ListTable } from '../../components/tables/ListTable';
import Profile from '../../components/containers/profile';

const AdminStudents = () => {

  document.title = "Unitime - Students";

  const testList = {
    total: 13,
    students: [
        {
            fname: "Amine",
            lname: "Belkacem",
            gender: "M",
            number: "39082793",
            level: "1 Master",
            departement: "IT",
            speciality: "SE",
            section: "A1",
            group: "G2",
            email: "amine.belkacem@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/36"
        },
        {
            fname: "Sara",
            lname: "Bennani",
            gender: "F",
            number: "40192833",
            level: "2 Licence",
            departement: "IT",
            speciality: "AI",
            section: "B2",
            group: "G1",
            email: "sara.bennani@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/15"
        },
        {
            fname: "Yacine",
            lname: "Khaldi",
            gender: "M",
            number: "37819203",
            level: "3 Licence",
            departement: "IT",
            speciality: "NW",
            section: "C3",
            group: "G4",
            email: "yacine.khaldi@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/42"
        },

        {
            fname: "Lina",
            lname: "Saidi",
            gender: "F",
            number: "41239822",
            level: "1 Licence",
            departement: "Math",
            speciality: "ST",
            section: "S1",
            group: "G1",
            email: "lina.saidi@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/25"
        },
        {
            fname: "Walid",
            lname: "Dahmani",
            gender: "M",
            number: "40922188",
            level: "2 Master",
            departement: "Physics",
            speciality: "OP",
            section: "P2",
            group: "G3",
            email: "walid.dahmani@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/38"
        },
        {
            fname: "Nour",
            lname: "Harrar",
            gender: "F",
            number: "39871204",
            level: "3 Licence",
            departement: "IT",
            speciality: "CY",
            section: "C1",
            group: "G2",
            email: "nour.harrar@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/82"
        },
        {
            fname: "Samir",
            lname: "Meftah",
            gender: "M",
            number: "42019277",
            level: "1 Master",
            departement: "Biology",
            speciality: "GE",
            section: "B3",
            group: "G1",
            email: "samir.meftah@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/9"
        },
        {
            fname: "Dina",
            lname: "Merabet",
            gender: "F",
            number: "40281739",
            level: "2 Licence",
            departement: "Chemistry",
            speciality: "OC",
            section: "O2",
            group: "G2",
            email: "dina.merabet@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/74"
        },
        {
            fname: "Karim",
            lname: "Bouzid",
            gender: "M",
            number: "41103928",
            level: "3 Licence",
            departement: "IT",
            speciality: "SE",
            section: "A2",
            group: "G3",
            email: "karim.bouzid@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/33"
        },
        {
            fname: "Hiba",
            lname: "Talbi",
            gender: "F",
            number: "41723980",
            level: "1 Licence",
            departement: "Economics",
            speciality: "FI",
            section: "F1",
            group: "G2",
            email: "hiba.talbi@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/77"
        },
        {
            fname: "Omar",
            lname: "Cherif",
            gender: "M",
            number: "39502817",
            level: "1 Master",
            departement: "IT",
            speciality: "AI",
            section: "B1",
            group: "G4",
            email: "omar.cherif@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/8"
        },
        {
            fname: "Rania",
            lname: "Bakir",
            gender: "F",
            number: "42173820",
            level: "2 Licence",
            departement: "IT",
            speciality: "NW",
            section: "N3",
            group: "G1",
            email: "rania.bakir@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/56"
        },
        {
            fname: "Imad",
            lname: "Zerrouki",
            gender: "M",
            number: "38920173",
            level: "3 Licence",
            departement: "Mathematics",
            speciality: "AM",
            section: "M4",
            group: "G3",
            email: "imad.zerrouki@univ-tlemcen.dz",
            image: "https://avatar.iran.liara.run/public/19"
        }
    ]
  };

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


  return (
    <div className={`${styles.teachersLayout} full scrollbar`}>
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
              <SecondaryButton text="Import List" icon="fa-regular fa-file-excel" onClick={()=>{}}/>
              <PrimaryButton text='Add Student' icon='fa-solid fa-plus' onClick={()=>{}}/>
            </div>
              <Float css='flex column a-center gap h4pc' bottom="6em" right="1em">
                <FloatButton icon="fa-solid fa-file-arrow-up" onClick={()=>{}} isLoading ={true}/>
                <FloatButton icon='fa-solid fa-plus' onClick={()=>{}}/>
              </Float>
        </div>
        <div ref={layoutBody} className={`gsap-y ${styles.teachersTable} ${styles.dashBGC} full`}>
          <ListTable
            title="Students"
            rowTitles={["Student", "Number", "Department", "Level", "Speciality", "Section", "Group", "Email", "Action"]}
            rowTemplate="0.4fr 0.4fr 0.3fr 0.3fr 0.3fr 0.2fr 0.2fr 0.6fr 0.2fr"

            dataList={{ total: testList.total, items: testList.students }}

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
                title: "Students List",
                fileName: "students_list",
                headers: ["#", "Name", "Email", "Number", "Level", "Department", "Speciality", "Section", "Group"],
                mapRow: (s, i) => [
                    i + 1,
                    `${s.fname} ${s.lname}`,
                    s.email,
                    s.number,
                    s.level,
                    s.departement,
                    s.speciality,
                    s.section,
                    s.group
                ]
            }}

            rowRenderer={(student) => (
                <>
                    <div className="flex row a-center gap">
                        <Profile img={student.image} width='35px' classes='clickable' border="2px solid var(--bg)"/>
                        <Text align='left' text={`${student.fname} ${student.lname}`} size='var(--text-m)'/>
                    </div>

                    <Text align='left' text={student.number} size='var(--text-m)'/>
                    <Text align='left' text={student.departement} size='var(--text-m)'/>
                    <Text align='left' text={student.level} size='var(--text-m)'/>
                    <Text align='left' text={student.speciality} size='var(--text-m)'/>
                    <Text align='left' text={student.section} size='var(--text-m)'/>
                    <Text align='left' text={student.group} size='var(--text-m)'/>
                    <Text align='left' text={student.email} size='var(--text-m)'/>

                    <div className="flex row center gap">
                        <IconButton icon="fa-regular fa-pen-to-square" />
                        <IconButton icon="fa-regular fa-trash-can" />
                    </div>
                </>
            )}
          />

        </div>
      </div>
    </div>
  )
}

export default AdminStudents