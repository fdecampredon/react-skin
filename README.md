ReactSkin
==========

> Skinnable components for [React](http://facebook.github.io/react/)

**this library is not implemented, don't use it**


Using a css framework like [Twitter Bootstrap](http://getbootstrap.com/) or 
[Zurb Foundation](http://foundation.zurb.com/) is not a choice without consequences.  
Your application will end up to be very coupled to that framework, and even worse 
to the version that you picked at that time.

However without this kind of framework you'll feel a bit *unarmed* in front of the task.
You need a number input, a datepicked, a dropdown menu etc ...  
And without a library that provides those components you'll loose a big amount of time reinventing the wheel. 

My solution to that problem is to create a library of components that separates the component *logic* from 
the component *skin*, to create a notion of *skinnable component*.  

This solution is inspired by the samely named concept of the [Apache Flex](http://flex.apache.org/) framework.


## Skinnable components

### The problem:

To illustrate the purpose of this library let's create a simple component, a `ToggleButton` : 

```javascript
var React = require('react');

var ToggleButton = React.createClass({
  propTypes: {
    toggled: React.PropTypes.bool,
    text: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func
  },
  
  getInitialState: function() {
    return {
      toggled: this.props.toggled || false
    };
  },
  
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.hasOwnProperty('toggled')) {
      this.setState({toggled: nextProps.toggled});
    }
  },
  
  buttonClickHandler: function() {
    var toggled = !this.state.toggled;
    this.setState({toggled: toggled});
    if (this.props.onChange) {
      this.props.onChange(toggled);
    }
  },
  
  render: function() {
    var className = this.state.toggled ? 'button-toggled' : '';
    return (
      <button className={className} onClick={this.buttonClickHandler}>
        {this.props.text}
      </button>
    );
  }
});
```

This is a very simple component, it takes as props:
* A boolean `toggled` that determines if our button is toggled or not.
* A callback `onChange` that will be called whenever the state of our button changes due to user interaction.
* A `text` that will be the text displayed by our button. 

When the user click on the button it updates his own state and notify the change through the `onChangeCallBack`.
If the button is toggled a class `button-toggled` is added on the rendered dom button. 

This component is well isolated and could be used in any React project... 
Except that it introduces a tight coupling with the className `button-toggled`.

If suddenly we decide to use bootstrap in my project we would have to change that class with `active` 
and if we want to use foundation another class name ...  
At this moment our only way to achive that is to directly change the code of that component.
And if it is a part of a third party library we'll need to fork that library or to overwrite the css styles of 
the class `button-toggled`.  

Sure we could introduce a property `toggledClass` that would be passed down to the render function, 
but with more complex cases where the generated dom needs to differ, that strategy won't be enough or will create too much complexity.

This is crazy, and pretty much all the components libraries suffer from this problem.  
Generaly those libraries will come with a set of css rules, images, even sometimes a pack of fonts, 
they will force you to use some css preprocessor like less or sass, and will completly dictate on how you will write your styles.


### The solution:

In the previously defined component 80% of the code, the component *logic*, is generic and can be used in any project 
however the last 20%, the component *skin* (the `render` function), needs to be adapted to whatever the project css class system is.  
To separate that *logic* from that *skin* we introduce the notion of **skinnable component**.

Now let's look at the `ToggleButton` written with ReactSkin.


```javascript
var ReactSkin = require('react-skin');
var React = require('react');

var ToggleButton = ReactSkin.createClass({
  propTypes: {
    toggled: React.PropTypes.bool,
    text: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func
  },
  
  skinParts: {
    button: skinPart('button').isRequired
  }
  
  getInitialState: function() {
    return {
      toggled: this.props.toggled || false
    };
  },
  
  getSkinState: function () {
    return {
      toggled: this.state.toggled,
      text: this.props.text
    };
  },
  
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.hasOwnProperty('toggled')) {
      this.setState({toggled: nextProps.toggled});
    }
  },
  
  buttonClickHandler: function() {
    var toggled = !this.state.toggled;
    this.setState({toggled: toggled});
    if (this.props.onChange) {
      this.props.onChange(toggled);
    }
  },
  
  partAdded: function (partName, part) {
    if (partName === 'button') {
      this.addEventListener(part, 'onClick', this.buttonClickHandler);
    }
  }
});


ToggleButton.setDefaultSkin(function (state) {
  var className = state.toggled ? 'button-toggled' : '';
  var text = state.text;
  return (
    <button className={className}>
      {text}
    </button>
  );
});

```


We have complete separation between the `logic` (contained in the component definition) and the `skin` (contained in the function passed to `setDefaultSkin`).
Now the `ToggleButton` component accepts a property `skin`, a function that should render the component given his state, alternatively its default skin can be
replaced using the `setDefaultSkin` function.


**Skinnable component** allows to define a contract between component and skin. The `skinParts` properties of the definition passed to `ReactSkin.createClass`
defines which elements (and their types) the component expect to find in the tree produced by its skin, when the component is rendered the part referenced 
trough the React `ref` properties will be passed to `partAdded` and the component can inject event listeners, or any kind of props to thoses components.
On the other end the skin part receive the result of the `getSkinState` method, and can render accordingly to this state.

Now if I want to use bootstrap I can just do: 

```javascript
ToggleButton.setDefaultSkin(function (state) {
  var className = state.toggled ? 'active' : '';
  var text = state.text;
  return (
    <button className={className}>
      {text}
    </button>
  );
});
```
