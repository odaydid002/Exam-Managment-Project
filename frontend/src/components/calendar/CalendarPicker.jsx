import { useState } from "react";
import './CalendarPicker.css'

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

 const DateRangeCalendar = ({
     bg = "transparent",
     pd = "1em",
     mrg = "0",
     round = "1em",
     width = "100%",
     height = "100%",
     onRangeSelect = () => {}
 }) => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay() || 7;
    const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const lastDateOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];
    for (let i = firstDayOfMonth - 1; i > 0; i--) {
    days.push({ day: lastDateOfPrevMonth - i + 1, inactive: true });
    }
    for (let i = 1; i <= lastDateOfMonth; i++) {
    days.push({ day: i, inactive: false });
    }
    while (days.length % 7 !== 0) {
    days.push({ day: days.length, inactive: true });
    }
    const handleDateClick = (day) => {
    if (day.inactive) return;

    const clickedDate = new Date(currentYear, currentMonth, day.day);

    if (!startDate || (startDate && endDate)) {
        const newStart = clickedDate;
        setStartDate(newStart);
        setEndDate(null);
        onRangeSelect(newStart, null);
    } else if (clickedDate < startDate) {
        const newStart = clickedDate;
        setStartDate(newStart);
        onRangeSelect(newStart, endDate);
    } else {
        const newEnd = clickedDate;
        setEndDate(newEnd);
        onRangeSelect(startDate, newEnd);
    }
    };
    const isInRange = (day) => {
    if (!startDate || !endDate || day.inactive) return false;
    const date = new Date(currentYear, currentMonth, day.day);
    return date > startDate && date < endDate;
    };
    const isSameDay = (d1, d2) =>
    d1 && d2 &&
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
    return (
        <div className="calendar-container" style={{
            backgroundColor: bg,
            padding: pd,
            margin: mrg,
            borderRadius: round,
            width: width,
            height: height
        }}>
        <div className="calendar-header">
                        <i
                        className="fa-solid fa-chevron-left"
                        onClick={() => {
                                if (currentMonth === 0) {
                                    setCurrentMonth(11);
                                    setCurrentYear(y => y - 1);
                                } else {
                                    setCurrentMonth(m => m - 1);
                                }
                        }}
                        />
            <span className="current-date">
            {MONTHS[currentMonth]} {currentYear}
            </span>
                        <i
                        className="fa-solid fa-chevron-right"
                        onClick={() => {
                                if (currentMonth === 11) {
                                    setCurrentMonth(0);
                                    setCurrentYear(y => y + 1);
                                } else {
                                    setCurrentMonth(m => m + 1);
                                }
                        }}
                        />
        </div>

        <ul className="weeks">
            {WEEK_DAYS.map((d) => (
            <li key={d}>{d}</li>
            ))}
        </ul>

        <ul className="days">
            {days.map((day, idx) => {
            const date = new Date(currentYear, currentMonth, day.day);

            const classes = [
                day.inactive && "inactive",
                isSameDay(date, startDate) && "range-start",
                isSameDay(date, endDate) && "range-end",
                isInRange(day) && "in-range"
            ]
                .filter(Boolean)
                .join(" ");

            return (
                <li
                key={idx}
                className={classes}
                onClick={() => handleDateClick(day)}
                >
                {day.day}
                </li>
            );
            })}
        </ul>
        </div>
    );
}

export default DateRangeCalendar