import React, {useState, useRef, useEffect} from 'react'

import styles from './admin.module.css'

import Text from '../../components/text/Text';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import Float from '../../components/containers/Float';
import FloatButton from '../../components/buttons/FloatButton';
import IconButton from '../../components/buttons/IconButton';
import formatNumber from '../../hooks/formatNumber';
import StaticsCard from '../../components/containers/StaticsCard';
import { ListTable } from '../../components/tables/ListTable';
import Button from '../../components/buttons/Button';
import Profile from '../../components/containers/profile';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);


const AdminModules = () => {
  document.title = "Unitime - Modules";
  const [staticsLoading, setStaticsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

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
    <div className={`${styles.modulesLayout} full scrollbar`}>
      <Float bottom='6em' right="1em" css='h4pc'>
        <FloatButton icon="fa-solid fa-plus" onClick={()=>{}}/>
      </Float>
      <div ref={layoutPath} className={`${styles.modulesHeader}`}>
        <div className={`${styles.modulesPath} flex a-center h4p`}>
            <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
            <Text css='h4p' align='left' mrg='0 0.25em' text='Modules' color='var(--text)' size='var(--text-m)' />
        </div>
      </div>
      <div ref={layoutHead} className={`${styles.modulesStatics} flex row gap wrap j-center`}>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Total Modules' value={formatNumber(0)} icon="fa-solid fa-book-bookmark" color='#2B8CDF'/>}

        </div>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Fundamental' value={formatNumber(0)} icon="fa-solid fa-book-open" color='#F1504A'/>}

        </div>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Methodological' value={formatNumber(0)} icon="fa-solid fa-person-chalkboard" color='#9A8CE5'/>}

        </div>
        <div className={`gsap-y ${styles.modulesStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
          {!staticsLoading && <StaticsCard title='Transversal' value={formatNumber(0)} icon="fa-solid fa-flask-vial" color='#4FB6A3'/>}

        </div>
      </div>
      <div ref={layoutBody} className={`gsap-y ${styles.modulesContent} flex column`}>
        <div className="flex row a-center">
          <Text align='left' text='Modules List' size='var(--text-l)' />
          <PrimaryButton text='Add Module' icon='fa-solid fa-plus' onClick={()=>{}} mrg='0 0 0 auto' css='h4p'/>
        </div>
        <div className={`${styles.modulesTable} full ${styles.dashBGC} ${tableLoading && "shimmer"}`}>
          {!tableLoading &&
          <ListTable
            title="Modules"
            rowTitles={["Code", "Name", "Shortcut", "Teacher", "Type", "Factor", "Credit", "Action"]}
            rowTemplate="0.2fr 0.6fr 0.3fr 0.5fr 0.3fr repeat(3, 0.2fr)"

            dataList={{ total: testList.total, items: testList.modules }}

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
                    s.shortcut,
                    s.type,
                    s.factor,
                    s.credit
                ]
            }}

            rowRenderer={(module) => (
                <>
                    <Text align='left' text={module.code} size='var(--text-m)'/>
                    <Text align='left' text={module.name} size='var(--text-m)'/>
                    <Text align='left' text={module.shortcut} size='var(--text-m)'/>
                    <div className="flex row a-center gap">
                      {module.teachers.length == 0 && <Button text='Attach Teacher' icon='fa-solid fa-plus' />}
                      {module.teachers.length == 1 && 
                      <div className="flex row a-center gap">
                        <Profile img={module.teachers[0].image} width="35px" border="2px solid var(--bg)"/>
                        <Text align='left' text={`${module.teachers[0].fname} ${module.teachers[0].lname}`} size='var(--text-m)'/>
                      </div>}
                      {module.teachers.length > 1 && 
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
                    <Text align='left' text={module.credit} size='var(--text-m)'/>
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

export default AdminModules