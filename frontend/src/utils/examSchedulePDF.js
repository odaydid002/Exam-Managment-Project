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
      speciality: e.speciality || e.speciality_name || e.department || e.group_speciality || 'General'
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

  // initialize each week with all days and time slots (empty)
  weekKeys.forEach(wk => {
    weeks[wk] = {};
    WEEK_DAYS.forEach(d => {
      weeks[wk][d] = {};
      TIME_SLOTS.forEach(s => (weeks[wk][d][s.label] = ""));
    });
  });

  // populate with exams - add to starting slot only
  (exams || []).forEach(exam => {
    const weekKey = getWeekKey(exam.date);
    const dayName = exam.date.toLocaleDateString("en-US", { weekday: "long" });
    const slot = mapToSlot(exam.start, exam.end);
    
    if (!slot || !weeks[weekKey]) return;
    
    weeks[weekKey][dayName][slot.label] = `${exam.module}\nRoom: ${exam.room}`;
  });

  return weeks;
}

/* --------------------------------------------------
   PDF GENERATOR (ONE WEEK PER PAGE)
-------------------------------------------------- */
function generateExamPDF(exams, department = "Computer Science", startDate = null, endDate = null) {
  const doc = new jsPDF();
  const normalized = normalizeExams(exams);
  const schedule = buildWeeklySchedule(normalized, startDate, endDate);

  let pageCount = 0;

  Object.entries(schedule).forEach(([spec, weeks]) => {
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
          { content: "Time", styles: { halign: "center", valign: "middle" } },
          { content: "Monday", styles: { halign: "center", valign: "middle" } },
          { content: "Tuesday", styles: { halign: "center", valign: "middle" } },
          { content: "Wednesday", styles: { halign: "center", valign: "middle" } },
          { content: "Thursday", styles: { halign: "center", valign: "middle" } },
          { content: "Friday", styles: { halign: "center", valign: "middle" } },
          { content: "Saturday", styles: { halign: "center", valign: "middle" } },
          { content: "Sunday", styles: { halign: "center", valign: "middle" } }
        ]
      ];

      const body = TIME_SLOTS.map(slot => [
        { content: slot.label, styles: { halign: "center", valign: "middle" } },
        { content: days.Monday?.[slot.label] || "", styles: { halign: "center", valign: "middle" } },
        { content: days.Tuesday?.[slot.label] || "", styles: { halign: "center", valign: "middle" } },
        { content: days.Wednesday?.[slot.label] || "", styles: { halign: "center", valign: "middle" } },
        { content: days.Thursday?.[slot.label] || "", styles: { halign: "center", valign: "middle" } },
        { content: days.Friday?.[slot.label] || "", styles: { halign: "center", valign: "middle" } },
        { content: days.Saturday?.[slot.label] || "", styles: { halign: "center", valign: "middle" } },
        { content: days.Sunday?.[slot.label] || "", styles: { halign: "center", valign: "middle" } }
      ]);

      autoTable(doc, {
        head: head,
        body: body,
        startY: 45,
        styles: {
          font: "times",
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          cellWidth: "wrap"
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold"
        },
        bodyStyles: {
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

  return doc;
}

export { generateExamPDF }

/* --------------------------------------------------
   PDF GENERATOR (ONE WEEK PER PAGE)
-------------------------------------------------- */
export function exportExamsToPDF(exams, department = "Computer Science", startDate = null, endDate = null, filename = "exam_schedule_by_speciality.pdf") {
  const doc = generateExamPDF(exams, department, startDate, endDate);
  doc.save(filename);
}
