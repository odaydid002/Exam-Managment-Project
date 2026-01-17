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

function formatDateString(date) {
  return date.getFullYear() + '-' + 
         String(date.getMonth() + 1).padStart(2, '0') + '-' + 
         String(date.getDate()).padStart(2, '0');
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
      level: e.level || e.level_name || '',
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

  if (startDate) {
    firstDate = new Date(startDate);
  }
  if (endDate) {
    lastDate = new Date(endDate);
  }

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

  // build week keys starting from startDate, every 7 days
  const weekKeys = [];
  if (firstDate && lastDate) {
    let current = new Date(firstDate);
    while (current <= lastDate) {
      weekKeys.push(formatDateString(current));
      current.setDate(current.getDate() + 7);
    }
  } else {
    // fallback to old logic
    const startWeek = getWeekStart(firstDate);
    const endWeek = getWeekStart(lastDate);
    for (let d = new Date(startWeek); d <= endWeek; d.setDate(d.getDate() + 7)) {
      weekKeys.push(new Date(d).toISOString().split('T')[0]);
    }
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
    const examDate = new Date(exam.date);
    const diffTime = examDate - firstDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const weekIndex = Math.floor(diffDays / 7);
    
    if (weekIndex < 0 || weekIndex >= weekKeys.length) return;
    
    const weekKey = weekKeys[weekIndex];
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

  // group exams by level and speciality
  const specMap = {};
  normalizedExams.forEach(e => {
    const level = e.level || 'General';
    const speciality = e.speciality || 'General';
    const key = `${level}-${speciality}`;
    if (!specMap[key]) specMap[key] = [];
    specMap[key].push(e);
  });

  console.debug('Exams grouped by speciality:', specMap);

  const doc = new jsPDF({ orientation: "landscape" });
  let pageCount = 0;

  Object.entries(specMap).forEach(([key, examsForSpec]) => {
    const [level, speciality] = key.split('-');
    const weeks = buildWeeklySchedule(examsForSpec, startDate, endDate);
    console.debug(`Building schedule for level "${level}" speciality "${speciality}":`, weeks);

    // Only generate one page per level-speciality (first week)
    const weeksArray = Object.entries(weeks);
    if (weeksArray.length > 0) {
      const [weekStart, days] = weeksArray[0];
      if (pageCount > 0) doc.addPage();
      pageCount++;

      // Calculate week days for this specific week
      const weekStartDate = new Date(weekStart);
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() + i);
        weekDays.push(d.toLocaleDateString("en-US", { weekday: "long" }));
      }

      /* HEADER */
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text("Faculty of Sciences", 148, 15, { align: "center" });
      doc.text(`Department of ${department}`, 148, 25, { align: "center" });

      doc.setFontSize(14);
      doc.text(`Exam Schedule - ${level} - ${speciality}`, 148, 35, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Week of ${formatDate(weekStartDate)}`, 148, 45, { align: "center" });

      // Get unique time slots for this week's exams
      const allExamsInWeek = [];
      weekDays.forEach(day => {
        days[day].forEach(exams => allExamsInWeek.push(...exams));
      });
      const uniqueSlots = getUniqueTimeSlots(allExamsInWeek);

      // Collect slot-module combinations
      const slotModuleMap = new Map();
      uniqueSlots.forEach(slot => {
        const slotKey = `${slot.start}-${slot.end}`;
        const modules = new Set();
        weekDays.forEach(day => {
          const dayExams = days[day].get(slotKey) || [];
          dayExams.forEach(exam => modules.add(exam.module));
        });
        slotModuleMap.set(slotKey, { slot, modules: Array.from(modules) });
      });

      /* TABLE */
      const head = [
        [
          "",
          ...weekDays.map(day => {
            const d = new Date(weekStartDate);
            d.setHours(12, 0, 0, 0); // set to noon to avoid timezone issues
            d.setDate(d.getDate() + weekDays.indexOf(day));
            d.setHours(0, 0, 0, 0);
            return `${day.slice(0, 3)}\n${formatDate(d)}`;
          })
        ]
      ];

      const body = uniqueSlots.map(slot => {
        const slotKey = `${slot.start}-${slot.end}`;
        return [
          slot.label,
          ...weekDays.map(day => {
            const dayExams = days[day].get(slotKey) || [];
            if (dayExams.length === 0) return "";
            
            // Group exams by module
            const moduleGroups = {};
            dayExams.forEach(exam => {
              const module = exam.module;
              if (!moduleGroups[module]) moduleGroups[module] = [];
              moduleGroups[module].push(exam);
            });
            
            // Format each module group
            const formattedGroups = Object.entries(moduleGroups).map(([module, exams]) => {
              if (exams.length === 1) {
                const exam = exams[0];
                return `${module}\n${exam.group || 'N/A'} - ${exam.room}`;
              } else {
                // Multiple exams with same module
                const details = exams.map(exam => `${exam.group || 'N/A'} - ${exam.room}`).join('\n');
                return `${module}\n${details}`;
              }
            });
            
            return formattedGroups.join('\n\n');
          })
        ];
      });

      autoTable(doc, {
        startY: 55,
        head,
        body,
        margin: { left: 18, right: 18 },
        styles: {
          fontSize: 9,
          halign: "center",
          valign: "middle",
          minCellHeight: 20,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          fontStyle: "bold"
        },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [44, 62, 80], cellWidth: 32 },
          1: { cellWidth: 32.7 },
          2: { cellWidth: 32.7 },
          3: { cellWidth: 32.7 },
          4: { cellWidth: 32.7 },
          5: { cellWidth: 32.7 },
          6: { cellWidth: 32.7 },
          7: { cellWidth: 32.7 }
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
