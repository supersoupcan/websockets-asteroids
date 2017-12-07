export default function socketUpdate(data){
  return(dispatch, getState, socket) => {
    socket.send(
      JSON.stringify({
        type : "UPDATE",
        payload : data
      })
    )
  }
}