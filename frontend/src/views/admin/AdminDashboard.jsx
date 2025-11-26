import React, {useState} from 'react'

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

import classroom from '../../assets/classroom.png'
import lab from '../../assets/labo.png'
import amph from '../../assets/amphi.png'

import styles from "./admin.module.css"
import Text from '../../components/text/Text'
import StaticsCard from '../../components/containers/StaticsCard';
import Greeting from '../../components/text/Greeting';
import CircularProgress from '../../components/graph/CircularProgress';

import formatNumber from '../../hooks/formatNumber';
import { useAnimateNumber } from "../../hooks/useAnimateNumber";

const RoomsList = ({
  classrooms = 0,
  labo = 0,
  amphi = 0
}) => {
  return (
    <ul className='flex column gap' style={{margin: "1em"}}>
      <li className='flex a-center gap w100'>
        <img src={classroom} alt="Classroom" />
        <Text align='left' color='var(--text)' size='var(--text-m)' text='Classrooms'/>
        <Text align='right' color='var(--text)' size='var(--text-m)' mrg='0 0 0 1em' text={formatNumber(classrooms)} css='w100'/>
      </li>
      <li className='flex a-center gap w100'>
        <img src={lab} alt="Labo" />
        <Text align='left' color='var(--text)' size='var(--text-m)' text='Laboratory'/>
        <Text align='right' color='var(--text)' size='var(--text-m)' mrg='0 0 0 1em' text={formatNumber(labo)} css='w100'/>
      </li>
      <li className='flex a-center gap w100'>
        <img src={amph} alt="Amphi" />
        <Text align='left' color='var(--text)' size='var(--text-m)' text='Amphitheaters'/>
        <Text align='right' color='var(--text)' size='var(--text-m)' mrg='0 0 0 1em' text={formatNumber(amphi)} css='w100'/>
      </li>
    </ul>
  );
}

const RoomStatic = ({
  title = "",
  value = 0,
  color = "grey",
  width = "150px",
  round = "5px"
}) => {
  return (
    <div className='flex column center' style={{
      backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
      width: width,
      height: "auto",
      aspectRatio: "1",
      borderRadius: round
    }}>
      <Text text={formatNumber(value)} align='center' size='var(--text-l)' color={color} />
      <Text text={title} align='center' size='var(--text-m)' opacity='0.5' color={color} />
    </div>
  );
}

const AdminDashboard = () => {
  const [staticsLoading, setStaticsLoading] = useState(false);
  useGSAP(() => {
      gsap.from('.gsap-y', { 
          y: 50,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
      })
  });

  return (
    <div className={`${styles.dashboardLayout} full scrollbar`}>
      <div className={`${styles.dashboardHeader}`}>
        <div className={`${styles.dashHead}`}>
          <Text css='h4p' align='left' text='Home/' color='var(--text-low)' size='var(--text-m)' />
          <Greeting />
        </div>
        <div className={`${styles.dashStatics} flex row gap wrap j-center`}>
          <div className={`gsap-y ${styles.dashStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
            {!staticsLoading && <StaticsCard title='Scheduled exams' value={formatNumber(useAnimateNumber(0, 452, 1000))} icon="fa-regular fa-calendar" color='#2B8CDF'/>}
          </div>
          <div className={`gsap-y ${styles.dashStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
            {!staticsLoading && <StaticsCard title='Conflicts detected' value={formatNumber(useAnimateNumber(0, 2, 1000))} icon="fa-solid fa-exclamation" color='#F78A4B'/>}
          </div>
          <div className={`gsap-y ${styles.dashStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
            {!staticsLoading && <StaticsCard title='Number Teachers' value={formatNumber(useAnimateNumber(0, 189, 1000))} icon="fa-regular fa-user" color='#9A8CE5'/>}
          </div>
          <div className={`gsap-y ${styles.dashStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
            {!staticsLoading && <StaticsCard title='Number Students' value={formatNumber(useAnimateNumber(0, 2850, 1000))} icon="fa-solid fa-people-roof" color='#4FB6A3'/>}
          </div>
        </div>
      </div>
      <div className={`${styles.dashboardContent} flex row wrap gap`}>
          <div className={`${styles.dashContent} grow-3`}>
            <div className={`gsap-y ${styles.dashRooms} ${styles.dashBGC} h-max flex row j-spacebet wrap`}>
              <div className="flex column">
                <Text text='Rooms' size='var(--text-l)' color='var(--text-low)' align='left' opacity='0.5'/>
                <RoomsList classrooms={useAnimateNumber(0, 16, 1000)} labo={useAnimateNumber(0, 4, 1000)} amphi={useAnimateNumber(0, 6, 1000)}/>
              </div>
              <div className="flex center" style={{width: "130px"}}>
                <CircularProgress value={useAnimateNumber(0, 8, 1000)} max={28} thick={8}/>
              </div>
              <div className="flex a-center gap h4w1000">
                <RoomStatic title='Available' value={useAnimateNumber(0, 20, 1000)} width='8vw' color='rgb(82, 146, 97)'/>
                <RoomStatic title="Occupied" value={useAnimateNumber(0, 5, 1000)} width='8vw' color='rgb(192, 68, 68)'/>
                <RoomStatic title="Maintenance" value={useAnimateNumber(0, 3, 1000)} width='8vw'/>
              </div>
            </div>
            <div className={`gsap-y ${styles.dashReports} ${styles.dashBGC} shimmer`}>
            </div>
          </div>
          <div className={`gsap-y ${styles.dashContentSide} ${styles.dashBGC} grow-1 shimmer`}>
          </div>
      </div>
    </div>
  )
}

export default AdminDashboard