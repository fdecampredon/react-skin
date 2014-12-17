
var ErrorType = {
  REQUIRED : 0,
  WRONG_TYPE: 1,
  MULTIPLE: 2
};


function getType(type) {
  if (typeof type === 'function' && typeof type.type === 'function' ) {
    return type.type;
  }
  return type;
}



function checkSkinPart(element, type, required, array) {
  type = getType(type);
  var errors = [];
  if (!element || element.length === 0) {
    if (required) {
      errors.push({ type: ErrorType.REQUIRED });
    }
  } else if (Array.isArray(element)) {
    if (!array) {
      errors.push({ type: ErrorType.MULTIPLE });
    } else {
      errors = errors.concat.apply(
        errors,
        element
          .map(element => checkSkinPart(element, type, required, true))
          .filter(errors => errors.length > 0)
      );
    }
  } else if (type !== '*' && element.type !== type) {
    errors.push({ 
      type: ErrorType.WRONG_TYPE, 
      expected: type, 
      actual: element.type
    });
  }

  return errors;
}


function skinPart(type) {
  var result = function (element) {
    return checkSkinPart(element, type, false, false);
  };
  
  result.isRequired = function (element) {
    return checkSkinPart(element, type, true, false);
  };
  
  return result;
}

skinPart.array = function (type) {
  var result = function (element) {
    return checkSkinPart(element, type, false, true);
  };
  
  result.isRequired = function (element) {
    return checkSkinPart(element, type, true, true);
  };
  
  return result;
};


skinPart.ErrorType = ErrorType;

module.exports = skinPart;