foam.CLASS({
  package: 'net.nanopay.ingenico.ui.transaction',
  name: 'EmptyTransactionListView',
  extends: 'foam.u2.View',

  documentation: 'View for empty transaction list',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 100%;
          background-color: #ffffff;
          position: relative;
        }
        ^ .no-transactions-label {
          height: 16px;
          font-family: Roboto;
          font-size: 16px;
          line-height: 1;
          text-align: center;
          color: #252c3d;
          padding-top: 156px;
        }
      */}
    })
  ],

  messages: [
    { name: 'noTransactions', message: 'You don’t have any transactions yet.' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .addClass('no-transactions-label')
          .add(this.noTransactions)
        .end()
    }
  ]
});