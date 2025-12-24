import './switch.css';
import Text from '../text/Text';
import { useState } from 'react';

const Switchbox = ({
    bg = "var(--bg)",
    color = "var(--color-main)",
    circleColor = "white",
    mrg = "0",
    css = "",
    label = "",
    desc = "",
    width = "100%",
    boxWidth = "3.5em",
    boxHeight = "1.5em",
    initial = false,
    value = undefined,
    onChange = () => {}

}) => {
    const [active, setActive] = useState(initial);

    // allow parent-controlled value
    const effective = (value === undefined) ? active : value;

    const toggle = (e) => {
        e && e.preventDefault && e.preventDefault();
        const next = !effective;
        if (value === undefined) setActive(next);
        try { onChange(next); } catch (err) {}
    }

    return (
        <div className={`${css} flex row a-center j-spacebet ease-in-out curs-default`} style={{
            margin: mrg,
            width: width
        }} onClick={toggle}>
            {label && <label className='flex column'>
                <Text text={label} align='left' size='var(--text-m)' />
                <Text text={desc} align='left' size='var(--text-s)' opacity='0.4'/>
            </label>}
            <div className='switch pos-rel rounded-l ease-in-out pointer' style={{
                background: effective ? color : bg,
                width: boxWidth,
                height: boxHeight
            }}>
                <input type="checkbox" hidden onClick={(e)=>{e.preventDefault();}} onChange={(e)=>{ toggle(e) }} checked={effective} />
                <div className='circle pos-abs ease-in-out' style={{
                    backgroundColor: circleColor,
                    height: `calc(${boxHeight} - 3px)`,
                    width: `calc(${boxHeight} - 3px)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: effective ? `calc(100% - calc(${boxHeight}))`:"3px"
                }}></div>
            </div>
        </div>
    )
}

export default Switchbox