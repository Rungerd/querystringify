'use strict';

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String} The decoded string.
 * @api private
 */
function decode(input) {
  return decodeURIComponent(input.replace(/\+/g, ' '));
}

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?&]+)=?([^&]*)/g
    , result = {}
    , part, k, v;

  while (part = parser.exec(query)) {
    k = decode(part[1]);
    v = decode(part[2]);
    if (!hasOwnProperty(result, k)) {
      result[k] = v;
    } else if (Array.isArray(result[k])) {
      result[k].push(v);
    } else {
      result[k] = [result[k], v];
    }
  }
  //
  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
  // the lastIndex property so we can continue executing this loop until we've
  // parsed all results.
  //
  // for (;
  //   part = parser.exec(query);
  //   result[decode(part[1])] = decode(part[2])
  // );

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix, eq) {
  prefix = prefix || '';
  eq = eq || '=';

  var pairs = [];

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (var key in obj) {
    var ks = encodeURIComponent(stringifyPrimitive(key)) + eq;
    if (Array.isArray(obj[key])) {
      obj[key].forEach(function(v) {
        pairs.push(ks + stringifyPrimitive(v));
      });
    } else {
      pairs.push(ks + stringifyPrimitive(obj[key]));
    }
  }

  // for (var key in obj) {
  //   if (hasOwnProperty(obj, key)) {
  //     pairs.push(encodeURIComponent(key) +'='+ obj[key]);
  //   }
  // }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
exports.stringify = querystringify;
exports.parse = querystring;
