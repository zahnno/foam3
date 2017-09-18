foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'HomeView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  requires: [
    'net.nanopay.merchant.ui.QRCodeView'
  ],

  imports: [
    'stack'
  ],

  exports: [
    'as data'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          background-color: #2c4389;
          position: relative;
        }
        ^ .amount-label {
          height: 30px;
          font-family: Roboto;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          padding-top: 58px;
        }
        ^ .property-amount {
          border: none;
          background-color: #2c4389;
          height: 88px;
          width: 320px;
          max-width: 100%;
          overflow-x: hidden;
          font-family: Roboto;
          font-size: 75px;
          text-align: center;
          color: #ffffff;
          margin-top: 14px;
        }

        ^ .property-amount:focus {
          outline: none;
        }
      */}
    })
  ],

  properties: [
    ['header', true],
    { name: 'amount', class: 'String', value: '$0.00'}
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .on('keydown', this.onKeyPressed)
        .start().addClass('amount-label').add('Amount').end()
        .tag(this.AMOUNT, { onKey: true })
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      if ( e.key !== 'Enter' )
        return;

      // check if amount entered is less than allowed amount of 1 cent
      var amountFloat = parseFloat(this.amount.replace(/\$|,|/g, ''));
      if ( amountFloat < 0.01 )
        return;

      // push QR code view
      this.stack.push(this.QRCodeView.create({
        amount: (amountFloat * 100)
      }));
    }
  ]
})