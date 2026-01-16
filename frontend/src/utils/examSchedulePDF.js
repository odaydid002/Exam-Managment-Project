import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* --------------------------------------------------
   TIME SLOTS (PICTURE FORMAT)
-------------------------------------------------- */
const TIME_SLOTS = [
  { label: "8:00 AM - 8:30 AM", start: 8, end: 8.5 },
  { label: "8:30 AM - 10:00 AM", start: 8.5, end: 10 },
  { label: "10:00 AM - 11:30 AM", start: 10, end: 11.5 },
  { label: "11:30 AM - 1:00 PM", start: 11.5, end: 13 },
  { label: "1:30 PM - 3:00 PM", start: 13.5, end: 15 },
  { label: "3:00 PM - 4:30 PM", start: 15, end: 16.5 }
];

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
  return date.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
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
   MAP TO TIME SLOT
-------------------------------------------------- */
function mapToSlot(start, end) {
  // Match to the slot where the exam starts
  const s = parseFloat(start);
  const e = parseFloat(end);
  
  if (s >= 8 && s < 8.5) return TIME_SLOTS[0];
  if (s >= 8.5 && s < 10) return TIME_SLOTS[1];
  if (s >= 10 && s < 11.5) return TIME_SLOTS[2];
  if (s >= 11.5 && s < 13) return TIME_SLOTS[3];
  if (s >= 13.5 && s < 15) return TIME_SLOTS[4];
  if (s >= 15 && s <= 16.5) return TIME_SLOTS[5];
  return null;
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

  // initialize each week with all days and time slots (empty arrays)
  weekKeys.forEach(wk => {
    weeks[wk] = {};
    WEEK_DAYS.forEach(d => {
      weeks[wk][d] = {};
      TIME_SLOTS.forEach(s => (weeks[wk][d][s.label] = []));
    });
  });

  // populate with exams - add to starting slot only
  (exams || []).forEach(exam => {
    const weekKey = getWeekKey(exam.date);
    const dayName = exam.date.toLocaleDateString("en-US", { weekday: "long" });
    const slot = mapToSlot(exam.start, exam.end);
    
    if (!slot || !weeks[weekKey]) return;
    
    weeks[weekKey][dayName][slot.label].push(exam);
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

  const doc = new jsPDF({ orientation: "landscape" });
  let pageCount = 0;

  Object.entries(specMap).forEach(([spec, examsForSpec]) => {
    const weeks = buildWeeklySchedule(examsForSpec, startDate, endDate);
    console.debug(`Building schedule for speciality "${spec}":`, weeks);

    Object.entries(weeks).forEach(([weekStart, days]) => {
      if (pageCount > 0) doc.addPage();
      pageCount++;

      /* HEADER */
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text("Faculty of Sciences", 148, 12, { align: "center" });
      doc.text(`Department of ${department}`, 148, 20, { align: "center" });

      doc.setFontSize(13);
      doc.text(`Exam Schedule - ${spec} (S1)`, 148, 30, { align: "center" });

      doc.setFontSize(11);
      doc.text(`Week of ${formatDate(new Date(weekStart))}`, 148, 38, { align: "center" });

      /* TABLE */
      const head = [
        [
          "",
          ...WEEK_DAYS.map(day => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + WEEK_DAYS.indexOf(day));
            return `${day}\n${formatDate(d)}`;
          })
        ]
      ];

      const body = TIME_SLOTS.map(slot => {
        const slotExams = days[slot.label] || [];
        let cellContent = "";
        if (slotExams.length > 0) {
          cellContent = slotExams.map(exam => `${exam.module}`).join('\n') + '\n' +
                        slotExams.map(exam => `${exam.group || 'N/A'} - ${exam.room}`).join('\n');
        }
        return [
          slot.label,
          ...WEEK_DAYS.map(day => {
            const dayExams = weeks[weekStart][day][slot.label] || [];
            if (dayExams.length === 0) return "";
            if (dayExams.length === 1) {
              const exam = dayExams[0];
              return `${exam.module}\n${exam.group || 'N/A'} - ${exam.room}`;
            } else {
              // Multiple exams in same slot
              const module = dayExams[0].module;
              const groups = dayExams.map(exam => `${exam.group || 'N/A'} - ${exam.room}`).join('\n');
              return `${module}\n${groups}`;
            }
          })
        ];
      }).filter(row => {
        // Only include rows that have at least one exam
        return row.slice(1).some(cell => cell !== "");
      });

      autoTable(doc, {
        startY: 45,
        head,
        body,
        styles: {
          fontSize: 10,
          halign: "center",
          valign: "middle",
          minCellHeight: 35
        },
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: 0
        },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [200, 0, 0] }
        },
        tableLineWidth: 1,
        tableLineColor: 0
      });
    });
  });

  doc.save(filename);
}
