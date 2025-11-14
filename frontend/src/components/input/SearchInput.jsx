import styles from './inputs.module.css';

function SearchInput({ onClick, inputParms }) {
  return ( 
    <div className={`flex row a-center pdl overflow-h cbg-trans-grey ${styles.container}`}>
      <i className="fa-solid fa-magnifying-glass l clickable text" onClick={onClick}></i>
      <input className={`${styles.search} ${styles.borderless} m text`} {...inputParms} type="search" />
    </div>
  );
}

export default SearchInput;