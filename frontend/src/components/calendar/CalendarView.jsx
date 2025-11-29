import React, { useState } from "react";
import "./Calendar.css";
import Text from "../text/Text";
import IconButton from "../buttons/IconButton";
import Eclipse from "../shapes/Eclipse";

export default function CalendarView({
    startDate,
    endDate,
    startHour = 8,
    endHour = 17,
    eventsList = [],
    onConflict = () => {}
}) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const fixDate = new Date(end);

    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    const remainder = diffDays % 7;
    const daysToAdd = remainder === 0 ? 0 : 7 - remainder;

    fixDate.setDate(fixDate.getDate() + daysToAdd);

    const getDays = () => {
        const days = [];
        const current = new Date(start);

        while (current < fixDate) {
            days.push({
                date: current.getDate(),
                weekday: current.toLocaleDateString("en-US", { weekday: "long" }),
                full: new Date(current)
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const allDays = getDays();
    const pageSize = 7;
    const totalPages = Math.ceil(allDays.length / pageSize);

    const [currentPage, setCurrentPage] = useState(1);

    const pageDays = allDays.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const headerStart = pageDays[0].full;
    const headerEnd = pageDays[pageDays.length - 1].full;

    const headerText = `${headerStart.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
    })} - ${headerEnd.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
    })}, ${headerStart.getFullYear()}`;

    const getTimes = () => {
        const times = [];
        for (let h = startHour; h < endHour; h++) {
            times.push(`${String(h).padStart(2, "0")}:00`);
            times.push(`${String(h).padStart(2, "0")}:30`);
        }
        times.push(`${endHour}:00`);
        return times;
    };

    const timeSlots = getTimes();

    const timeStringToNumber = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h + m / 60;
    };

    const numericTimeSlots = timeSlots.map(t => timeStringToNumber(t));

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const HOUR_HEIGHT = 120;

    return (
        <div className="calendar-wrapper full">
            <header className="calendar-header flex row a-center j-spacebet">
                <Text text={headerText} align="left" size="var(--text-l)" />

                <div className="flex row a-center gap-2">
                    <IconButton
                        icon="fa-solid fa-arrow-left"
                        size="var(--text-xl)"
                        enabled={currentPage > 1}
                        color={currentPage > 1 ? "var(--text)" : "var(--text-low)"}
                        onClick={prevPage}
                    />
                    <IconButton
                        icon="fa-solid fa-arrow-right"
                        size="var(--text-xl)"
                        enabled={currentPage < totalPages}
                        color={currentPage < totalPages ? "var(--text)" : "var(--text-low)"}
                        onClick={nextPage}
                    />
                </div>
            </header>

            <div className="calendar-body pos-rel full scrollbar">
                <div className="calendar-hours">
                    <div className="flex center w100 day-header">
                        <i className="fa-regular fa-clock"></i>
                    </div>
                    {timeSlots.map((t) => (
                        <div key={t} className="time-cell full flex j-center">
                            <Text text={t} size="var(--text-m)" />
                        </div>
                    ))}
                </div>

                {pageDays.map((d) => (
                    <div key={d.full.toISOString()} className="day-column">
                        <div className="flex column center day-header">
                            <Text text={d.date} size="var(--text-m)" />
                            <Text text={d.weekday} size="var(--text-m)" />
                        </div>
                        {(() => {
                            const dayKey = d.full.toISOString().split("T")[0];
                            const dayEvents = eventsList.filter(ev => ev.day === dayKey);

                            return timeSlots.map((t, rowIndex) => {
                                const slotTime = numericTimeSlots[rowIndex];

                                const events = dayEvents.filter(ev => slotTime === ev.startHour);

                                return (
                                    <div key={t} className="day-cell w100 pos-rel">
                                        {events.map((ev, i) => {
                                            const zIndex = dayEvents.filter(e => e.startHour < ev.startHour).length + 1;

                                            const conflictCount = dayEvents.filter(e =>
                                                e.room === ev.room &&
                                                e.startHour < ev.endHour &&
                                                ev.startHour < e.endHour
                                            ).length;

                                            const borderStyle = conflictCount > 1 ? `2px solid rgb(255, 81, 0)` : 'none';
                                            {conflictCount > 1 && onConflict(ev, dayKey);}

                                            return (
                                                <div
                                                    key={i}
                                                    className="event-box flex column clickable-2"
                                                    style={{
                                                        height: `${(ev.endHour - ev.startHour) * HOUR_HEIGHT + 10}px`,
                                                        top: `${i * 20}px`,
                                                        zIndex: zIndex,
                                                        border: borderStyle,
                                                        boxSizing: 'border-box'
                                                    }}
                                                >
                                                    {conflictCount > 1 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '6px',
                                                            right: '8px',
                                                            background: 'rgb(255, 81, 0)',
                                                            color: 'white',
                                                            borderRadius: '999px',
                                                            minWidth: '20px',
                                                            height: '20px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.75em',
                                                            padding: '0 6px',
                                                            zIndex: zIndex + 1
                                                        }}> <i className="fa-solid fa-exclamation-triangle text-white"></i> </div>
                                                    )}

                                                    <div className="flex row a-center">
                                                        <i className="fa-solid fa-door-open text-m text-white"></i>
                                                        <Text color="var(--color-second)" text={ev.room} align="left" size="var(--text-l)" mrg="0 0 0.25em 0.5em"/>
                                                    </div>
                                                    <Text color="white" text={`${ev.type} - ${ev.module}`} align="center" mrg="auto 0" size="var(--text-m)" w="bold"/>
                                                    <Text color="white" text={ev.level} align="left" size="var(--text-s)"/>
                                                    <Text color="white" text={ev.speciality} align="left" size="var(--text-s)"/>
                                                    <Eclipse css="pos-abs" top="60%" left="30%" color="var(--trans-grey)"/>
                                                    <Eclipse css="pos-abs" top="-10%" left="-30%" w="6em" color="var(--trans-grey)"/>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            });
                        })()}

                    </div>
                ))}
            </div>
        </div>
    );
}
