import React, { useRef, useState, useEffect, useMemo } from 'react';
import Text from '../text/Text';

const TextInput = ({
    mrg = "0",
    width = "100%",
    height = "2.2em",
    pd = "0 1em",
    bg = 'var(--trans-grey)',
    color = "var(--text)",
    round = "5px",
    icon = null,
    label = null,
    readOnly = false,
    val = undefined,
    value = undefined,
    type = "text",
    align = "left",
    border = "none",
    placeholder = "",
    onchange = (e) => {e},
    oninput = (e) => {e},
    editable = false,
    onEdit = () => {},
    dataList = [],
    disabled = false,
    css = "",
    ...rest
}) => {

    const inp = useRef(null);
    const isControlled = value !== undefined || val !== undefined;
    const [internalValue, setInternalValue] = useState(() => (val ?? value ?? ""));

    useEffect(() => {
        if (value !== undefined) setInternalValue(value);
        else if (val !== undefined) setInternalValue(val);
    }, [value, val]);
    const dataListId = useMemo(() => "datalist-" + Math.random().toString(36).substring(2), []);
    return (
        <>
            <div className={`${css} flex column`} style={{ width, margin: mrg }}>
                {label && (
                    <label htmlFor="text-input" style={{ margin: "0.5em 0" }}>
                        <Text 
                            text={label} 
                            color='var(--text-low)'
                            size='var(--text-m)' 
                            opacity='0.8' 
                            align='left'
                        />
                    </label>
                )}
                <div className={`flex row a-center w100 ${disabled && 'disabled'}`} style={{
                    border,
                    borderRadius: round,
                    backgroundColor: bg,
                    padding: pd,
                    height
                }}>
                    {icon && <i className={`${icon} text-m text-low`} />}
                    <input 
                        {...rest}
                        disabled={disabled}
                        readOnly={readOnly}
                        value={isControlled ? (value ?? val ?? "") : internalValue}
                        list={dataListId}
                        ref={inp}
                        className='full'
                        type={type}
                        placeholder={placeholder}
                        onChange={(e) => {
                            if (!isControlled) setInternalValue(e.target.value);
                            try { onchange && onchange(e); } catch (err) {}
                        }}
                        onInput={(e) => {
                            try { oninput && oninput(e); } catch (err) {}
                        }}
                        onFocus={(e) => e.target.style.outline = "none"}
                        style={{
                            paddingLeft: !icon?"":"1em",
                            border: "none",
                            textAlign: align,
                            backgroundColor: "transparent",
                            color: color
                        }}
                        />
                        {editable && 
                        <i 
                            className="fa-solid fa-pen-to-square text-m c-text clickable"
                            onClick={() => {onEdit()}}
                        ></i> }
                </div>
            </div>
            <datalist id={dataListId}>
                {dataList.map((option, i) => (
                    <option key={i} value={option} />
                ))}
            </datalist>
        </>
    );
};

export default TextInput;
