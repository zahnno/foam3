/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'AccountUCJQueryService',
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
      ]
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
      ]
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
      ]
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
      ]
    }
  ]
});
