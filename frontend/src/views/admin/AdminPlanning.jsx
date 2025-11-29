import React, { useState } from 'react'

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

const AdminPlanning = () => {
  document.title = "Unitime - Planning";
  useGSAP(() => {
    gsap.set('.gsap-y', {y:0,zIndex:1, opacity: 1})
    gsap.from('.gsap-y', { 
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
    })
  });

  const [calendarLoading, setCalendarLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const examsList = [
    {
      day: "2026-10-01",
      startHour: 8,
      endHour: 9.5,
      type: "Exam",
      room: "B101",
      group: "G1",
      speciality: "Software Engineering",
      level: "Master 1",
      module: "Distributed Systems"
    },
    {
      day: "2026-10-01",
      startHour: 8,
      endHour: 10,
      type: "TP",
      room: "B101",
      group: "G3",
      speciality: "Artificial Intelligence",
      level: "Licence 3",
      module: "Neural Networks"
    },
    {
      day: "2026-10-15",
      startHour: 10,
      endHour: 11.5,
      type: "normal",
      room: "N301",
      group: "G5",
      speciality: "Computer Science",
      level: "Engineer 2",
      module: "Algorithms & Complexity"
    },
    {
      day: "2026-10-04",
      startHour: 9.5,
      endHour: 11,
      type: "catch-up",
      room: "B203",
      group: "G2",
      speciality: "Software Engineering",
      level: "Master 2",
      module: "Advanced Databases"
    },
    {
      day: "2026-10-05",
      startHour: 13,
      endHour: 15,
      type: "TD",
      room: "C102",
      group: "G4",
      speciality: "Artificial Intelligence",
      level: "Licence 2",
      module: "Deep Learning"
    },
    {
      day: "2026-10-06",
      startHour: 8,
      endHour: 10,
      type: "TP",
      room: "L305",
      group: "G7",
      speciality: "Software Engineering",
      level: "Engineer 5",
      module: "Web Technologies"
    },
    {
      day: "2026-10-07",
      startHour: 11,
      endHour: 12.5,
      type: "normal",
      room: "N103",
      group: "G6",
      speciality: "Network Security",
      level: "Master 1",
      module: "Cryptography"
    },
    {
      day: "2026-10-08",
      startHour: 15,
      endHour: 17,
      type: "catch-up",
      room: "B105",
      group: "G3",
      speciality: "Computer Science",
      level: "Licence 3",
      module: "Operating Systems"
    },
    {
      day: "2026-10-09",
      startHour: 9,
      endHour: 10.5,
      type: "TD",
      room: "C210",
      group: "G1",
      speciality: "Software Engineering",
      level: "Engineer 3",
      module: "Software Testing"
    },
    {
      day: "2026-10-10",
      startHour: 13.5,
      endHour: 15,
      type: "normal",
      room: "N202",
      group: "G8",
      speciality: "Artificial Intelligence",
      level: "Master 2",
      module: "Natural Language Processing"
    }
  ];

  const [filterLvl, setFilterLvl] = useState(null)
  const [filterSpecr, setFilterSpecr] = useState(null)
  const [filterRoom, setFilterRoom] = useState(null)
  const [filterGroup, setFilterGroup] = useState(null)
  const [filterDate, setFilterDate] = useState(null)
  const [filterStartdate, setFilterStartdate] = useState(null)
  const [filterEnddate, setFilterEnddate] = useState(null)
  const [conflicts, setConflicts] = useState([])

  function filterEvents(events, filters = {}) {
    const {
      level,
      speciality,
      room,
      group,
      date,       
      startDate,  
      endDate     
    } = filters;

    return events.filter(ev => {

      if (level && !ev.level.toLowerCase().includes(level.toLowerCase())) return false;
      if (speciality && !ev.speciality.toLowerCase().includes(speciality.toLowerCase())) return false;
      if (room && !ev.room.toLowerCase().includes(room.toLowerCase())) return false;
      if (group && !ev.group.toLowerCase().includes(group.toLowerCase())) return false;

      if (date && ev.day !== date) return false;

      if (startDate && endDate) {
        const d = new Date(ev.day);
        if (d < new Date(startDate) || d > new Date(endDate)) return false;
      }

      return true;
    });
  }

  const handleConflict = (event, dayKey) => {
    setConflicts(prev => {
      const exists = prev.some(c => c.room === event.room && c.day === dayKey && c.startHour === event.startHour);
      if (!exists) {
        return [...prev, { room: event.room, day: dayKey, startHour: event.startHour, type: 'room', group: event.group }];
      }
      return prev;
    });
  };

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 600;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    }

    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className={`${styles.planningLayout} full scrollbar`}>
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
            <div className={`${styles.dashBGC} full gsap-y`}>
              <Text text='Filters' size='var(--text-m)' opacity='0.5' align='left' />
              <div className="flex column">
                <Text text='Semester' size='0.7rem' opacity='0.2' align='left' mrg='1em 0 0.25em 0'/>
                <SelectInput
                  w='100%'
                  options={[
                      { value: "All", text: "All" },
                      { value: "S1", text: "Semester 1 - 22 Sep 25 - 22 Jan 26" },
                      { value: "S2", text: "Semester 2 - 23 Jan 26 - 05 May 26" },
                  ]}
                  bg='var(--bg)'
                />
              </div>
              <div className="flex column">
                <Text text='Exam type' size='var(--text-m)' opacity='0.8' color='var(--text-low)' align='left' mrg='1em 0 0.5em 0'/>
                <div className="flex a-center j-spacebet">
                  <Checkbox label="Exam"/>
                  <Checkbox label="Catch-up"/>
                  <Checkbox label="TD"/>
                </div>
              </div>
              <TextInput 
                label='Room'
                icon="fa-solid fa-door-open" 
                placeholder='All Rooms' 
                dataList={[
                  "B101", "B102", "B103", "B104", "B105",
                  "S201", "S202", "S203", "S204", "S205",
                  "L301", "L302", "L303", "L304", "L305",
                  "N401", "N402", "N403", "N404", "N405",
                ]}
                oninput={(e) => {setFilterRoom(e.target.value)}}
              />
              <div className="flex row a-center gap">
                <TextInput 
                  label="Level"
                  width='40%'
                  placeholder='All Levels'
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
                  oninput={(e) => {setFilterLvl(e.target.value)}}
                />
                <TextInput
                  label="Speciality" 
                  width='60%'
                  placeholder='All Specialities'
                  dataList={[ "Software Engineering", "Artificial Intelligence", "Computer Science", "Network Security"]}
                  oninput={(e) => {setFilterSpecr(e.target.value)}}
                />
              </div>
                <TextInput 
                  label='Group'
                  placeholder='All Groups'
                  dataList={[ "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8" ]}
                  oninput={(e) => {setFilterSpecr(e.target.value)}}
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
                    const conflictType = conflict.type === 'room' 
                      ? `Room overlap (${conflict.room})` 
                      : `Group overlap (${conflict.group})`;
                    
                    return (
                      <div key={idx} style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75em 1em',
                        backgroundColor: 'rgba(255, 81, 0, 0.08)',
                        borderRadius: '0.5em',
                        border: '1px solid rgba(255, 81, 0, 0.2)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em' }}>
                          <i className="fa-solid fa-exclamation-triangle" style={{
                            color: 'rgb(255, 81, 0)',
                            fontSize: 'var(--text-l)'
                          }}></i>
                          <Text text={conflictType} size='var(--text-m)' color='var(--text)' align='left' />
                        </div>
                        <button style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgb(255, 81, 0)',
                            cursor: 'pointer',
                            fontSize: 'var(--text-m)',
                            fontWeight: 'bold',
                            padding: '0',
                            transition: 'opacity 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                          onClick={() => setConflicts(prev => prev.filter((_, i) => i !== idx))}
                          >
                          Fix
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
                <PrimaryButton text='Add Exam' icon='fa-solid fa-plus' mrg='0 0.25em 0 0'/>
                <SecondaryButton text='Auto assign rooms' />
                <SecondaryButton text='Check conflicts' />
              </div>
              <div className={`flex a-center h100 gap wrap`}>
                <SecondaryButton text='Export Pdf' />
                <SecondaryButton text='Export Excel' />
                <Button text='Publish' mrg='0 0 0 0.25em'/>
              </div>
            </div>
            <Float top="1em" right="1em" css={`${styles.plnn4p} flex column gap`}>
              <FloatButton icon="fa-solid fa-arrow-down-wide-short" color="var(--border-low)" css="clickable"/>
              <FloatButton icon="fa-solid fa-pen-ruler" css="clickable"/>
            </Float>
          </div>
          <div className={`${styles.planningCalendar}`}>
            <div className={`${styles.dashBGC} full ${calendarLoading && "shimmer"} gsap-y`}>
              { !calendarLoading && <CalendarView  
                startDate="2026-10-01"
                endDate="2026-10-16"
                startHour={8}
                endHour={17}
                eventsList={
                  filterEvents(examsList, { 
                    level: filterLvl,
                    speciality: filterSpecr,
                    room: filterRoom,
                    group: filterGroup,
                    date: filterDate,       
                    startDate: filterStartdate,  
                    endDate: filterEnddate
                  })
                }
                onConflict={handleConflict}
              />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPlanning