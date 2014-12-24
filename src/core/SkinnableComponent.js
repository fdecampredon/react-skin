var React     = require('react');
var invariant = require('react/lib/invariant');
var ErrorType = require('./skinPart').ErrorType;


function traverseTree(element, func) {
  func(element);
  var children = (element && element.props && element.props.children);
  React.Children.forEach(children, function (el) {
    if (el && typeof el === 'object') {
      traverseTree(el, func);
    }
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
    type.displayName:
    type;
}

function getSkinRef(element) {
  return element.props? element.props.skinRef : null; 
}

function deleteSkinRef(element) {
  delete element.props.skinRef;
  if (element._store) {
    delete element._store.skinRef;
  }
}

function attachSkinPart(component, tree) {
  var skinParts = component.constructor.skinParts;
  
  if (!skinParts || !Object.keys(skinParts).length) {
    return tree;
  } 
  
  var skinPartsElements = {};
  
  traverseTree(tree, function (element) {
    var skinRef = getSkinRef(element);
    if (skinRef && skinParts[skinRef]) {
      if (skinPartsElements.hasOwnProperty(skinRef)) {
        if (!Array.isArray(skinPartsElements[skinRef])) {
          skinPartsElements[skinRef] = [skinPartsElements[skinRef]];
        }
        skinPartsElements[skinRef].push(element);
      } else {
        skinPartsElements[skinRef] = element;
      }
      
      deleteSkinRef(element);
      if (component.partAdded) {
        component.partAdded(skinRef, element);
      }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    var displayName = getDisplayName(component);
    
    Object.keys(skinParts).forEach(function (key) {
      var checkSkinpart = skinParts[key];
      var errors = checkSkinpart(skinPartsElements[key]);
      if (errors.length) {
        errors.forEach(function (error) {
          switch(error.type) {
              case ErrorType.REQUIRED:
                console.warn(`${displayName}.render(...): required skin part \`${key}\` is missing`);
              break;
              case ErrorType.MULTIPLE:
                console.warn(
                  `${displayName}.render(...): skin part \`${key}\` ` + 
                  `was provided multiple time but is not marked as array`
                );
              break;
              case ErrorType.WRONG_TYPE:
                console.warn(
                  `${displayName}.render(...): expected type \`${typeToString(error.expected)}\` ` + 
                  `for skin part \`${key}\` got \`${typeToString(error.actual)}\``
                );
              break;
          }
        });
      }
    });
  }
  return tree;
}


var SkinnableComponentMixin = {
  
  render() {
    var skin = getSkin(this);
    var displayName = getDisplayName(this);
    invariant(skin !== null, `${displayName}.render(...): could not resolve skin`);
    invariant(typeof skin === 'function', `${displayName}.render(...): skin should be a function`);
    return attachSkinPart(this, skin(this.getSkinState()));
  },

  addEventListener(element, event, handler) {
    this.setPartProp(element, event, handler);
  },

  setPartProp(element, key, value) {
    var displayName = getDisplayName(this);
    invariant(
      typeof element.props[key] === 'undefined', 
      `${displayName}.setPartProp(...): trying to set props \`${key}\` which is already defined` 
    );
    if (!element.props) {
      element.props = {};
    }
    element.props[key] = value;
    if (element._store) {
      element._store.props[key] = value;
    }
  }
};

var SkinnableComponentPropTypes = {
  skin: React.PropTypes.func
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
      spec.getSkinState && typeof spec.getSkinState === 'function',
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
