foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PaymentProvider',

  documentation: 'Payment Provider.',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'net.nanopay.bank.BankAccount',
    'java.util.ArrayList',
    'java.util.List'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of the Payment Provider.'
    }
  ],

  axioms: [
    {
      buildJavaClass: function (cls) {
        cls.extras.push(`
        
        public static ArrayList<PaymentProvider> findPaymentProvider(X x, BankAccount account){
      
          DAO paymentProviderConfigDAO = (DAO) x.get("paymentProviderConfigDAO");
          DAO paymentProviderDAO = (DAO) x.get("paymentProviderDAO");
      
          ArraySink sink = (ArraySink) paymentProviderConfigDAO.where(
            MLang.EQ(PaymentProviderConfig.INSTITUTION, account.getInstitution())
          ).select(new ArraySink());
          List<PaymentProviderConfig> array = sink.getArray();
      
          ArrayList<PaymentProvider> paymentProviders = new ArrayList<>();
      
          if ( array.size() > 0 ) {
            for ( PaymentProviderConfig config : array ) {
              PaymentProvider paymentProvider = (PaymentProvider) paymentProviderDAO.find(config.getPaymentProvider());
              paymentProviders.add(paymentProvider);
            }
          }
      
          return paymentProviders;
        }
        
        `)
      }
    }
    ]
});
