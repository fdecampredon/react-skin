jest.dontMock('../skinPart');
jest.dontMock('../SkinnableComponent');


var SkinnableComponent = require('../SkinnableComponent');
var React = require('react');
var ReactTestUtils = require('react/lib/ReactTestUtils');
var skinPart = require('../skinPart');

describe('SkinnableComponent', function () {
  
  describe('createClass', function () {
    it('should throws when passing a non object', function () {
      expect(function() {
        SkinnableComponent.createClass(1);
      }).toThrow(
        'Invariant Violation: SkinnableComponent.createClass(...): ' +
        'Class specification for skinnable components should be an object'
      );
    });
    
    
    it('should throws when `getSkinState` not is specified', function () {
      expect(function() {
        SkinnableComponent.createClass({
        });
      }).toThrow(
        'Invariant Violation: SkinnableComponent.createClass(...): ' +
        'Class specification for skinnable components should implements a method `getSkinState`'
      );
    });
    
    it('should throws when spec contains static that collide with SkinnableComponent static', function () {
      expect(function() {
        SkinnableComponent.createClass({
          statics: {
            setDefaultSkin() {}
          },
          getSkinState() {}
        });
      }).toThrow(
        'Invariant Violation: SkinnableComponent.createClass(...): ' +
        'Class specification for skinnable components should not implements a `setDefaultSkin` static'
      );
      
      expect(function() {
        SkinnableComponent.createClass({
          statics: {
            skinParts() {}
          },
          getSkinState() {}
        });
      }).toThrow(
        'Invariant Violation: SkinnableComponent.createClass(...): ' +
        'Class specification for skinnable components should not implements a `skinParts` static'
      );
    });
    
    it('should throws when spec contains a propType that collide with SkinnableComponent propType', function () {
      expect(function() {
        SkinnableComponent.createClass({
          propTypes: {
            skin() {}
          },
          getSkinState() {}
        });
      }).toThrow(
        'Invariant Violation: SkinnableComponent.createClass(...): ' +
        'Class specification for skinnable components should not implements a `skin` prop type'
      );
    });
    
    it('should throws when spec implements a method that collide with SkinnableComponent implementation', function () {
      expect(function() {
        SkinnableComponent.createClass({
          render() {},
          getSkinState() {}
        });
      }).toThrow(
        'Invariant Violation: SkinnableComponent.createClass(...): ' +
        'Class specification for skinnable components should not implements a `render` method'
      );
      
      expect(function() {
        SkinnableComponent.createClass({
          addEventListener() {},
          getSkinState() {}
        });
      }).toThrow(
        'Invariant Violation: SkinnableComponent.createClass(...): ' +
        'Class specification for skinnable components should not implements a `addEventListener` method'
      );
      
      expect(function() {
        SkinnableComponent.createClass({
          setPartProp() {},
          getSkinState() {}
        });
      }).toThrow(
        'Invariant Violation: SkinnableComponent.createClass(...): ' +
        'Class specification for skinnable components should not implements a `setPartProp` method'
      );
      
     
    });
    
    it('should produce a react component', function () {
      var Comp = SkinnableComponent.createClass({
        getSkinState() {
          return {};
        }
      });

      var element = <Comp />;

      expect(React.isValidElement(element)).toBe(true);
    });
    
  });
  
  
  describe('render', function () {
    it ('should throws when skin could not be resolved', function () {
      var Comp = SkinnableComponent.createClass({
        displayName: 'Comp',
        getSkinState() {
          return {};
        }
      });
      
      expect(function () {
        ReactTestUtils.renderIntoDocument(<Comp />);
      }).toThrow(
        'Invariant Violation: Comp.render(...): could not resolve skin'
      );
      
    });
      
    it ('should throws when skin is not a function', function () {
      var Comp = SkinnableComponent.createClass({
        displayName: 'Comp',
        skin: {},
        getSkinState() {
          return {};
        }
      });
      
      expect(function () {
        ReactTestUtils.renderIntoDocument(<Comp />);
      }).toThrow(
        'Invariant Violation: Comp.render(...): skin should be a function'
      );
      
    });
      
    it('should resolve to default skin if no skin is provided', function () {
      var Comp = SkinnableComponent.createClass({
        displayName: 'Comp',
        getSkinState() {
          return {};
        }
      });
      
      Comp.setDefaultSkin(function () {
        return <div className="defaultSkin" />;
      });
      var element = ReactTestUtils.renderIntoDocument(<Comp />);
      expect(ReactTestUtils.scryRenderedDOMComponentsWithClass(element,"defaultSkin").length).toBe(1);
    });
    
      
    it('should resolve to passed skin prop if provided', function () {
      var Comp = SkinnableComponent.createClass({
        displayName: 'Comp',
        skin: function () {
          return <div className="propsSkin" />;
        },
        getSkinState() {
          return {};
        }
      });
      
      Comp.setDefaultSkin(function () {
        return <div className="defaultSkin" />;
      });
      var element = ReactTestUtils.renderIntoDocument(<Comp />);
      expect(ReactTestUtils.scryRenderedDOMComponentsWithClass(element,"defaultSkin").length).toBe(0);
      expect(ReactTestUtils.scryRenderedDOMComponentsWithClass(element,"propsSkin").length).toBe(1);
    });
      
    it('should pass the return value of getSkinState to the skin function', function () {
      
      var value = {};
      var skinSpy = jasmine.createSpy('skin').andCallFake(function () {
        return null;
      });
      
      
      var Comp = SkinnableComponent.createClass({
        displayName: 'Comp',
        skin:skinSpy,
        getSkinState() {
          return value;
        }
      });
      
     
      ReactTestUtils.renderIntoDocument(<Comp />);
      expect(skinSpy).toHaveBeenCalledWith(value);
    });  
    
  });
      
      
  describe('skin parts attachments', function () {
    it('should pass element corresponding to a skin part to `partAdded` if implemented', function () {
      var partAddedSpy = jasmine.createSpy('partAdded');
      var element = <button skinRef="button" />;
      var Comp = SkinnableComponent.createClass({
        skin() {
          return element;
        },
        skinParts: {
          button: skinPart('button')
        },
        getSkinState() {
          return {};
        },
        partAdded: partAddedSpy
      });
      
      ReactTestUtils.renderIntoDocument(<Comp />);
      expect(partAddedSpy).toHaveBeenCalledWith('button', element);
    });
    
    
    it('should pass child element corresponding to a skin part to `partAdded` if implemented', function () {
      var partAddedSpy = jasmine.createSpy('partAdded');
      var element = <button skinRef="button" />;
      var Comp = SkinnableComponent.createClass({
        skin() {
          return (
            <div>
              <div><button /></div>
              <div><button /> {element}</div>
            </div>
          );
        },
        skinParts: {
          button: skinPart('button')
        },
        getSkinState() {
          return {};
        },
        partAdded: partAddedSpy
      });
      
      ReactTestUtils.renderIntoDocument(<Comp />);
      expect(partAddedSpy).toHaveBeenCalledWith('button', element);
    });
    
    it('should not pass element with skinRef to partAdded if it has not be referenced as a skinPart', function () {
      var partAddedSpy = jasmine.createSpy('partAdded');
      var Comp = SkinnableComponent.createClass({
        skin() {
          return <button skinRef="button" />;
        },
        getSkinState() {
          return {};
        },
        partAdded: partAddedSpy
      });
      
      ReactTestUtils.renderIntoDocument(<Comp />);
      expect(partAddedSpy).not.toHaveBeenCalled();
    });
    
    it('should delete skinRef prop', function () {
      var element = <button skinRef="button" />;
      var Comp = SkinnableComponent.createClass({
        skin() {
          return element;
        },
        skinParts: {
          button: skinPart('button')
        },
        getSkinState() {
          return {};
        }
      });
      
      ReactTestUtils.renderIntoDocument(<Comp />);
      expect(element.props).toEqual({});
      expect(element._store.props).toEqual({});
    });
    
    
    
    it('should pass all elements in case of array skinPart', function () {
      var partAddedSpy = jasmine.createSpy('partAdded');
      var element = <button skinRef="button" />;
      var element1 = <button skinRef="button" />;
      var Comp = SkinnableComponent.createClass({
        skin() {
          return <div>{element} {element1}</div>;
        },
        skinParts: {
          button: skinPart.array('button')
        },
        getSkinState() {
          return {};
        },
        partAdded: partAddedSpy
      });
      
      ReactTestUtils.renderIntoDocument(<Comp />);
      expect(partAddedSpy).toHaveBeenCalledWith('button', element);
      expect(partAddedSpy).toHaveBeenCalledWith('button', element1);
    });
    
    it('should warn when skin part validation fail', function () {
      var warnSpy = spyOn(console, 'warn');
      
      var HelloComp = React.createClass({
        render: function () {
          return null;
        }
      });
      
      var Comp = SkinnableComponent.createClass({
        displayName: 'Comp',
        skin() {
          return (
            <div>
              <button skinRef="button" />
              <button skinRef="button" />
              <div skinRef="button2" />
              <div skinRef="helloComp" />
              <HelloComp skinRef="div" />
            </div>
          );
        },
        skinParts: {
          button: skinPart('button'),
          button1: skinPart('button').isRequired,
          button2: skinPart('button'),
          helloComp: skinPart(HelloComp),
          div: skinPart('div')
        },
        getSkinState() {
          return {};
        }
      });
      
      ReactTestUtils.renderIntoDocument(<Comp />);
      expect(warnSpy).toHaveBeenCalledWith(
        'Comp.render(...): skin part `button` ' + 
        'was provided multiple time but is not marked as array'
      );
      expect(warnSpy).toHaveBeenCalledWith(
        'Comp.render(...): required skin part `button1` is missing'
      );
      expect(warnSpy).toHaveBeenCalledWith(
        'Comp.render(...): expected type `button` for skin part `button2` got `div`'
      );
      
      expect(warnSpy).toHaveBeenCalledWith(
        'Comp.render(...): expected type `HelloComp` for skin part `helloComp` got `div`'
      );
      
       expect(warnSpy).toHaveBeenCalledWith(
        'Comp.render(...): expected type `div` for skin part `div` got `HelloComp`'
      );
    });
  });
  
  describe('setPartProp', function () {
    it('should set a property on an element', function () {
      var element = <button skinRef="button" />;
      var Comp = SkinnableComponent.createClass({
        skin() {
          return element;
        },
        skinParts: {
          button: skinPart('button')
        },
        getSkinState() {
          return {};
        },
        partAdded(partName, element) {
          this.setPartProp(element, 'className', 'foo');
        }
      });
      
      ReactTestUtils.renderIntoDocument(<Comp />);
      expect(element.props.className).toBe('foo');
      expect(element._store.props.className).toBe('foo');
    });
    
    
    it('should throw and error if the property is already set', function () {
      var element = <button skinRef="button" className="bar"/>;
      var Comp = SkinnableComponent.createClass({
        displayName: 'Comp',
        skin() {
          return element;
        },
        skinParts: {
          button: skinPart('button')
        },
        getSkinState() {
          return {};
        },
        partAdded(partName, element) {
          this.setPartProp(element, 'className', 'foo');
        }
      });
      
       expect(function () {
        ReactTestUtils.renderIntoDocument(<Comp />);
      }).toThrow(
        'Invariant Violation: Comp.setPartProp(...): trying to set props `className` which is already defined'
      );
    });
  });
    
});