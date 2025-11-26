import React, { useState } from "react";
import "./Calendar.css";
import Text from "../text/Text";
import IconButton from "../buttons/IconButton";

export default function CalendarView({
    startDate,
    endDate,
    startHour = 8,
    endHour = 17,
    eventsList = [],

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

                        {timeSlots.map((t, rowIndex) => {
                            const slotTime = numericTimeSlots[rowIndex];

                            const events = eventsList.filter(ev =>
                                ev.day === d.full.toISOString().split("T")[0] &&
                                slotTime === ev.startHour
                            );

                            return (
                                <div key={t} className="day-cell w100 pos-rel">
                                    {events.map((ev, i) => (
                                        <div
                                            key={i}
                                            className="event-box clickable z-2"
                                            style={{
                                                height: `${(ev.endHour - ev.startHour) * HOUR_HEIGHT + 10}px`, 
                                                top: 0
                                            }}
                                        >
                                            <Text color="white" text={ev.room} align="center" size="var(--text-m)"/>
                                            <Text color="white" text={ev.module} align="center" size="var(--text-m)" w="bold"/>
                                            <Text color="white" text={ev.type} align="center" size="var(--text-m)"/>
                                            <Text color="white" text={ev.level} align="center" size="var(--text-m)"/>
                                            <Text color="white" text={ev.speciality} align="center" size="var(--text-m)"/>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}

                    </div>
                ))}
            </div>
        </div>
    );
}
