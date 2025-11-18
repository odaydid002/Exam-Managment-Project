import React, { useState } from 'react';

const ExpendContainer = (props) => {
  const [w, setW] = useState(`${props.w}`);
  const [closeBt, setCloseBt] = useState(`fa-circle-chevron-right`);

  const expand = () => {
    setW(prev => (prev === `${props.w}` ? `${props.xw}` : `${props.w}`));
    setCloseBt(prev => (prev === `fa-circle-chevron-right` ? `fa-circle-chevron-left` : `fa-circle-chevron-right`));
  };

  const varStyles = {
    width: w,
    height: props.h,
    zIndex: 10,
  };

  return (
    <div className={`${props.classes || ""} pos-rel`} style={varStyles}>
      <i 
        onClick={expand} 
        className={`fa-solid ${closeBt} pos-abs top-left clickable text-xl text-low`}
      ></i>
      {props.children}
    </div>
  );
};

export default ExpendContainer;
