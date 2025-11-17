import React, { useState, useRef, useEffect } from 'react'
import styles from './inputs.module.css'

/*  Options List Strecture 

[
    {
        value:"",
        text:"",
    },
    {
        value:"",
        text:"",
    },
    ...
]

*/

const SelectInput = ({ 
  mrg = "0", w = "max-content", 
  options = [{value:"", text:""}], 
  onChange = () =>{},
  indexed = false
}) => {
    const varStyles = {
        margin: mrg,
        width: w,
        cursor: "default",
    };

    const [selected, setSelected] = useState(0);
    const [selectedVal, setselectedVal] = useState(null);
    const [open, setOpen] = useState(false);

    const containerRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
    if (!listRef.current || !containerRef.current) return;
        listRef.current.classList.add(styles.measure);
        const width = listRef.current.offsetWidth;
        containerRef.current.style.width = width + "px";
        listRef.current.classList.remove(styles.measure);
    }, []);

    useEffect(() => {
    function handleClickOutside(e) {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  return (
    <div
      ref={containerRef}
      style={varStyles}
      className={`${styles.container} ${styles.selectContainer} ${open ? styles.open : ""} flex a-center pos-rel`}
      selected-value = {selectedVal || 0}
      selected-index = {selected}
    >
      <div
        className="flex row h100 a-center w100 j-spacebet"
        onClick={() => setOpen(!open)}
      >
        <p className="text-m text-low">{options[selected].text}</p>
        <i className="fa-solid fa-sort text-low text-m"></i>
      </div>

      <ul ref={listRef} className={`flex column ${styles.selectList} pos-abs`}>
        {options.map((option, index) => (
          <li
            key={index}
            data-id={option.value}
            className={`no-style-list ${styles.selectElement} ${selected == index?styles.selectedLi:""}`}
            onClick={() => {
              setSelected(index);
              setselectedVal(option.value);
              setOpen(false);
              onChange(index);
            }}
          >
            <div className="flex row a-center j-spacebet">
                <p className="text-m text-low">{indexed?index+1+" - ":""} {option.text}</p>
                <i className={`fa-solid fa-check ${styles.check} ${selected == index?styles.checked:""}`}></i>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectInput;
