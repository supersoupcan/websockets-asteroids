import {createStore, combineReducers, applyMiddleware} from 'redux';
import logger from 'redux-logger';

import user from "./reducers/userReducer";


export default createStore(
  combineReducers({
    user : user,
  }), {
    user: {
      name : "Jacob",
      age: 22,
      }
    },
  applyMiddleware(logger)
);
