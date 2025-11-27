import React, { useState } from 'react'

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

import styles from "./admin.module.css"
import Text from '../../components/text/Text'
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import Button from '../../components/buttons/Button';
import Float from '../../components/containers/Float';
import FloatButton from '../../components/buttons/FloatButton';
import CalendarView from '../../components/calendar/CalendarView';

const AdminPlanning = () => {
  document.title = "Unitime - Planning";
  useGSAP(() => {
    gsap.from('.gsap-y', { 
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
    })
  });

  const [calendarLoading, setCalendarLoading] = useState(false);

  const eventsList = [
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
      day: "2026-10-02",
      startHour: 9,
      endHour: 12,
      type: "TP",
      room: "L204",
      group: "G3",
      speciality: "Artificial Intelligence",
      level: "Licence 3",
      module: "Neural Networks"
    },
    {
      day: "2026-10-03",
      startHour: 14,
      endHour: 16,
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

      if (level && ev.level !== level) return false;
      if (speciality && ev.speciality !== speciality) return false;
      if (room && ev.room !== room) return false;
      if (group && ev.group !== group) return false;

      if (date && ev.day !== date) return false;

      if (startDate && endDate) {
        const d = new Date(ev.day);
        if (d < new Date(startDate) || d > new Date(endDate)) return false;
      }

      return true;
    });
  }

  return (
    <div className={`${styles.planningLayout} full scrollbar`}>
      <div className={`flex h4p ${styles.planningHead}`}>
        <Text css='h4p' align='left' text='Main /' color='var(--text-low)' size='var(--text-m)' />
        <Text css='h4p' align='left' mrg='0 0.25em' text='Planning' color='var(--text)' size='var(--text-m)' />
      </div>
      <div className={`${styles.planningContent}`}>
        <div className={`${styles.planningSide} ${styles.plnn4pc}`}>
          <div className={`${styles.planningFilter}`}>
            <div className={`${styles.dashBGC} full shimmer gsap-y`}></div>
          </div>
          <div className={`${styles.planningConficts}`}>
            <div className={`${styles.dashBGC} full shimmer gsap-y`}></div>
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
                  filterEvents(eventsList, { 
                    level: filterLvl,
                    speciality: filterSpecr,
                    room: filterRoom,
                    group: filterGroup,
                    date: filterDate,       
                    startDate: filterStartdate,  
                    endDate: filterEnddate
                  })
                }
              />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPlanning