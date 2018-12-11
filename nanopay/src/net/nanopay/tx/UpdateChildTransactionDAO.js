foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'UpdateChildTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Updates child transaction`,

  javaImports: [
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Transaction oldTxn = (Transaction) getDelegate().find_(x, obj);
          Transaction txn = (Transaction) getDelegate().put_(x, obj);
          List children = ((ArraySink) txn.getChildren(x).select(new ArraySink())).getArray();
          if ( children.size() == 0 ) return txn;
          if ( txn.getStatus() == TransactionStatus.COMPLETED ) {
            if ( oldTxn.getStatus() != TransactionStatus.COMPLETED || txn instanceof DigitalTransaction) {
              for ( Object txObj : children ) {
                Transaction t = (Transaction)((FObject) txObj).fclone();
                ((DAO) x.get("localTransactionDAO")).put_(x, t);
              /*Transaction t = (Transaction)((FObject) txObj).fclone();
              try {
                ((DAO) x.get("localTransactionDAO")).put_(x, t);
              } catch (Exception e) {
                e.printStackTrace();
              }*/
              }
            }
          }
      return txn;
      `
    }
  ],

     axioms: [
       {
         buildJavaClass: function(cls) {
           cls.extras.push(`
   public UpdateChildTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
     System.err.println("Direct constructor use is deprecated. Use Builder instead.");
     setDelegate(delegate);
   }
           `);
         },
       },
     ]
});
