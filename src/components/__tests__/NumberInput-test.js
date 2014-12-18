jest.dontMock('../../core/skinPart');
jest.dontMock('../../core/SkinnableComponent');
jest.dontMock('../NumberInput');


var NumberInput = require('../NumberInput');
var React = require('react');
var ReactTestUtils = require('react/lib/ReactTestUtils');


describe('NumberInput', function () {
  var skinSpy = jasmine.createSpy('skin').andCallFake(function () {
    return (
      <div>
        <input skinRef="input" ref="input"/>
        <button skinRef="incrementButton" ref="incrementButton" />
        <button skinRef="decrementButton" ref="decrementButton" />
      </div>
    );
  });

  NumberInput.setDefaultSkin(skinSpy);
  
  afterEach(function () {
    skinSpy.reset();
  });
  
  it('should pass text and disabled as skinState', function () {
    ReactTestUtils.renderIntoDocument(
      <NumberInput value={10} format={function (value) { return value + ' $'; }} disabled />
    );
    expect(skinSpy).toHaveBeenCalledWith({text: '10 $', disabled: true});
  });

  it('should dispatch onChange event when input value change', function () {
    var onChangeSpy = jasmine.createSpy('onChange');
    var component = ReactTestUtils.renderIntoDocument(
      <NumberInput value={10} onChange={onChangeSpy} 
        parse={function (value) { return parseInt(value) + 10; }}/>
    );
    ReactTestUtils.Simulate.change(component.refs.input.getDOMNode(), {target: {value: '20'}});
    
    expect(onChangeSpy).toHaveBeenCalledWith(30);
  });


  it('should dispatch onChange event when incrementButton is clicked', function () {
    var onChangeSpy = jasmine.createSpy('onChange');
    var component = ReactTestUtils.renderIntoDocument(
      <NumberInput value={10} onChange={onChangeSpy} step={10} />
    );
    ReactTestUtils.Simulate.click(component.refs.incrementButton.getDOMNode(), {});
    
    expect(onChangeSpy).toHaveBeenCalledWith(20);
  });

  it('should dispatch onChange event when decrementButton is clicked', function () {
    var onChangeSpy = jasmine.createSpy('onChange');
    var component = ReactTestUtils.renderIntoDocument(
      <NumberInput value={10} onChange={onChangeSpy} step={5} />
    );
    ReactTestUtils.Simulate.click(component.refs.decrementButton.getDOMNode(), {});
    
    expect(onChangeSpy).toHaveBeenCalledWith(5);
  });
  
});

