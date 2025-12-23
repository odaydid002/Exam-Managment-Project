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
    onChange = () => {}

}) => {

    const [active, setActive] = useState(initial);

    return (
        <div className={`${css} flex row a-center j-spacebet ease-in-out curs-default`} style={{
            margin: mrg,
            width: width
        }} onClick={(e)=>{e.preventDefault; setActive(!active); onChange}} checked = {active}>
            {label && <label className='flex column'>
                <Text text={label} align='left' size='var(--text-m)' />
                <Text text={desc} align='left' size='var(--text-s)' opacity='0.4'/>
            </label>}
            <div className='switch pos-rel rounded-l ease-in-out pointer' style={{
                background: active? color:bg,
                width: boxWidth,
                height: boxHeight
            }}>
                <input type="checkbox" hidden onClick={(e)=>{e.preventDefault; setActive(!active); onChange}} checked = {active} />
                <div className='circle pos-abs ease-in-out' style={{
                    backgroundColor: circleColor,
                    height: `calc(${boxHeight} - 3px)`,
                    width: `calc(${boxHeight} - 3px)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: active? `calc(100% - calc(${boxHeight}))`:"3px"
                }}></div>
            </div>
        </div>
    )
}

export default Switchbox