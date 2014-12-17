var ReactTools = require('react-tools');  

function process (src, path) {     
  if (path.indexOf('node_modules') === -1) {
    return ReactTools.transform(src, {harmony: true, stripTypes: true});   
  }
  return src;
} 

module.exports = { process: process };