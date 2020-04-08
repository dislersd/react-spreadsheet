import React, { Component } from "react";
import PropTypes from "prop-types";

export default class Cell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      value: props.value,
    };

    this.display = this.determineDisplay(
      { x: props.x, y: props.y },
      props.value
    );
    this.timer = 0;
    this.delay = 200;
    this.prevent = false;
  }

  
}
