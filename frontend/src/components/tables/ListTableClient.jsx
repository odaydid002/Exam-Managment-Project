import React, { useMemo, useState, useEffect } from 'react';

import styles from "./tables.module.css";
import Text from '../text/Text';
import SearchInput from '../input/SearchInput';
import IconButton from '../buttons/IconButton';
import TextButton from '../buttons/TextButton';
import SelectInput from '../input/SelectInput';

import formatNumber from '../../hooks/formatNumber';
import { useAnimateNumber } from "../../hooks/useAnimateNumber";

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

const ListTableClient = ({
    title = "",
    rowTitles = [],
    rowTemplate = "1fr 1fr",
    dataList = { total: 0, items: [] },
    rowRenderer,    
    filterFunction, 
    sortFunction,   
}) => {

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [sortBy, setSortBy] = useState("DateAsc");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredItems = useMemo(() => {
        let list = [...dataList.items];

        if (search.trim()) {
            list = list.filter(item => filterFunction(item, search));
        }

        if (sortFunction) {
            list.sort((a, b) => {
                try {
                    return sortFunction(a, b, sortBy);
                } catch (err) {
                    console.debug('ListTableClient: sortFunction error', err);
                    return 0;
                }
            });
        } else {
            if (sortBy === 'A-Z') {
                list.sort((a, b) => (String(a.name || a.module_name || '')).localeCompare(String(b.name || b.module_name || '')));
            } else if (sortBy === 'Z-A') {
                list.sort((a, b) => (String(b.name || b.module_name || '')).localeCompare(String(a.name || a.module_name || '')));
            } else if (sortBy === 'DateAsc' || sortBy === 'Date') {
                list.sort((a, b) => {
                    const da = a.date ? new Date(a.date) : new Date(0);
                    const db = b.date ? new Date(b.date) : new Date(0);
                    return da - db;
                });
            } else if (sortBy === 'DateDesc') {
                list.sort((a, b) => {
                    const da = a.date ? new Date(a.date) : new Date(0);
                    const db = b.date ? new Date(b.date) : new Date(0);
                    return db - da;
                });
            }
        }

        return list;
    }, [dataList.items, search, sortBy, filterFunction, sortFunction]);

    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput || ""), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const pages = Math.ceil(filteredItems.length / pageSize) || 1;
    const start = (currentPage - 1) * pageSize;
    const pageItems = filteredItems.slice(start, start + pageSize);
    
  return (
    <div className={`${styles.tableList} full overflow-a`}>

            <div className="flex row a-center w100 j-spacebet">
                <div className="flex row a-center gap">
                    <Text text={title} size="var(--text-m)" />
                    <Text text={`(${formatNumber(useAnimateNumber(0, filteredItems.length, 1000))})`} size="var(--text-s)" opacity="0.3" />

                    <SearchInput
                        maxWidth="180px"
                        value={searchInput}
                        onChange={e => {
                            setSearchInput(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="flex row a-center gap">
                    <div className={`${styles.Pagination} flex a-center w100`}>
                        <div className="flex row a-center gap">
                            <Text align='left' size='var(--text-s)' opacity='0.3' text="items per page"/>
                            <select
                                className={styles.inp}
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                            </select>
                            <Text align="left" size="var(--text-s)" opacity="0.3"
                                text={`${start + 1} - ${Math.min(start + pageSize, filteredItems.length)} of ${filteredItems.length} items`} />
                        </div>
                    </div>

                    <SelectInput
                        bg="var(--bg)"
                        onChange={setSortBy}
                        icon="fa-solid fa-arrow-down-short-wide"
                        options={[
                            { value: "DateAsc", text: "Date ↑" },
                            { value: "DateDesc", text: "Date ↓" },
                            { value: "A-Z", text: "A-Z" },
                            { value: "Z-A", text: "Z-A" }
                        ]}
                    />
                </div>
                
            </div>

            <div
                className={styles.tableListHead}
                style={{ gridTemplateColumns: rowTemplate, paddingLeft: "1em" }}
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
                            className={`${styles.listTableRowView} a-center gsap-row`}
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
  )
}

export default ListTableClient