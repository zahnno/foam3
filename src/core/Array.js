/*
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  id: 'foam.core.Array',
  package: 'foam.core',
  name: 'Array', // TODO: rename to FObjectArray
  extends: 'Property',

  // documentation: "A Property which contains an array of 'of' FObjects.",

  properties: [
    { name: 'of', required: true },
    [ 'factory', function() { return []; } ],
    [ 'adapt', function(_, /* array? */ a, prop) {
        if ( ! a ) return [];
        console.assert(Array.isArray(a), 'Array required, but received:', a);
        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = prop.adaptArrayElement(a[i]);
        }
        return b;
      }
    ],
    [ 'adaptArrayElement', function(o) {
      // FUTURE: replace 'foam.' with '(this.Y || foam).' ?
      var cls = foam.lookup(this.of);
      console.assert(cls, 'Unknown array "of": ', this.of);
      return cls.isInstance(o) ? o : cls.create(o, this);
      }
    ]
  ]
});
