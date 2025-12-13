import React from 'react'
import Text from '../text/Text'

const Exam = ({
  name = "",
  time = "",
  room = "",
  css = "",
  color = "var(--color-main)",
  border = "2px solid var(--trans-grey)",
  bg = "transparent",
  round = "8px"
}) => {
  return <div className={`${css} pd flex row a-center gap`} style={{
    border: border,
    backgroundColor: bg,
    borderRadius: round
  }}>
     <div style={{backgroundColor: color, height: "45px", borderRadius: "5px", width: "4px"}}>
     </div>
     <div className="flex column curs-default">
        <Text text={name} size='var(--text-m)' opacity='0.6' align='left' />
        <div className="flex row a-center gap" style={{marginTop: "0.5em"}}>
            <div className="flex a-center">
                <i className="fa-regular fa-clock text-s cText" style={{marginRight: "0.5em"}}></i>
                <Text text={time} size='var(--text-s)' align='left'/>
            </div>
            <div className="flex a-center">
                <i className="fa-solid fa-location-dot text-s cText" style={{marginRight: "0.5em"}}></i>
                <Text text={room} size='var(--text-s)' align='left'/>
            </div>
        </div>
     </div>
  </div>
}

export default Exam