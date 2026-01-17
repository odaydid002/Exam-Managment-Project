import './teacher.css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useState, useEffect } from "react"
import { useNotify } from '../../components/loaders/NotificationContext';
import { authCheck } from '../../API/auth';
import { get as getTeacher } from '../../API/teachers';
import { getNotificationsByUser, markNotificationsRead } from '../../API/users';
import { getTeacherExams, approve, reject } from '../../API/surveillance';
import { getByTeacher as getModulesByTeacher } from '../../API/modules';
import { useNavigate } from 'react-router-dom'

import formatDateTime from '../../hooks/formatDateTime';

import StaticCard2 from '../../components/containers/StaticCard2';
import Profile from '../../components/containers/Profile';
import Text from '../../components/text/Text';
import Notification from '../../components/svg/Notification';
import Eclipse from '../../components/shapes/Eclipse';
import Exam from '../../components/containers/Exam';
import ListTableClient from '../../components/tables/ListTableClient';
import Copy from '../../components/buttons/Copy';
import Popup from '../../components/containers/Popup';
import TextButton from '../../components/buttons/TextButton';
import IconButton from '../../components/buttons/IconButton';
import Notif from '../../components/containers/Notif';

gsap.registerPlugin(useGSAP);

function floatToTimeString(num) {
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm}`;
}

const TeacherHome = () => {

  const navigate = useNavigate();

  const [infoLoading, setInfoLoading] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [surveillanceExamsLoading, setSurveillanceExamsLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [surveillanceExams, setSurveillanceExams] = useState([])
  const [notificationFilter, setNotificationFilter] = useState('all')
  const [approvalLoading, setApprovalLoading] = useState(null)
  const [modulesCount, setModulesCount] = useState(0)
  const [otherTeachersModal, setOtherTeachersModal] = useState(null)

  const getLocalTodayString = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  const _normalizeToYMD = (val) => {
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
      return '';
    }
  }

  const todaysSurveillance = surveillanceExams.filter(e => _normalizeToYMD(e?.date) === getLocalTodayString());

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
  const [teacherNumber, setTeacherNumber] = useState(null);
  // other-proctors popup removed

  // Load teacher profile
  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        setInfoLoading(true);
        const auth = await authCheck();
        const user = auth?.user || auth || null;
        if (mounted) _setAuthUser(user);

        if (user) {
          const identifier = user.id;
          if (identifier) {
            setIdentifierUsed(identifier);
            try {
              const teacherData = await getTeacher(identifier);
              if (mounted) {
                setProfile(teacherData);
                // Extract teacher number from the profile
                setTeacherNumber(teacherData?.number);
              }              
              // modules count will be loaded in a separate effect watching `teacherNumber`
              
              return;
            } catch {
              console.debug('teachers.get failed');
            }
          }
        }

        try {
          const res = await fetch('/api/teacher/profile');
          if (res.ok) {
            const data = await res.json();
            if (mounted) {
              setProfile(data);
              setIdentifierUsed(data.number ?? data.id ?? null);
              setTeacherNumber(data.number ?? null);
            }
            return;
          }
        } catch { console.debug('fallback /api/teacher/profile failed'); }

        try {
          const alt = await fetch('/api/teacher');
          if (alt.ok) {
            const altData = await alt.json();
            if (mounted) {
              setProfile(altData);
              setIdentifierUsed(altData.number ?? altData.id ?? null);
              setTeacherNumber(altData.number ?? null);
            }
            return;
          }
        } catch { console.debug('fallback /api/teacher failed'); }

      } catch {
        notify?.('error', 'Unable to load teacher profile');
      } finally {
        if (mounted) setInfoLoading(false);
      }
    };

    loadProfile();
    return () => { mounted = false };
  }, [notify]);

  // Load notifications
  useEffect(() => {
    if (!identifierUsed || !_authUser) return;
    let mounted = true;
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const resp = await getNotificationsByUser(identifierUsed);
        const items = Array.isArray(resp) ? resp : (resp.notifications || resp.data || []);
        
        // Filter notifications on frontend to ensure they are targeted to this user's role
        const filteredItems = (items || []).filter(notif => {
          const targetType = notif.target_type || 'user';
          const targetRole = notif.target_role;
          const targetUserId = notif.target_user_id;
          const userRole = _authUser?.role;
          const userId = _authUser?.id;
          
          // If target_type is 'all', include it
          if (targetType === 'all') return true;
          // If target_type is 'role', check if user's role matches
          if (targetType === 'role' && targetRole && userRole === targetRole) return true;
          // If target_type is 'user', check if notification is for this user
          if (targetType === 'user' && targetUserId && userId === targetUserId) return true;
          // Legacy: if no target_type specified but user_id matches, include it
          if (!notif.target_type && notif.user_id === userId) return true;
          
          return false;
        });
        
        if (mounted) {
          setNotifications(filteredItems || []);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
        if (mounted) {
          setNotifications([]);
        }
      } finally {
        if (mounted) setNotificationsLoading(false);
      }
    }

    loadNotifications();
    return () => { mounted = false }
  }, [identifierUsed, _authUser]);

  // Load surveillance exams (where teacher is assigned)
  useEffect(() => {
    if (!teacherNumber) return;
    let mounted = true;
    const loadSurveillanceExams = async () => {
      try {
        setSurveillanceExamsLoading(true);
        // Use dedicated API to fetch exams where teacher is surveillance
        const exams = await getTeacherExams(teacherNumber);
        
        const filtered = (exams || []).map(ex => ({
          surveillance_id: ex.surveillance_id,
          status: ex.status || 'pending', // Current teacher's surveillance status
          exam_id: ex.exam_id,
          exam_type: ex.exam_type ?? ex.type ?? '',
          module_name: ex.module_name ?? '',
          module_code: ex.module_code ?? '',
          module_credit: ex.module_credit ?? 0,
          module_factor: ex.module_factor ?? 0,
          date: (ex.date || '').toString().split(' ')[0],
          startHour: ex.start_hour ?? 0,
          endHour: ex.end_hour ?? 0,
          room: ex.room ?? '',
          otherTeachers: (ex.surveillances || []) // Other teachers assigned to this exam
        }));

        if (mounted) setSurveillanceExams(filtered);
      } catch (err) {
        console.error('Failed to load surveillance exams', err);
        if (mounted) setSurveillanceExams([]);
      } finally {
        if (mounted) setSurveillanceExamsLoading(false);
      }
    }

    loadSurveillanceExams();
    return () => { mounted = false }
  }, [teacherNumber]);

  // Load modules assigned to this teacher to get modules count
  useEffect(() => {
    if (!teacherNumber) return;
    let mounted = true;
    const loadModules = async () => {
      try {
        const resp = await getModulesByTeacher(teacherNumber);
        const modules = Array.isArray(resp) ? resp : (resp.modules || resp.data || []);
        if (mounted) setModulesCount(modules.length || (resp.total ?? modules.length));
      } catch (err) {
        console.debug('Failed to load teacher modules', err);
      }
    }

    loadModules();
    return () => { mounted = false };
  }, [teacherNumber]);

  // Notification handlers
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
    } catch (err) {
      console.error(err);
      notify?.('error', 'Failed to mark notification as read');
    }
  }

  // Surveillance approval handlers
  const handleApproveSurveillance = async (surveillanceId) => {
    try {
      setApprovalLoading(surveillanceId);
      await approve(surveillanceId);

      // Update only the current teacher's status
      setSurveillanceExams(prev => prev.map(exam => 
        exam.surveillance_id === surveillanceId 
          ? { ...exam, status: 'approved' }
          : exam
      ));

      notify?.('success', 'Surveillance approved successfully');
    } catch (err) {
      console.error('Failed to approve surveillance', err);
      notify?.('error', 'Failed to approve surveillance');
    } finally {
      setApprovalLoading(null);
    }
  }

  const handleRejectSurveillance = async (surveillanceId) => {
    try {
      setApprovalLoading(surveillanceId);
      await reject(surveillanceId);

      // Update only the current teacher's status
      setSurveillanceExams(prev => prev.map(exam => 
        exam.surveillance_id === surveillanceId 
          ? { ...exam, status: 'rejected' }
          : exam
      ));

      notify?.('success', 'Surveillance rejected');
    } catch (err) {
      console.error('Failed to reject surveillance', err);
      notify?.('error', 'Failed to reject surveillance');
    } finally {
      setApprovalLoading(null);
    }
  }

  // Notification grouping helpers
  const getDateOnlyFrom = (value) => {
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
      return '';
    }
  }

  // Notification counts and filtering
  const unreadCount = notifications.filter(n => !n.is_read && !n.read_at).length;
  const allCount = notifications.length;

  const filteredNotifications = notificationFilter === 'unread' 
    ? notifications.filter(n => !n.is_read && !n.read_at)
    : notifications;
  
  const filteredTodayNotifications = filteredNotifications.filter(n => getDateOnlyFrom(n.created_at || n.createdAt || n.date) === getLocalTodayString());
  const filteredOtherNotifications = filteredNotifications.filter(n => getDateOnlyFrom(n.created_at || n.createdAt || n.date) !== getLocalTodayString());

  return (
    <div className={`homeLayout full scrollbar overflow-y-a`}>
      <div className="homeBody">
        {/* Teacher Profile Section */}
        <div className={`overflow-h homeProfile gsap-y ${infoLoading && "shimmer-second"}`} style={{ padding: "2em", backgroundColor: "var(--color-second2)", borderRadius: "20px" }}>
          {!infoLoading && <>
            <Eclipse css='pos-abs' w='10em' size='1em' color='var(--trans-grey)' zi='0' top="-20%" left="15%" />
            <Eclipse css='pos-abs' w='10em' size='1em' color='var(--trans-grey)' zi='0' bottom="-40%" right="15%" />
            <Eclipse css='pos-abs anim-float-slow' w='5em' size='0.625em' color='var(--trans-grey)' zi='0' top="-20%" right="15%" />
            <Eclipse css='pos-abs anim-float' w='8em' size='0.8em' color='var(--trans-grey)' zi='0' top="10%" left="45%" />
            <Eclipse css='pos-abs anim-float-slow' w='5em' size='0.625em' color='var(--trans-grey)' zi='0' bottom="-20%" left="15%" />
            <div className={`teacherProfile w100`}>
              <div className="flex row a-start j-center">
                <Profile
                  width='90%'
                  img={profile?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(((profile?.fname || '') + ' ' + (profile?.lname || '')).trim() || 'Teacher')}`}
                />
              </div>
              <div className="flex column gap">
                <Text css='ellipsis' color='white' align='left' text={(profile?.fname || '') + (profile?.lname ? ' ' + profile.lname : '') || 'Teacher Name'} w='600' size='var(--text-l)' />
                <div className="flex row gap wrap a-center">
                  <div className="flex column grow-1">
                    <Text css='ellipsis' text='ID' size='var(--text-l)' align='left' color='white' opacity='0.3' w='500' />
                    <Text color='white' css='ellipsis' align='left' text={`#${identifierUsed ?? profile?.id ?? '-'}`} size='var(--text-m)' />
                  </div>
                  <div className="flex column grow-1">
                    <Text css='ellipsis' text='Teacher Number' size='var(--text-l)' align='left' color='white' opacity='0.3' w='500' />
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
              <StaticCard2 minWidth='150px' css="grow-1" label='Department' value={profile?.departement ?? '-'} icon='fa-solid fa-building' color='#4FB6A3' textColor="white" />
              <StaticCard2 minWidth='150px' css="grow-1" label='Speciality' value={profile?.speciality ?? '-'} icon='fa-solid fa-book-bookmark' color='#4AD8F1' textColor="white" />
              <StaticCard2 minWidth='150px' css="grow-1" label='Modules' value={String(modulesCount)} icon='fa-solid fa-graduation-cap' color='#FF872C' textColor="white" />
              <StaticCard2 minWidth='150px' css="grow-1" label='Surveillances' value={String(surveillanceExams.length)} icon='fa-solid fa-eye' color='#4AD8F1' textColor="white" />
            </div>
          </>}
        </div>

        {/* Surveillance Exams Section */}
        <div className={`examsList BGC pd gsap-y ${surveillanceExamsLoading && "shimmer"}`}>
          {!surveillanceExamsLoading && <>
            <ListTableClient
              title="My Surveillance Exams"
              rowTitles={["Exam", "Date", "Room", "Proctors", "Status", "Action"]}
              rowTemplate="0.5fr 0.25fr 0.25fr 0.35fr 0.2fr 0.1fr"

              dataList={{ total: surveillanceExams.length, items: surveillanceExams }}

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
                title: 'Surveillance Exams',
                headers: ['Exam', 'Date', 'Room', 'Proctors', 'Status'],
                fileName: 'surveillance_exams',
                mapRow: (r) => [
                  `${r.module_name} - ${r.exam_type}`, 
                  `${r.date}`, 
                  r.room, 
                  (r.otherTeachers || []).map(p => `${p.adj || ''} ${p.fname || ''} ${p.lname || ''}`.trim()).join(', ') || '-',
                  r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : 'Pending'
                ],
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
                    <Text align='left' text={formatDateTime(exam.date).date} size='0.85rem' />
                    <div className="flex row a-center">
                      <i className="fa-regular fa-clock text-low" style={{ fontSize: "0.5rem" }}></i>
                      <Text mrg='0 0 0 0.5em' align='left' opacity='0.8' text={`${floatToTimeString(exam.startHour)} - ${floatToTimeString(exam.endHour)}`} size='0.7rem' />
                    </div>
                  </div>
                  <Text align='left' text={exam.room} size='0.85rem' />
                  
                  {/* Other Teachers Assigned */}
                  <div className="flex row a-center">
                    {(() => {
                      const otherTeachers = exam.otherTeachers || [];
                      if (otherTeachers.length === 0) return <Text text='No other proctors' size='var(--text-m)' align='left' />;
                      
                      if (otherTeachers.length === 1) {
                        return (
                          <div className="flex row a-center gap">
                            <Profile img={otherTeachers[0].image} width="35px" border="2px solid var(--bg)" />
                            <Text align='left' text={`${otherTeachers[0].adj || ''}${otherTeachers[0].adj ? '.' : ''} ${otherTeachers[0].fname || ''} ${otherTeachers[0].lname || ''}`} size='var(--text-m)' />
                          </div>
                        );
                      }
                      
                      return (
                        <div className="flex row a-center gap pos-rel clickable" onClick={() => setOtherTeachersModal(exam)}>
                          {otherTeachers.map((teacher, index) => {
                            if (index > 2) return null;
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
                            text={`+${otherTeachers.length} Proctors`}
                            size="var(--text-m)"
                            mrg={`0 0 0 ${35 + Math.min(otherTeachers.length, 3) * 12}px`}
                          />
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Current Teacher's Status */}
                  <div className="flex column a-center">
                    {(() => {
                      const status = exam.status || 'pending';
                      if (status === 'pending') return (
                        <span style={{
                          padding: '0.25em 0.75em',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: 'rgba(255, 193, 7, 0.2)',
                          color: '#FFC107'
                        }}>
                          Pending
                        </span>
                      );
                      if (status === 'approved') return (
                        <span style={{
                          padding: '0.25em 0.75em',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: 'rgba(79, 182, 163, 0.2)',
                          color: '#4FB6A3'
                        }}>
                          Approved
                        </span>
                      );
                      if (status === 'rejected') return (
                        <span style={{
                          padding: '0.25em 0.75em',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: 'rgba(241, 80, 74, 0.12)',
                          color: '#F1504A'
                        }}>
                          Rejected
                        </span>
                      );
                      return <Text text='-' size='var(--text-m)' />;
                    })()}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex row a-center gap">
                    {exam.status === 'pending' && (
                      <>
                        <IconButton
                          icon="fa-solid fa-check"
                          onClick={() => handleApproveSurveillance(exam.surveillance_id)}
                          disabled={approvalLoading !== null && approvalLoading !== exam.surveillance_id}
                          title="Approve"
                          color="#4FB6A3"
                        />
                        <IconButton
                          icon="fa-solid fa-xmark"
                          onClick={() => handleRejectSurveillance(exam.surveillance_id)}
                          disabled={approvalLoading !== null && approvalLoading !== exam.surveillance_id}
                          title="Reject"
                          color="#F1504A"
                        />
                      </>
                    )}
                    {exam.status !== 'pending' && (
                      <Text text='-' size='var(--text-m)' opacity='0.5' />
                    )}
                  </div>
                </>
              )}
            />
          </>}
        </div>
      </div>

      {/* Sidebar: Notifications & Today's Sessions */}
      <div className="homeSide">
        {/* Notifications Section */}
        <div className={`homeNotification flex column BGC pd gsap-y overflow-h ${notificationsLoading && "shimmer"}`}>
          {!notificationsLoading && <>
            {/* Header */}
            <div className='flex row a-center j-spacebet' style={{marginBottom: "1em"}}>
              <Text text="Notifications" color='var(--text-low)' size='var(--text-m)' align='left' />
              <TextButton text='Mark all as read' icon = "fa-solid fa-check-double" textColor='var(--color-main)' onClick={handleMarkAllAsRead} />
            </div>

            {/* Filter Bar */}
            <div className='flex row a-center j-spacebet' style={{paddingBottom: "0.75em", marginBottom: "1em", borderBottom: "1px solid rgba(255,255,255,0.1)"}}>
              <div className='flex row a-center gap' style={{flex: 1}}>
                <button 
                  onClick={() => setNotificationFilter('all')}
                  style={{
                    background: 'transparent',
                    border: "none",
                    borderBottom: notificationFilter === 'all' ? '3px solid var(--color-main)' : 'none',
                    padding: '0.5em 1em',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: notificationFilter === 'all' ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5em'
                  }}
                >
                  <Text text="All" color= {notificationFilter === 'all' ? 'var(--color-main)' : 'var(--text-low)'}/>
                  {allCount > 0 && (
                    <span style={{
                      background: notificationFilter === 'all' ? 'var(--color-main)' : 'var(--trans-grey)',
                      color: notificationFilter === 'all' ? 'white' : 'var(--text-low)',
                      padding: '0.125em 0.5em',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      minWidth: '1.5em',
                      textAlign: 'center'
                    }}>
                      {allCount > 99 ? '99+' : allCount}
                    </span>
                  )}
                </button>
                
                <button 
                  onClick={() => setNotificationFilter('unread')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: notificationFilter === 'unread' ? '3px solid var(--color-main)' : 'none',
                    padding: '0.5em 1em',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: notificationFilter === 'unread' ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5em'
                  }}
                >
                  <Text text="Unread" color= {notificationFilter === 'unread' ? 'var(--color-main)' : 'var(--text-low)'}/>
                  {unreadCount > 0 && (
                     <span style={{
                      background: notificationFilter === 'unread' ? 'var(--color-main)' : 'var(--trans-grey)',
                      color: notificationFilter === 'unread' ? 'white' : 'var(--text-low)',
                      padding: '0.125em 0.5em',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      minWidth: '1.5em',
                      textAlign: 'center'
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
              
              <button 
                onClick = {() => {navigate('/teacher/settings')}}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-low)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.5em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  hover: {color: 'white'}
                }}
                title="Settings"
              >
                <i className="fa-solid fa-gear"></i>
              </button>
            </div>

            {filteredNotifications.length === 0 &&
              <>
                <Notification css="self-center" width='40%' mrg="auto 0 0 0" />
                <Text text={notificationFilter === 'unread' ? 'No unread notifications' : 'No notifications'} w='bold' mrg="2em 0 auto 0" color='var(--color-main)' size='var(--text-l)' />
              </>
            }
            {(filteredTodayNotifications.length > 0 || filteredOtherNotifications.length > 0) &&
              <div className="flex column gap notification-container overflow-y-a scrollbar">
                {filteredTodayNotifications.length > 0 && (
                  <>
                    <Text text='Today' size='var(--text-m)' align='left' color='var(--text-low)' opacity='0.5'/>
                    {filteredTodayNotifications.map((notif, idx) => {
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

                {filteredOtherNotifications.length > 0 && (
                  <>
                    <Text text='Other' size='var(--text-m)' align='left' color='var(--text-low)' opacity='0.5'/>
                    {filteredOtherNotifications.map((notif, idx) => {
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

        {/* Today's Surveillance Section */}
        <div className={`homeSessions BGC pd gsap-y ${surveillanceExamsLoading && "shimmer"}`}>
          {!surveillanceExamsLoading && <>
            <Text text="Today's Surveillance" color='var(--text-low)' size='var(--text-m)' align='left' />
            <div className="flex column gap pdt">
              {todaysSurveillance.length === 0 && <Text text='No surveillance today' color='var(--text-low)' size='var(--text-m)' align='left' />}
              {todaysSurveillance.map((ex, idx) => (
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

      {/* Other Teachers Modal */}
      {otherTeachersModal && (
      <Popup
        isOpen={!!otherTeachersModal}
        onClose={() => setOtherTeachersModal(null)}
        bg="rgba(0, 0, 0, 0.5)"
      >
        <div
          style={{
            backgroundColor: 'var(--color-second2)',
            borderRadius: '20px',
            padding: '2em',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex row a-center j-spacebet" style={{ marginBottom: '1.5em' }}>
            <Text
              text={`Other Proctors (${otherTeachersModal?.otherTeachers?.length || 0})`}
              color='white'
              size='var(--text-l)'
              weight='600'
              align='left'
            />
            <button
              onClick={() => setOtherTeachersModal(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="fa-solid fa-xmark" style={{color: "white"}}></i>
            </button>
          </div>

          {/* Exam Info */}
          <div style={{ marginBottom: '1.5em', paddingBottom: '1.5em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Text
              text={`${otherTeachersModal?.module_name} - ${otherTeachersModal?.exam_type}`}
              color='var(--color-main)'
              size='var(--text-m)'
              weight='600'
              align='left'
            />
            <div className="flex row a-center gap" style={{ marginTop: '0.5em' }}>
              <Text
                text={`📅 ${otherTeachersModal?.date ? formatDateTime(otherTeachersModal.date).date : '-'}`}
                color='white'
                size='0.85rem'
                align='left'
                opacity='0.8'
              />
              <Text
                text={`🕐 ${otherTeachersModal?.startHour ? floatToTimeString(otherTeachersModal.startHour) : '-'} - ${otherTeachersModal?.endHour ? floatToTimeString(otherTeachersModal.endHour) : '-'}`}
                color='white'
                size='0.85rem'
                align='left'
                opacity='0.8'
              />
              <Text
                text={`🏛️ ${otherTeachersModal?.room}`}
                color='white'
                size='0.85rem'
                align='left'
                opacity='0.8'
              />
            </div>
          </div>

          {/* Teachers List */}
          <div className="flex column gap">
            {(otherTeachersModal?.otherTeachers || []).map((teacher, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '1em',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                className="flex row a-center gap"
              >
                {/* Teacher Avatar */}
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(79, 182, 163, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  {teacher.image ? (
                    <img
                      src={teacher.image}
                      alt={`${teacher.fname} ${teacher.lname}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((teacher.fname || '') + ' ' + (teacher.lname || ''))}`}
                      alt={`${teacher.fname} ${teacher.lname}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                {/* Teacher Info */}
                <div className="flex column grow-1">
                  <div className="flex row a-center gap-half">
                    <Text
                      text={`${teacher.adj || ''} ${teacher.fname || ''} ${teacher.lname || ''}`}
                      color='white'
                      size='0.95rem'
                      weight='600'
                      align='left'
                    />
                  </div>
                  <Text
                    text={`ID: ${teacher.teacher_number || '-'}`}
                    color='white'
                    size='0.8rem'
                    align='left'
                    opacity='0.7'
                    mrg='0.25em 0 0 0'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popup>
      )}
    </div>
  )
}

export default TeacherHome
