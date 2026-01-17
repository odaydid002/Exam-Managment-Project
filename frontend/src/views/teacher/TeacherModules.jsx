import './teacher.css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useState, useEffect } from 'react';
import { authCheck } from '../../API/auth';
import { get as getTeacher } from '../../API/teachers';
import { getByTeacher as getModulesByTeacher } from '../../API/modules';
// exam requests functionality removed (was using getTeacherExams)

import Text from '../../components/text/Text';
import ExamRequest from '../../components/containers/ExamRequest';
import StaticsCard from '../../components/containers/StaticsCard';
import ListTableClient from '../../components/tables/ListTableClient';
import Button from '../../components/buttons/Button';
import IconButton from '../../components/buttons/IconButton';
import Popup from '../../components/containers/Popup';
import SelectInput from '../../components/input/SelectInput';
import TextInput from '../../components/input/TextInput';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import Exam from '../../components/containers/Exam';
import { useNotify } from '../../components/loaders/NotificationContext';
import { getByTeacher as getRequestsByTeacher, add as addExamRequest } from '../../API/examRequests';
import { getAll as getAllGroups } from '../../API/groups';
import { getAll as getAllExams } from '../../API/exams';
import { getAll as getAllRooms } from '../../API/rooms';
import { getAll as getAllStudents } from '../../API/students';

