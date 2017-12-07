import React, { Component } from 'react';
import { connect } from 'react-redux';

import socket from '../socket';
import socketEvent from '../actions/socketEvent';
import socketUpdate from '../actions/socketUpdate';

import Game from '../components/Game';


class App extends Component{
  componentDidMount(){
    socket.onmessage = (e) => {
      this.props.socketEvent(e.data);
    }
  }
  render(){
    return(
      <Game 
        game={this.props.game}
        update={this.props.socketUpdate}
        width={window.innerWidth * window.devicePixelRatio}
        height={window.innerHeight * window.devicePixelRatio}
        cf={this.props.config}
      />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    game : state.game,
    config : state.config
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    socketEvent : data => {
      dispatch(socketEvent(data));
    },
    socketUpdate : data => {
      dispatch(socketUpdate(data));
    }
  };
};

export default connect(mapStateToProps,  mapDispatchToProps)(App);