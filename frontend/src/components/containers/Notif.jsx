import React from 'react'
import Text from '../text/Text'

const Notif = ({
    read = false,
    mrg = '0',
    pd = "0 0.5em 0.625em 0" ,
    css = "",
    icon = null,
    title = "",
    description = "",
    date = "",
    time = null,
    iconColor = "var(--color-main)",
    onClick = (e) => {e}
}) => {
  const divTitle = !read ? 'Click to mark as read' : undefined;
  const safeTitle = (title === false || title == null) ? undefined : String(title);
  const safeDescription = description == null ? '' : String(description);

  return (
    <div title={divTitle} 
        onClick={()=> {onClick()}} 
        className={`${css} flex row a-start gap clickable j-spacebet w100`} 
        style={{
            margin: mrg,
            padding: pd,
            borderBottom: "2px solid var(--trans-grey)",
            opacity: read?"0.4":"1",
    }}>
        { icon && <div className='flex center' style={{
            backgroundColor: `color-mix(in srgb, ${iconColor} 10%, transparent)`,
            borderRadius: "0.3125em",
            padding: "0.625em"
        }}>
            <i className={icon} style={{
                fontSize: 'var(--text-l)',
                color: iconColor
            }}/>
        </div>}
        <div className='flex column w100'>
            <Text overflow = {false} align='left' text={safeTitle} w="bold" size='0.75rem'/>
            <Text align='left' text={safeDescription} size='0.7rem' opacity='0.6'/>
            <Text align='right' mrg='0.25em 0.25em 0 0'  text={`${date} ${time?`| ${time}`:""}`} size='var(--text-s)' opacity='0.8'/>
        </div>
    </div>
  )
}

export default Notif