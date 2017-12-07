export default function socketEvent(msgStr){
  return dispatch => {
    const msg = JSON.parse(msgStr);
    dispatch({
      type : msg.type,
      payload : msg.payload
    })
  }
}