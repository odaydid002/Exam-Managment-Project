import React, { useMemo, useState } from 'react';

import styles from "./tables.module.css";
import Text from '../text/Text';
import SearchInput from '../input/SearchInput';
import Button from '../buttons/Button';
import IconButton from '../buttons/IconButton';
import TextButton from '../buttons/TextButton';
import SelectInput from '../input/SelectInput';

import formatNumber from '../../hooks/formatNumber';
import { useAnimateNumber } from "../../hooks/useAnimateNumber";

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const exportPDF = (items, config) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    doc.setFillColor(45, 45, 45);
    doc.rect(0, 0, doc.internal.pageSize.width, 70, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(config.title, 40, 45);

    autoTable(doc, {
        startY: 90,
        head: [config.headers],
        body: items.map(config.mapRow),
        headStyles: {
            fillColor: [241, 80, 74],
            textColor: [255, 255, 255],
        },
        theme: "grid",
    });

    doc.save(config.fileName + ".pdf");
};

const exportExcel = (items, config) => {
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "List");
    XLSX.writeFile(wb, config.fileName + ".xlsx");
};

export const ListTable = ({
    title = "",
    rowTitles = [],
    rowTemplate = "1fr 1fr",
    dataList = { total: 0, items: [] },
    ovh = false,
    rowRenderer,    
    filterFunction, 
    sortFunction,   

    exportConfig = null
}) => {

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("Default");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredItems = useMemo(() => {
        let list = [...dataList.items];

        if (search.trim()) {
            list = list.filter(item => filterFunction(item, search));
        }

        if (sortFunction) {
            list.sort((a, b) => sortFunction(a, b, sortBy));
        }

        return list;
    }, [dataList.items, search, sortBy]);

    const pages = Math.ceil(filteredItems.length / pageSize) || 1;
    const start = (currentPage - 1) * pageSize;
    const pageItems = filteredItems.slice(start, start + pageSize);

    useGSAP(() => {
        gsap.from('.gsap-row', { 
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.025,
         });
    });

    return (
        <div className={`${styles.tableList} full ${ovh?"overflow-h":"overflow-a"}`}>

            <div className="flex row a-center w100 j-spacebet">
                <div className="flex row a-center gap">
                    <Text text={title} size="var(--text-m)" />
                    <Text text={`(${formatNumber(useAnimateNumber(0, filteredItems.length, 1000))})`} size="var(--text-s)" opacity="0.3" />

                    <SearchInput
                        maxWidth="180px"
                        onChange={e => setSearch(e.target.value)}
                    />

                    <Button text="Add filter" icon="fa-solid fa-filter" />
                </div>

                <div className="flex row a-center gap">
                    <div className={`${styles.Pagination} flex a-center w100`}>
                        <div className="flex row a-center gap">
                            <Text align='left' size='var(--text-s)' opacity='0.3' text="items per page"/>
                            <input
                                type="number"
                                value={pageSize}
                                className={styles.inp}
                                min="1"
                                max={filteredItems.length || 1}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value) || 1);
                                    setCurrentPage(1);
                                }}
                            />
                            <Text align="left" size="var(--text-s)" opacity="0.3"
                                text={`${start + 1} - ${Math.min(start + pageSize, filteredItems.length)} of ${filteredItems.length} items`} />
                        </div>
                    </div>
                    {exportConfig && (
                        <>
                            <IconButton
                                icon="fa-solid fa-print"
                                onClick={() => exportPDF(filteredItems, exportConfig)}
                            />
                            <IconButton
                                icon="fa-solid fa-download"
                                onClick={() => exportExcel(filteredItems, exportConfig)}
                            />
                        </>
                    )}

                    <SelectInput
                        bg="var(--bg)"
                        onChange={setSortBy}
                        icon="fa-solid fa-arrow-down-short-wide"
                        options={[
                            { value: "Default", text: "Default" },
                            { value: "A-Z", text: "A-Z" },
                            { value: "Z-A", text: "Z-A" }
                        ]}
                    />
                </div>
                
            </div>

            <div
                className={styles.tableListHead}
                style={{ gridTemplateColumns: rowTemplate }}
            >
                {rowTitles.map((t, i) => (
                    <Text align='left' key={i} text={t} size="var(--text-m)" />
                ))}
            </div>

            <div className={`flex column ${styles.tableListBody} scrollbar`}>
                <div className={styles.tableListContent}>
                    {pageItems.map((item, i) => (
                        <div
                            key={i}
                            className={`${styles.listTableRow} a-center gsap-row`}
                            style={{ gridTemplateColumns: rowTemplate }}
                        >
                            {rowRenderer(item, i)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex row center gap w100">

                <IconButton
                    icon="fa-solid fa-angles-left"
                    enabled={currentPage > 1}
                    color={currentPage > 1 ? "var(--text)" : "var(--text-low)"}
                    onClick={() => setCurrentPage(1)}
                />

                <IconButton
                    icon="fa-solid fa-chevron-left"
                    enabled={currentPage > 1}
                    color={currentPage > 1 ? "var(--text)" : "var(--text-low)"}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                />

                <TextButton
                    text="Prev"
                    textColor={currentPage > 1 ? "var(--text)" : "var(--text-low)"}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                />

                <p className='cText text-m'>
                    <span className='text-fill'>{currentPage}</span>{` of ${pages}`}
                </p>

                <select
                    className={styles.inp}
                    value={currentPage}
                    onChange={e => setCurrentPage(Number(e.target.value))}
                >
                    {Array.from({ length: pages }, (_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                </select>

                <Text mrg='0 0 0 0.25em' text={`of ${pages}`} align="left" color="var(--text-low)" size="var(--text-m)" />

                <TextButton
                    enabled={currentPage < pages}
                    text="Next"
                    textColor={currentPage < pages ? "var(--text)" : "var(--text-low)"}
                    onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                />

                <IconButton
                    color={currentPage < pages ? "var(--text)" : "var(--text-low)"}
                    enabled={currentPage < pages}
                    icon="fa-solid fa-chevron-right"
                    onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                />

                <IconButton
                    color={currentPage < pages ? "var(--text)" : "var(--text-low)"}
                    enabled={currentPage < pages}
                    icon="fa-solid fa-angles-right"
                    onClick={() => setCurrentPage(pages)}
                />
            </div>
        </div>
    );
};
