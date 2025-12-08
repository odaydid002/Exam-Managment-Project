import React, { useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import styles from './admin.module.css';
import Text from '../../components/text/Text';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import Button from '../../components/buttons/Button';
import SelectInput from '../../components/input/SelectInput';
import TextInput from '../../components/input/TextInput';
import IconButton from '../../components/buttons/IconButton';
import { useNotify } from '../../components/loaders/NotificationContext';
import DangerAction from '../../components/buttons/DangerAction';
import LineBreak from '../../components/shapes/LineBreak';

gsap.registerPlugin(useGSAP);

{/*
const maxOdd = (n) => {
  return [...String(n).split('').filter(d => d % 2 !== 0).map(Number)].length == String(n).split('').length
};
*/}

const General = () => {
  return <>
    <div className="flex row a-end gap">
      <SelectInput label='Current Semester' options={[
        {value: "S1", text: "Semester 1"},
        {value: "S2", text: "Semester 2"}
      ]}/>
      <Text align='left' text='Defines the semester used for modules, groups, and exams.' size='var(--text-m)'/>
    </div>
    <Text align='left' text='Period' size='var(--text-m)' color='var(--text-low)' mrg='1em 0 0 0'/>
    <div className="flex column gap w100">
      <div className="flex row gap a-end">
        <div className="flex row a-center" style={{textWrap: 'nowrap'}}>
          <Text mrg='0 0 0.5em 0' align='left' text='Semester 1' size='var(--text-m)' color='var(--text-low)' />
        </div>
        <TextInput width='30%' label="Start Date" type='datetime-local'/>
        <TextInput width='30%' label="end Date" type='datetime-local'/>
      </div>
      <div className="flex row gap a-end">
        <div className="flex row a-center" style={{textWrap: 'nowrap'}}>
          <Text mrg='0 0 0.5em 0' align='left' text='Semester 2' size='var(--text-m)' color='var(--text-low)' />
        </div>
        <TextInput width='30%' label="Start Date" type='datetime-local'/>
        <TextInput width='30%' label="end Date" type='datetime-local'/>
      </div>
    </div>
    <Text align='left' text='Export / Backup' size='var(--text-m)' color='var(--text-low)' mrg='1em 0 0 0'/>
    <div className="flex column gap w100">

    </div>
  </>
}
const Appearance = () => {
  return <>
    <Text text='Appearance'/>
  </>
}
const Account = () => {
  return <>
    <Text text='Account'/>
  </>
}
const Security = () => {
  return <>
    <Text text='Security'/>
  </>
}
const Notifications = () => {
  return <>
    <Text text='Notifications'/>
  </>
}

const AdminSettings = () => {

  document.title = "Unitime - Settings";

  useGSAP(() => {
    gsap.set('.gsap-y', {y:0, zIndex:1, opacity: 1})
    gsap.from('.gsap-y', { 
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
    })
  });

  const [dataReady, setDataReady] = useState(false);
  const [currentSubpage, setCurrentSubpage] = useState("General");

  return (
    <div className={`${styles.settingsLayout} full scrollbar pdv`}>
      <div className={`${styles.settingsHeader}`}>
        <div className={`flex row a-center`}>
          <Text align='left' text='System /' color='var(--text-low)' size='var(--text-m)' />
          <Text align='left' mrg='0 0 0 0.25em' text='Settings' size='var(--text-m)' />
          <Text align='left' mrg='0 0 0 0.25em' text={`> ${currentSubpage}`} size='var(--text-m)' />
        </div>
      </div>
      <div className={`${styles.settingsContent} full`}>
        <div className={`${styles.settingsMain} full ${dataReady && "shimmer"} gsap-y ${styles.dashBGC}`}>
            {!dataReady && <div className="full flex column a-center">
              <div className="flex row a-center gap" style={{height: "2em"}}>
                <Text css='clickable' align='left' text="Account" high={currentSubpage == 'Account'} color={currentSubpage == 'Account'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("Account")}}/>
                <Text css='clickable' align='left' text="General" high={currentSubpage == 'General'} color={currentSubpage == 'General'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("General")}}/>
                <Text css='clickable' align='left' text="Security" high={currentSubpage == 'Security'} color={currentSubpage == 'Security'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("Security")}}/>
                <Text css='clickable' align='left' text="Appearance" high={currentSubpage == 'Appearance'} color={currentSubpage == 'Appearance'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("Appearance")}}/>
                <Text css='clickable' align='left' text="Notifications" high={currentSubpage == 'Notifications'} color={currentSubpage == 'Notifications'?"var(--color-main)":"var(--text)"} size='var(--text-m)' onClick={() => {setCurrentSubpage("Notifications")}}/>
              </div>
              <LineBreak mrg='0.625em 0' w='40%' h='3px' color='var(--trans-grey)'/>
              <div className="flex column gap w100">
                {currentSubpage == 'Account' && <Account />}
                {currentSubpage == 'General' && <General />}
                {currentSubpage == 'Security' && <Security />}
                {currentSubpage == 'Appearance' && <Appearance/>}
                {currentSubpage == 'Notifications' && <Notifications/>}
              </div>
            </div>}
        </div>
        <div className={`${styles.settingsSide} flex column gap full`}>
          <div className={`${styles.settingsRect} full ${dataReady && "shimmer"} gsap-y ${styles.dashBGC}`}>
            {!dataReady && <div className="flex full column gap">
                <TextInput readOnly val="Computer Science" label='Department Name' editable = {true} onEdit={() => {}}/>
              <div className="flex row a-center gap">
                <TextInput readOnly val="4 Sep 2025 - 28 May 2026" label='Academic Year' editable = {true} onEdit={() => {}}/>
              </div>
            </div>}
          </div>
          <div className={`${styles.settingsCtr} full ${dataReady && "shimmer"} gsap-y ${styles.dashBGC}`}>
              {!dataReady && <div className="flex full column gap">
                <Text text='System maintenance' align='left' size='var(--text-m)' color='var(--text-low)'/>
                <div className="flex column gap center w100">
                  <DangerAction css="w100" title='Reset all schedules (exams + monitoring)' onAction={() => {}} />
                  <DangerAction css="w100" title='Clean up orphaned groups' onAction={() => {}} />
                  <DangerAction css="w100" title='Clear old notifications' onAction={() => {}} />
                  <DangerAction css="w100" title='Clear old validation requests' onAction={() => {}} />
                </div>
              </div>}
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default AdminSettings