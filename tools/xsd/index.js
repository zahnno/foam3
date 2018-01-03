'use strict';

require('../../../NANOPAY/foam2/src/foam.js');
var stringify = require("json-stringify-pretty-compact");
var _ = require('underscore');

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp')
var DOMParser = require('xmldom').DOMParser;
var pack = require('../../package.json');
var simpleType = require('./simpleType');
var complexType = require('./complexType');
var types = require('./typeMapping');

if ( process.argv.length < 3 ) {
  console.log('Usage: node tools/xsd/index.js package [files]');
  process.exit(-1);
}

var files = process.argv.slice(3);
var packageName  = process.argv[2];
var packagePath = packageName.replace(/\./g, "/");
var indir = path.join(__dirname, '/messages/');
var outdir = path.join(__dirname, '../../nanopay/src/' + packagePath + '/');

var classesOutDir = path.join(__dirname, '../../tools/');

var classes = [];
var simpleTypes = [];

/**
 * Converts the FOAM model to string
 * @param  {Object} m FOAM model
 * @return {String}   String of FOAM model
 */
function modelToStr(m) {
  return foam.json.Pretty.stringify(m).toString().replace(/"/g, "'").replace(/:/g, ': ');
}

/**
 * Checks a restriction for enum properties
 * @param  {Object} doc DOM model
 * @return {Boolean}     true if enum, false otherwise
 */
function checkForEnum(doc) {
  for ( var key in doc.childNodes ) {
    var child = doc.childNodes[key];
    // check if nodeType is an element node
    if ( child.nodeType !== 1 ) continue;
    // check for enumeration
    if ( child.localName === 'enumeration' ) {
      return true;
    }
  }
  return false;
}

/**
 * Preparses the XSD definition file and creates a map
 * for simple types.
 * @param {DOMElement} docElement dom tree
 * @return {Map}                  a map of simple types
 */
function preparse(docElement) {
  // checks keys of doc
  for ( var key in docElement ) {
    var child = docElement[key];

    // check if nodeType is an element node
    if ( child.nodeType !== 1 ) continue;

    var name = child.getAttribute('name');

    // confirm element is a simple type
    if ( child.localName === 'simpleType' ) {
      for ( var childKey in child.childNodes ) {
        var grandChild = child.childNodes[childKey];

        // check if nodeType is an element node
        if ( grandChild.nodeType !== 1 ) continue;

        // check if restriction has been specified
        if ( grandChild.localName === 'restriction' ) {
          // check for enum
          if ( checkForEnum(grandChild) ) {
            simpleTypes[name] = 'foam.core.Enum';
          } else {
            var a = grandChild.attributes['0']
            if ( a.localName === 'base' ) simpleTypes[name] = types[a.value];
          }
        }
      }
    } else if ( child.localName === 'complexType' ) {
      for ( var childKey in child.childNodes ) {
        var grandChild = child.childNodes[childKey];
        // check if nodeType is an element node
        if ( grandChild.nodeType !== 1 ) continue;
        if ( grandChild.localName === 'simpleContent' ) {
          for ( var grandChildKey in grandChild.childNodes ) {
            var greatGrandChild = grandChild.childNodes[grandChildKey];
            if ( greatGrandChild.nodeType !== 1 ) continue;
          }
        }
      }
    }
  }
}

/**
 * Processes an XSD file and converts it to FOAM
 * @param  {String} file Raw string input from XSD file
 */
function processFile (file) {
  let models = [];

  // parse the raw string to a DOM object
  var doc = new DOMParser().parseFromString(file);
  var docElement = doc.documentElement;

  // preparse all the simple types
  var children = docElement.childNodes;
  preparse(children);

  for ( var key in children ) {
    var child = children[key];

    // check if nodeType is an element node
    if ( child.nodeType !== 1 ) continue;

    // create foam model
    var m = {
      package: packageName,
      name: child.getAttribute('name')
    };

    switch ( child.localName ) {
      case 'complexType':
        // process complex type
        var complexTypes = new complexType.init(simpleTypes, packageName);
        complexType.processComplexType(m, child);
        break;
      case 'simpleType':
        // process simple type
        simpleType.processSimpleType(m, child);
        break;
      default:
        break;
    }

    if ( m.type === 'enum' ) {
      delete m.type;
      models.push(genModel(m, 'ENUM'));
    } else {
      models.push(genModel(m));
    }
  }

  return models;
}

/**
 * Adds complex types to classes output file for classes.js
 * @param {Array} classes Array of complex classes to output
 * @param {Array} models  Models to add to classes.js
 */
function addToClasses(classes, models) {
  for ( var i = 0; i < models.length; i++ ) {
    var model = models[i];
    // ignore simple types
    if ( simpleTypes[model.name] && simpleTypes[model.name] !== 'foam.core.Enum' ) continue;
    // check if already in classes array
    if ( ! classes.some(function (element, index, array) {
      return element === ( packageName + '.' + model.name );
    })) {
      classes.push( packageName + '.' + model.name );
    }
  }
}

/**
 *
 * @param {FOAMModel} m         FOAM Model to be generated
 * @param {String}    modelType CLASS or ENUM, default CLASS
 * @return {Object}        Object containing model name and string representation
 */
function genModel(m, modelType = 'CLASS') {
  return {
    name: m.name,
    class: '// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!\nfoam.' +
            modelType + '(' + modelToStr(m) + ');'
  }
}

if ( files.length === 0 ) {
  files = fs.readdirSync(indir);
}

if ( ! fs.existsSync(outdir) ) {
  mkdirp.sync(outdir);
}

// generate classes
for ( var i = 0; i < files.length; i++ ) {
  var messageClasses = [];
  var file = fs.readFileSync(indir + files[i], 'utf8');
  let models = processFile(file);

  // change generic document type to be name of ISO20022 message
  models = models.map(function (model) {
    if ( model.name === 'Document' ) {
      let name = files[i][0].toUpperCase() +
        files[i].slice(1, -4).replace(/\./g, '');
      model.name = name;
      model.class = model.class.replace('Document', name);
    }

    return model;
  });

  // add to classes
  addToClasses(messageClasses, models);
  classes = classes.concat(messageClasses);

  for ( var j = 0 ; j < models.length ; j++ ) {
    let model = models[j];
    fs.writeFileSync(outdir + model.name + '.js', model.class, 'utf8');
  }

  var foamFiles = Object.keys(simpleTypes).concat(messageClasses).sort().map(function (file) {
    if ( ! file.startsWith(packageName) ) {
      return { name: packagePath + '/' + file }
    } else {
      return { name: file.replace(/\./g, '/') }
    }
  });

  foamFiles = _.uniq(foamFiles, function (v) {
    return v.name && v.name;
  });
}

// generate classes.js file
if ( ! fs.existsSync(classesOutDir) ) {
  mkdirp.sync(classesOutDir);
}

let classesOutput = '';
for ( var key in simpleTypes ) {
  classesOutput += 'require(\'../src/' + packagePath + '/' + key + '.js\');\n';
}

classesOutput += `var classes = ${modelToStr(classes)};
var abstractClasses = [];
var skeletons = [];
var proxies = [];
var blacklist = [];

module.exports = {
  classes: classes,
  abstractClasses: abstractClasses,
  skeletons: skeletons,
  proxies: proxies,
  blacklist: blacklist
};`

var files = simpleTypes.concat(classes).sort().map(function (file) {
  return { name: file.replace(/\./g, '/') }
});

fs.writeFileSync(outdir + 'files.js', 'FOAM_FILES(' + stringify(files) + ')', 'utf8');
fs.writeFileSync(classesOutDir + 'classes.js', classesOutput, 'utf8');
