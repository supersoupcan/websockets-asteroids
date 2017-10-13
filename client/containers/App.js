import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setName } from '../actions/userActions';


class App extends Component {
  render(){
    return(
      <div>
        <h1>Simple React Boiler Plate</h1>
        <p> Hello {this.props.user.name} </p>
        <p> You are {this.props.user.age} years old</p>
        <p onClick={() => this.props.setName("Kendrick")}> 
          Click here to change your name to Kendrick
        </p> 
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user : state.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setName : (name) => {
      dispatch(setName(name));
    }
  };
};

export default connect(mapStateToProps,  mapDispatchToProps)(App);
