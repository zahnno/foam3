foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ManualFxRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Get FX rate if an approval request with FX quote is available.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.KotakFxTransaction',
    'net.nanopay.fx.ManualFxApprovalRequest',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          ManualFxApprovalRequest request = (ManualFxApprovalRequest) obj;
          if ( request.getStatus() == ApprovalStatus.REQUESTED ) {
            return;
          }
          DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
          DAO transactionDAO = ((DAO) x.get("transactionDAO"));
          DAO fxQuoteDAO = (DAO) x.get("fxQuoteDAO");
          Sink sink = new ArraySink();
          sink = transactionDAO
            .where(
              MLang.AND(
                MLang.INSTANCE_OF(KotakFxTransaction.class),
                MLang.EQ(Transaction.ID, request.getObjId())
              )
            )
            .select(sink);
          List list = ((ArraySink) sink).getArray();
    
          // approval request with rate exists
          if ( list != null && list.size() > 0 ) {
            KotakFxTransaction kotakFxTransaction = (KotakFxTransaction) list.get(0);
            double rate = request.getFxRate();

            if ( request.getStatus() == ApprovalStatus.REJECTED ) {
              kotakFxTransaction.setStatus(TransactionStatus.DECLINED);
              transactionDAO.put_(x, kotakFxTransaction);
            }

            if ( rate <= 0 ) {
              request.setStatus(ApprovalStatus.REQUESTED);
              request = (ManualFxApprovalRequest) approvalRequestDAO.put_(x, request);
            } else {
              FXQuote quote = new FXQuote();
              quote.setRate(rate);
              quote.setSourceCurrency("CAD");
              quote.setTargetCurrency("INR");
              quote.setSourceAmount(kotakFxTransaction.getAmount());
              quote.setExpiryTime(request.getExpiryDate());
              quote.setQuoteDateTime(request.getValueDate());
              String id = Long.toString(((FXQuote) fxQuoteDAO.put_(x, quote)).getId());
    
              kotakFxTransaction.setFxQuoteId(id);
              kotakFxTransaction.setFxRate(rate);
              kotakFxTransaction.setStatus(TransactionStatus.COMPLETED);
              transactionDAO.put_(x, kotakFxTransaction);
    
              approvalRequestDAO
                .where(
                  MLang.AND(
                    MLang.INSTANCE_OF(ManualFxApprovalRequest.class),
                    MLang.EQ(ManualFxApprovalRequest.DAO_KEY, "transactionDAO"),
                    MLang.EQ(ManualFxApprovalRequest.OBJ_ID, kotakFxTransaction.getId()),
                    MLang.NEQ(ManualFxApprovalRequest.ID, request.getId())
                  )
                )
                .removeAll();
            }
          }
        }
      }, "Manual FX Rule");
      `
    }
  ]
 });
