import Text from '../text/Text'
import Copy from '../buttons/Copy'

const StaticCard2 = (
    {
        icon = null,
        color = "var(--color-main)",
        label = "",
        value = "",
        pd= "1em",
        mrg = "0",
        bg = "var(--trans-grey)",
        border = "2px solid var(--border-low)",
        round = "8px",
        css = "",
        minWidth = "unset",
        minHeight = "unset",
        textColor = "var(--text)",
        copyable = false,
        rest
    }
) => {
  return (
    <div style={{
        backgroundColor: bg,
        padding: pd,
        margin: mrg,
        border: border,
        minWidth: minWidth,
        minHeight: minHeight,
        borderRadius: round
    }} className={`flex row gap a-center ${css}`} {...rest}>
        {icon && <div className='flex center' style={{
            backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
            width: "calc(var(--text-xl) * 2)",
            height: "calc(var(--text-xl) * 2)",
            borderRadius: "50%",
        }}>
            <i className={`${icon} text-l`} style={{color: color}}></i>
        </div> }
        <div className="flex column">
            <div className="flex row a-center gap">
                <Text css='ellipsis' align='left' text={value} w='bold' size='var(--text-m)' color={textColor}/>
                {copyable && <Copy value={value} />}
            </div>
            <Text css='ellipsis' align='left' text={label} size='var(--text-m)' color={textColor} opacity='0.4'/>
        </div>
    </div>
  )
}

export default StaticCard2