const ExpendContainer = (props) => {

  const varStyles = {
    width: props.w,
    height: props.h,
    minHeight: props.minHeight,
    zIndex: 10,
  };

  return (
    <div className={`${props.classes || ""} pos-rel`} style={varStyles}>
      {props.children}
    </div>
  );
};

export default ExpendContainer;
