foam.INTERFACE({
  package: 'net.nanopay.tx.model',
  name: 'FeeInterface',
  methods: [
    {
      name: 'getFee',
      javaReturns: 'long',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'transactionAmount',
          javaType: 'long'
        }
      ]
    },
    {
      name: 'getTotalAmount',
      javaReturns: 'long',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'transactionAmount',
          javaType: 'long'
        }
      ]
    }
  ]
});

