import styles from './inputs.module.css';

function SearchInput({ onClick, inputParms }) {

  const varStyles = {
    width: "calc(100% - 1.3em)",
    marginLeft: "0.65em",
    padding: "0.10em 0",
    paddingLeft: "0.85em",
  }

  return ( 
    <div className={`flex row a-center pdl overflow-h ${styles.container}`} style={varStyles}>
      <i className="fa-solid fa-magnifying-glass l clickable text" onClick={onClick}></i>
      <input placeholder='Search...' className={`${styles.search} ${styles.borderless} m text`} {...inputParms} type="search" />
    </div>
  );
}

export default SearchInput;