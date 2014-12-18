var SkinnableComponent = require('../core/SkinnableComponent');
var skinPart = require('../core/skinPart');
var React = require('react');


var NumberInput = SkinnableComponent.createClass({
  displayName: 'NumberInput',
  
  propTypes: {
    value: React.PropTypes.number,
    format: React.PropTypes.func,
    parse: React.PropTypes.func,
    
    step: React.PropTypes.number,
    
    onChange: React.PropTypes.func,
    
    disabled: React.PropTypes.bool
  },
  
  getDefaultProps() {
    return {
      value: 0,
      format(value) {
        return '' + value;
      },
      parse(value) {
        return parseFloat(value);
      },
      step: 1,
      disabled: false
    };
  },
  
  getInitialState() {
    return {
      value: this.props.value
    };
  },
  
  componentWillReceiveProps(props) {
    if (props.hasOwnProperty('value')) {
      this.setState({value: props.value});
    }
  },
  
  skinParts: {
    input: skinPart('input').isRequired,
    incrementButton: skinPart('*'),
    decrementButton: skinPart('*')
  },
  
  getSkinState() {
    return {
      text: this.props.format(this.state.value),
      disabled: this.props.disabled
    };
  },
  
  partAdded(partName, element) {
    switch(partName) {
      case 'input': 
        this.addEventListener(element, 'onChange', this._inputChangeHandler);
        break;
        
      case 'incrementButton': 
        this.addEventListener(element, 'onClick', this._incrementButtonClickHandler);
        break;
        
      case 'decrementButton': 
        this.addEventListener(element, 'onClick', this._decrementButtonClickHandler);
        break;
    }
  },
  
  _setValue(value) {
    this.setState({value: value});
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  },
  
  _inputChangeHandler(event) {
    var value = this.props.parse(event.target.value);
    if (typeof value !== 'number' || isNaN(value)) {
      value = 0;
    }
    this._setValue(value);
  },
  
  _incrementButtonClickHandler() {
    this._setValue(this.state.value + this.props.step);
  },
  
  _decrementButtonClickHandler() {
    this._setValue(this.state.value - this.props.step);
  }
});

module.exports = NumberInput;