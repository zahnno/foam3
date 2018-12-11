foam.INTERFACE({
  package: 'net.nanopay.tx',
  name: 'UserTransactionLimit',

  methods: [
    {
      name: 'start',
    },
    {
      name: 'getLimit',
      returns: 'Long',
      swiftReturns: 'Int',
      async: true,
      swiftThrows: true,
      args: [
        {
          name: 'userId',
          type: 'Long',
        },
        {
          type: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
          name: 'timeFrame'
        },
        {
          type: 'net.nanopay.tx.model.TransactionLimitType',
          name: 'type'
        }
      ]
    },
    {
      name: 'getRemainingLimit',
      returns: 'Long',
      async: true,
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          name: 'userId',
          type: 'Long',
        },
        {
          type: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
          name: 'timeFrame'
        },
        {
          name: 'type',
          type: 'net.nanopay.tx.model.TransactionLimitType'
        }
      ]
    }
  ]
});
