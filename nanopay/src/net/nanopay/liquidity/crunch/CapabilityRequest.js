foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityRequest', 

  implements: [
    'net.nanopay.liquidity.approvalRequest.ApprovableAware'
  ],

  javaImports: [
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
    'net.nanopay.liquidity.crunch.ApproverLevel',
    'net.nanopay.liquidity.crunch.GlobalLiquidCapability',
  ],

  tableColumns: [
    'id',
    'requestType',
    'users'
  ],

  properties: [  
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
    {
      name: 'requestType',
      javaType: 'net.nanopay.liquidity.crunch.CapabilityRequestOperations',
      class: 'Enum',
      of: 'net.nanopay.liquidity.crunch.CapabilityRequestOperations'
    },
    {
      name: 'users',
      class: 'List',
      javaType: 'java.util.List<Long>',
      factory: function () {
        return [];
      },
      view: () => {
        return {
          class: 'foam.u2.view.ReferenceArrayView',
          daoKey: 'userDAO'
        };
      }
    },
    {
      class: 'Boolean',
      name: 'isUsingTemplate',
      label: 'Assign to multiple accounts using a template',
      value: false,
      visibilityExpression: function(requestType) {
        if ( 
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ||
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
        ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      name: 'accountBasedCapability',
      of: 'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
      visibilityExpression: function(requestType) {
        if ( 
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ||
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
        ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      name: 'globalCapability',
      of: 'net.nanopay.liquidity.crunch.GlobalLiquidCapability',
      visibilityExpression: function(requestType) {
        if ( 
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_GLOBAL ||
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_GLOBAL
        ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      name: 'capabilityAccountTemplate',
      of: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplate',
      visibilityExpression: function(requestType, isUsingTemplate) {
        if ( 
            isUsingTemplate &&
            (
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ||
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
            )
          ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      name: 'accountToAssignTo',
      of : 'net.nanopay.account.Account',
      visibilityExpression: function(requestType, isUsingTemplate) {
        if ( 
            ! isUsingTemplate &&
            (
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ||
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
            )
          ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      name: 'approverLevel',
      class: 'Int',
      javaType: 'java.lang.Integer',
      visibilityExpression: function(requestType, isUsingTemplate) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_GLOBAL || 
          ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED && ! isUsingTemplate )
        ) 
          return foam.u2.Visibility.RW;
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: foam.nanos.auth.LifecycleState.PENDING,
      visibility: foam.u2.Visibility.HIDDEN
    },
  ],

  methods: [
    {
      name: 'getApprovableKey',
      type: 'String',
      javaCode: `
        String id = String.valueOf(getId());
        return id;
      `
    }
  ]
});
