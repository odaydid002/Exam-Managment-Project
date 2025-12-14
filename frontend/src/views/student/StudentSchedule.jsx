import './student.css';

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
import { get as getStudent } from '../../API/students';

const StudentSchedule = () => {

  document.title = "Unitime - Schedule";

  const [filtersLoading, setFiltersLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [filterStartdate, setFilterStartdate] = useState("");
  const [filterEnddate, setFilterEnddate] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterExamType, setFilterExamType] = useState("");
  const [filterSpeciality, setFilterSpeciality] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [profile, setProfile] = useState(null);

  const [specialitiesOptions, setSpecialitiesOptions] = useState([{ value: '*', text: 'All' }]);
  const [groupsOptions, setGroupsOptions] = useState([{ value: '*', text: 'All' }]);
  const [roomsOptions, setRoomsOptions] = useState([{ value: '*', text: 'All' }]);

  const levelOptions = [
    { value: '*', text: 'All Levels'},
    { value: 'L1', text: 'Licence 1'},
    { value: 'L2', text: 'Licence 2'},
    { value: 'L3', text: 'Licence 3'},
    { value: 'M1', text: 'Master 1'},
    { value: 'M2', text: 'Master 2'},
    { value: 'Eng1', text: 'Engineer 1'},
    { value: 'Eng2', text: 'Engineer 2'},
    { value: 'Eng3', text: 'Engineer 3'},
    { value: 'Eng4', text: 'Engineer 4'},
    { value: 'Eng5', text: 'Engineer 5'},
  ]

  const { notify } = useNotify();

  const examsList = [
    { id: 1, day: '2026-01-01', startHour: 9, endHour: 11, room: 'L001', type: 'Final', module: 'Arduino', level: 'M1', speciality: 'Software Engineer', section: "A1", group_name: "G1" },
    { id: 2, day: '2026-01-02', startHour: 13, endHour: 15, room: 'S202', type: 'Catch-Up', module: 'Physics 201', level: 'M1', speciality: 'Physics', section: "A1", group_name: "G2" },
    { id: 3, day: '2026-01-03', startHour: 10, endHour: 12, room: 'N101', type: 'Final', module: 'Chemistry 101', level: 'M1', speciality: 'Chemistry', section: "A1", group_name: "G3" },
    { id: 4, day: '2026-01-04', startHour: 8, endHour: 10, room: 'S003', type: 'Practical', module: 'Biology Lab', level: 'M1', speciality: 'Biology', section: "A1", group_name: "G4" }
  ];

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
        if (e.room !== filters.room) return false;
      }
      if (filters.level && filters.level !== "" && filters.level !== "*") {
        if (e.level !== filters.level) return false;
      }
      if (filters.speciality && filters.speciality !== "" && filters.speciality !== "*") {
        if (e.speciality !== filters.speciality) return false;
      }
      if (filters.group && filters.group !== "" && filters.group !== "*") {
        if (e.group && e.group !== filters.group) return false;
      }
      if (filters.examType && filters.examType !== "") {
        if (e.type !== filters.examType) return false;
      }
      return true;
    })
  }

  const transformExamForCalendar = (e) => ({
    id: e.id,
    day: e.day,
    startHour: e.startHour,
    endHour: e.endHour,
    room: e.room,
    type: e.type,
    module: e.module,
    level: e.level,
    speciality: e.speciality
  });

  useGSAP(() => {
    gsap.from('.gsap-y', {
      y: 50,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
    })
  });

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

  useEffect(() => {
    const loadSpecialities = async () => {
      try {
        const resp = await Specialities.getAll()
        const items = Array.isArray(resp) ? resp : (resp.specialities || [])
        const opts = [{ value: '*', text: 'All Specialities' }, ...items.map(s => ({ value: s.id ?? s.code ?? s.name, text: s.name ?? s.title }))]
        setSpecialitiesOptions(opts)
      } catch (err) {
        console.error('Failed to load specialities', err)
        notify && notify('error', 'Failed to load specialities')
      }
    }

    const loadRooms = async () => {
      try {
        const resp = await Rooms.getAll()
        const items = Array.isArray(resp) ? resp : (resp.rooms || [])
        const opts = [{ value: '*', text: 'All Rooms' }, ...items.map(r => ({ value: r.id ?? r.name ?? r.code, text: r.name ?? r.code }))]
        setRoomsOptions(opts)
      } catch (err) {
        console.error('Failed to load rooms', err)
        notify && notify('error', 'Failed to load rooms')
      }
    }

    loadSpecialities()
    loadRooms()
  }, [])
  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const auth = await authCheck();
        const user = auth?.user || auth || null;
        let prof = null;
        if (user) {
          const identifier = user.id || user.student_id || user.student_number || user.number || user.uuid;
          if (identifier) {
            try {
              prof = await getStudent(identifier);
            } catch (err) {
              console.debug('students.get failed', err);
            }
          }
        }
        if (!prof) {
          try {
            const res = await fetch('/api/student/profile');
            if (res.ok) prof = await res.json();
          } catch { }
        }

        if (!prof) return;
        if (!mounted) return;

        setProfile(prof);

        const specialityVal = prof.speciality_id ?? prof.speciality ?? prof.department ?? '';
        const groupVal = prof.group_code ?? prof.group_name ?? prof.group ?? '';
        const levelVal = prof.level ?? prof.study_level ?? '';

        if (specialityVal) {
          setFilterSpeciality(specialityVal);
          loadGroupsFor(specialityVal);
        }
        if (groupVal) setFilterGroup(groupVal);
        if (levelVal) setFilterLevel(levelVal);
      } catch (err) {
        console.error('Failed to load student profile', err);
        notify && notify('error', 'Failed to load student profile');
      }
    }

    loadProfile();
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!profile || !specialitiesOptions || specialitiesOptions.length <= 1) return;
    const desired = profile.speciality_id ?? profile.speciality ?? profile.department ?? null;
    if (!desired) return;

    const already = specialitiesOptions.some(o => String(o.value) === String(filterSpeciality) || String(o.text) === String(filterSpeciality));
    if (filterSpeciality && already) return;

    const findMatch = (val) => specialitiesOptions.find(o => String(o.value) === String(val) || String(o.text).toLowerCase() === String(val).toLowerCase() || String(o.text).toLowerCase().includes(String(val).toLowerCase()));

    let match = findMatch(desired);
    if (!match && profile.speciality) match = findMatch(profile.speciality);
    if (match) {
      setFilterSpeciality(match.value);
      loadGroupsFor(match.value);
    }
  }, [specialitiesOptions, profile]);

  useEffect(() => {
    if (!profile || !groupsOptions || groupsOptions.length <= 1) return;
    const desired = profile.group_code ?? profile.group ?? profile.group_name ?? null;
    if (!desired) return;

    const already = groupsOptions.some(o => String(o.value) === String(filterGroup) || String(o.text) === String(filterGroup));
    if (filterGroup && already) return;

    const findMatch = (val) => groupsOptions.find(o => String(o.value) === String(val) || String(o.text).toLowerCase() === String(val).toLowerCase() || String(o.text).toLowerCase().includes(String(val).toLowerCase()));
    let match = findMatch(desired);
    if (!match && profile.group_name) match = findMatch(profile.group_name);
    if (match) setFilterGroup(match.value);
  }, [groupsOptions, profile]);

  useEffect(() => {
    if (!profile || !levelOptions || levelOptions.length <= 1) return;
    const desired = profile.level ?? profile.study_level ?? null;
    if (!desired) return;

    const already = levelOptions.some(o => String(o.value) === String(filterLevel) || String(o.text) === String(filterLevel));
    if (filterLevel && already) return;

    const findMatch = (val) => levelOptions.find(o => String(o.value) === String(val) || String(o.text).toLowerCase() === String(val).toLowerCase() || String(o.text).toLowerCase().includes(String(val).toLowerCase()));
    const match = findMatch(desired);
    if (match) setFilterLevel(match.value);
  }, [profile]);

  return (
    <div className={`full flex column scrollbar overflow-y-a gap`} style={{ padding: "1em 1em 1em 0" }}>
      <div className="flex row a-center j-spacebet" style={{ height: "3.5em" }}>
        <Text text='Schedule - Calendar' size='var(--text-m)' opacity='0.8' />
        <div className="flex row a-center gap" style={{ paddingRight: "1em" }}>
          <SelectInput
            bg='var(--bg)'
            icon="fa-solid fa-book-bookmark"
            options={specialitiesOptions}
            value={filterSpeciality}
            initial={profile ? (profile.speciality_id ?? profile.speciality ?? profile.department ?? null) : null}
            onChange={(v) => { setFilterSpeciality(v); loadGroupsFor(v); }}
          />
          <SelectInput
            bg='var(--bg)'
            icon="fa-solid fa-graduation-cap"
            options={[
              { value: '*', text: 'All Levels'},
              { value: 'L1', text: 'Licence 1'},
              { value: 'L2', text: 'Licence 2'},
              { value: 'L3', text: 'Licence 3'},
              { value: 'M1', text: 'Master 1'},
              { value: 'M2', text: 'Master 2'},
              { value: 'Eng1', text: 'Engineer 1'},
              { value: 'Eng2', text: 'Engineer 2'},
              { value: 'Eng3', text: 'Engineer 3'},
              { value: 'Eng4', text: 'Engineer 4'},
              { value: 'Eng5', text: 'Engineer 5'},
            ]}
            value={filterLevel}
            initial={profile ? (profile.level ?? profile.study_level ?? null) : null}
            onChange={(v) => setFilterLevel(v)}
          />
          <SelectInput
            bg='var(--bg)'
            icon="fa-solid fa-clipboard-list"
            options={groupsOptions}
            value={filterGroup}
            initial={profile ? (profile.group_code ?? profile.group ?? profile.group_name ?? null) : null}
            onChange={(v) => setFilterGroup(v)}
          />
          <IconButton color='var(logo)' icon='fa-solid fa-download' onClick={() => { }} />
          <IconButton color='var(logo)' icon='fa-solid fa-print' onClick={() => { }} />
        </div>
      </div>
      <div className="scheduleBody" style={{ minHeight: "calc(100vh - 3.5em - 2em" }}>
        <div className="scheduleSide">
          <div className={`scheduleSearch BGC gsap-y pd ${filtersLoading && "shimmer"}`}>{!filtersLoading && <>
            <TextInput width='calc(100%-2em)' type='search' icon="fa-solid fa-magnifying-glass" placeholder='Search...' label="Search" />
            <SelectInput bg='var(--bg)' label='Room' options={roomsOptions} onChange={(v) => setFilterRoom(v)} value={filterRoom} />
            <Text text='Exam Type' size='var(--text-m)' align='left' opacity='0.6' mrg='1em 0 0 0' />
            <div className="flex row wrap gap a-center pdv">
              <Checkbox label="Final Exam" />
              <Checkbox label="Catch-Up" />
              <Checkbox label="Tutorials" />
              <Checkbox label="Pratical work" />
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
            startDate={filterStartdate || "2026-01-01"}
            endDate={filterEnddate || "2026-12-31"}
            startHour={8}
            endHour={17}
            eventsList={
              filterEvents(examsList, {
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
    </div>
  )
}

export default StudentSchedule