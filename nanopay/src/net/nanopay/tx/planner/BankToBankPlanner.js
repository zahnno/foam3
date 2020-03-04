foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'BankToBankPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for bank to bank transactions',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        Transaction txn;
        // create summary transaction when the request transaction is the base Transaction,
        // otherwise conserve the type of the transaction.
        if ( requestTxn.getType().equals("Transaction") ) {
          txn = new SummaryTransaction(x);
          txn.copyFrom(requestTxn);
        } else {
          txn = (Transaction) requestTxn.fclone();
        }

        txn.setStatus(TransactionStatus.PENDING);
        txn.setInitialStatus(TransactionStatus.COMPLETED);

        Account sourceAccount = quote.getSourceAccount();
        Account destinationAccount = quote.getDestinationAccount();
        DigitalAccount sourceDigitalAccount = DigitalAccount.findDefault(getX(), sourceAccount.findOwner(getX()), sourceAccount.getDenomination());
        DigitalAccount destinationDigitalAccount = DigitalAccount.findDefault(getX(), destinationAccount.findOwner(getX()), destinationAccount.getDenomination());
       
        // Split 1: ABank -> ADigital
        Transaction t1 = new Transaction(x);
        t1.copyFrom(txn);
        // Get Payer Digital Account to fufil CASH-IN
        t1.setDestinationAccount(sourceDigitalAccount.getId());

        // Split 2: ADigital -> BDigital
        Transaction t2 = new Transaction(x);
        t2.copyFrom(txn);
        t2.setSourceAccount(sourceDigitalAccount.getId());
        t2.setDestinationAccount(destinationDigitalAccount.getId());

        // Split 3: BDigital -> BBankAccount
        Transaction t3 = new Transaction(x);
        t3.copyFrom(txn);
        t3.setSourceAccount(destinationDigitalAccount.getId());
        t3.setDestinationAccount(destinationAccount.getId());

        // Put chain transaction together
        Transaction[] cashInPlans = multiQuoteTxn(x, t1);
        Transaction[] digitalPlans = multiQuoteTxn(x, t2);
        Transaction[] cashOutPlans = multiQuoteTxn(x, t3);

        for ( Transaction CIP : cashInPlans ) {
          for ( Transaction DP : digitalPlans ) {
            for ( Transaction COP : cashOutPlans ) {
              Transaction t = (Transaction) txn.fclone();
              DP.addNext(COP);
              CIP.addNext(DP);
              t.addNext(CIP);
              t.addLineItems(CIP.getLineItems(), CIP.getReverseLineItems());
              t.addLineItems(DP.getLineItems(), DP.getReverseLineItems());
              t.addLineItems(COP.getLineItems(), COP.getReverseLineItems());
              t.setStatus(TransactionStatus.COMPLETED);
              // TODO move to fee engine
              t.addLineItems(new TransactionLineItem[] { new InvoicedFeeLineItem.Builder(getX()).setGroup("InvoiceFee").setAmount(75l).setCurrency(sourceAccount.getDenomination()).build()}, null);
              getAlternatePlans_().add(t);
            }
          }
        }
        return null;
      `
    },
  ]
});
