import React, { useState } from "react";
import "./Calendar.css";
import Text from "../text/Text";
import IconButton from "../buttons/IconButton";
import Eclipse from "../shapes/Eclipse";
import ConfirmDialog from "../containers/ConfirmDialog";

export default function CalendarView({
    startDate,
    endDate,
    startHour = 8,
    endHour = 17,
    eventsList = [],
    onConflict = () => {},
    onEventClick = () => {},
    onEventDelete = () => {},
    onEventSurveillance = () => {}
    , readOnly = false
}) {
    // Helper to get local date string YYYY-MM-DD
    const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    // Parse date string in local timezone (not UTC)
    const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return new Date(dateStr);
        
        // Handle ISO format YYYY-MM-DD by parsing locally
        const match = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [, year, month, day] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return new Date(dateStr);
    };

    let start = parseLocalDate(startDate);
    let end = parseLocalDate(endDate);

    const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());
    if (!isValidDate(start)) start = new Date();
    if (!isValidDate(end)) {
        end = new Date(start);
        end.setDate(start.getDate() + 6);
    }

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
                full: new Date(current),
                localDate: getLocalDateString(current)
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const allDays = getDays();
    const pageSize = 7;
    const totalPages = Math.max(1, Math.ceil(allDays.length / pageSize));

    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, event: null });

    const pageDays = allDays.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const headerStart = pageDays.length > 0 ? pageDays[0].full : start;
    const headerEnd = pageDays.length > 0 ? pageDays[pageDays.length - 1].full : end;

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
                            const dayKey = d.localDate;
                            const dayEvents = eventsList.filter(ev => ev.day === dayKey);

                            // Group overlapping events
                            const groupOverlappingEvents = (events) => {
                                if (events.length === 0) return [];
                                
                                const sorted = events.sort((a, b) => a.startHour - b.startHour);
                                const groups = [];
                                
                                for (const event of sorted) {
                                    let added = false;
                                    for (const group of groups) {
                                        // Check if event overlaps with any in the group
                                        const overlaps = group.some(g => 
                                            g.startHour < event.endHour && event.startHour < g.endHour
                                        );
                                        if (overlaps) {
                                            group.push(event);
                                            added = true;
                                            break;
                                        }
                                    }
                                    if (!added) {
                                        groups.push([event]);
                                    }
                                }
                                
                                return groups;
                            };

                            const eventGroups = groupOverlappingEvents(dayEvents);

                            return timeSlots.map((t, rowIndex) => {
                                const slotTime = numericTimeSlots[rowIndex];

                                // Find groups that should be displayed in this slot (first event starts here)
                                const slotGroups = eventGroups.filter(group => 
                                    group.length > 0 && group[0].startHour === slotTime
                                );

                                const events = slotGroups.flat();

                                // Sort events by start time, then by end time
                                const sortedEvents = events.sort((a, b) => a.startHour - b.startHour || a.endHour - b.endHour);

                                // Check if all events have the same start and end time
                                const allSameTime = sortedEvents.length > 1 && sortedEvents.every(ev => ev.startHour === sortedEvents[0].startHour && ev.endHour === sortedEvents[0].endHour);

                                // Calculate vertical positions
                                let currentTop = 0;
                                const eventPositions = sortedEvents.map(ev => {
                                    const height = (ev.endHour - ev.startHour) * HOUR_HEIGHT + 10;
                                    let top;
                                    if (allSameTime) {
                                        // Stack on top for same time exams
                                        top = 0;
                                    } else {
                                        // Stack vertically for overlapping exams
                                        top = currentTop;
                                        currentTop += height + 0;
                                    }
                                    return { ...ev, calculatedHeight: height, calculatedTop: top };
                                });

                                return (
                                    <div key={t} className="day-cell w100 pos-rel">
                                        {eventPositions.map((ev, i) => {
                                            const zIndex = i + 1; // Stack order: first event at bottom, later ones on top

                                            // compute overlapping events for room and group
                                            const overlappingRoom = dayEvents.filter(e =>
                                                e.room === ev.room &&
                                                e.startHour < ev.endHour &&
                                                ev.startHour < e.endHour
                                            );

                                            const overlappingGroup = (ev.group)
                                                ? dayEvents.filter(e =>
                                                    e.group === ev.group &&
                                                    e.startHour < ev.endHour &&
                                                    ev.startHour < e.endHour
                                                )
                                                : [];

                                            const roomConflict = overlappingRoom.length > 1;
                                            const groupConflict = overlappingGroup.length > 1;

                                            let borderStyle = 'none';
                                            let conflictType = null;
                                            if (roomConflict && groupConflict) {
                                                borderStyle = `2px solid rgb(150, 0, 150)`; // both
                                                conflictType = 'both';
                                            } else if (groupConflict) {
                                                borderStyle = `2px solid rgb(245, 91, 91)`; // group (red)
                                                conflictType = 'group';
                                            } else if (roomConflict) {
                                                borderStyle = `2px solid rgb(255, 81, 0)`; // room (orange)
                                                conflictType = 'room';
                                            }

                                            // notify parent about conflict (keeps backward compatible signature)
                                            if ((roomConflict || groupConflict) && typeof onConflict === 'function') {
                                                try {
                                                    onConflict(ev, dayKey, {
                                                        type: conflictType,
                                                        overlappingRoomCount: overlappingRoom.length,
                                                        overlappingGroupCount: overlappingGroup.length,
                                                        overlappingRoomEvents: overlappingRoom,
                                                        overlappingGroupEvents: overlappingGroup
                                                    });
                                                } catch (e) {
                                                    // ignore parent errors
                                                }
                                            }

                                            return (
                                                <div
                                                    key={i}
                                                    className="event-box flex column clickable-2"
                                                    onClick={() => onEventClick(ev)}
                                                    onMouseEnter={() => setHoveredEvent(`${ev.id}-${i}`)}
                                                    onMouseLeave={() => setHoveredEvent(null)}
                                                    style={{
                                                        height: `${ev.calculatedHeight}px`,
                                                        top: `${ev.calculatedTop}px`,
                                                        zIndex: zIndex,
                                                        border: borderStyle,
                                                        boxSizing: 'border-box',
                                                        cursor: 'pointer',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {(roomConflict || groupConflict) && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '6px',
                                                            right: '8px',
                                                            background: groupConflict ? 'rgb(245, 91, 91)' : 'rgb(255, 81, 0)',
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
                                                        }}> {groupConflict ? <i className="fa-solid fa-people-group text-white"></i> : <i className="fa-solid fa-exclamation-triangle text-white"></i>} </div>
                                                    )}

                                                    <div className="flex row a-center">
                                                        <i className="fa-solid fa-door-open text-m text-white" style={{ opacity: roomConflict ? 1 : 0.9, filter: roomConflict ? 'drop-shadow(0 0 4px rgba(255,81,0,0.6))' : 'none' }}></i>
                                                        <Text color="var(--color-second)" text={ev.room} align="left" size="var(--text-l)" mrg="0 0 0.25em 0.5em"/>
                                                    </div>
                                                    <Text color="white" text={`${ev.type} - ${ev.module}`} align="center" mrg="auto 0" size="var(--text-m)" w="bold"/>
                                                    <Text color="white" text={ev.level} align="left" size="var(--text-s)"/>
                                                    <Text color="white" text={ev.speciality} align="left" size="var(--text-s)"/>
                                                    
                                                    {hoveredEvent === `${ev.id}-${i}` && !readOnly && (
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '0.5em',
                                                            marginTop: 'auto',
                                                            paddingTop: '0.5em',
                                                            animation: 'fadeIn 0.2s ease-in'
                                                        }}>
                                                            <IconButton
                                                                icon="fa-solid fa-trash"
                                                                color="white"
                                                                size="var(--text-m)"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setDeleteConfirmation({ show: true, event: ev })
                                                                }}
                                                                title="Delete exam"
                                                            />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    onEventSurveillance(ev)
                                                                }}
                                                                style={{
                                                                    background: 'rgba(100, 150, 255, 0.8)',
                                                                    border: 'none',
                                                                    color: 'white',
                                                                    padding: '0.3em 0.6em',
                                                                    borderRadius: '0.3em',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.75em',
                                                                    flex: 1
                                                                }}
                                                                title="Assign proctors"
                                                            >
                                                                <i className="fa-solid fa-users"></i>
                                                            </button>
                                                        </div>
                                                    )}
                                                    
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

            <ConfirmDialog
                isOpen={deleteConfirmation.show}
                title="Delete Exam"
                message={`Are you sure you want to delete ${deleteConfirmation.event?.module || 'this exam'}?`}
                confirmText="Delete"
                cancelText="Cancel"
                isDangerous={true}
                onConfirm={() => {
                    if (deleteConfirmation.event) {
                        onEventDelete(deleteConfirmation.event)
                    }
                    setDeleteConfirmation({ show: false, event: null })
                }}
                onCancel={() => setDeleteConfirmation({ show: false, event: null })}
            />
        </div>
    );
}
