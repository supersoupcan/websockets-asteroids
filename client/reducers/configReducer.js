const configReducer = (state={}, action) => {
  switch(action.type){
    case "GET_CONFIG" : {
      state = action.payload;
      break;
    }
  }
  return state;
}

export default configReducer;