import React from 'react'
import { useNotify } from '../loaders/NotificationContext';

const Copy = ({
    value = "",
    mrg = "0",
    css = "",
    color = "var(--text-low)",
    size = "var(--text-s)",
    bg = "var(--trans-grey)",
    round = "5px",
    pd = "0.25em 0.55em"
}) => {
    const { notify } = useNotify()
  return (
    <button className={`clickable ${css}`} type='button' style={{
        border:"none",
        backgroundColor: bg,
        borderRadius: round,
        padding: pd,
        margin: mrg,
        color: color,
        fontSize: size
    }} onClick={() => {
        navigator.clipboard.writeText(value)
        .then(() => {
            notify('success', 'Copied to clipboard');
        })
        .catch(err => {
            notify('error','Failed to copy');
            console.error("Failed to copy:", err);
        });
        }}>
        <i className="fa-regular fa-copy" style={{
            fontSize: size,
            color: color
        }}></i>
    </button>
  )
}

export default Copy