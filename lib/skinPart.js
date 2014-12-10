
var ErrorType = {
  REQUIRED : 0,
  WRONG_TYPE: 1,
  MULTIPLE: 2
};

function WrongTypeError(expected, actual) {
  return { type: ErrorType.WRONG_TYPE, expected, actual};
}

function RequiredError() {
  return { type: ErrorType.REQUIRED };
}

function MultipleError() {
  return { type: ErrorType.MULTIPLE };
}


function checkSkinPart(element, type, required, isArray) {
  var errors = [];
  if (!element) {
    if (required) {
      errors.push(RequiredError());
    }
  } else if (Array.isArray(element)) {
    if (!isArray) {
      errors.push(MultipleError());
    } else {
      errors = errors.concat(element.map(function (element) {
        return skinPart(element, type, required, true);
      }));
    }
  } else if (type !== '*' && element.type !== type && !(element.type instanceof type)) {
    errors.push(WrongTypeError(type, element.type));
  }

  return errors;
}


function skinPart(type) {
  var result = function (element) {
    return checkSkinPart(element, type, false, false);
  };
  
  result.required = function (element) {
    return checkSkinPart(element, type, true, false);
  };
  
  return result;
}

skinPart.array = function (type) {
  var result = function (element) {
    return checkSkinPart(element, type, false, true);
  };
  
  result.required = function (element) {
    return checkSkinPart(element, type, true, true);
  };
  
  return result;
};


skinPart.errors = ErrorType;

module.exports = skinPart;