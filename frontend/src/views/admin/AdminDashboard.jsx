import React, {useState, useEffect} from 'react'

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
import { ListTable } from '../../components/tables/ListTable';
import IconButton from '../../components/buttons/IconButton';

import formatNumber from '../../hooks/formatNumber';
import { useAnimateNumber } from "../../hooks/useAnimateNumber";
import { Exams, Rooms, Teachers, Students, Groups } from '../../API'
import * as ConflictsAPI from '../../API/conflicts';
import * as Users from '../../API/users';
import { useNotify } from '../../components/loaders/NotificationContext';
import ExamRequest from '../../components/containers/ExamRequest';
import * as ExamRequestsAPI from '../../API/examRequests';
import { authCheck } from '../../API/auth';
import Popup from '../../components/containers/Popup';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';

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
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [scheduledExams, setScheduledExams] = useState(0);
  const [conflictsDetected, setConflictsDetected] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [roomsTotal, setRoomsTotal] = useState(0);
  const [roomsClassroom, setRoomsClassroom] = useState(0);
  const [roomsLabo, setRoomsLabo] = useState(0);
  const [roomsAmphi, setRoomsAmphi] = useState(0);
  const [roomsOccupied, setRoomsOccupied] = useState(0);
  const [roomsMaintenance, setRoomsMaintenance] = useState(0);
  const [nonValidatedExams, setNonValidatedExams] = useState([]);
  const [nonValidatedLoading, setNonValidatedLoading] = useState(false);
  const [validatingId, setValidatingId] = useState(null);
  const [examRequests, setExamRequests] = useState([]);
  const [examRequestsLoading, setExamRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestActionLoading, setRequestActionLoading] = useState(false);
  const { notify } = useNotify();
  useGSAP(() => {
      gsap.from('.gsap-y', { 
          y: 50,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
      })
  });

  // Fetch current user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const data = await authCheck();
        const user = data?.user || data || {};
        const role = (user.role || user.type || user.role_name || '').toString().toLowerCase();
        setUserRole(role);
        // set newbie flag to false
        if (user.newbie) {

        }
      } catch (err) {
        console.error('Failed to fetch user role', err);
      } finally {
        setRoleLoading(false);
      }
    };
    fetchUserRole();
  }, []);

    // Animated numbers: call hooks unconditionally to avoid changing hook order
    const animScheduled = useAnimateNumber(0, scheduledExams, 1000);
    const animConflicts = useAnimateNumber(0, conflictsDetected, 1000);
    const animTeachers = useAnimateNumber(0, teachersCount, 1000);
    const animStudents = useAnimateNumber(0, studentsCount, 1000);
    const animRoomsClass = useAnimateNumber(0, roomsClassroom, 1000);
    const animRoomsLabo = useAnimateNumber(0, roomsLabo, 1000);
    const animRoomsAmphi = useAnimateNumber(0, roomsAmphi, 1000);
    const animRoomsOccupied = useAnimateNumber(0, roomsOccupied, 1000);
    const availableRooms = Math.max(0, (roomsTotal || 0) - (roomsOccupied || 0) - (roomsMaintenance || 0));
    const animRoomsAvailable = useAnimateNumber(0, availableRooms, 1000);
    const animRoomsMaintenance = useAnimateNumber(0, roomsMaintenance, 1000);

  useEffect(() => {
    const fetchStats = async () => {
      setStaticsLoading(true);
      try {
        const [exJson, roomsList, teachersRes, studentsRes, conflictsResp] = await Promise.all([
          Exams.getAll(),
          Rooms.getAll(),
          Teachers.getAll(),
          Students.getAll(),
          ConflictsAPI.getStats().catch(() => null),
        ]);

        const examsData = exJson || { total: 0, exams: [] };
        const rooms = Array.isArray(roomsList) ? roomsList : (roomsList && roomsList.rooms) ? roomsList.rooms : [];
        const teachersJson = teachersRes || { total: 0, teachers: [] };
        const studentsJson = studentsRes || { total: 0, students: [] };

        setScheduledExams(examsData.total || 0);
        setTeachersCount(typeof teachersJson.total !== 'undefined' ? teachersJson.total : (Array.isArray(teachersJson) ? teachersJson.length : 0));
        setStudentsCount(typeof studentsJson.total !== 'undefined' ? studentsJson.total : (Array.isArray(studentsJson) ? studentsJson.length : 0));
        setRoomsTotal(rooms.length || 0);

        // classify rooms by explicit type; fallback to name heuristics for legacy data
        let c = 0, l = 0, a = 0, m = 0;
        rooms.forEach(r => {
          if (r.disabled) {
            m++;
          } else {
            // Prefer explicit type; fallback to name heuristics
            const type = (r.type || '').toLowerCase();
            const name = (r.name || '').toLowerCase();
            if (type === 'laboratory' || (!type && (name.includes('lab') || name.includes('labo')))) {
              l++;
            } else if (type === 'amphitheater' || (!type && (name.includes('amph') || name.includes('amphi')))) {
              a++;
            } else {
              c++;
            }
          }
        });
        setRoomsClassroom(c);
        setRoomsLabo(l);
        setRoomsAmphi(a);
        setRoomsMaintenance(m);

        // compute occupied rooms based on exams happening now
        const exams = (examsData.exams || []);
        const now = new Date();
        const todayStr = now.toISOString().slice(0,10);
        const currentHour = now.getHours();

        const occupiedRoomIds = new Set();
        // compute conflicts: overlapping exams on same room+date
        let conflicts = 0;
        const grouped = {};
        exams.forEach(e => {
          const dateOnly = e.date ? e.date.slice(0,10) : null;
          if (!dateOnly) return;
          const key = `${e.room_id}||${dateOnly}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(e);
          // occupancy check (simple hour overlap)
          if (dateOnly === todayStr && typeof e.start_hour !== 'undefined' && typeof e.end_hour !== 'undefined') {
            const start = Number(e.start_hour);
            const end = Number(e.end_hour);
            if (!isNaN(start) && !isNaN(end) && currentHour >= start && currentHour < end) {
              if (e.room_id) occupiedRoomIds.add(e.room_id);
            }
          }
        });

        // detect conflicts per grouped exams
        Object.values(grouped).forEach(list => {
          // sort by start
          list.sort((a,b) => Number(a.start_hour) - Number(b.start_hour));
          for (let i=0;i<list.length;i++){
            for (let j=i+1;j<list.length;j++){
              const aStart = Number(list[i].start_hour);
              const aEnd = Number(list[i].end_hour);
              const bStart = Number(list[j].start_hour);
              const bEnd = Number(list[j].end_hour);
              if (isNaN(aStart)||isNaN(aEnd)||isNaN(bStart)||isNaN(bEnd)) continue;
              if (aStart < bEnd && aEnd > bStart) conflicts++;
            }
          }
        });

        setRoomsOccupied(occupiedRoomIds.size);
        // if backend provided stats use it, otherwise fallback to computed
        if (conflictsResp && typeof conflictsResp.total_conflicts !== 'undefined') {
          setConflictsDetected(conflictsResp.total_conflicts || 0);
        } else {
          setConflictsDetected(conflicts);
        }

      } catch (e) {
        console.error('Failed fetching stats', e);
      } finally {
        setStaticsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch non-validated exams
  useEffect(() => {
    const fetchNonValidated = async () => {
      setNonValidatedLoading(true);
      try {
        const [data, studentsResp, groupsResp] = await Promise.all([
          Exams.getNonValidated(),
          Students.getAll(),
          Groups.getAll()
        ]);

        const exams = (data && data.exams) ? data.exams : (Array.isArray(data) ? data : []);
        const students = Array.isArray(studentsResp) ? studentsResp : (studentsResp.students || []);
        const groups = Array.isArray(groupsResp) ? groupsResp : (groupsResp.groups || []);

        // Enrich exams with speciality - group name
        const enrichedExams = exams.map(exam => {
          const group = groups.find(g => g.code === exam.group_code);
          if (group) {
            const firstStudent = students.find(s => s.group_code === group.code);
            const speciality = firstStudent?.speciality || 'N/A';
            return { ...exam, group_name: `${speciality} - ${group.name}` };
          }
          return exam;
        });

        setNonValidatedExams(enrichedExams);
      } catch (err) {
        console.error('Failed fetching non-validated exams', err);
        notify && notify('error', 'Failed to load non-validated exams');
      } finally {
        setNonValidatedLoading(false);
      }
    };
    fetchNonValidated();
  }, [notify]);

  // Fetch exam requests
  useEffect(() => {
    const fetchExamRequests = async () => {
      setExamRequestsLoading(true);
      try {
        const data = await ExamRequestsAPI.getAll();
        const requests = (data && data.requests) ? data.requests : (Array.isArray(data) ? data : []);
        setExamRequests(requests);
      } catch (err) {
        console.error('Failed fetching exam requests', err);
        notify && notify('error', 'Failed to load exam requests');
      } finally {
        setExamRequestsLoading(false);
      }
    };
    fetchExamRequests();
  }, [notify]);

  const handleValidateExam = async (examId) => {
    setValidatingId(examId);
    try {
      await Exams.validateExam(examId, { validated: true });
      setNonValidatedExams(nonValidatedExams.filter(e => e.id !== examId));
      notify && notify('success', 'Exam validated successfully');
    } catch (err) {
      console.error('Failed to validate exam', err);
      notify && notify('error', 'Failed to validate exam');
    } finally {
      setValidatingId(null);
    }
  };

  const handleRequestAction = async (action) => {
    if (!selectedRequest) return;
    setRequestActionLoading(true);
    try {
      if (action === 'approve') {
        await ExamRequestsAPI.approve(selectedRequest.id);
        notify && notify('success', 'Exam request approved');
      } else if (action === 'reject') {
        await ExamRequestsAPI.reject(selectedRequest.id);
        notify && notify('success', 'Exam request rejected');
      } else if (action === 'delete') {
        await ExamRequestsAPI.remove(selectedRequest.id);
        notify && notify('success', 'Exam request deleted');
      }
      setExamRequests(examRequests.filter(r => r.id !== selectedRequest.id));
      setRequestModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to handle exam request action', err);
      notify && notify('error', `Failed to ${action} exam request`);
    } finally {
      setRequestActionLoading(false);
    }
  };

  return (
    <div className={`${styles.dashboardLayout} full scrollbar`}>
      <div className={`${styles.dashboardHeader}`}>
        <div className={`${styles.dashHead}`}>
          <Text css='h4p' align='left' text='Home/' color='var(--text-low)' size='var(--text-m)' />
          <Greeting />
        </div>
        <div className={`${styles.dashStatics} flex row gap wrap j-center`}>
          <div className={`gsap-y ${styles.dashStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
            {!staticsLoading && <StaticsCard title='Scheduled exams' value={formatNumber(animScheduled)} icon="fa-regular fa-calendar" color='#2B8CDF'/>}
          </div>
          <div className={`gsap-y ${styles.dashStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
            {!staticsLoading && <StaticsCard title='Conflicts detected' value={formatNumber(animConflicts)} icon="fa-solid fa-exclamation" color='#F78A4B'/>}
          </div>
          <div className={`gsap-y ${styles.dashStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
            {!staticsLoading && <StaticsCard title='Number Teachers' value={formatNumber(animTeachers)} icon="fa-regular fa-user" color='#9A8CE5'/>}
          </div>
          <div className={`gsap-y ${styles.dashStatic} ${styles.dashBGC} grow-1 ${staticsLoading && "shimmer"}`}>
            {!staticsLoading && <StaticsCard title='Number Students' value={formatNumber(animStudents)} icon="fa-solid fa-people-roof" color='#4FB6A3'/>}
          </div>
        </div>
      </div>
        <div className={`${styles.dashboardContent} flex row wrap gap`}>
          <div className={`${styles.dashContent} grow-3`}>
            <div className={`gsap-y ${styles.dashRooms} ${styles.dashBGC} h-max flex row j-spacebet wrap`}>
              <div className="flex column">
                <Text text='Rooms' size='var(--text-l)' color='var(--text-low)' align='left' opacity='0.5'/>
                <RoomsList classrooms={animRoomsClass} labo={animRoomsLabo} amphi={animRoomsAmphi}/>
              </div>
              <div className="flex center" style={{width: "130px"}}>
                <CircularProgress value={animRoomsOccupied} max={roomsTotal || 1} thick={8}/>
              </div>
              <div className="flex a-center gap h4w1000">
                <RoomStatic title='Available' value={animRoomsAvailable} width='8vw' color='rgb(82, 146, 97)'/>
                <RoomStatic title="Occupied" value={animRoomsOccupied} width='8vw' color='rgb(192, 68, 68)'/>
                <RoomStatic title="Maintenance" value={animRoomsMaintenance} width='8vw'/>
              </div>
            </div>
            <div className={`gsap-y overflow-h ${styles.dashReports} ${styles.dashBGC} ${nonValidatedLoading && "shimmer"}`}>
              {!nonValidatedLoading && (
                <>
                  {userRole === 'admin' ? (
                    <ListTable
                      ovh
                      title="Pending Validation"
                      rowTitles={["Module", "Group", "Date", "Time", "Action"]}
                      rowTemplate="0.25fr 0.3fr 0.2fr 0.15fr 0.1fr"
                      dataList={{ total: nonValidatedExams.length, items: nonValidatedExams }}
                      filterFunction={(exam, text) => 
                        (exam.module_name || '').toLowerCase().includes(text.toLowerCase()) ||
                        (exam.group_name || '').toLowerCase().includes(text.toLowerCase())
                      }
                      sortFunction={(a, b, sort) => {
                        if (sort === "A-Z") return (a.module_name || '').localeCompare(b.module_name || '');
                        if (sort === "Z-A") return (b.module_name || '').localeCompare(a.module_name || '');
                        return 0;
                      }}
                      rowRenderer={(exam) => (
                        <>
                          <Text align='left' text={exam.module_name || 'N/A'} size='var(--text-m)' />
                          <Text align='left' text={exam.group_name || 'N/A'} size='var(--text-m)' />
                          <Text align='left' text={exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'} size='var(--text-m)' />
                          <Text align='left' text={`${exam.start_hour || '0'}:00 - ${exam.end_hour || '0'}:00`} size='var(--text-m)' />
                          <IconButton 
                            icon={validatingId === exam.id ? 'fa-spinner fa-spin' : 'fa-solid fa-check'} 
                            onClick={() => handleValidateExam(exam.id)} 
                            title='Validate'
                            disabled={validatingId !== null}
                          />
                        </>
                      )}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px' }}>
                      <Text text='Not Authorised' align='center' size='var(--text-m)' color='var(--text-low)' />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className={`gsap-y ${styles.dashContentSide} ${styles.dashBGC} ${examRequestsLoading && "shimmer"} grow-1`}>
            {!examRequestsLoading && (
              <div className="flex column full gap" style={{ padding: '1em', overflow: 'auto', maxHeight: '100%' }}>
                <div style={{ paddingBottom: '0.5em', borderBottom: '1px solid var(--trans-grey)' }}>
                  <Text text='Exam Requests' size='var(--text-l)' align='left' />
                  <Text text={`${examRequests.length} total`} size='var(--text-s)' color='var(--text-low)' align='left' />
                </div>
                <div className="flex column gap full" style={{ overflow: 'auto' }}>
                  {examRequests.length === 0 ? (
                    <Text text='No exam requests' size='var(--text-m)' color='var(--text-low)' align='center' mrg='2em 0' />
                  ) : (
                    examRequests.map((req, idx) => (
                      <div key={req.id || idx} onClick={() => { setSelectedRequest(req); setRequestModalOpen(true); }} style={{ cursor: 'pointer' }}>
                        <ExamRequest
                          name={req.module?.name || req.module_name || 'N/A'}
                          date={req.date ? new Date(req.date).toLocaleDateString() : 'N/A'}
                          time={`${req.start_hour || '0'}:00 - ${req.end_hour || '0'}:00`}
                          room={req.room?.name || req.room_name || 'N/A'}
                          status={(req.status || 'pending').toLowerCase()}
                          border='1px solid var(--trans-grey)'
                          bg='var(--bg)'
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
      </div>

      {/* Exam Request Modal */}
      <Popup isOpen={requestModalOpen} blur={2} bg='rgba(0,0,0,0.2)' onClose={() => { setRequestModalOpen(false); setSelectedRequest(null); }}>
        <div style={{ minWidth: '300px', padding: '1.5em' }} className={`${styles.dashBGC}`}>
          <div className="flex row a-center j-spacebet">
            <Text text='Exam Request Details' size='var(--text-l)' color='var(--text)' align='left' />
            <IconButton icon='fa-solid fa-xmark' onClick={() => { setRequestModalOpen(false); setSelectedRequest(null); }} />
          </div>
          {selectedRequest && (
            <div className="flex column gap" style={{marginTop: '1em'}}>
              <div className="flex row a-center j-spacebet">
                <Text text='Module' size='var(--text-m)' color='var(--text-low)' />
                <Text text={selectedRequest.module?.name || selectedRequest.module_name || 'N/A'} size='var(--text-m)' align='right' />
              </div>
              <div className="flex row a-center j-spacebet">
                <Text text='Date' size='var(--text-m)' color='var(--text-low)' />
                <Text text={selectedRequest.date ? new Date(selectedRequest.date).toLocaleDateString() : 'N/A'} size='var(--text-m)' align='right' />
              </div>
              <div className="flex row a-center j-spacebet">
                <Text text='Time' size='var(--text-m)' color='var(--text-low)' />
                <Text text={`${selectedRequest.start_hour || '0'}:00 - ${selectedRequest.end_hour || '0'}:00`} size='var(--text-m)' align='right' />
              </div>
              <div className="flex row a-center j-spacebet">
                <Text text='Room' size='var(--text-m)' color='var(--text-low)' />
                <Text text={selectedRequest.room?.name || selectedRequest.room_name || 'N/A'} size='var(--text-m)' align='right' />
              </div>
              <div className="flex row a-center j-spacebet">
                <Text text='Status' size='var(--text-m)' color='var(--text-low)' />
                <Text text={(selectedRequest.status || 'pending').charAt(0).toUpperCase() + (selectedRequest.status || 'pending').slice(1)} size='var(--text-m)' align='right' color={selectedRequest.status === 'approved' ? '#4FB6A3' : selectedRequest.status === 'rejected' ? '#F1504A' : '#7D7D7D'} />
              </div>
              <div className="flex row j-end gap" style={{marginTop: '1.5em', gap: '0.5em'}}>
                {selectedRequest.status === 'pending' ? (
                  <>
                    <SecondaryButton text='Delete' onClick={() => handleRequestAction('delete')} isLoading={requestActionLoading} />
                    <SecondaryButton text='Reject' onClick={() => handleRequestAction('reject')} isLoading={requestActionLoading} />
                    <PrimaryButton text='Approve' onClick={() => handleRequestAction('approve')} isLoading={requestActionLoading} />
                  </>
                ) : (
                  <SecondaryButton text='Delete' onClick={() => handleRequestAction('delete')} isLoading={requestActionLoading} />
                )}
              </div>
            </div>
          )}
        </div>
      </Popup>
    </div>
  )
}

export default AdminDashboard