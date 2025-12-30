import React, { useState, useRef, useEffect } from 'react'
import styles from './inputs.module.css'
import Text from '../text/Text';

const SelectInput = ({ 
  mrg = "0", w = "fit-content", 
  label = "",
  placeholder = "Select...",
  options = [{value:"", text:""}], 
  onChange = () =>{},
  indexed = false,
  icon = null,
  bg = 'var(--bg)',
  value = null
}) => {
    const varStyles = {
      margin: mrg,
      cursor: "default",
      backgroundColor: bg || 'var(--trans-grey)'
    };

    // Only set a fixed inline width when the caller provided an explicit width
    // other values like 'fit-content' or 'auto' will be measured and applied
    if (w && w !== 'fit-content' && w !== 'auto') {
      varStyles.width = w;
    }

    const [selected, setSelected] = useState(0);
    const [selectedVal, setselectedVal] = useState(null);
    const [open, setOpen] = useState(false);

    const containerRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
      if (!options || options.length === 0) return;

      // Controlled `value` takes precedence
      if (value !== null && value !== undefined) {
        const foundIndex = options.findIndex(opt => opt.value === value || opt.value === String(value))
        if (foundIndex !== -1) {
          setSelected(foundIndex)
          setselectedVal(options[foundIndex].value)
        }
      }
    }, [value, options])

    useEffect(() => {
      if (!listRef.current || !containerRef.current) return;
      const measure = () => {
        try {
          const listEl = listRef.current;
          const containerEl = containerRef.current;

          const items = listEl.querySelectorAll('li');
          let max = 0;
          items.forEach(li => {
            const p = li.querySelector('p')
            const w = p ? p.getBoundingClientRect().width : li.getBoundingClientRect().width
            if (w > max) max = w
          })

          const selectedP = containerEl.querySelector('> div p')
          if (selectedP) {
            const sw = selectedP.getBoundingClientRect().width
            if (sw > max) max = sw
          }

          const EXTRA = 75
          const finalWidth = Math.ceil(max + EXTRA)
          if (!varStyles.width) {
            containerEl.style.width = finalWidth + 'px'
          }
        } catch (err) {
          if (containerRef.current) containerRef.current.style.width = 'auto'
        }
      }

      const t = setTimeout(measure, 0)
      window.addEventListener('resize', measure)
      return () => {
        clearTimeout(t)
        window.removeEventListener('resize', measure)
      }
    }, [options, value, selected])

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
    <div style={{margin: mrg}}>
      {label && <div style={{ margin: "0.5em 0" }}>{
        <Text 
            text={label} 
            color='var(--text-low)'
            size='var(--text-m)' 
            opacity='0.8' 
            align='left'
        />}</div>}
      <div
        ref={containerRef}
        style={varStyles}
        className={`${styles.container} ${styles.selectContainer} ${open ? styles.open : ""} flex a-center pos-rel`}
        selected-value = {selectedVal || 0}
        selected-index = {selected}
      >
        <div
          className="flex row h100 a-center w100 j-spacebet gap"
          onClick={() => setOpen(!open)}
        >
          {icon && <i className={icon} style={{
            fontSize:"var(--text-m)",
            color: "var(--text-low)"
          }}></i>}
          <p className="ellipsis text-m text-low">{options.length > 0 && selected < options.length ? options[selected].text : placeholder}</p>
          <i className="fa-solid fa-sort" style={{
            fontSize:"var(--text-m)",
            color: "var(--text-low)"
          }}></i>
        </div>

        <ul ref={listRef} style={{backgroundColor: bg}} className={`flex column ${styles.selectList} pos-abs z-10`}>
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
                  <p className="ellipsis text-m text-low">{indexed?index+1+" - ":""} {option.text}</p>
                  <i className={`fa-solid fa-check ${styles.check} ${selected == index?styles.checked:""}`}></i>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SelectInput;
