foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactByPaymentCodeModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Add Contact By PaymentCode Modal',

  imports: [
    'addPaymentCodeContact',
    'closeDialog',
    'ctrl',
    'user',
  ],

  requires: [
    'net.nanopay.contacts.Contact'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 593px;
    }
    ^container {
      height: 509px;
      padding: 24px;
    }
    ^contact-title {
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
      margin-bottom: 8px;
    }
    ^instruction {
      color: #8e9090;
      line-height: 1.43;
      margin-top: 8px;
      margin-bottom: 16px;
    }
    ^contact-input {
      width: 100%;
      margin: 0;
    }
    ^button-container {
      height: 84px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back {
      color: #604aff;
      background-color: transparent;
      border: none;
      padding: 0;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.43;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back:hover {
      background-color: transparent;
      color: #4d38e1;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-primary:hover {
      border: none;
    }
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'Add by Payment Code'
    },
    {
      name: 'INSTRUCTION',
      message: `Input a payment code to add an Ablii business to your
        contacts. You can ask your contact for their Payment Code.`
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'paymentCodeValue',
      documentation: 'Payment code provided by user.',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Enter payment code',
      }
    }
  ],

  methods: [

    function initE() {
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('container'))
          .start().addClass('contact-title')
            .add(this.TITLE)
          .end()
          .start().addClass(this.myClass('instruction'))
            .add(this.INSTRUCTION)
          .end()
          .start(this.PAYMENT_CODE_VALUE)
            .addClass(this.myClass('contact-input'))
          .end()
        .end()
        .start().addClass(this.myClass('button-container'))
          .start(this.BACK).end()
          .start(this.ADD_CONTACT_BY_PAYMENT_CODE).end()
        .end();
    },

    function dec2hex(dec) {
      return ('0' + dec.toString(16)).substr(-2);
    },

    function generateTemporaryId() {
      var array = new Uint8Array((15 || 40) / 2);
      window.crypto.getRandomValues(array);
      return Array.from(array, this.dec2hex).join('');
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        if ( X.subStack.depth > 1 ) {
          X.subStack.back();
        } else {
          X.closeDialog();
        }
      }
    },
    {
      name: 'AddContactByPaymentCode',
      label: 'Add Contact',
      code: async function(X) {
        let contact = this.Contact.create({
            type: 'Contact',
            group: 'sme',
            email: 'temp' + this.generateTemporaryId() + this.user.email,
            organization: 'temp' + this.generateTemporaryId() + this.user.organization
        });
        contact.paymentCode = this.paymentCodeValue;
        contact.createdUsingPaymentCode = true;
        try {
          await this.user.contacts.put(contact);
          this.ctrl.notify('Contact by payment code added!', 'success');
          X.closeDialog();
        } catch (err) {
          var msg = err.message || this.GENERIC_PUT_FAILED;
          this.ctrl.notify(msg, 'error');
        }
      }
    }
  ]
});
