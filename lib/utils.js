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

module.exports = {
  traverseTree
};