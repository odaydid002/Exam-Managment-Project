import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* --------------------------------------------------
   TIME SLOTS (PICTURE FORMAT) - REMOVED, using dynamic slots now
-------------------------------------------------- */

/* --------------------------------------------------
   FORMAT TIME
-------------------------------------------------- */
function formatTime(hour) {
  const h = Math.floor(hour);
  const m = (hour % 1) * 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const displayM = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;
  return `${displayH}${displayM} ${ampm}`;
}

/* --------------------------------------------------
   GET UNIQUE TIME SLOTS FROM EXAMS
-------------------------------------------------- */
function getUniqueTimeSlots(exams) {
  const slotMap = new Map();
  exams.forEach(e => {
    const key = `${e.start}-${e.end}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, { start: e.start, end: e.end, label: `${formatTime(e.start)} - ${formatTime(e.end)}` });
    }
  });
  return Array.from(slotMap.values()).sort((a, b) => a.start - b.start);
}

/* --------------------------------------------------
   WEEK DAYS ORDER
-------------------------------------------------- */
const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

/* --------------------------------------------------
   DATE HELPERS
-------------------------------------------------- */
function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekKey(date) {
  return getWeekStart(date).toISOString().split("T")[0];
}

/* --------------------------------------------------
   NORMALIZE EXAMS
-------------------------------------------------- */
function normalizeExams(exams) {
  return exams.map(e => {
    // Parse date - handle both date objects and strings
    let dateObj = e.date;
    if (typeof e.date === 'string') {
      dateObj = new Date(e.date);
    } else if (!(e.date instanceof Date)) {
      dateObj = new Date(e.date);
    }
    
    // Handle both camelCase (startHour) and snake_case (start_hour) field names
    const start = parseFloat(e.start_hour ?? e.startHour ?? e.start ?? 0);
    const end = parseFloat(e.end_hour ?? e.endHour ?? e.end ?? 0);
    
    // Handle both module naming conventions (module vs module_name)
    const moduleName = e.module_name ?? e.module ?? e.module_code ?? '';
    
    return {
      module: moduleName,
      teacher: e.teacher_name || e.teacher || '',
      room: e.room_name || e.room || 'TBD',
      date: dateObj,
      start: start,
      end: end,
      speciality: e.speciality || e.speciality_name || e.department || e.group_speciality || 'General',
      group: e.group || e.group_name || e.group_code || ''
    };
  });
}

/* --------------------------------------------------
   BUILD WEEKLY STRUCTURE
-------------------------------------------------- */
function buildWeeklySchedule(exams, startDate = null, endDate = null) {
  const weeks = {};

  // determine date range
  let firstDate = null;
  let lastDate = null;

  if (startDate) firstDate = new Date(startDate);
  if (endDate) lastDate = new Date(endDate);

  if (!firstDate || !lastDate) {
    const examDates = (exams || []).map(e => e.date && e.date.getTime()).filter(Boolean);
    if (examDates.length > 0) {
      const min = new Date(Math.min(...examDates));
      const max = new Date(Math.max(...examDates));
      if (!firstDate) firstDate = min;
      if (!lastDate) lastDate = max;
    }
  }

  // nothing to build
  if (!firstDate || !lastDate) return weeks;

  const startWeek = getWeekStart(firstDate);
  const endWeek = getWeekStart(lastDate);

  // build all week keys between startWeek and endWeek inclusive
  const weekKeys = [];
  for (let d = new Date(startWeek); d <= endWeek; d.setDate(d.getDate() + 7)) {
    weekKeys.push(new Date(d).toISOString().split('T')[0]);
  }

  // initialize each week with all days (empty maps for dynamic slots)
  weekKeys.forEach(wk => {
    weeks[wk] = {};
    WEEK_DAYS.forEach(d => {
      weeks[wk][d] = new Map(); // key: 'start-end', value: array of exams
    });
  });

  // populate with exams
  (exams || []).forEach(exam => {
    const weekKey = getWeekKey(exam.date);
    const dayName = exam.date.toLocaleDateString("en-US", { weekday: "long" });
    const slotKey = `${exam.start}-${exam.end}`;
    
    if (!weeks[weekKey]) return;
    
    if (!weeks[weekKey][dayName].has(slotKey)) {
      weeks[weekKey][dayName].set(slotKey, []);
    }
    weeks[weekKey][dayName].get(slotKey).push(exam);
  });

  return weeks;
}

/* --------------------------------------------------
   PDF GENERATOR (ONE WEEK PER PAGE)
-------------------------------------------------- */
export function exportExamsToPDF(exams, department = "Computer Science", startDate = null, endDate = null, filename = "exam_schedule_by_speciality.pdf") {
  console.debug('exportExamsToPDF called with:', { examsCount: exams?.length, department, startDate, endDate, filename });
  console.debug('Raw exams before normalization:', exams);
  
  const normalizedExams = normalizeExams(exams || []);
  console.debug('Normalized exams:', normalizedExams);

  // group exams by speciality
  const specMap = {};
  normalizedExams.forEach(e => {
    const s = e.speciality || 'General';
    if (!specMap[s]) specMap[s] = [];
    specMap[s].push(e);
  });

  console.debug('Exams grouped by speciality:', specMap);

  const doc = new jsPDF({ orientation: "portrait" });
  let pageCount = 0;

  Object.entries(specMap).forEach(([spec, examsForSpec]) => {
    const weeks = buildWeeklySchedule(examsForSpec, startDate, endDate);
    console.debug(`Building schedule for speciality "${spec}":`, weeks);

  Object.entries(specMap).forEach(([spec, examsForSpec]) => {
    const weeks = buildWeeklySchedule(examsForSpec, startDate, endDate);
    console.debug(`Building schedule for speciality "${spec}":`, weeks);

    Object.entries(weeks).forEach(([weekStart, days]) => {
      if (pageCount > 0) doc.addPage();
      pageCount++;

      /* HEADER */
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text("Faculty of Sciences", 105, 15, { align: "center" });
      doc.text(`Department of ${department}`, 105, 25, { align: "center" });

      doc.setFontSize(14);
      doc.text(`Exam Schedule - ${spec}`, 105, 35, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Week of ${formatDate(new Date(weekStart))}`, 105, 45, { align: "center" });

      // Get unique time slots for this week's exams
      const allExamsInWeek = [];
      WEEK_DAYS.forEach(day => {
        days[day].forEach(exams => allExamsInWeek.push(...exams));
      });
      const uniqueSlots = getUniqueTimeSlots(allExamsInWeek);

      // Collect slot-module combinations
      const slotModuleMap = new Map();
      uniqueSlots.forEach(slot => {
        const slotKey = `${slot.start}-${slot.end}`;
        const modules = new Set();
        WEEK_DAYS.forEach(day => {
          const dayExams = days[day].get(slotKey) || [];
          dayExams.forEach(exam => modules.add(exam.module));
        });
        slotModuleMap.set(slotKey, { slot, modules: Array.from(modules) });
      });

      /* TABLE */
      const head = [
        [
          "",
          ...WEEK_DAYS.map(day => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + WEEK_DAYS.indexOf(day));
            return `${day.slice(0, 3)}\n${formatDate(d)}`;
          })
        ]
      ];

      const body = [];
      slotModuleMap.forEach(({ slot, modules }) => {
        const slotKey = `${slot.start}-${slot.end}`;
        if (modules.length === 1) {
          // Single module, one row
          const module = modules[0];
          body.push([
            slot.label,
            ...WEEK_DAYS.map(day => {
              const dayExams = days[day].get(slotKey) || [];
              const moduleExams = dayExams.filter(exam => exam.module === module);
              if (moduleExams.length === 0) return "";
              const details = moduleExams.map(exam => `${exam.group || 'N/A'} - ${exam.room}`).join('\n');
              return details;
            })
          ]);
        } else {
          // Multiple modules, separate rows for each
          modules.forEach(module => {
            body.push([
              `${slot.label} - ${module}`,
              ...WEEK_DAYS.map(day => {
                const dayExams = days[day].get(slotKey) || [];
                const moduleExams = dayExams.filter(exam => exam.module === module);
                if (moduleExams.length === 0) return "";
                const details = moduleExams.map(exam => `${exam.group || 'N/A'} - ${exam.room}`).join('\n');
                return details;
              })
            ]);
          });
        }
      });

      autoTable(doc, {
        startY: 55,
        head,
        body,
        styles: {
          fontSize: 9,
          halign: "center",
          valign: "middle",
          minCellHeight: 25,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          fontStyle: "bold"
        },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [44, 62, 80], cellWidth: 35 }
        },
        tableLineWidth: 0.5,
        tableLineColor: [0, 0, 0],
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
    });
  });
  });

  doc.save(filename);
}
