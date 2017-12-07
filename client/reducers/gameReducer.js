const gameReducer = (state={}, action) => {
  switch(action.type){
    case "UPDATE" : {
      state = action.payload;
      break;
    }
  }
  return state;
}

export default gameReducer;