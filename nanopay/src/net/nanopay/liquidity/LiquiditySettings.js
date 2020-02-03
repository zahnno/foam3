foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquiditySettings',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.analytics.Foldable',
    'foam.nanos.auth.LastModifiedAware',
    'net.nanopay.liquidity.approvalRequest.ApprovableAware'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.Liquidity'
  ],

  sections: [
    {
      name: 'basicInfo'
    },
    {
      name: 'thresholds'
    },
    {
      name: 'accountsSection',
      title: 'Accounts',
      isAvailable: function(id) {
        return !! id;
      }
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    }
  ],

  tableColumns: [
    'name',
    'cashOutFrequency',
    'denomination',
    'lowLiquidity',
    'highLiquidity'
  ],

  searchColumns: [
    'name',
    'cashOutFrequency',
    'denomination'
  ],

  //relationship: 1:* LiquiditySettings : DigitalAccount

  //ids: ['account'],

  plural: 'Liquidity Settings',

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true
    },
    {
      class: 'String',
      name: 'name',
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userToEmail',
      required: true,
      documentation: 'The user that is supposed to receive emails for this liquidity Setting',
      section: 'basicInfo',
      view: (_, X) => {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Users',
              dao: X.userDAO.where(
                X.data.AND(
                  X.data.EQ(foam.nanos.auth.User.GROUP, 'liquidBasic'),
                  X.data.EQ(foam.nanos.auth.User.LIFECYCLE_STATE, foam.nanos.auth.LifecycleState.ACTIVE)
                )
              ).orderBy(foam.nanos.auth.User.LEGAL_NAME)
            }
          ]
        };
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'cashOutFrequency',
      label: 'Sweep Frequency',
      factory: function() {
        return net.nanopay.util.Frequency.DAILY;
      },
      documentation: 'Determines how often an automatic cash out can occur.',
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      of: 'foam.core.Unit',
      name: 'denomination',
      required: true,
      targetDAOKey: 'currencyDAO',
      documentation: `The unit of measure of the payment type. The payment system can handle
        denominations of any type, from mobile minutes to stocks.
      `,
      section: 'basicInfo',
      updateMode: 'RO',
      postSet: function(o, n) {
        if ( this.lowLiquidity ) this.lowLiquidity.denomination = n;
        if ( this.highLiquidity ) this.highLiquidity.denomination = n;
      },
      javaPostSet: `
            Liquidity high = this.getHighLiquidity();
            if ( high != null ) high.denomination_ = (String) val;
            Liquidity low = this.getLowLiquidity();
            if ( low != null ) low.denomination_ = (String) val;
      `,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              dao: X.currencyDAO
            }
          ]
        };
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.Liquidity',
      name: 'lowLiquidity',
      label: 'Low Threshold',
      section: 'thresholds',
      gridColumns: 6,
      postSet: function(o, n) { n.denomination = this.denomination; },
      javaPostSet: `
        lowLiquidity_.denomination_ = this.denomination_;
      `,
      view: function(_, X) {
        return {
          class: 'net.nanopay.liquidity.ui.liquidity.LiquidityDetailView',
          of: 'net.nanopay.liquidity.Liquidity',
          denominationToFilterBySlot: X.data.denomination$
        };
      },
      factory: function() {
        return this.Liquidity.create({
          rebalancingEnabled: false,
          enabled: false,
          denomination$: this.denomination$
        });
      },
      javaFactory: `
        return new net.nanopay.liquidity.Liquidity.Builder(getX())
          .setRebalancingEnabled(false)
          .setEnabled(false)
          .build();
      `,
      tableCellFormatter: function(value, obj, id) {
        var self = this;
        return self.__subSubContext__.currencyDAO.find(obj.denomination).then(
          function(curr) {
            var lowLiquidity = curr ? curr.format(obj.lowLiquidity.threshold != null ? obj.lowLiquidity.threshold : 0) : obj.lowLiquidity.threshold;
            self.add(lowLiquidity);
          })
      },
      validationTextVisible: true,
      validationStyleEnabled: true,
      validateObj: function(lowLiquidity$enabled, lowLiquidity$rebalancingEnabled, lowLiquidity$resetBalance, lowLiquidity$threshold,
                          highLiquidity$enabled, highLiquidity$rebalancingEnabled, highLiquidity$resetBalance, highLiquidity$threshold, lowLiquidity$pushPullAccount) {
        if ( this.lowLiquidity.enabled && this.highLiquidity.enabled ) {
          if ( this.lowLiquidity.rebalancingEnabled && this.highLiquidity.rebalancingEnabled ) {
            if ( this.lowLiquidity.resetBalance > this.highLiquidity.threshold ) {
              return 'High Liquidity threshold should be greater than Low liquidity reset balance value.';
            }
            if ( this.highLiquidity.resetBalance < this.lowLiquidity.threshold ) {
              return 'High Liquidity reset balance should be greater than Low liquidity threshold value.';
            }
          }
          if ( this.lowLiquidity.threshold > this.highLiquidity.threshold ) {
            return 'High Liquidity threshold should be greater than Low liquidity values.';
          }
        }
        if ( this.lowLiquidity.rebalancingEnabled ) {
          if ( this.lowLiquidity.threshold >= this.lowLiquidity.resetBalance ) {
            return 'Low Liquidity threshold must be less than Low Liquidity reset balance.';
          }
        }
        if ( this.lowLiquidity.rebalancingEnabled && this.lowLiquidity.pushPullAccount == 0 ) {
          return 'Please select push/pull account based off denomination.';
        }
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.Liquidity',
      name: 'highLiquidity',
      label: 'High Threshold',
      section: 'thresholds',
      gridColumns: 6,
      postSet: function(o, n) { n.denomination = this.denomination; },
      javaPostSet: `
        highLiquidity_.denomination_ = this.denomination_;
      `,
      view: function(_, X) {
        return {
          class: 'net.nanopay.liquidity.ui.liquidity.LiquidityDetailView',
          of: 'net.nanopay.liquidity.Liquidity',
          denominationToFilterBySlot: X.data.denomination$
        };
      },
      factory: function() {
        return this.Liquidity.create({
          rebalancingEnabled: false,
          enabled: false,
          denomination$: this.denomination$
        });
      },
      javaFactory: `
        return new net.nanopay.liquidity.Liquidity.Builder(getX())
          .setRebalancingEnabled(false)
          .setEnabled(false)
          .build();
      `,
      tableCellFormatter: function(value, obj, id) {
        var self = this;
        return self.__subSubContext__.currencyDAO.find(obj.denomination).then(
          function(curr) {
            var highLiquidity = curr ? curr.format(obj.highLiquidity.threshold != null ? obj.highLiquidity.threshold : 0) : obj.highLiquidity.threshold;
            self.add(highLiquidity);
          })
      },
      validationTextVisible: true,
      validationStyleEnabled: true,
      validateObj: function(lowLiquidity$enabled, lowLiquidity$rebalancingEnabled, lowLiquidity$resetBalance, lowLiquidity$threshold,
                         highLiquidity$enabled, highLiquidity$rebalancingEnabled, highLiquidity$resetBalance, highLiquidity$threshold, highLiquidity$pushPullAccount) {
        if ( this.lowLiquidity.enabled && this.highLiquidity.enabled ) {
          if ( this.lowLiquidity.rebalancingEnabled && this.highLiquidity.rebalancingEnabled ) {
            if ( this.lowLiquidity.resetBalance > this.highLiquidity.threshold ) {
              return 'High Liquidity threshold should be greater than Low liquidity reset balance value.';
            }
            if ( this.highLiquidity.resetBalance < this.lowLiquidity.threshold ) {
              return 'High Liquidity reset balance should be greater than Low liquidity threshold value.';
            }
          }
          if ( this.lowLiquidity.threshold >= this.highLiquidity.threshold ) {
            return 'High Liquidity threshold should be greater than Low liquidity values.';
          }
        }
        if ( this.highLiquidity.rebalancingEnabled ) {
          if ( this.highLiquidity.threshold <= this.highLiquidity.resetBalance ) {
            return 'High Liquidity threshold must be greater than High Liquidity reset balance.';
          }
        }
        if ( this.highLiquidity.rebalancingEnabled && this.highLiquidity.pushPullAccount == 0 ) {
          return 'Please select push/pull account based off denomination.';
        }
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date',
      createMode: 'HIDDEN',
      visibility: 'RO'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      section: 'basicInfo',
      value: foam.nanos.auth.LifecycleState.ACTIVE,
      visibility: foam.u2.Visibility.HIDDEN
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: foam.u2.Visibility.HIDDEN
    }
  ],
  methods: [
    {
      name: 'toSummary',
      documentation: `
        When using a reference to the accountDAO, the labels associated to it will show a chosen property
        rather than the first alphabetical string property. In this case, we are using the account name.
      `,
      code: function(x) {
        var self = this;
        return this.name;
      },
    },
    {
      name: 'doFolds',
      javaCode: `
if ( getLastModified() == null ) return;
fm.foldForState(getId()+":high", getLastModified(), getHighLiquidity().getThreshold());
fm.foldForState(getId()+":low", getLastModified(), getLowLiquidity().getThreshold());
      `
    },
    {
      name: 'getApprovableKey',
      type: 'String',
      javaCode: `
        String id = ((Long) getId()).toString();
        return id;
      `
    }
  ]
});
