/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'CachedAccountUCJQueryService',
  documentation: 'A cached implementation of the AccountUCJQueryService interface.',

  implements: [
    'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService'
  ],
  javaImports: [
    'java.util.ArrayList',
    'foam.core.FObject'
  ],

  properties: [
    {
      class: 'Map',
      name: 'cache'
    },
    {
      class: 'Int',
      name: 'TTL',
      value: 5000
    }
  ],

  methods: [
    {
      name: 'getRoles',
      type: 'FObject[]',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'accountId',
          type: 'Long'
        }
      ],
      javaCode: `
        return new FObject[1];
      `,
    },
    {
      name: 'getUsers',
      type: 'FObject[]',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        },
        {
          name: 'accountId',
          type: 'Long'
        }
      ],
      javaCode: `
        return new FObject[1];
      `,
    },
    {
      name: 'getAccounts',
      type: 'FObject[]',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'roleId',
          type: 'String'
        }
      ],
      javaCode: `
        return new FObject[1];
      `,
    },
    {
      name: 'getApproversByLevel',
      type: 'FObject[]',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        },
        {
          name: 'accountId',
          type: 'String'
        },
        {
          name: 'level',
          type: 'Integer'
        }
      ],
      javaCode: `
        return new FObject[1];
      `,
    }
  ]
});
