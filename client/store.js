import {createStore, combineReducers, applyMiddleware} from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import game from "./reducers/gameReducer";
import config from "./reducers/configReducer";
import socket from './socket';

export default createStore(
  combineReducers({
    game : game,
    config : config
  }), {
    game : null,
    config : null,
  },
  applyMiddleware(thunk.withExtraArgument(socket))
);
