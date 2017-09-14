foam.CLASS({
  package: 'net.nanopay.bank.ui.co',
  name: 'CashOutModal',
  extends: 'foam.u2.View',

  imports: [ 'closeDialog', 'confirmCashOut', 'bankDAO' ],

  documentation: 'Pop up modal for cashing out.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 448px;
          height: 288px;
          margin: auto;
        }
        ^ .cashOutContainer {
          width: 448px;
          height: 288px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
        }
        ^ .popUpHeader {
          width: 448px;
          height: 40px;
          background-color: #093649;
        }
        ^ .popUpTitle {
          width: 198px;
          height: 40px;
          font-family: Roboto;
          font-size: 14px;
          line-height: 40.5px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #ffffff;
          margin-left: 20px;
          display: inline-block;
        }
        ^ .foam-u2-ActionView-closeButton {
          width: 24px;
          height: 24px;
          margin: 0;
          margin-top: 5px;
          margin-right: 20px;
          cursor: pointer;
          display: inline-block;
          float: right;
          outline: 0;
          border: none;
          background: transparent;
          box-shadow: none;
        }
        ^ .foam-u2-ActionView-closeButton:hover {
          background: transparent;
          background-color: transparent;
        }
        input {
          width: 408px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          margin-left: 20px;
          border-radius: 5px;
          padding: 10px;
        }
        ^ .label {
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
          margin-top: 20px;
          margin-left: 20px;
        }
        ^ .foam-u2-tag-Select{
          height: 40px;
          width: 408px;
          background: white;
          border: solid 1px rgba(164, 179, 184, 0.5);
          margin-top: 5px;
          margin-left: 20px;
          outline: none;
          padding: 10px;
        }
        ^ .foam-u2-ActionView-nextButton {
          font-family: Roboto;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          background: #59a5d5;
          border: solid 1px #59a5d5;
          display: inline-block;
          color: white;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          margin: 0;
          margin-right: 20px;
          margin-top: 20px;
          outline: none;
          float: right;
          box-shadow: none;
          font-weight: normal;
        }
        ^ .foam-u2-ActionView-nextButton:hover {
          background: #3783b3;
          border-color: #3783b3;
        }
        ^ .foam-u2-ActionView-goToBank {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: #5e91cb;
          text-decoration: underline;
          display: inline-block;
          margin: 0;
          float: left;
          cursor: pointer;
          background: transparent;
          border: 0;
          outline: none;
          padding: 0;
          margin-left: 20px;
          margin-top: 44px;
        }
        ^ .foam-u2-ActionView-goToBank:hover {
          background: transparent;
        }
    */}
    })
  ],

  properties: [
    'amount',
    {
      name: 'bankList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.bankDAO,
          objToChoice: function(a){
            return [a.financialId, a.name];
          }
        })
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
      .start()
        .start().addClass('cashOutContainer')
          .start().addClass('popUpHeader')
            .start().add(this.Title).addClass('popUpTitle').end()
            .add(this.CLOSE_BUTTON)
          .end()
          .start().add(this.bankLabel).addClass('label').end()
          .add(this.BANK_LIST)
          .start().add(this.amountLabel).addClass('label').end()
          .start('input').add(this.AMOUNT).end()
          .add(this.NEXT_BUTTON)
          .add(this.GO_TO_BANK)
        .end()
      .end()
    }
  ],

  messages: [
    { name: 'Title', message: 'Cash Out' },
    { name: 'bankLabel', message: 'Bank Name' },
    { name: 'amountLabel', message: 'Amount' }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'nextButton',
      label: 'Next',
      code: function(X) {
        X.closeDialog();
        X.confirmCashOut();
      }
    },
    {
      name: 'goToBank',
      label: 'Go to Bank Accounts',
      code: function(X) {
        X.closeDialog();
        // TODO: Bring user to bank accounts
      }
    }
  ]
})