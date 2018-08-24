foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'Transaction',

  tableColumns: [
    'id',
    'status',
    'payer',
    'payee',
    'amount',
    'processDate',
    'completionDate',
    'created'
  ],

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'addCommas',
    'userDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'java.util.*',
    'java.util.Date',
    'java.util.List',
    'net.nanopay.tx.alterna.AlternaTransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionType',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.account.Balance',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.Transfer'
  ],

  constants: [
    {
      name: 'STATUS_BLACKLIST',
      type: 'Set<TransactionStatus>',
      value: `Collections.unmodifiableSet(new HashSet<TransactionStatus>() {{
        add(TransactionStatus.REFUNDED);
        add(TransactionStatus.PENDING);
      }});`
    }
  ],

  searchColumns: [
    'id', 'status', 'type'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      label: 'Transaction ID',
      visibility: 'RO',
      javaJSONParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.json.StringParser())`,
      javaCSVParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.csv.CSVStringParser())`

    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `The date the transaction was created.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The id of the user who created the transaction.`,
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: `The date the transaction was last modified.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The id of the user who last modified the transaction.`,
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.TransactionType',
      name: 'type',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceId',
      flags: ['js'],
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select invoice' }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'String',
      name: 'referenceNumber',
      visibility: 'RO'
    },
    {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payee',
      label: 'Receiver',
      storageTransient: true,
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.fullName : 'na')
          .end()
        .end();
      }
    },
    {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payer',
      label: 'Sender',
      storageTransient: true,
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.fullName : 'na')
          .end()
        .end();
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      targetDAOKey: 'localAccountDAO',
    },
    {
      class: 'Long',
      name: 'payeeId',
      storageTransient: true,
    },
    {
      class: 'Long',
      name: 'payerId',
      storageTransient: true,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      targetDAOKey: 'localAccountDAO',
    },
    {
      class: 'Currency',
      name: 'amount',
      label: 'Amount',
      visibility: 'RO',
      tableCellFormatter: function(amount, X) {
        var formattedAmount = amount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'Currency',
      name: 'total',
      visibility: 'RO',
      label: 'Total Amount',
      transient: true,
      expression: function(amount) {
        return amount;
      },
      javaGetter: `return getAmount();`,
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        this
          .start()
          .addClass('amount-Color-Green')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
    {
      class: 'DateTime',
      name: 'processDate'
    },
    {
      class: 'DateTime',
      name: 'completionDate'
    },
    {
      documentation: `Defined by ISO 20220 (Pacs008)`,
      class: 'String',
      name: 'messageId'
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      value: 'CAD'
    }
  ],

  methods: [
    {
      name: 'isActive',
      javaReturns: 'boolean',
      javaCode: `
         return
           getStatus().equals(TransactionStatus.COMPLETED) ||
           getType().equals(TransactionType.CASHOUT) ||
           getType().equals(TransactionType.NONE);
      `
    },
    {
      name: 'mapTransfers',
      javaReturns: 'HashMap<String, Transfer[]>',
      javaCode: `
      HashMap<String, Transfer[]> hm = new HashMap<String, Transfer[]>();
      if ( ! isActive() ) return hm;
      hm.put(getSourceCurrency(), new Transfer[]{
        new Transfer((Long) getSourceAccount(), -getTotal()),
        new Transfer((Long) getDestinationAccount(),  getTotal())
      });
      return hm;
      `
    },
    {
      name: 'toString',
      javaReturns: 'String',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(this.getClass().getSimpleName());
        sb.append("(");
        sb.append("id: ");
        sb.append(getId());
        sb.append(", ");
        sb.append("type: ");
        sb.append(getType());
        sb.append(", ");
        sb.append("status: ");
        sb.append(getStatus());
        sb.append(")");
        return sb.toString();
      `
    }
  ]
});
