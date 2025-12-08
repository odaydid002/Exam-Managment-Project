import React from 'react'
import Text from '../text/Text'
import Button from './Button'

const DangerAction = (
    {
        title = "",
        onAction = () => {},
        css = "",
        mrg = "0"
    }
) => {
  return (
    <div className={`flex column rounded-m ${css}`} style={{
            backgroundColor: "rgba(248, 82, 82, 0.05)",
            padding: "0.8em 1em",
            margin: mrg,
        }}>
        <div className="flex row a-center gap" >
            <i className='fa-solid fa-triangle-exclamation' style={{
                color: 'rgb(255, 68, 0)',
                fontSize: "var(--text-l)"
            }}></i>
            <Text text={title} size='var(--text-m)'/>
        </div>
        <Button mrg='0.5em 0 0 0' bg="rgba(248, 82, 82, 0.15)" color='red' text='Execute' onClick={() => {onAction}}/>
    </div>
  )
}

export default DangerAction