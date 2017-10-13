const userReducer = (state={}, action) => {
  switch(action.type){
    case "CHANGE_NAME" : {
      state = Object.assign({}, state, {
        name : action.payload
      })
      break;
    }
    case "CHANGE_AGE" : {
      state = Object.assign({}, state, {
        age : action.payload
      })
      break
    }
  }
  return state;
};

export default userReducer;