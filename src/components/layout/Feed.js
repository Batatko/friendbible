const Feed = (props) => {
  return (
    <div className={props.className} style={props.style}>
      {props.children}
    </div>
  );
};

export default Feed;
