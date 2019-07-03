foam.CLASS({
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
    'java.util.ArrayList',
    'java.util.Arrays',
    'net.nanopay.tx.bmo.BmoFormatUtil'
  ],

  implements: [
    'net.nanopay.tx.bmo.cico.BmoTransaction'
  ],

  properties: [
    {
      name: 'CompletedTimeEDT',
      class: 'String'
    },
    {
      name: 'transactionHistory',
      class: 'String',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 }
    },
    {
      name: 'potentiallyUndelivered',
      class: 'Boolean'
    },
    {
      name: 'bmoReferenceNumber',
      class: 'String'
    },
    {
      name: 'bmoFileCreationNumber',
      class: 'Int'
    },
    {
      name: 'rejectReason',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'addHistory',
      args: [
        {
          name: 'history', type: 'String'
        }
      ],
      type: 'Void',
      javaCode: `
      String temp = BmoFormatUtil.getCurrentDateTimeEDT() + " : " + history + System.lineSeparator();
      this.setTransactionHistory(this.getTransactionHistory() + temp);
      `
    },
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode: `
        super.limitedCopyFrom(other);
        setTransactionHistory( ((BmoCOTransaction) other).getTransactionHistory() );
        setCompletedTimeEDT(((BmoCOTransaction) other).getCompletedTimeEDT() );
        setPotentiallyUndelivered( ((BmoCOTransaction) other).getPotentiallyUndelivered() );
        setBmoReferenceNumber( ((BmoCOTransaction) other).getBmoReferenceNumber() );
        setBmoFileCreationNumber( ((BmoCOTransaction) other).getBmoFileCreationNumber() );
        setRejectReason( ((BmoCOTransaction) other).getRejectReason() );
      `
    }
  ]
});
