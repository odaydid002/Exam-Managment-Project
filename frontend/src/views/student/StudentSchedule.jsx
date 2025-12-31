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
import { getAll as getExams } from '../../API/exams'
import { get as getStudent } from '../../API/students';
import { exportExamsToPDF } from '../../utils/examSchedulePDF';

const StudentSchedule = () => {

  document.title = "Unitime - Schedule";

  const [filtersLoading, setFiltersLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [filterStartdate, setFilterStartdate] = useState("");
  const [filterEnddate, setFilterEnddate] = useState("");
  const [filterRoom, setFilterRoom] = useState("*");
  const [filterLevel, setFilterLevel] = useState("*");
  const [filterExamType, setFilterExamType] = useState("*");
  const [filterSpeciality, setFilterSpeciality] = useState("*");
  const [filterGroup, setFilterGroup] = useState("*");
  const [profile, setProfile] = useState(null);
  const [userDepartment, setUserDepartment] = useState('Computer Science');

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
    { value: 'Eng2', text: 'Engineer 2' },
    { value: 'Eng3', text: 'Engineer 3' },
    { value: 'Eng4', text: 'Engineer 4' },
    { value: 'Eng5', text: 'Engineer 5' },
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

  const { notify } = useNotify();

  const [examsRaw, setExamsRaw] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [specialitiesLoaded, setSpecialitiesLoaded] = useState(false);
  const [roomsLoaded, setRoomsLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [examsLoaded, setExamsLoaded] = useState(false);

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
        if (String(e.speciality) === specFilter) {
          //ok
        } else {
          const opt = (specialitiesOptions || []).find(o => String(o.value) === specFilter || String(o.value) === String(specFilter));
          if (opt) {
            const optText = String(opt.text || "");
            if (String(e.speciality) === optText) {
              //ok
            } else if (!String(e.speciality).toLowerCase().includes(optText.toLowerCase()) && !optText.toLowerCase().includes(String(e.speciality).toLowerCase())) {
              return false;
            }
          } else {
            if (!String(e.speciality).toLowerCase().includes(specFilter.toLowerCase()) && !specFilter.toLowerCase().includes(String(e.speciality).toLowerCase())) return false;
          }
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
        setSpecialitiesLoaded(true);
        console.debug('loaded specialities options', opts)
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
        console.debug('loaded rooms options', opts)
      } catch (err) {
        console.error('Failed to load rooms', err)
        notify && notify('error', 'Failed to load rooms')
        setRoomsLoaded(true);
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
          const identifier = user.id;
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
            if (res.ok) {
              prof = await res.json();
            }
          } catch { }
        }

        if (!prof) return;
        if (!mounted) return;

        setProfile(prof);
        setProfileLoaded(true);
        console.debug('loaded profile', prof)

        // Get department for PDF export
        const dept = prof.department?.name || prof.department || 'Computer Science';
        setUserDepartment(dept);

        const specialityVal = prof.speciality ?? prof.department ?? prof.department_id ?? '';
        const groupVal = prof.group_code ?? prof.group ?? prof.group_name ?? prof.groupe_name ?? '';
        const levelVal = prof.level ?? prof.study_level ?? '';

        console.debug('Profile data:', { specialityVal, groupVal, levelVal, fullProfile: prof });

        if (specialityVal) setFilterSpeciality(specialityVal);
        if (groupVal) setFilterGroup(groupVal);
        if (levelVal) setFilterLevel(normalizeLevelValue(levelVal));
        try {
          setExamsLoading(true);
          const resp = await getExams();
          const items = Array.isArray(resp) ? resp : (resp.exams || resp.data || []);

          const normalized = (items || []).map(ex => ({
            id: ex.id,
            module: ex.module_name ?? ex.module ?? ex.module_code ?? "",
            module_code: ex.module_code ?? "",
            group_code: ex.group_code ?? ex.group ?? "",
            group_name: ex.group_name ?? ex.group ?? ex.group_code ?? "",
            section: ex.section ?? ex.section_name ?? "",
            speciality: ex.speciality ?? ex.speciality_name ?? ex.department ?? "",
            room: ex.room_name ?? ex.room ?? ex.room_id ?? "",
            room_id: ex.room_id ?? null,
            type: ex.exam_type ?? ex.type ?? "",
            date: ex.date ?? ex.day ?? "",
            day: (ex.date ?? ex.day ?? "").toString().split(' ')[0],
            startHour: ex.start_hour ?? ex.startHour ?? ex.start ?? null,
            endHour: ex.end_hour ?? ex.endHour ?? ex.end ?? null,
            level: ex.level ?? "",
            raw: ex
          }));

          const matchesProfile = (exam, prof) => {
            if (!prof) return false;
            const profSpec = String(prof.speciality ?? prof.department ?? "").toLowerCase();
            const profLevel = String(prof.level ?? prof.study_level ?? "").toLowerCase();
            const profGroup = String(prof.group_code ?? prof.group_name ?? prof.group ?? "").toLowerCase();

            const exSpec = String(exam.speciality ?? "").toLowerCase();
            const exLevel = String(exam.level ?? "").toLowerCase();
            const exGroup = String(exam.group_code ?? exam.group_name ?? "").toLowerCase();

            const specMatches = !profSpec ? true : (exSpec === profSpec || exSpec.includes(profSpec) || profSpec.includes(exSpec));

            const levelMatches = !profLevel ? true : (!exLevel ? true : (exLevel === profLevel || exLevel.includes(profLevel) || profLevel.includes(exLevel)));
            const groupMatches = !profGroup ? true : (exGroup === profGroup || exGroup.includes(profGroup) || profGroup.includes(exGroup));

            return specMatches && levelMatches && groupMatches;
          }

          const filtered = normalized.filter(ex => matchesProfile(ex, prof));
          if (mounted) setExamsRaw(filtered);
          if (mounted) setExamsLoaded(true);
          console.debug('loaded exams total:', normalized.length);
          console.debug('loaded exams (filtered):', filtered.length);
          console.debug('exam samples:', normalized.slice(0, 3));
          console.debug('filtered samples:', filtered.slice(0, 3))
        } catch (err) {
          console.error('Failed to load exams', err);
          if (mounted) setExamsRaw([]);
        } finally {
          if (mounted) setExamsLoading(false);
          if (mounted && !examsLoaded) setExamsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load student profile', err);
        notify && notify('error', 'Failed to load student profile');
      }
    }

    loadProfile();
    return () => { mounted = false }
  }, [])


  useEffect(() => {
    const allLoaded = specialitiesLoaded && roomsLoaded && profileLoaded && examsLoaded;
    setCalendarLoading(!allLoaded);
  }, [specialitiesLoaded, roomsLoaded, profileLoaded, examsLoaded]);

  useEffect(() => {
    if (!profile || !specialitiesOptions || specialitiesOptions.length <= 1) return;
    const desired = profile.speciality ?? profile.department ?? profile.department_id ?? null;
    if (!desired) return;

    const already = specialitiesOptions.some(o => String(o.value) === String(filterSpeciality) || String(o.text) === String(filterSpeciality));
    if (filterSpeciality && filterSpeciality !== '*' && already) return;

    const findMatch = (val) => specialitiesOptions.find(o => String(o.value) === String(val) || String(o.text).toLowerCase() === String(val).toLowerCase() || String(o.text).toLowerCase().includes(String(val).toLowerCase()));

    let match = findMatch(desired);
    if (!match && profile.speciality) match = findMatch(profile.speciality);
    if (match) {
      setFilterSpeciality(match.value);

      try { loadGroupsFor(match.value) } catch (e) { /* ignore */ }
    }
  }, [specialitiesOptions, profile]);

  useEffect(() => {
    if (!profile || !groupsOptions || groupsOptions.length <= 1) return;
    const desired = profile.group_code ?? profile.group ?? profile.group_name ?? profile.groupe_name ?? null;
    if (!desired) return;

    const already = groupsOptions.some(o => String(o.value) === String(filterGroup) || String(o.text) === String(filterGroup));
    if (filterGroup && filterGroup !== '*' && already) return;

    const findMatch = (val) => groupsOptions.find(o => String(o.value) === String(val) || String(o.text).toLowerCase() === String(val).toLowerCase() || String(o.text).toLowerCase().includes(String(val).toLowerCase()));
    let match = findMatch(desired);
    if (!match && profile.group_name) match = findMatch(profile.group_name);
    if (match) setFilterGroup(match.value);
  }, [groupsOptions, profile]);

  useEffect(() => {
    if (!profile || !levelOptions || levelOptions.length <= 1) return;
    const desired = normalizeLevelValue(profile.level ?? profile.study_level ?? null) || null;
    if (!desired) return;

    const already = levelOptions.some(o => String(o.value) === String(filterLevel) || String(o.text) === String(filterLevel));
    if (filterLevel && filterLevel !== '*' && already) return;

    const findMatch = (val) => levelOptions.find(o => String(o.value) === String(val) || String(o.text).toLowerCase() === String(val).toLowerCase() || String(o.text).toLowerCase().includes(String(val).toLowerCase()));
    const match = findMatch(desired);
    if (match) setFilterLevel(match.value);
  }, [profile]);


  useEffect(() => {
    if (filterSpeciality && filterSpeciality !== '*') {
      loadGroupsFor(filterSpeciality);
    }
  }, [filterSpeciality]);

  const handlePrintSchedule = () => {
    try {
      const filteredExams = filterEvents(examsRaw, {
        startDate: filterStartdate,
        endDate: filterEnddate,
        room: filterRoom,
        level: filterLevel,
        examType: filterExamType,
        speciality: filterSpeciality,
        group: filterGroup
      });

      console.debug('Filtered exams for PDF:', filteredExams);
      console.debug('Filter params:', { filterStartdate, filterEnddate, filterRoom, filterLevel, filterExamType, filterSpeciality, filterGroup });

      if (filteredExams.length === 0) {
        notify('warning', 'No exams to export after filtering');
        return;
      }

      exportExamsToPDF(filteredExams, userDepartment, filterStartdate, filterEnddate, 'student_exam_schedule.pdf');
      notify('success', 'Exam schedule exported successfully');
    } catch (err) {
      console.error('Failed to export PDF', err);
      notify('error', 'Failed to export exam schedule');
    }
  };

  return (
    <div className={`full flex column scrollbar overflow-y-a gap`} style={{ padding: "1em 1em 1em 0" }}>
      <div className="flex row a-center j-spacebet" style={{ height: "3.5em" }}>
        <Text text='Schedule - Calendar' size='var(--text-m)' opacity='0.8' />
        <div className="flex row a-center gap" style={{ paddingRight: "1em" }}>
          <div className="flex row a-center gap" style={{ padding: "0.5em 1em", backgroundColor: "var(--bg)", borderRadius: "0.25em", fontSize: "0.9em" }}>
            <i className="fa-solid fa-book-bookmark" style={{ color: "var(logo)", marginRight: "0.5em" }}></i>
            <span>{filterSpeciality}</span>
          </div>
          <SelectInput
            bg='var(--bg)'
            icon="fa-solid fa-graduation-cap"
            options={[
              { value: '*', text: 'All Levels' },
              { value: 'L1', text: 'Licence 1' },
              { value: 'L2', text: 'Licence 2' },
              { value: 'L3', text: 'Licence 3' },
              { value: 'M1', text: 'Master 1' },
              { value: 'M2', text: 'Master 2' },
              { value: 'Eng1', text: 'Engineer 1' },
              { value: 'Eng2', text: 'Engineer 2' },
              { value: 'Eng3', text: 'Engineer 3' },
              { value: 'Eng4', text: 'Engineer 4' },
              { value: 'Eng5', text: 'Engineer 5' },
            ]}
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
          <IconButton color='var(logo)' icon='fa-solid fa-print' onClick={handlePrintSchedule} />
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
            startDate={filterStartdate || new Date().getDate}
            endDate={filterEnddate || new Date(new Date() + 7).getDate}
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
    </div>
  )
}

export default StudentSchedule