const TeacherModules = () => {
  document.title = 'Unitime - Modules';
  const { notify } = useNotify();

  const [_loading, setLoading] = useState(true);
  const [modulesLoading, _setModulesLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [_exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  // exams list removed — exam requests are now static/placeholders
  const [_profile, setProfile] = useState(null);
  const [addExamModal, setAddExamModal] = useState(false);
  const [groupsList, setGroupsList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [examFormData, setExamFormData] = useState({
    module_id: '',
    exam_type: 'Exam',
    date: '',
    start_hour: '',
    end_hour: '',
    group_code: '',
    level: '',
    message: '',
    room: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useGSAP(() => {
    gsap.from('.gsap-y', { y: 30, opacity: 0, duration: 0.45, stagger: 0.04 });
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const auth = await authCheck();
        const user = auth?.user || auth || null;
        let teacher = null;
        if (user && user.id) {
          try { teacher = await getTeacher(user.id); } catch (err) { console.debug('getTeacher failed', err); }
        }
        if (!teacher) {
          try {
            const res = await fetch('/api/teacher/profile');
            if (res.ok) teacher = await res.json();
          } catch (err) { console.debug('fallback profile failed', err); }
        }

        if (!mounted) return;
        setProfile(teacher || null);
        const teacherNumber = teacher?.number ?? teacher?.id ?? null;

        // load modules
        if (teacherNumber) {
          _setModulesLoading(true)
          try {
            const resp = await getModulesByTeacher(teacherNumber);
            const items = Array.isArray(resp) ? resp : (resp.modules || resp.data || []);
            if (mounted) setModules(items || []);
            // load groups list for the select
            try {
              const [gresp, sresp] = await Promise.all([
                getAllGroups(),
                getAllStudents()
              ]);
              const gitems = Array.isArray(gresp) ? gresp : (gresp.groups || gresp.data || []);
              const sitems = Array.isArray(sresp) ? sresp : (sresp.students || sresp.data || []);

              // Enrich groups with speciality from first student
              const enrichedGroups = gitems.map(g => {
                const firstStudent = sitems.find(s => s.group_code === g.code);
                const speciality = firstStudent?.speciality || 'N/A';
                return { ...g, displayName: `${speciality} - ${g.name}` };
              });

              if (mounted) setGroupsList(enrichedGroups || []);
            } catch (err) {
              console.debug('Failed to load groups or students', err)
              if (mounted) setGroupsList([])
            }

            // load rooms list for the select
            try {
              const rresp = await getAllRooms();
              const ritems = Array.isArray(rresp) ? rresp : (rresp.rooms || rresp.data || []);
              if (mounted) setRoomsList(ritems || []);
            } catch (err) {
              console.debug('Failed to load rooms', err)
              if (mounted) setRoomsList([])
            }

            // load planning exams and compute scheduled modules count for this teacher
            setExamsLoading(true)
            try {
              const exResp = await getAllExams();
              const exItems = Array.isArray(exResp) ? exResp : (exResp.exams || exResp.data || []);
              if (mounted) setExams(exItems || []);
              // compute count of modules that appear in exams and are assigned to this teacher
              const moduleKeys = new Set((items || []).map(m => String(m.code || m.module_code || m.name || '').toLowerCase()).filter(Boolean));
              const scheduledSet = new Set();
              (exItems || []).forEach(ex => {
                const mkey = String(ex.module_code || ex.module_name || '').toLowerCase();
                if (mkey && moduleKeys.has(mkey)) scheduledSet.add(mkey);
              })
              if (mounted) setScheduledCount(scheduledSet.size)
            } catch (err) {
              console.debug('Failed to load planning exams', err)
              if (mounted) setExams([])
            } finally {
              if (mounted) setExamsLoading(false)
            }

          } catch (err) {
            console.error('Failed to load modules', err);
            notify && notify('error', 'Failed to load modules');
            if (mounted) setModules([]);
          } finally {
            if (mounted) _setModulesLoading(false)
          }

          // load exam requests for this teacher
          try {
            setRequestsLoading(true)
            const r = await getRequestsByTeacher(teacherNumber)
            console.log(r)
            const reqItems = Array.isArray(r) ? r : (r.requests || r.data || [])
            if (mounted) setRequests(reqItems || [])
          } catch (err) {
            console.debug('Failed to load exam requests', err)
            if (mounted) setRequests([])
          } finally {
            if (mounted) setRequestsLoading(false)
          }

        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false };
  }, [notify]);

  const openAskExam = (module) => {
    setExamFormData({
      module_id: module?.code || module?.module_code || '',
      exam_type: 'Exam',
      date: '',
      start_hour: '',
      end_hour: '',
      group_code: '',
      level: '',
      message: '',
      room: ''
    });
    setAddExamModal(true);
  }

  const handleSubmitExamRequest = async () => {
    if (!examFormData.module_id) {
      notify && notify('error', 'Please select a module')
      return
    }
    if (!examFormData.date || !examFormData.start_hour || !examFormData.end_hour) {
      notify && notify('error', 'Please provide date and time')
      return
    }
    if (!examFormData.group_code) {
      notify && notify('error', 'Please select a group')
      return
    }
    setFormLoading(true)
    try {
      const payload = {
        id_teacher: (_profile?.number || _profile?.id || null) !== null ? String(_profile?.number || _profile?.id) : null,
        id_module: examFormData.module_id,
        exam_type: examFormData.exam_type,
        group_code: examFormData.group_code,
        level: examFormData.level,
        exam_date: examFormData.date || null,
        start_hour: examFormData.start_hour !== '' && examFormData.start_hour !== null ? parseFloat(examFormData.start_hour) : null,
        end_hour: examFormData.end_hour !== '' && examFormData.end_hour !== null ? parseFloat(examFormData.end_hour) : null,
        room: examFormData.room !== undefined && examFormData.room !== null ? String(examFormData.room) : null
      }
      const res = await addExamRequest(payload)
      const created = Array.isArray(res) ? res[0] : (res.request || res.data || res)
      // prepend the created request if available
      setRequests(prev => (created ? [created, ...prev] : prev))
      notify && notify('success', 'Exam request submitted')
      setAddExamModal(false)
      setExamFormData({ module_id: '', exam_type: 'Exam', date: '', start_hour: '', end_hour: '', group_code: '', level: '', message: '', room: '' })
    } catch (err) {
      console.error('Failed to submit exam request', err)
      notify && notify('error', 'Failed to submit exam request')
    } finally {
      setFormLoading(false)
    }
  }

  const examCounts = {
    approved: (requests || []).filter(e => (e.status || '').toLowerCase() === 'approved').length,
    rejected: (requests || []).filter(e => (e.status || '').toLowerCase() === 'rejected').length,
    pending: (requests || []).filter(e => (e.status || '').toLowerCase() === 'pending' || !e.status).length,
  };

  return (
    <div className="modulesLayout full scrollbar overflow-y-a">
      <div className="flex row gap wrap gsap-y">
        <div className={`grow-1 gsap-y BGC pd ${modulesLoading && 'shimmer'}`} style={{minWidth: '150px'}}>
          {!modulesLoading &&
            <StaticsCard title='Modules' value={String(modules.length || 0)} icon='fa-solid fa-book' color='#4FB6A3' />
          }
        </div>
        <div className={`grow-1 gsap-y BGC pd ${(requestsLoading || examsLoading || modulesLoading) && 'shimmer'}`} style={{minWidth: '150px'}}>
          {!(requestsLoading || examsLoading || modulesLoading) &&
            <StaticsCard title='Scheduled exams' value={String(scheduledCount || 0)} icon='fa-solid fa-calendar' color='#0092FF' />
          }
        </div>
        <div className='grow-1 gsap-y BGC pd' style={{minWidth: '150px'}}>
          <StaticsCard title='Groups' value={'-'} icon='fa-solid fa-users' color='#A78BFA' />
        </div>
        <div className='grow-1 gsap-y BGC pd' style={{minWidth: '150px'}}>
          <StaticsCard title='Total Students' value={'-'} icon='fa-solid fa-people-roof' color='#FECACA' />
        </div>
      </div>
      <div className='modulesBody'>
        <div className={`BGC pd gsap-y ${modulesLoading && "shimmer"}`}>
          {!modulesLoading && <>
            <ListTableClient
              title= "My Modules"
              rowTitles={["Module", "Type", "Groups", "Students", "Action"]}
              rowTemplate="0.6fr 0.5fr repeat(2, 0.3fr) 0.4fr"
              dataList={{ total: modules.length, items: modules }}
              filterFunction={(m, text) => {
                const q = (text || '').toString().toLowerCase();
                const hay = `${m.name || m.title || ''} ${m.type || m.typ || ''}`.toLowerCase();
                return hay.includes(q);
              }}
              sortFunction={(a, b) => (String(a.name || '').localeCompare(String(b.name || '')))}
              rowRenderer={(m) => (
                <>
                  <div className='flex column'>
                    <Text text={`${m.name || '-'}`} align='left' size="var(--text-m)"/>
                    <Text align="left" text={`#${m.code} - ${m.short_name}`} size='0.75rem' opacity='0.6' />
                  </div>
                  <div>
                    <Text align="left" size="var(--text-m)" text={m.type || '-'} />
                    <Text align="left" size="var(--text-m)" text={`Factor: ${m.factor} - Credit: ${m.credits}`} color="var(--text-low)"/>
                  </div>
                    <Text text={String(m.groups_count ?? m.groups ?? '-') } />
                    <Text text={String(m.students_count ?? m.students ?? '-') } />
                      <div className='flex row a-center'>
                        <Button icon='fa-solid fa-plus' text='Ask for Exam' onClick={() => openAskExam(m)} />
                      </div>
                </>
              )}
            />
          </>}
        </div>
        <div className="modulesSide">
          <div className={`flex column BGC pd gsap-y ${requestsLoading && "shimmer"}`}>
            {!requestsLoading && <>
              <Text align="left" text='Exam Requests Summary' size='var(--text-m)' mrg="0 0 1em 0"/>
              <div className='full flex row center gap' style={{justiySelf: "center"}}>
                <div style={{ background: '#4fb6aa15', padding: '1em 1.5em', borderRadius: '8px' }}>
                  <Text text={String(examCounts.approved)} size='var(--text-m)' color="#4FB6A3"/>
                  <Text text='Approved' size='0.75rem' opacity='0.6' color="#4FB6A3"/>
                </div>
                <div style={{ background: '#f1504a15',  padding: '1em 1.5em', borderRadius: '8px' }}>
                  <Text text={String(examCounts.rejected)} size='var(--text-m)' color="#F1504A"/>
                  <Text text='Rejected' size='0.75rem' opacity='0.6' color="#F1504A" />
                </div>
                <div style={{ background: '#86868619', padding: '1em 1.5em', borderRadius: '8px' }}>
                  <Text text={String(examCounts.pending)} size='var(--text-m)' color="#868686"/>
                  <Text text='Pending' size='0.75rem' opacity='0.6' color="#868686"/>
                </div>
              </div>
            </>}
          </div>

          <div className={`BGC pd gsap-y ${requestsLoading && "shimmer"}`}>
            {!requestsLoading && <>
              <Text text='Exam requests' size='var(--text-m)' />
              <div className="flex column gap">
                {(requests || []).filter(Boolean).slice(0, 6).map((ex, idx) => {
                  const formatHour = (h) => {
                    if (h === null || h === undefined || h === '') return '';
                    const n = typeof h === 'number' ? h : parseFloat(h);
                    if (Number.isNaN(n)) return String(h);
                    const hh = Math.floor(n);
                    const mm = (n - hh) === 0.5 ? '30' : '00';
                    return `${String(hh).padStart(2, '0')}:${mm}`;
                  }
                  const dateStr = (ex?.date || ex?.exam_date || ex?.created_at || '') ? String(ex?.date || ex?.exam_date || ex?.created_at).split('T')[0] : '';
                  const timeStr = `${formatHour(ex.start_hour)}${ex.start_hour ? ' - ' : ''}${formatHour(ex.end_hour)}`;
                  const roomStr = ex.room_name || ex.room || (ex.room_id ? String(ex.room_id) : '-') || '-';
                  const groupLabel = ex.groupe_name || ex.group_name || ex.group_code || '';
                  const moduleLabel = ex.module_name || '-';
                  return (
                    <ExamRequest
                      key={ex.id || idx}
                      name={`${moduleLabel}${groupLabel ? ` (${groupLabel})` : ''}`}
                      date={dateStr}
                      time={timeStr}
                      room={roomStr}
                      status={ex.status || 'pending'}
                    />
                  )
                })}
                {(requests || []).length === 0 && <Text text='No exam requests' size='0.9rem' opacity='0.7' />}
              </div>
            </>}
          </div>
        </div>
        <Popup isOpen={addExamModal} blur={2} bg='rgba(0,0,0,0.2)' onClose={()=>{ setAddExamModal(false); setExamFormData({ module_id: '', exam_type: 'Exam', date: '', start_hour: '', end_hour: '', group_code: '', level: '', message: '', room: '' }) }}>
          <div className={`BGC pd`} style={{ maxWidth: '400px'}}>
            <div className='flex row a-center j-spacebet w100'>
              <Text text='Ask for Exam' size='var(--text-l)' />
              <IconButton icon='fa-solid fa-xmark' bg="transparent" color="var(--text)" onClick={() => setAddExamModal(false)} />
            </div>
            <div className='flex column gap mrv'>
              <div className='flex row gap' style={{ alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}>
                  <SelectInput label='Module' value={examFormData.module_id} onChange={(v) => setExamFormData(prev => ({ ...prev, module_id: v || '' }))} options={(modules || []).map(m => ({ value: m.code || m.module_code || m.id || '', text: m.name || m.title || m.module_name || m.code || '' }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <SelectInput label='Exam Type' options={[{value:'Exam', text:'Exam'},{value:'TP', text:'TP'},{value:'TD', text:'TD'}]} value={examFormData.exam_type} onChange={(v)=> setExamFormData(prev=>({...prev, exam_type: v || 'Exam'}))} />
                </div>
              </div>

              <div className='flex row gap'>
                <div style={{ flex: 1 }}>
                  <TextInput label='Date' type='date' value={examFormData.date} onchange={(e)=> setExamFormData(prev=>({...prev, date: e.target.value}))} />
                </div>
                <div style={{ flex: 1 }}>
                  <TextInput label='Start Hour' type='number' step='0.5' value={examFormData.start_hour} onchange={(e)=> setExamFormData(prev=>({...prev, start_hour: e.target.value}))} />
                </div>
                <div style={{ flex: 1 }}>
                  <TextInput label='End Hour' type='number' step='0.5' value={examFormData.end_hour} onchange={(e)=> setExamFormData(prev=>({...prev, end_hour: e.target.value}))} />
                </div>
              </div>

              <div className='flex row gap'>
                <div style={{ flex: 1 }}>
                  <SelectInput label='Room' value={examFormData.room} onChange={(v) => setExamFormData(prev => ({ ...prev, room: v || '' }))} options={(roomsList || []).map(r => ({ value: r.code || r.id || r.name || '', text: r.name || r.code || r.id || '' }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <SelectInput label='Level' value={examFormData.level} onChange={(v)=> setExamFormData(prev=>({...prev, level: v || ''}))} options={[
                    { value: 'Licence 1', text: 'Licence 1' },
                    { value: 'Licence 2', text: 'Licence 2' },
                    { value: 'Licence 3', text: 'Licence 3' },
                    { value: 'Master 1', text: 'Master 1' },
                    { value: 'Master 2', text: 'Master 2' },
                    { value: 'Engineer 1', text: 'Engineer 1' },
                    { value: 'Engineer 2', text: 'Engineer 2' },
                    { value: 'Engineer 3', text: 'Engineer 3' },
                    { value: 'Engineer 4', text: 'Engineer 4' },
                    { value: 'Engineer 5', text: 'Engineer 5' }
                  ]} />
                </div>
              </div>
                <div style={{ flex: 1 }}>
                  <SelectInput label='Group' value={examFormData.group_code} onChange={(v) => setExamFormData(prev => ({ ...prev, group_code: v || '' }))} options={(groupsList || []).map(g => ({ value: g.code || g.id || '', text: g.displayName || g.name || g.code || '' }))} />
                </div>

              <div>
                <TextInput label='Optional message' type='text' value={examFormData.message} onchange={(e)=> setExamFormData(prev=>({...prev, message: e.target.value}))} />
              </div>

              <div className='flex row a-center gap pdt' style={{ justifyContent: 'flex-end' }}>
                <SecondaryButton text='Cancel' onClick={()=>{ setAddExamModal(false) }} />
                <PrimaryButton isLoading={formLoading} text='Submit Request' onClick={handleSubmitExamRequest} />
              </div>
            </div>
          </div>
        </Popup>
      </div>
    </div>
  )
}

export default TeacherModules;