foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'GenericCOPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for doing Cash outs for any currency instantly.',

  javaImports: [
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.account.TrustAccount',
  ],

  //TODO: Predicate:
  /*if ( destAccount instanceof BankAccount &&
                           sourceAccount instanceof DigitalAccount ) */

  methods: [
    {
      name: 'plan',
      javaCode: `

      COTransaction cashOut = new COTransaction();
      cashOut.copyFrom(requestTxn);
      // use destinations trust, need system context.
      TrustAccount trustAccount = TrustAccount.find(getX(), quote.getDestinationAccount());

      addTransfer(trustAccount.getId(), cashOut.getAmount());
      addTransfer(quote.getSourceAccount().getId(), -cashOut.getAmount());

      cashOut.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);

      return cashOut;

      `
    },
  ]
});

