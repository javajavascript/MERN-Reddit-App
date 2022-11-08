import React, { useState } from 'react';

function DeleteButton(props) {
  const [show, setShow] = useState(false);

  function toggleShow() {
    setShow(!show);
  }
  
  return (
    <div>
      {show || <input type="button" value="Delete" onClick={() => toggleShow(props.id)}/>}
      {show && <input type="button" value="Confirm Delete" onClick={() => {props.remove(props.id); toggleShow(props.id);}}/>}
      {show && <input type="button" value="Cancel" onClick={() => {toggleShow(props.id);}}/>}
    </div>
  );
};

export default DeleteButton;