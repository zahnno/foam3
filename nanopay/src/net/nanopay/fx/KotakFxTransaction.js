foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'KotakFxTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

   javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
  ],

   documentation: `Kotak transaction that stays in pending until a manual transaction rate is entered`,

   properties: [
    {
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;',
    },
    {
      name: 'status',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
   ],

   methods: [
     {
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
      return false;
      `
     },
     {
       name: 'limitedCopyFrom',
       args: [
         {
           name: 'other',
           javaType: 'net.nanopay.tx.model.Transaction'
         }
       ],
       javaCode: `
       super.limitedCopyFrom(other);
       setFxRate(((KotakFxTransaction) other).getFxRate());
       setFxQuoteId(((KotakFxTransaction) other).getFxQuoteId());
       `
     },
  ]
});
