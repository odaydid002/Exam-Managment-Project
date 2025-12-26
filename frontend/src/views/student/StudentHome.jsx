import './student.css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useState, useEffect } from "react"
import { useNotify } from '../../components/loaders/NotificationContext';
import { authCheck } from '../../API/auth';
import { get as getStudent, getExams as getStudentExams } from '../../API/students';
import { get as getGroup } from '../../API/groups';
import { getNotificationsByUser, markNotificationsRead } from '../../API/users';

import formatDateTime from '../../hooks/formatDateTime';

import StaticCard2 from '../../components/containers/StaticCard2';
import Profile from '../../components/containers/profile';
import Text from '../../components/text/Text';
import Notification from '../../components/svg/Notification';
import Eclipse from '../../components/shapes/Eclipse';
import Exam from '../../components/containers/Exam';
import ListTableClient from '../../components/tables/ListTableClient';
import Copy from '../../components/buttons/Copy';
import Popup from '../../components/containers/Popup';
import TextButton from '../../components/buttons/TextButton';
import Notif from '../../components/containers/Notif';

gsap.registerPlugin(useGSAP);

function floatToTimeString(num) {
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm}`;
}

const StudentHome = () => {

  const [infoLoading, setInfoLoading] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [sessionsLoading, _setSessionsLoading] = useState(false)
  const [examsLoading, setExamsLoading] = useState(false)
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [myExams, setMyExams] = useState([])
  const [myExamsLoading, setMyExamsLoading] = useState(false)

  const getLocalTodayString = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  const todaysExams = myExams.filter(e => String(e.date) === getLocalTodayString());
  useGSAP(() => {
    gsap.from('.gsap-y', {
      y: 50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
    })
  });

  const notifyCtx = useNotify();
  const notify = notifyCtx?.notify;
  const [profile, setProfile] = useState(null);
  const [_authUser, _setAuthUser] = useState(null);
  const [identifierUsed, setIdentifierUsed] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSurveillances, setPopupSurveillances] = useState([]);

  const openSurveillancesPopup = (list) => {
    setPopupSurveillances(list || []);
    setPopupOpen(true);
  }

  const closeSurveillancesPopup = () => {
    setPopupOpen(false);
    setPopupSurveillances([]);
  }

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
        notify?.('error', 'Unable to load student profile');
      } finally {
        if (mounted) setInfoLoading(false);
      }
    };

    loadProfile();
    return () => { mounted = false };
  }, [notify]);

 
  useEffect(() => {
    if (!identifierUsed) return;
    let mounted = true;
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const resp = await getNotificationsByUser(identifierUsed);
        const items = Array.isArray(resp) ? resp : (resp.notifications || resp.data || []);
        if (mounted) {
          setNotifications(items || []);
          setNotificationsCount(items?.length || 0);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
        if (mounted) {
          setNotifications([]);
          setNotificationsCount(0);
        }
      } finally {
        if (mounted) setNotificationsLoading(false);
      }
    }

    loadNotifications();
    return () => { mounted = false }
  }, [identifierUsed]);

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      if (unreadNotifications.length === 0) return;
      
      const notificationIds = unreadNotifications.map(n => n.id);
      await markNotificationsRead({ notification_ids: notificationIds });
      
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      notify?.('success', 'Notifications marked as read');
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
      notify?.('error', 'Failed to mark notifications as read');
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      if (!id) return;

      const current = notifications.find(n => n.id == id || n.uuid == id);
      if (!current) return;

      if (current.read_at || current.is_read) return;

      await markNotificationsRead({ notification_ids: [id] });

      setNotifications(prev => prev.map(n => {
        if (n.id == id || n.uuid == id) {
          return { ...n, read_at: n.read_at || new Date().toISOString(), is_read: true };
        }
        return n;
      }));

      setNotificationsCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
      notify?.('error', 'Failed to mark notification as read');
    }
  }

  useEffect(() => {
    if (!identifierUsed) return;
    let mounted = true;
    const loadMyExams = async () => {
      try {
        setMyExamsLoading(true);
        setExamsLoading(true);
        const resp = await getStudentExams(identifierUsed);
        const items = Array.isArray(resp) ? resp : (resp.exams || resp.data || []);
        const mapped = (items || []).map(ex => ({
          module_name: ex.module_name ?? ex.module ?? ex.module_code ?? '',
          module_credit: ex.module_credit ?? 0,
          module_factor: ex.module_factor ?? 0,
          exam_type: ex.exam_type ?? ex.type ?? '',
          date: (ex.date || ex.day || '').toString().split(' ')[0],
          startHour: ex.start_hour ?? ex.startHour ?? ex.start ?? 0,
          endHour: ex.end_hour ?? ex.endHour ?? ex.end ?? 0,
          room: ex.room_name ?? ex.room ?? '',
          surveillances: ex.surveillances || []
        }));
        if (!mounted) return;
        setMyExams(mapped);
      } catch (err) {
        console.error('Failed to load student exams', err);
        if (mounted) setMyExams([]);
      } finally {
        if (mounted) {
          setMyExamsLoading(false);
          setExamsLoading(false);
        }
      }
    }

    loadMyExams();
    return () => { mounted = false }
  }, [identifierUsed]);

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

  // Notification grouping helpers
  const getDateOnlyFrom = (value) => {
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch (e) {
      return '';
    }
  }

  const todayNotifications = notifications.filter(n => getDateOnlyFrom(n.created_at || n.createdAt || n.date) === getLocalTodayString());
  const otherNotifications = notifications.filter(n => getDateOnlyFrom(n.created_at || n.createdAt || n.date) !== getLocalTodayString());

  return (
    <div className={`homeLayout full scrollbar overflow-y-a`}>
      <div className="homeBody">
        <div className={`overflow-h homeProfile gsap-y ${infoLoading && "shimmer-second"}`} style={{ padding: "2em", backgroundColor: "var(--color-second2)", borderRadius: "20px" }}>
          {!infoLoading && <>
            <Eclipse css='pos-abs' w='10em' size='1em' color='var(--trans-grey)' zi='0' top="-20%" left="15%" />
            <Eclipse css='pos-abs' w='10em' size='1em' color='var(--trans-grey)' zi='0' bottom="-40%" right="15%" />
            <Eclipse css='pos-abs anim-float-slow' w='5em' size='0.625em' color='var(--trans-grey)' zi='0' top="-20%" right="15%" />
            <Eclipse css='pos-abs anim-float' w='8em' size='0.8em' color='var(--trans-grey)' zi='0' top="10%" left="45%" />
            <Eclipse css='pos-abs anim-float-slow' w='5em' size='0.625em' color='var(--trans-grey)' zi='0' bottom="-20%" left="15%" />
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
                    <Text css='ellipsis' text='ID' size='var(--text-l)' align='left' color='white' opacity='0.3' w='500' />
                    <Text color='white' css='ellipsis' align='left' text={`#${identifierUsed ?? profile?.id ?? '-'}`} size='var(--text-m)' />
                  </div>
                  <div className="flex column grow-1">
                    <Text css='ellipsis' text='Student Number' size='var(--text-l)' align='left' color='white' opacity='0.3' w='500' />
                    <div className="flex row a-center gap-half">
                      <Text color='white' css='ellipsis' align='left' text={profile?.number ?? profile?.registration_number ?? '-'} size='var(--text-m)' />
                      <Copy value={profile?.number ?? profile?.registration_number ?? '-'} />
                    </div>
                  </div>
                  <div className="flex column grow-1">
                    <Text css='ellipsis' text='Email' size='var(--text-l)' align='left' color='white' opacity='0.3' w='500' />
                    <div className="flex row a-center gap-half">
                      <Text color='white' css='ellipsis' align='left' text={profile?.email ?? '-'} size='var(--text-m)' />
                      <Copy value={profile?.email ?? '-'} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`flex row wrap w100 gap`}>
              <StaticCard2 minWidth='150px' css="grow-1" label='Study level' value={profile?.level ?? profile?.study_level ?? '-'} icon='fa-solid fa-graduation-cap' color='#4FB6A3' textColor="white" />
              <StaticCard2 minWidth='150px' css="grow-1" label='Speciality' value={profile?.speciality ?? profile?.department ?? '-'} icon='fa-solid fa-book-bookmark' color='#4AD8F1' textColor="white" />
              <StaticCard2 minWidth='150px' css="grow-1" label='Section' value={profile?.section ?? '-'} icon='fa-solid fa-people-group' color='#888888' textColor="white" />
              <StaticCard2 minWidth='150px' css="grow-1" label='Group' value={profile?.group_name ?? profile?.group_code ?? profile?.group ?? '-'} icon='fa-solid fa-clipboard-list' color='#F1504A' textColor="white" />
            </div>
          </>}
        </div>
        <div className={`examsList BGC pd gsap-y ${examsLoading && "shimmer"}`}>
          {!examsLoading && <>
            <ListTableClient
              title="My Exams"
              rowTitles={["Exam", "Date", "Room", "Surveillances"]}
              rowTemplate="0.6fr 0.3fr 0.3fr 0.5fr"

              dataList={{ total: myExams.length, items: myExams }}

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
                    <Text text={`${exam.module_name} - ${exam.exam_type}`} align='left' size='0.85rem' opacity='0.9' />
                    <div className="flex row a-center gap">
                      <Text align='left' text={`Factor: ${exam.module_factor}`} size='0.65rem' opacity='0.6' mrg='0.25em 0 0 0' />
                      <Text align='left' text={`Credit: ${exam.module_credit}`} size='0.65rem' opacity='0.6' mrg='0.25em 0 0 0' />
                    </div>
                  </div>
                  <div className="flex column">
                    <Text align='left' text={exam.date} size='0.85rem' />
                    <div className="flex row a-center">
                      <i className="fa-regular fa-clock text-low" style={{ fontSize: "0.5rem" }}></i>
                      <Text mrg='0 0 0 0.5em' align='left' opacity='0.8' text={`${floatToTimeString(exam.startHour)} - ${floatToTimeString(exam.endHour)}`} size='0.7rem' />
                    </div>
                  </div>
                  <Text align='left' text={exam.room} size='var(--text-m)' />
                  {(!exam.surveillances || exam.surveillances.length == 0) && <Text text='_' size='var(--text-m)' align='left' />}
                  {(exam.surveillances && exam.surveillances.length == 1) &&
                    <div className="flex row a-center gap">
                      <Profile img={exam.surveillances[0].image} width="35px" border="2px solid var(--bg)" />
                      <Text align='left' text={`${exam.surveillances[0].pronoun}. ${exam.surveillances[0].name}`} size='var(--text-m)' />
                    </div>}
                  {(exam.surveillances && exam.surveillances.length > 1) && 
                    <div className="flex row a-center gap pos-rel clickable" onClick={()=> openSurveillancesPopup(exam.surveillances)}>
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
        <div className={`homeNotification flex column BGC pd gsap-y overflow-h ${notificationsLoading && "shimmer"}`}>
          {!notificationsLoading && <>
            <div className='flex column gap' style={{height: "5em"}}>
              <div className='flex row a-center j-spacebet' style={{marginBottom: "1em"}}>
                <Text text="Notifications" color='var(--text-low)' size='var(--text-m)' align='left' />
                <TextButton text='Mark all as read' icon = "fa-solid fa-check-double" textColor='var(--color-main)' onClick={handleMarkAllAsRead} />
              </div>
            </div>
            {notifications.length === 0 &&
              <>
                <Notification css="self-center" width='40%' mrg="auto 0 0 0" />
                <Text text='No notifications' w='bold' mrg="2em 0 auto 0" color='var(--color-main)' size='var(--text-l)' />
              </>
            }
            {(todayNotifications.length > 0 || otherNotifications.length > 0) &&
              <div className="flex column gap notification-container overflow-y-a scrollbar">
                {todayNotifications.length > 0 && (
                  <>
                    <Text text='Today' size='var(--text-m)' align='left' color='var(--text-low)' opacity='0.5'/>
                    {todayNotifications.map((notif, idx) => {
                      const titleStr = (notif.title === false || notif.title == null) ? '' : String(notif.title);
                      const descStr = notif.message == null ? '' : String(notif.message);
                      const lowerTitle = titleStr.toLowerCase();
                      const icon = lowerTitle.includes('update') ? 'fa-solid fa-calendar-day' : lowerTitle.includes('cancel') ? 'fa-solid fa-calendar-xmark' : lowerTitle.includes('new') ? 'fa-solid fa-calendar' : null;
                      const iconColor = lowerTitle.includes('update') ? '#FF872C' : lowerTitle.includes('cancel') ? '#F1504A' : lowerTitle.includes('new') ? '#4FB6A3' : null;

                      return (
                        <Notif
                          key={`today-${idx}-${notif.id || notif.uuid || idx}`}
                          read={!!notif.is_read}
                          title={titleStr || undefined}
                          description={descStr}
                          onClick={() => { handleMarkAsRead(notif.id) }}
                          date={formatDateTime(notif.created_at).date}
                          time={formatDateTime(notif.created_at).time}
                          icon={icon}
                          iconColor={iconColor}
                        />
                      );
                    })}
                  </>
                )}

                {otherNotifications.length > 0 && (
                  <>
                    <Text text='Other' size='var(--text-m)' align='left' color='var(--text-low)' opacity='0.5'/>
                    {otherNotifications.map((notif, idx) => {
                      const titleStr = (notif.title === false || notif.title == null) ? '' : String(notif.title);
                      const descStr = notif.message == null ? '' : String(notif.message);
                      const lowerTitle = titleStr.toLowerCase();
                      const icon = lowerTitle.includes('update') ? 'fa-solid fa-calendar-day' : lowerTitle.includes('cancel') ? 'fa-solid fa-calendar-xmark' : lowerTitle.includes('new') ? 'fa-solid fa-calendar' : null;
                      const iconColor = lowerTitle.includes('update') ? '#FF872C' : lowerTitle.includes('cancel') ? '#F1504A' : lowerTitle.includes('new') ? '#4FB6A3' : null;

                      return (
                        <Notif
                          key={`other-${idx}-${notif.id || notif.uuid || idx}`}
                          read={!!notif.is_read}
                          title={titleStr || undefined}
                          description={descStr}
                          onClick={() => { handleMarkAsRead(notif.id) }}
                          date={formatDateTime(notif.created_at).date}
                          time={formatDateTime(notif.created_at).time}
                          icon={icon}
                          iconColor={iconColor}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            }
          </>}
        </div>
            <div className={`homeSessions BGC pd gsap-y ${myExamsLoading && "shimmer"}`}>
              {!myExamsLoading && <>
                <Text text="Today's sessions" color='var(--text-low)' size='var(--text-m)' align='left' />
                <div className="flex column gap pdt">
                  {todaysExams.length === 0 && <Text text='No sessions today' color='var(--text-low)' size='var(--text-m)' align='left' />}
                  {todaysExams.map((ex, idx) => (
                    <Exam
                      key={idx}
                      time={`${floatToTimeString(ex.startHour)} - ${floatToTimeString(ex.endHour)}`}
                      color={idx === 0 ? '#4FB6A3' : '#888888'}
                      room={ex.room}
                      name={`${ex.module_name} - ${ex.exam_type}`}
                    />
                  ))}
                </div>
              </>}
            </div>
      </div>
      <Popup isOpen={popupOpen} onClose={closeSurveillancesPopup} bg="rgba(0,0,0,0.45)">
        <div style={{ background: 'var(--bg)', padding: '1em', borderRadius: '8px', minWidth: '320px', maxWidth: '90%' }}>
          <div className="flex row a-center j-spacebet" style={{ marginBottom: '0.5em' }}>
            <Text text={`Surveillances (${popupSurveillances.length})`} size='var(--text-m)' />
            <div className="clickable" onClick={closeSurveillancesPopup}><i className="fa-solid fa-xmark"></i></div>
          </div>
          <div className="flex column gap">
            {popupSurveillances.length === 0 && <Text text='No teachers' />}
            {popupSurveillances.map((t, i) => (
              <div key={i} className="flex row a-center gap">
                <Profile img={t.image} width="45px" />
                <div className="flex column">
                  <Text text={`${t.pronoun ? t.pronoun + '. ' : ''}${t.name || t.fullname || t.username || '-'}`} />
                  <Text text={t.email || t.phone || ''} size='0.75rem' opacity='0.6' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </div>
  )
}


export default StudentHome