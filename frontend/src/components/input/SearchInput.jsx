import styles from './inputs.module.css';

function SearchInput({ 
  onClickIcon = () => {}, 
  onChange = () => {}, 
  onInput = () => {}, 
  ref = null,
  fontSize = "var(--text-m)",
  css = "",
  mrg = "0",
  pd = "0.10em 0 0.10em 0.85em",
  width = "100%",
  maxWidth = "unset",
  bg = "var(--trans-grey)"
}) {

  const varStyles = {
    width: width,
    maxWidth : maxWidth,
    margin: mrg,
    fontSize: fontSize,
    padding: pd,
    backgroundColor: bg
  }

  return ( 
    <div ref={ref} className={`flex row a-center pdl overflow-h ${css} ${styles.container}`} style={varStyles}>
      <i style={{fontSize: fontSize}} className="fa-solid fa-magnifying-glass clickable ctext" onClick={onClickIcon}></i>
      <input placeholder='Search...' className={`${styles.search} ${styles.borderless} ctext`} type="search" onChange={onChange} onInput={onInput}/>
    </div>
  );
}

export default SearchInput;