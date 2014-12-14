var React     = require('react');
var invariant = require('react/lib/invariant');
var ErrorType = require('./skinPart');


function traverseTree(element, func) {
  func(element);
  var children = (element && element && element.props.children) || [];
  if(!Array.isArray(children)) {
      children = [children];
  }
  return children.forEach(function (el) {
      return typeof el === 'object' && func(el);
  });
}

function getSkin(comp) {
  return comp.skin || comp.constructor.__defaultSkin ||  null;
}

function getDisplayName(comp) {
  return comp.constructor.displayName || 'SkinnableComponent';
}

function typeToString(type) {
  return typeof type === 'function'?
    getDisplayName(type):
    type;
}

function attachSkinPart(component, tree) {
  var skinParts = component.constructor.skinParts;
  
  if (!skinParts && !Object.keys(skinParts).length) {
    return tree;
  } 
  
  var skinPartsElements = {};
  
  traverseTree(tree, function (element) {
    if (element.ref && skinParts[element.ref]) {
      if (skinPartsElements.hasOwnProperty(element.ref)) {
        if (!Array.isArray(skinPartsElements[element.ref])) {
          skinPartsElements[element.ref] = [skinPartsElements[element.ref]];
        }
        skinPartsElements[element.ref].push(element);
      } else {
        skinPartsElements[element.ref] = element;
      }
      
      delete element.ref;
      if (component.partAdded) {
        component.partAdded(element.ref, element);
      }
    }
  });

  if (process.env.NODE_ENV === "development") {
    var displayName = getDisplayName(component);
    
    Object.keys(skinParts).forEach(function (key) {
      if (skinParts[key].required && !skinParts.hasOwnProperty(key)) {
        var def = skinParts[key];
        var errors = def(skinParts[key]);
        if (errors.length) {
          errors.forEach(function (error) {
            switch(error.type) {
                case ErrorType.REQUIRED:
                  console.warn(`${displayName}.render(...): required skin part ${key} is missing`);
                break;
                case ErrorType.MULTIPLE:
                  console.warn(
                    `${displayName}.render(...): skin part ${key}` + 
                    ` was provided multiple time but is not marked as array`
                  );
                break;
                case ErrorType.WRONG_TYPE:
                  console.warn(
                    `${displayName}.render(...): expected type ${typeToString(error.expected)} ` + 
                    ` for skin part ${key} got ${typeToString(error.actual)}`
                  );
                break;
            }
          });
        }
      }
    });
  }
  return tree;
}


var SkinnableComponentMixin = {
  
  render() {
    var skin = getSkin(this);
    var displayName = getDisplayName(this);
    invariant(skin !== null, `${displayName}.render(..): could not find skin for component`);
    invariant(typeof skin === 'function', `${displayName}.render(..): skin should be a function`);
    return attachSkinPart(this, skin(this.state));
  },

  addEventListener(element, event, handler) {
    this.setPartProps(element, event, handler);
  },

  setPartProp(element, key, value) {
    var displayName = getDisplayName(this);
    invariant(
      typeof element.props[key] !== 'undefined', 
      `${displayName}.setPartProp(...): trying to set props \`${key}\` which is already defined` 
    );
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
    var key;
    
    invariant(
      spec && typeof spec === 'object', 
      'SkinnableComponent.createClass(...): Class specification for skinnable components should be an object'
    );
   
    invariant(
      spec.getSkinState && typeof spec.getSkinState === 'object',
      'SkinnableComponent.createClass(...): Class specification for skinnable components ' +
      'should implements a method `getSkinState`'
    );
    
    for (key in SkinnableComponentStatics) {
      invariant(
        !spec.statics || !spec.statics[key], 
        `SkinnableComponent.createClass(...): Class specification for skinnable components ` +
        `should not implements a \`${key}\` static`
      );
    }
    
    invariant(
      !spec.statics || !spec.statics.skinParts, 
      'SkinnableComponent.createClass(...): Class specification for skinnable components ' +
      'should not implements a `skinParts` static'
    );
    
    for (key in SkinnableComponentPropTypes) {
      invariant(
        !spec.propTypes || !spec.propTypes[key], 
        `SkinnableComponent.createClass(...): Class specification for skinnable components ` +
        `should not implements a \`${key}\` prop type`
      );
    }
    
    
    for (key in SkinnableComponentMixin) {
      invariant(
        !spec[key], 
        `SkinnableComponent.createClass(...): Class specification for skinnable components ` +
        `should not implements a \`${key}\` method`
      );
    }
    
    var componentSpec = {
      ...spec,
      ...SkinnableComponentMixin,
      statics: {
        ...spec.statics, 
        ...SkinnableComponentStatics, 
        skinParts: spec.skinParts
      },
      propTypes: {
        ...spec.propTypes,
        ...SkinnableComponentPropTypes
      },
      displayName: spec.displayName || 'SkinnableComponent'
    };
  
    delete componentSpec.skinParts;
  
    return React.createClass(componentSpec);
  }
};


module.exports = SkinnableComponent;