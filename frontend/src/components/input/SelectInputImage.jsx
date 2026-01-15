import React, { useState, useRef, useEffect } from 'react'
import styles from './inputs.module.css'
import Profile from '../containers/profile'

/*  Options List Strecture 

[
    {
        value:"",
        text:"",
        img: ""
    },
    {
        value:"",
        text:"",
        img: ""
    },
    ...
]

*/

const SelectInputImage = ({ 
  mrg = "0", 
  w = "max-content", 
  options = [{value:"", text:"", img: ""}],
  indexed = false,
  bg = 'var(--trans-grey)',
  onChange = () => {},
  value = ''
}) => {
    const varStyles = {
        margin: mrg,
        width: w,
        cursor: "default",
        backgroundColor: "var(--trans-grey)",
    };

    const [selected, setSelected] = useState(options.length > 0 ? 0 : -1);
    const [selectedVal, setselectedVal] = useState(options[0]?.value || '');
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
        const index = options.findIndex(opt => opt.value === value);
        if (index >= 0) {
            setSelected(index);
            setselectedVal(value);
        } else if (options.length > 0) {
            setSelected(0);
            setselectedVal(options[0].value);
        } else {
            setSelected(-1);
            setselectedVal('');
        }
    }, [value, options]);

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
        <div className="flex row a-center">
            <Profile width="20px" mrg="0 1em 0 0" img={selected >= 0 ? options[selected]?.img : ''} />
            <p className="text-m text-low">{selected >= 0 ? options[selected]?.text : 'Select teacher'}</p>
        </div>
        <i className="fa-solid fa-sort text-low text-m"></i>
      </div>

      <ul ref={listRef} className={`flex column ${styles.selectList} pos-abs`} style={{backgroundColor: "var(--bgc)", boxShadow: "5px 5px 20px rgba(0,0,0,0.5)", borderRadius: "8px"}}>
        {options.map((option, index) => (
          <li
            key={index}
            data-id={option.value}
            className={`no-style-list ${styles.selectElement} ${selected == index?styles.selectedLi:""}`}
            onClick={() => {
              setSelected(index);
              setselectedVal(option.value);
              setOpen(false);
              onChange(option.value);
            }}
          >
            <div className="flex row a-center j-spacebet">
                <div className="flex row a-center">
                  <p className="text-m text-low">{indexed?index+1+"  -":""}</p>
                  <Profile width="20px" mrg={`0 1em 0 ${indexed?".5em":"0"}`} img={option.img} />
                  <p className="text-m text-low">{option.text}</p>
                </div>
                <i className={`fa-solid fa-check ${styles.check} ${selected == index?styles.checked:""}`}></i>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectInputImage;
