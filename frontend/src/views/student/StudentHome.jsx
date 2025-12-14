import './student.css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useState, useEffect } from "react"
import { useNotify } from '../../components/loaders/NotificationContext';
import { authCheck } from '../../API/auth';
import { get as getStudent } from '../../API/students';
import { get as getGroup } from '../../API/groups';

import StaticCard2 from '../../components/containers/StaticCard2';
import Profile from '../../components/containers/profile';
import Text from '../../components/text/Text';
import Notification from '../../components/svg/Notification';
import Eclipse from '../../components/shapes/Eclipse';
import Exam from '../../components/containers/Exam';
import ListTableClient from '../../components/tables/ListTableClient';
import Copy from '../../components/buttons/Copy';

gsap.registerPlugin(useGSAP);

function floatToTimeString(num) {
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm}`;
}


const StudentHome = () => {

  const testList = [
    {
      module_name: "Linear Algebra",
      module_credit: 3,
      module_factor: 5,
      exam_type: "Final Exam",
      date: "2026-01-22",
      startHour: 13,
      endHour: 15,
      room: "Classroom B204",
      surveillances: [
      ]
    },
    {
      module_name: "Computer Architecture",
      module_credit: 3,
      module_factor: 4,
      exam_type: "Final Exam",
      date: "2026-01-25",
      startHour: 9,
      endHour: 11.5,
      room: "Classroom C301",
      surveillances: [
        { name: "Laura Schmidt", pronoun: "Ms", image: "https://avatar.iran.liara.run/public/30" },
        { name: "Ethan Park", pronoun: "Mr", image: "https://avatar.iran.liara.run/public/31" },
        { name: "James Miller", pronoun: "Mr", image: "https://avatar.iran.liara.run/public/41" }
      ]
    },
    {
      module_name: "Data Structures",
      module_credit: 4,
      module_factor: 6,
      exam_type: "Midterm",
      date: "2026-01-27",
      startHour: 14,
      endHour: 16,
      room: "Classroom E110",
      surveillances: [
        { name: "Nora Alvarez", pronoun: "Ms", image: "https://avatar.iran.liara.run/public/40" },
      ]
    }
  ]

  const [infoLoading, setInfoLoading] = useState(false)
  const [notificationsLoading, _setNotificationsLoading] = useState(false)
  const [sessionsLoading, _setSessionsLoading] = useState(false)
  const [examsLoading, _setExamsLoading] = useState(false)
  const [notificationsCount, _setNotificationsCount] = useState(0)
  useGSAP(() => {
      gsap.from('.gsap-y', { 
          y: 50,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
      })
  });

  const notify = useNotify?.();
  const [profile, setProfile] = useState(null);
  const [_authUser, _setAuthUser] = useState(null);
  const [identifierUsed, setIdentifierUsed] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        setInfoLoading(true);
        const auth = await authCheck();
        const user = auth?.user || auth || null;
        if (mounted) _setAuthUser(user);

        if (user) {
          const identifier = user.id || user.student_id || user.student_number || user.number || user.uuid;
          if (identifier) {
            setIdentifierUsed(identifier);
            try {
              const studentData = await getStudent(identifier);
              if (mounted) setProfile(studentData);
              return;
            } catch {
              console.debug('students.get failed');
            }
          }
        }

        try {
          const res = await fetch('/api/student/profile');
          if (res.ok) {
            const data = await res.json();
            if (mounted) setProfile(data);
            if (mounted) setIdentifierUsed(data.number ?? data.id ?? null);
            return;
          }
        } catch { console.debug('fallback /api/student/profile failed'); }

        try {
          const alt = await fetch('/api/student');
          if (alt.ok) {
            const altData = await alt.json();
            if (mounted) setProfile(altData);
            if (mounted) setIdentifierUsed(altData.number ?? altData.id ?? null);
            return;
          }
        } catch { console.debug('fallback /api/student failed'); }

      } catch {
        notify?.({ type: 'error', message: 'Unable to load student profile' });
      } finally {
        if (mounted) setInfoLoading(false);
      }
    };

    loadProfile();
    return () => { mounted = false };
  }, [notify]);

  useEffect(() => {
    let mounted = true;
    const loadGroup = async () => {
      try {
        const code = profile?.group_code || profile?.group || null;
        if (!code) return;
        if (profile?.group_name && profile?.section) return;
        const g = await getGroup(code);
        if (!mounted) return;
        setProfile((p) => ({ ...(p || {}), group_name: g?.name ?? p?.group_name, section: g?.section ?? p?.section }));
      } catch (err) {
        console.debug('Failed to load group details', err?.message ?? err);
      }
    };

    loadGroup();
    return () => { mounted = false };
  }, [profile]);

  return (
        <div className={`homeLayout full scrollbar overflow-y-a`}>
          <div className="homeBody">
            <div className={`overflow-h homeProfile gsap-y ${infoLoading && "shimmer-second"}`} style={{padding: "2em", backgroundColor:"var(--color-second2)", borderRadius: "20px"}}>
              {!infoLoading && <>
                <Eclipse css='pos-abs' w='10em' size='1em' color='var(--trans-grey)' zi='0' top="-20%" left="15%"/>
                <Eclipse css='pos-abs' w='10em' size='1em' color='var(--trans-grey)' zi='0' bottom="-40%" right="15%"/>
                <Eclipse css='pos-abs anim-float-slow' w='5em' size='0.625em' color='var(--trans-grey)' zi='0' top="-20%" right="15%"/>
                <Eclipse css='pos-abs anim-float' w='8em' size='0.8em' color='var(--trans-grey)' zi='0' top="10%" left="45%"/>
                <Eclipse css='pos-abs anim-float-slow' w='5em' size='0.625em' color='var(--trans-grey)' zi='0' bottom="-20%" left="15%"/>
                <div className={`studentProfile w100`}>
                  <div className="flex row a-start j-center">
                    <Profile
                      width='90%'
                      img={profile?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(((profile?.fname || '') + ' ' + (profile?.lname || '')).trim() || 'Student')}`}
                    />
                  </div>
                  <div className="flex column gap">
                    <Text css='ellipsis' color='white' align='left' text={(profile?.fname || '') + (profile?.lname ? ' ' + profile.lname : '') || 'Student Name'} w='600' size='var(--text-l)' />
                    <div className="flex row gap wrap a-center">
                      <div className="flex column grow-1">
                        <Text css='ellipsis' text='ID' size='var(--text-l)' align='left' color='white' opacity='0.3' w='500'/>
                        <Text color='white' css='ellipsis' align='left' text={`#${identifierUsed ?? profile?.id ?? '-'}`} size='var(--text-m)'/>
                      </div>
                      <div className="flex column grow-1">
                        <Text css='ellipsis' text='Student Number' size='var(--text-l)' align='left' color='white' opacity='0.3' w='500'/>
                        <div className="flex row a-center gap-half">
                          <Text color='white' css='ellipsis' align='left' text={profile?.number ?? profile?.registration_number ?? '-'} size='var(--text-m)' />
                          <Copy value={profile?.number ?? profile?.registration_number ?? '-'} />
                        </div>
                      </div>
                      <div className="flex column grow-1">
                        <Text css='ellipsis' text='Email' size='var(--text-l)' align='left' color='white' opacity='0.3' w='500'/>
                        <div className="flex row a-center gap-half">
                          <Text color='white' css='ellipsis' align='left' text={profile?.email ?? '-'} size='var(--text-m)' />
                          <Copy value={profile?.email ?? '-'} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`flex row wrap w100 gap`}>
                  <StaticCard2 minWidth='150px' css="grow-1" label='Study level' value={profile?.level ?? profile?.study_level ?? '-'} icon='fa-solid fa-graduation-cap' color='#4FB6A3' textColor = "white"/>
                  <StaticCard2 minWidth='150px' css="grow-1" label='Speciality' value={profile?.speciality ?? profile?.department ?? '-'} icon='fa-solid fa-book-bookmark' color='#4AD8F1' textColor = "white"/>
                  <StaticCard2 minWidth='150px' css="grow-1" label='Section' value={profile?.section ?? '-'} icon='fa-solid fa-people-group' color='#888888' textColor = "white"/>
                  <StaticCard2 minWidth='150px' css="grow-1" label='Group' value={profile?.group_name ?? profile?.group_code ?? profile?.group ?? '-'} icon='fa-solid fa-clipboard-list' color='#F1504A' textColor = "white"/>
                </div>
              </>}
            </div>
            <div className={`examsList BGC pd gsap-y ${examsLoading && "shimmer"}`}>
              {!examsLoading && <>
                <ListTableClient
                  title="My Exams"
                  rowTitles={["Exam", "Date", "Room", "Surveillances"]}
                  rowTemplate="0.6fr 0.3fr 0.3fr 0.5fr"

                  dataList={{ total: 10, items: testList }}

                    filterFunction={(exam, text) => {
                      const q = (text || '').toString().toLowerCase();
                      const hay = `${String(exam.module_name || '')} ${String(exam.exam_type || '')} ${String(exam.room || '')} ${String(exam.date || '')}`.toLowerCase();
                      return hay.includes(q);
                    }}

                    sortFunction={(a, b, sort) => {
                      const s = sort || 'DateAsc';
                      if (s === 'A-Z') return String(a.module_name || '').localeCompare(String(b.module_name || ''));
                      if (s === 'Z-A') return String(b.module_name || '').localeCompare(String(a.module_name || ''));
                      const da = a.date ? new Date(a.date) : new Date(0);
                      const db = b.date ? new Date(b.date) : new Date(0);
                      if (s === 'DateDesc') return db - da;
                      // DateAsc
                      return da - db;
                    }}

                  exportConfig={{
                    title: 'Exams List',
                    headers: ['Exam', 'Date', 'Room', 'Surveillances'],
                    fileName: 'exams_list',
                    mapRow: (r) => [`${r.module_name} - ${r.exam_type}`, `${r.date} ${r.time}`, r.room, (r.surveillances || []).join(', ')],
                  }}

                  rowRenderer={(exam) => (
                      <>
                        <div className="flex column">
                          <Text text={`${exam.module_name} - ${exam.exam_type}`} align='left' size='0.85rem' opacity='0.9'/>
                          <div className="flex row a-center gap">
                            <Text align='left' text={`Factor: ${exam.module_factor}`} size='0.65rem' opacity='0.6' mrg='0.25em 0 0 0'/>
                            <Text align='left' text={`Credit: ${exam.module_credit}`} size='0.65rem' opacity='0.6' mrg='0.25em 0 0 0'/>
                          </div>
                        </div>
                        <div className="flex column">
                          <Text align='left' text={exam.date} size='0.85rem' />
                          <div className="flex row a-center">
                            <i className="fa-regular fa-clock text-low" style={{fontSize: "0.5rem"}}></i>
                            <Text mrg='0 0 0 0.5em' align='left' opacity='0.8' text={`${floatToTimeString(exam.startHour)} - ${floatToTimeString(exam.endHour)}`} size='0.7rem' />
                          </div>
                        </div>
                        <Text align='left' text={exam.room} size='var(--text-m)' />
                          {(!exam.surveillances || exam.surveillances.length == 0) && <Text text='_' size='var(--text-m)' align='left'/> }
                          {(exam.surveillances && exam.surveillances.length == 1) && 
                          <div className="flex row a-center gap">
                            <Profile img={exam.surveillances[0].image} width="35px" border="2px solid var(--bg)"/>
                            <Text align='left' text={`${exam.surveillances[0].pronoun}. ${exam.surveillances[0].name}`} size='var(--text-m)'/>
                          </div>}
                          {(exam.surveillances && exam.surveillances.length > 1) && 
                            <div className="flex row a-center gap pos-rel">
                              {exam.surveillances.map((teacher, index) => {
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
                                text={`+${exam.surveillances.length} Teachers`}
                                size="var(--text-m)"
                                mrg={`0 0 0 ${35 + exam.surveillances.length * 12}px`}
                              />
                          </div>}
                      </>
                  )}
                />
              </>}
            </div>
          </div>
          <div className="homeSide">
            <div className={`homeNotification flex column BGC pd gsap-y ${sessionsLoading && "shimmer"}`}>
              {!notificationsLoading && <>
                <Text text="Notifications" color='var(--text-low)' size='var(--text-m)' align='left' />
                {notificationsCount == 0 && 
                <>
                  <Notification css="self-center" width='40%' mrg="auto 0 0 0"/> 
                  <Text text='No notifications' w='bold' mrg="2em 0 auto 0" color='var(--color-main)' size='var(--text-l)'/>
                </>
                }
              </>}
            </div>
            <div className={`homeSessions BGC pd gsap-y ${examsLoading && "shimmer"}`}>
              {!sessionsLoading && <>
                <Text text="Today's sessions" color='var(--text-low)' size='var(--text-m)' align='left' />
                <div className="flex column gap pdt">
                  <Exam time='11:00 - 13:00' color='#4FB6A3' room='Laboratory 101' name='Arduino Programming - Practical Exam'/>
                  <Exam time='09:00 - 11:00' room='Amphitheaters 3' name='Advanced Database - Final Exam'/>
                </div>
              </>}
            </div>
          </div>
        </div>
  )
}

export default StudentHome