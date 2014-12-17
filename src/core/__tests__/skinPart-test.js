jest.dontMock('../skinPart');

describe('skinPart', function () {
  var skinPart = require('../skinPart');
  var ErrorType = skinPart.ErrorType;
  var React = require('react');
  
  it('should validate dom element skinPart type', function () {
    var part = skinPart('div');
        
    expect(part(<section />)).toEqual([{type: ErrorType.WRONG_TYPE, actual: 'section', expected: 'div'}]);
    expect(part(<div />)).toEqual([]);
  });
  
  
  it('should validate dom Composite Element skinPart type', function () {
    var Comp1 = React.createClass({
      render: function () {
        return null;
      }
    });
    
    var Comp2 = React.createClass({
      render: function () {
        return null;
      }
    });
    
    var part = skinPart(Comp2);
    var res = part(<Comp1 />);
    expect(res).toEqual([{type: ErrorType.WRONG_TYPE, actual: Comp1.type, expected: Comp2.type }]);
    expect(part(<Comp2 />)).toEqual([]);
  });
  
  
  it('should validate required skinPart', function () {
    
    var part = skinPart('div');
    expect(part(null)).toEqual([]);
    
    part = skinPart('div').isRequired;
    expect(part(null)).toEqual([{type: ErrorType.REQUIRED }]);
    expect(part(<div />)).toEqual([]);
  });
  
  
  it('should validate multiple skinPart', function () {
    
    var part;
    var errors;
        
    part = skinPart('div');
    errors = part([<div />, <div />]);
    expect(errors).toEqual([{ type: ErrorType.MULTIPLE }]);
    
    part = skinPart.array('div');
    errors = part([<div />, <div />]);
    expect(errors).toEqual([]);
    
  });
  
  
  it('should validate type in multiple skinPart', function () {
    
    var part;
    var errors;
        
    part = skinPart.array('div');
    errors = part([<div />, <ul />]);
    expect(errors).toEqual([{type: ErrorType.WRONG_TYPE, actual: 'ul', expected: 'div'}]);
    
    part = skinPart.array('div');
    errors = part([<div />, <div />]);
    expect(errors).toEqual([]);
    
  });
  
  
  it('should accept type wildcard', function () {
    
    var part = skinPart('*');
    expect(part(<div />)).toEqual([]);
    
  });
});