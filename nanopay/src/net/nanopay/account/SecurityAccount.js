foam.CLASS({
  package: 'net.nanopay.account',
  name: 'SecurityAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'The base model for storing all individual securities.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'foam.core.Currency'
  ],

  imports: [
    'exchangeRateService'
  ],

  searchColumns: [
    'name',
    'id',
    'denomination',
    'type'
  ],

  tableColumns: [
    'id',
    'name',
    'type',
    'denomination',
    'balance'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.exchangeable.Security',
      targetDAOKey: 'securitiesDAO',
      name: 'denomination',
      documentation: 'The security that this account stores.',
      tableWidth: 127,
      section: 'accountDetails',
      order: 3
    },
    {
      class: 'Long',
      name: 'balance',
      label: 'Balance (local)',
      section: 'balanceDetails',
      documentation: 'A numeric value representing the available funds in the bank account.',
      storageTransient: true,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, id) {
        return obj.denomination.format(value);
      },
      tableWidth: 145
    },
    {
      class: 'Long',
      name: 'homeBalance',
      label: 'Balance (home)',
      section: 'balanceDetails',
      documentation: `
        replace the table cell formatter to return the market value in home currency.
      `,
      storageTransient: true,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
              var self = this;

              this.add(
                obj.slot(homeDenomination => {
                  return Promise.all([
                    obj.denomination == homeDenomination ?
                      Promise.resolve(1) :
                      obj.exchangeRateService.exchange(obj.denomination, homeDenomination,
                         obj.findBalance(self.__subSubContext__)),
                    self.__subSubContext__.currencyDAO.find(homeDenomination)
                  ]).then(arr => {
                    let [b, c] = arr;
                    var displayBalance = c.format(Math.floor((b || 0) ));
                    self.tooltip = displayBalance;
                    return displayBalance;
                  })
                })
              );
            },
      tableWidth: 145
    },
  ],

  methods: [
    {
      name: 'findBalance',
      type: 'Any',
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      code: function(x) {
        return x.balanceDAO.find(this.id).then(b => b ? b.balance : 0);
      },
      javaCode: `
        DAO balanceDAO = (DAO) x.get("balanceDAO");
        Balance balance = (Balance) balanceDAO.find(this.getId());
        if ( balance != null ) {
          //((foam.nanos.logger.Logger) x.get("logger")).debug("Balance found for account", this.getId());
          return balance.getBalance();
        } else {
          //((foam.nanos.logger.Logger) x.get("logger")).debug("Balance not found for account", this.getId());
        }
        return 0L;
      `
    },
    {
      name: 'validateAmount',
      documentation: `Allows a specific value to be used to perform a balance operation.
        For example: Trust accounts can be negative.`,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',

          type: 'Long'
        }
      ],
      javaCode: `
        long bal = balance == null ? 0L : balance.getBalance();

        /*if ( amount < 0 &&
             -amount > bal ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", bal);
          throw new RuntimeException("Insufficient balance in account " + this.getId());
        } // Lets just we can go into margin on securities for now.. */
      `
    }
  ]
});
