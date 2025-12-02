import React,{useState, useRef, useEffect} from 'react'

import styles from './admin.module.css'

import Text from '../../components/text/Text';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import Float from '../../components/containers/Float';
import FloatButton from '../../components/buttons/FloatButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import StaticsCard from '../../components/containers/StaticsCard';
import formatNumber from '../../hooks/formatNumber';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Profile from '../../components/containers/profile';
import IconButton from '../../components/buttons/IconButton';
import Button from '../../components/buttons/Button';
import { ListTable } from '../../components/tables/ListTable';
gsap.registerPlugin(useGSAP);

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
  useEffect(() => {
    const HH = layoutPath.current.offsetHeight + layoutHead.current.offsetHeight + layoutTHead.current.offsetHeight
    layoutBody.current.style.maxHeight = `calc(100vh - ${HH}px - 2em)`
  }, []);

  const testList = {
  total: 20,
  groups: [
      {
        code: "M1SEG1",
        name: "G1",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "A1",
        members: 36,
        delegate: [
          { id: 1, fname: "Amine", lname: "Belkacem", image: "https://avatar.iran.liara.run/public/36" },
          { id: 6, fname: "Meriem", lname: "Harrat", image: "https://avatar.iran.liara.run/public/19" },
          { id: 7, fname: "Walid", lname: "Bezzina", image: "https://avatar.iran.liara.run/public/42" }
        ]
      },
      {
        code: "M1SEG2",
        name: "G2",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "A2",
        members: 34,
        delegate: [{ id: 2, fname: "Sara", lname: "Mansouri", image: "https://avatar.iran.liara.run/public/12" }]
      },
      {
        code: "M1SEG3",
        name: "G3",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "A3",
        members: 32,
        delegate: [{ id: 3, fname: "Yacine", lname: "Boudiaf", image: "https://avatar.iran.liara.run/public/52" }]
      },
      {
        code: "M1SEG4",
        name: "G4",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "A4",
        members: 31,
        delegate: [{ id: 4, fname: "Nour", lname: "Khellaf", image: "https://avatar.iran.liara.run/public/4" }]
      },
      {
        code: "M1SEG5",
        name: "G5",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "A5",
        members: 35,
        delegate: []
      },
      {
        code: "M1SEG6",
        name: "G6",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "B1",
        members: 33,
        delegate: [
          { id: 6, fname: "Meriem", lname: "Harrat", image: "https://avatar.iran.liara.run/public/19" },
          { id: 7, fname: "Walid", lname: "Bezzina", image: "https://avatar.iran.liara.run/public/42" }
        ]
      },
      {
        code: "M1SEG7",
        name: "G7",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "B2",
        members: 37,
        delegate: [{ id: 7, fname: "Walid", lname: "Bezzina", image: "https://avatar.iran.liara.run/public/42" }]
      },
      {
        code: "M1SEG8",
        name: "G8",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "B3",
        members: 28,
        delegate: [{ id: 8, fname: "Aya", lname: "Sebbahi", image: "https://avatar.iran.liara.run/public/7" }]
      },
      {
        code: "M1SEG9",
        name: "G9",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "B4",
        members: 39,
        delegate: [{ id: 9, fname: "Mohamed", lname: "Dahmane", image: "https://avatar.iran.liara.run/public/3" }]
      },
      {
        code: "M1SEG10",
        name: "G10",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "B5",
        members: 30,
        delegate: [{ id: 10, fname: "Salma", lname: "Kerroum", image: "https://avatar.iran.liara.run/public/13" }]
      },
      {
        code: "M1SEG11",
        name: "G11",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "C1",
        members: 41,
        delegate: [{ id: 11, fname: "Oussama", lname: "Meziane", image: "https://avatar.iran.liara.run/public/27" }]
      },
      {
        code: "M1SEG12",
        name: "G12",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "C2",
        members: 29,
        delegate: [{ id: 12, fname: "Hana", lname: "Seddiki", image: "https://avatar.iran.liara.run/public/8" }]
      },
      {
        code: "M1SEG13",
        name: "G13",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "C3",
        members: 32,
        delegate: [{ id: 13, fname: "Imad", lname: "Cherif", image: "https://avatar.iran.liara.run/public/9" }]
      },
      {
        code: "M1SEG14",
        name: "G14",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "C4",
        members: 38,
        delegate: [{ id: 14, fname: "Sabrina", lname: "Benkhelifa", image: "https://avatar.iran.liara.run/public/23" }]
      },
      {
        code: "M1SEG15",
        name: "G15",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "C5",
        members: 34,
        delegate: [{ id: 15, fname: "Khaled", lname: "Zerrouki", image: "https://avatar.iran.liara.run/public/11" }]
      },
      {
        code: "M1SEG16",
        name: "G16",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "D1",
        members: 31,
        delegate: [{ id: 16, fname: "Farah", lname: "Boudebza", image: "https://avatar.iran.liara.run/public/5" }]
      },
      {
        code: "M1SEG17",
        name: "G17",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "D2",
        members: 36,
        delegate: [{ id: 17, fname: "Ismail", lname: "Kaci", image: "https://avatar.iran.liara.run/public/14" }]
      },
      {
        code: "M1SEG18",
        name: "G18",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "D3",
        members: 33,
        delegate: [{ id: 18, fname: "Rania", lname: "Touati", image: "https://avatar.iran.liara.run/public/6" }]
      },
      {
        code: "M1SEG19",
        name: "G19",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "D4",
        members: 40,
        delegate: [{ id: 19, fname: "Yassin", lname: "Kebir", image: "https://avatar.iran.liara.run/public/41" }]
      },
      {
        code: "M1SEG20",
        name: "G20",
        level: "Master 1",
        speciality: "Software Engineering",
        section: "D5",
        members: 28,
        delegate: [{ id: 20, fname: "Maya", lname: "Haddad", image: "https://avatar.iran.liara.run/public/10" }]
      }
    ]
  };


  return (
    <div className={`${styles.modulesLayout} full scrollbar`}>
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
            <PrimaryButton text='Add Group' icon='fa-solid fa-plus' onClick={()=>{}} css='h4p'/>
            <PrimaryButton text='Generate' icon='fa-solid fa-wand-magic-sparkles' onClick={()=>{}} css='h4p'/>
            <SecondaryButton text='Export' onClick={()=>{}} css='h4p'/>
          </div>
        </div>
        <div ref={layoutBody} className={`${styles.modulesTable} full ${styles.dashBGC} ${tableLoading && "shimmer"}`}>
          {!tableLoading &&
          <ListTable
            title="Groups"
            rowTitles={["Code", "Name", "Level", "Speciality", "Section", "Members", "Delegate", "Action"]}
            rowTemplate="repeat(3, 0.3fr) 0.5fr repeat(2, 0.2fr) 0.5fr 0.2fr"

            dataList={{ total: testList.total, items: testList.groups }}

            filterFunction={(s, text) =>
                `${s.name}`.toLowerCase().includes(text.toLowerCase()) ||
                s.speciality.toLowerCase().includes(text.toLowerCase()) ||
                s.level.includes(text)
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
                      {group.delegate.length == 0 && <Button text='Attach Delegate' icon='fa-solid fa-plus' />}
                      {group.delegate.length == 1 && 
                      <div className="flex row a-center gap">
                        <Profile img={group.delegate[0].image} width="35px" border="2px solid var(--bg)"/>
                        <Text align='left' text={`${group.delegate[0].fname} ${group.delegate[0].lname}`} size='var(--text-m)'/>
                      </div>}
                      {group.delegate.length > 1 && 
                        <div className="flex row a-center gap pos-rel">
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
                        <IconButton icon="fa-regular fa-pen-to-square" />
                        <IconButton icon="fa-regular fa-trash-can" />
                    </div>
                </>
            )}
          />}
        </div>
      </div>
    </div>
  )
}

export default AdminGroups