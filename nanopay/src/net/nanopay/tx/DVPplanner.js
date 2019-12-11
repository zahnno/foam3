foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DVPplanner',
  documentation: 'A planner for planning Delivery vs. Payment (DVP) type transactions',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.dao.DAO',
    'net.nanopay.tx.DVPTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.SecurityTransaction',
    'net.nanopay.tx.Transfer',
    'foam.core.ContextAgent',
    'foam.core.X',
    'java.util.List',
    'java.util.ArrayList'
  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
                                  @Override
                                  public void execute(X x) {
        TransactionQuote txq = (TransactionQuote) obj;
        DVPTransaction tx = (DVPTransaction) txq.getRequestTransaction();
        CompositeTransaction ct = new CompositeTransaction.Builder(x).build();
        ct.setIsQuoted(true);
        SecurityTransaction fop = new SecurityTransaction.Builder(x).build();
        DigitalTransaction dt = new DigitalTransaction.Builder(x).build();
        DAO quoter = ((DAO) x.get("localTransactionQuotePlanDAO"));

        // create the FOP transaction
        fop.setSourceAccount(tx.getSourceAccount());
        fop.setDestinationAccount(tx.getDestinationAccount());
        fop.setSourceCurrency(tx.getSourceCurrency());
        fop.setDestinationCurrency(tx.getDestinationCurrency());
        fop.setAmount(tx.getAmount());
        TransactionQuote tq1 = new TransactionQuote.Builder(x).setRequestTransaction(fop).build();
        tq1 = (TransactionQuote) quoter.put(tq1);
        ct.addNext(tq1.getPlan());

        //create the Payment digital transaction
        dt.setSourceCurrency(tx.getPaymentDenomination());
        dt.setDestinationCurrency(tx.getPaymentDenomination());

        dt.setDestinationAccount(tx.getDestinationPaymentAccount());
        dt.setAmount(tx.getPaymentAmount());
        TransactionQuote tq2 = new TransactionQuote.Builder(x).setRequestTransaction(dt).build();
        tq2 = (TransactionQuote) quoter.put(tq2);
        ct.addNext(tq2.getPlan());


        tx.addNext(ct);
        tx.setIsQuoted(true);
        tx.setTransfers(new Transfer[0]);
        txq.setPlan(tx);
        }}, "DVP Security Transaction Planner");
      `
    }
  ]
});
