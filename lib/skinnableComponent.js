var React     = require('react');
var invariant = require('react/lib/invariant');
var { traverseTree } = require('./utils');
var assign = require('Object.assign');


function getSkin(comp) {
  return comp.skin || comp.constructor.__defaultSkin ||  null;
}

function attachSkinPart(component, tree) {
  var skinParts = {};
  var skinPartsDefs = component.skinPartsDefs;
  if (skinPartsDefs && Object.keys(skinPartsDefs).length) {
    traverseTree(tree, function (element) {
      if (element.ref && skinPartsDefs[element.ref]) {
        skinParts[element.ref] = element;
        delete element.ref;
        if (component.partAdded) {
          component.partAdded(element.ref, element);
        }
      }
    });
    
    if (process.env.NODE_ENV === "development") {
      Object.keys(skinPartsDefs).forEach(function (key) {
        if (skinPartsDefs[key].required && !skinParts.hasOwnProperty(key)) {
          var def = skinPartsDefs[key];
          var errors = def(skinParts[key]);
          if (errors.length) {
            //TODO log 
          }
        }
      });
    }
  }
  return tree;
}


var SkinnableComponentMixin = {
  
  render() {
    var skin = getSkin(this);
    invariant(skin !== null, "SkinnableComponent.render(..): could not find skin for component");
    invariant(typeof skin === 'function', 'SkinnableComponent.render(..): skin should be a function');
    return attachSkinPart(this, skin(this.state));
  },

  addEventListener(element, event, handler) {
    this.setPartProps(element, event, handler);
  },

  setPartProps(element, key, value) {
    invariant(typeof element.props[key] !== 'undefined', 'props %s is already defined', key);
    element.props[key] = value;
  }

};

var SkinnableComponentPropTypes = {
  skin: React.PropTypes.function
};

var SkinnableComponentStatics = {
  setDefaultSkin(skin) {
    this.__defaultSkin = skin;
  }
};

var SkinnableComponent = {
  createClass(spec) {
    invariant(spec && typeof spec === 'object', 'SkinnableComponent.createClass(...): the spec object passed to createClass should be an object');
    for (var key in SkinnableComponentMixin) {
      invariant(!spec[key], 'SkinnableComponent.createClass(...): Class specification for skinnable components should not implements a \'%s\' method', key);
    }
    
    spec = assign({}, spec, SkinnableComponentMixin);
    spec.propTypes = assign({}, spec.propTypes || {}, SkinnableComponentPropTypes);
    spec.statics  = assign({}, spec.statics || {}, SkinnableComponentStatics);
    
    return React.createClass(spec);
  }
};











module.exports = SkinnableComponent;