import React from 'react'
import Text from '../text/Text'

const ExamRequest = ({
  name = "",
  date = "",
  time = "",
  room = "",
  status = "Pending",
  css = "",
  color = status == "pending"?"#7D7D7D":status == "approved"?"#4FB6A3":"#F1504A",
  border = "none",
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
     <div className="flex row a-center j-spacebet w100">
        <div className="flex column curs-default">
            <Text text={name} size='var(--text-m)' align='left' />
            <div className="flex row a-center gap" style={{marginTop: "0.5em", opacity:'0.6'}}>
                <div className="flex a-center">
                    <i className="fa-regular fa-calendar text-s cText" style={{marginRight: "0.5em"}}></i>
                    <Text text={date} size='var(--text-s)' align='left'/>
                </div>
                <div className="flex a-center">
                    <i className="fa-regular fa-clock text-s cText" style={{marginRight: "0.5em"}}></i>
                    <Text text={time} size='var(--text-s)' align='left'/>
                </div>
                <div className="flex a-center">
                    <i className="fa-solid fa-door-open text-s cText" style={{marginRight: "0.5em"}}></i>
                    <Text text={room} size='var(--text-s)' align='left'/>
                </div>
            </div>
        </div>
            <div className="flex center" style={{
                padding:"0.5em 1.25em",
                borderRadius: "3px",
                backgroundColor: status == "pending"?"#86868619":status == "approved"?"#4fb6a31b":"#f1504a21"
            }}>
               <Text text={status} align="center" size="var(--text-s)" color={status == "pending"?"#7D7D7D":status == "approved"?"#4FB6A3":"#F1504A"} />
            </div>
     </div>
  </div>
}

export default ExamRequest