import '../student/student.css';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useState, useEffect } from "react"
import { useNotify } from '../../components/loaders/NotificationContext';
import { authCheck } from '../../API/auth';

import CalendarPicker from '../../components/calendar/CalendarPicker';
import Text from '../../components/text/Text';
import SelectInput from '../../components/input/SelectInput';
import IconButton from '../../components/buttons/IconButton';
import TextInput from '../../components/input/TextInput';
import Checkbox from '../../components/input/Checkbox';
import CalendarView from '../../components/calendar/CalendarView';
import { Specialities, Groups, Rooms } from '../../API'
import { getTeacherExams } from '../../API/surveillance'
import { get as getTeacher } from '../../API/teachers'
import Popup from '../../components/containers/Popup'
import Profile from '../../components/containers/Profile'

const TeacherSchedule = () => {

  document.title = "Unitime - Schedule";

  const { notify } = useNotify();

  const [filtersLoading, _setFiltersLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [filterStartdate, setFilterStartdate] = useState("");
  const [filterEnddate, setFilterEnddate] = useState("");
  const [filterRoom, setFilterRoom] = useState("*");
  const [filterLevel, setFilterLevel] = useState("*");
  const [filterExamType, _setFilterExamType] = useState("*");
  const [filterSpeciality, setFilterSpeciality] = useState("*");
  const [filterGroup, setFilterGroup] = useState("*");

  const [specialitiesOptions, setSpecialitiesOptions] = useState([{ value: '*', text: 'All Specialities' }]);
  const [groupsOptions, setGroupsOptions] = useState([{ value: '*', text: 'All Groups' }]);
  const [roomsOptions, setRoomsOptions] = useState([{ value: '*', text: 'All Rooms' }]);

  const levelOptions = [
    { value: '*', text: 'All Levels' },
    { value: 'L1', text: 'Licence 1' },
    { value: 'L2', text: 'Licence 2' },
    { value: 'L3', text: 'Licence 3' },
    { value: 'M1', text: 'Master 1' },
    { value: 'M2', text: 'Master 2' },
    { value: 'Eng1', text: 'Engineer 1' },
  ]

  const normalizeLevelValue = (val) => {
    if (!val && val !== 0) return '';
    const s = String(val).toLowerCase();
    const num = (s.match(/\d+/) || [])[0];
    if (s.includes('master') || s.startsWith('m')) {
      return num ? `M${num}` : 'M1';
    }
    if (s.includes('licence') || s.startsWith('l')) {
      return num ? `L${num}` : 'L1';
    }
    if (s.includes('engineer') || s.includes('eng')) {
      return num ? `Eng${num}` : 'Eng1';
    }
    return String(val);
  }

  const [_profile, setProfile] = useState(null);
  const [teacherNumber, setTeacherNumber] = useState(null);

  const [examsRaw, setExamsRaw] = useState([]);
  const [_examsLoading, setExamsLoading] = useState(false);
  const [specialitiesLoaded, setSpecialitiesLoaded] = useState(false);
  const [roomsLoaded, setRoomsLoaded] = useState(false);
  const [examsLoaded, setExamsLoaded] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSurveillances, setPopupSurveillances] = useState([]);

  const _openSurveillancesPopup = (list) => {
    setPopupSurveillances(list || []);
    setPopupOpen(true);
  }

  const closeSurveillancesPopup = () => {
    setPopupOpen(false);
    setPopupSurveillances([]);
  }

  useGSAP(() => {
    gsap.from('.gsap-y', {
      y: 50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
    })
  });

  const filterEvents = (list, filters) => {
    return list.filter(e => {
      if (filters.startDate && filters.startDate !== "") {
        const evDate = new Date(e.day);
        const s = new Date(filters.startDate);
        const en = filters.endDate && filters.endDate !== "" ? new Date(filters.endDate) : null;
        if (en) {
          if (evDate < s || evDate > en) return false;
        } else {
          if (evDate < s) return false;
        }
      }
      if (filters.room && filters.room !== "" && filters.room !== "*") {
        const evRoom = String(e.room ?? e.room_name ?? e.room_id ?? e.raw?.room_id ?? "");
        const fRoom = String(filters.room);
        if (evRoom !== fRoom && String(e.room_id ?? e.room ?? '') !== fRoom) return false;
      }
      if (filters.level && filters.level !== "" && filters.level !== "*") {
        const fLevelNorm = normalizeLevelValue(filters.level).toLowerCase();
        const evLevelRaw = (e.level ?? e.level_name ?? e.raw?.level ?? e.group_code ?? e.group_name ?? e.module ?? "");
        const evLevelNorm = normalizeLevelValue(evLevelRaw).toLowerCase();
        if (!evLevelNorm) return false;
        if (!(evLevelNorm === fLevelNorm || evLevelNorm.includes(fLevelNorm) || fLevelNorm.includes(evLevelNorm))) return false;
      }
      if (filters.speciality && filters.speciality !== "" && filters.speciality !== "*") {
        const specFilter = String(filters.speciality);
        const opt = (specialitiesOptions || []).find(o => String(o.value) === specFilter || String(o.value) === String(specFilter));
        if (opt) {
          const optText = String(opt.text || "");
          const specialityVal = String(e.speciality || "");
          const matches = (
            specialityVal === specFilter ||
            specialityVal === optText ||
            specialityVal.toLowerCase().includes(optText.toLowerCase()) ||
            optText.toLowerCase().includes(specialityVal.toLowerCase())
          );
          if (!matches) return false;
        } else {
          if (!String(e.speciality).toLowerCase().includes(specFilter.toLowerCase()) && !specFilter.toLowerCase().includes(String(e.speciality).toLowerCase())) return false;
        }
      }
      if (filters.group && filters.group !== "" && filters.group !== "*") {
        const evGroup = String(e.group_code ?? e.group_name ?? e.group ?? e.raw?.group_code ?? "");
        const fGroup = String(filters.group);
        if (!(evGroup === fGroup || evGroup.includes(fGroup) || fGroup.includes(evGroup))) return false;
      }
      if (filters.examType && filters.examType !== "" && filters.examType !== "*") {
        if (e.type !== filters.examType) return false;
      }
      return true;
    })
  }

  const transformExamForCalendar = (e) => ({
    id: e.surveillance_id ?? e.exam_id ?? e.id,
    day: e.date || e.day,
    startHour: e.startHour ?? e.start_hour,
    endHour: e.endHour ?? e.end_hour,
    room: e.room,
    type: e.exam_type || e.type,
    module: e.module_name || e.module
  });

  // load select options
  useEffect(() => {
    const loadSpecialities = async () => {
      try {
        const resp = await Specialities.getAll()
        const items = Array.isArray(resp) ? resp : (resp.specialities || [])
        const opts = [{ value: '*', text: 'All Specialities' }, ...items.map(s => ({ value: s.id ?? s.code ?? s.name, text: s.name ?? s.title }))]
        setSpecialitiesOptions(opts)
        setSpecialitiesLoaded(true);
      } catch (err) {
        console.error('Failed to load specialities', err)
        notify && notify('error', 'Failed to load specialities')
        setSpecialitiesLoaded(true);
      }
    }

    const loadRooms = async () => {
      try {
        const resp = await Rooms.getAll()
        const items = Array.isArray(resp) ? resp : (resp.rooms || [])
        const opts = [{ value: '*', text: 'All Rooms' }, ...items.map(r => ({ value: r.id ?? r.name ?? r.code, text: r.name ?? r.code }))]
        setRoomsOptions(opts)
        setRoomsLoaded(true);
      } catch (err) {
        console.error('Failed to load rooms', err)
        notify && notify('error', 'Failed to load rooms')
        setRoomsLoaded(true);
      }
    }

    loadSpecialities();
    loadRooms();
  }, [notify])

  

  // load profile -> teacherNumber
  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const auth = await authCheck();
        const user = auth?.user || auth || null;
        let prof = null;
        if (user) {
          const identifier = user.id;
          if (identifier) {
            try {
              prof = await getTeacher(identifier);
            } catch (err) {
              console.debug('teachers.get failed', err);
            }
          }
        }

        if (!prof) {
          try {
            const res = await fetch('/api/teacher/profile');
            if (res.ok) prof = await res.json();
          } catch (err) { console.debug('fallback /api/teacher/profile failed', err); }
        }

        if (!mounted) return;
        if (!prof) return;
        setProfile(prof);
        setTeacherNumber(prof.number ?? prof.id ?? null);
      } catch (err) {
        console.error('Failed to load teacher profile', err);
        notify && notify('error', 'Failed to load teacher profile');
      }
    }

    loadProfile();
    return () => { mounted = false };
  }, [notify])

  // load teacher exams (surveillances)
  useEffect(() => {
    if (!teacherNumber) return;
    let mounted = true;
    const loadMyExams = async () => {
      try {
        setExamsLoading(true);
        const resp = await getTeacherExams(teacherNumber);
        const items = Array.isArray(resp) ? resp : (resp.exams || resp.data || []);
        const mapped = (items || []).map(ex => ({
          surveillance_id: ex.surveillance_id ?? ex.id ?? null,
          status: ex.status ?? 'pending',
          exam_id: ex.exam_id ?? ex.id ?? null,
          exam_type: ex.exam_type ?? ex.type ?? '',
          module_name: ex.module_name ?? ex.module ?? ex.module_code ?? '',
          module_code: ex.module_code ?? '',
          module_credit: ex.module_credit ?? ex.credit ?? null,
          module_factor: ex.module_factor ?? ex.factor ?? null,
          group_code: ex.group_code ?? ex.group ?? '',
          group_name: ex.group_name ?? ex.group ?? ex.group_code ?? '',
          section: ex.section ?? ex.section_name ?? '',
          speciality: ex.speciality ?? ex.speciality_name ?? ex.department ?? '',
          room: ex.room_name ?? ex.room ?? ex.room_id ?? '',
          room_id: ex.room_id ?? null,
          date: (function(){ try { const d = new Date(ex.date || ex.day); if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]; return (ex.date||ex.day||'').split('T')[0] || ''; } catch { return ''; } })(),
          day: (function(){ try { const d = new Date(ex.date || ex.day); if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]; return (ex.date||ex.day||'').split('T')[0] || ''; } catch { return ''; } })(),
          startHour: ex.start_hour ?? ex.startHour ?? ex.start ?? null,
          endHour: ex.end_hour ?? ex.endHour ?? ex.end ?? null,
          level: ex.level ?? '',
          raw: ex,
          surveillances: ex.surveillances || [],
        }));

        if (!mounted) return;
        setExamsRaw(mapped);
      } catch (err) {
        console.error('Failed to load teacher exams', err);
        if (mounted) setExamsRaw([]);
      } finally {
        if (mounted) {
          setExamsLoading(false);
          setExamsLoaded(true);
        }
      }
    }

    loadMyExams();
    return () => { mounted = false }
  }, [teacherNumber]);

  useEffect(() => {
    const allLoaded = specialitiesLoaded && roomsLoaded && examsLoaded;
    setCalendarLoading(!allLoaded);
  }, [specialitiesLoaded, roomsLoaded, examsLoaded]);

  useEffect(() => {
    if (filterSpeciality && filterSpeciality !== '*') {
      const loadGroupsFor = async (specialityId) => {
        try {
          const params = {}
          if (specialityId && specialityId !== '*') params.speciality_id = specialityId
          const resp = await Groups.getAll(params)
          const items = Array.isArray(resp) ? resp : (resp.groups || [])
          const opts = [{ value: '*', text: 'All Groups' }, ...items.map(g => ({ value: g.code ?? g.id ?? g.name, text: g.name }))]
          setGroupsOptions(opts)
        } catch (err) {
          console.error('Failed to load groups', err)
          notify && notify('error', 'Failed to load groups')
        }
      }
      loadGroupsFor(filterSpeciality);
    }
  }, [filterSpeciality, notify]);

  return (
    <div className={`full flex column scrollbar overflow-y-a gap`} style={{ padding: "1em 1em 1em 0" }}>
      <div className="flex row a-center j-spacebet" style={{ height: "3.5em" }}>
        <Text text='Schedule - Calendar' size='var(--text-m)' opacity='0.8' />
        <div className="flex row a-center gap" style={{ paddingRight: "1em" }}>
          <SelectInput
            bg='var(--bg)'
            icon="fa-solid fa-book-bookmark "
            options={specialitiesOptions}
            value={filterSpeciality}
            onChange={(v) => { setFilterSpeciality(v); }}
          />
          <SelectInput
            bg='var(--bg)'
            icon="fa-solid fa-graduation-cap"
            options={levelOptions}
            value={filterLevel}
            onChange={(v) => setFilterLevel(v)}
          />
          <SelectInput
            bg='var(--bg)'
            icon="fa-solid fa-clipboard-list"
            options={groupsOptions}
            value={filterGroup}
            onChange={(v) => setFilterGroup(v)}
          />
          <IconButton color='var(logo)' icon='fa-solid fa-download' onClick={() => { }} />
          <IconButton color='var(logo)' icon='fa-solid fa-print' onClick={() => { }} />
        </div>
      </div>
      <div className="scheduleBody" style={{ minHeight: "calc(100vh - 3.5em - 2em)" }}>
        <div className="scheduleSide">
          <div className={`scheduleSearch BGC gsap-y pd ${filtersLoading && "shimmer"}`}>{!filtersLoading && <>
            <TextInput width='calc(100%-2em)' type='search' icon="fa-solid fa-magnifying-glass" placeholder='Search...' label="Search" />
            <SelectInput bg='var(--bg)' label='Room' options={roomsOptions} value={filterRoom} onChange={(v) => setFilterRoom(v)} />
            <Text text='Exam Type' size='var(--text-m)' align='left' opacity='0.6' mrg='1em 0 0 0' />
            <div className="flex row wrap gap a-center pdv">
              <Checkbox label="Final Exam" />
              <Checkbox label="Catch-Up" />
              <Checkbox label="Tutorials" />
              <Checkbox label="Practical work" />
            </div>
          </>}</div>
          <div className={`schedulePicker flex center BGC gsap-y`}>
            <CalendarPicker
              width='96%'
              onRangeSelect={(s, e) => {
                setFilterStartdate(s ? s.toISOString().split('T')[0] : "");
                setFilterEnddate(e ? e.toISOString().split('T')[0] : "");
              }}
            />
          </div>
        </div>
        <div className={`scheduleCalendar BGC gsap-y ${calendarLoading && "shimmer"} pd`}>{!calendarLoading && <>
          <CalendarView
            startDate={filterStartdate || new Date()}
            endDate={filterEnddate || new Date(new Date().setDate(new Date().getDate() + 7))}
            startHour={8}
            endHour={17}
            eventsList={
              filterEvents(examsRaw, {
                startDate: filterStartdate,
                endDate: filterEnddate,
                room: filterRoom,
                level: filterLevel,
                examType: filterExamType,
                speciality: filterSpeciality,
                group: filterGroup
              }).map(transformExamForCalendar)
            }
            onConflict={() => { }}
            onEventClick={() => { }}
            onEventDelete={() => { }}
            onEventSurveillance={() => { }}
            readOnly={true}
          />
        </>}</div>
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
                  <Text text={`${t.adj ? t.adj + '. ' : ''}${t.fname || ''} ${t.lname || ''}`} />
                  <Text text={t.email || t.phone || t.teacher_number || ''} size='0.75rem' opacity='0.6' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </div>
  )
}

export default TeacherSchedule