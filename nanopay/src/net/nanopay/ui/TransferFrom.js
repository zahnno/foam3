foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TransferFrom',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Payer account selection',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'foam.nanos.auth.User',
    'net.nanopay.ui.transfer.TransferUserCard'
  ],

  imports: [
    'accountDAO',
    'publicUserDAO',
    'userDAO',
    'user',
    'groupDAO',
    'type',
    'balanceDAO',
    'balance',
    'currencyDAO'
  ],

  css: `
    ^ .property-notes {
      box-sizing: border-box;
      width: 320px;
      height: 66px;
      overflow-y: scroll;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      resize: vertical;

      padding: 8px;
      outline: none;
    }

    ^ .property-notes:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-tag-Select {
      width: 320px;
      height: 40px;
      border-radius: 0;

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      padding: 12px 20px;
      padding-right: 35px;
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      background-color: white;
      outline: none;
      cursor: pointer;
    }

    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }

    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }

    ^ .dropdownContainer {
      position: relative;
      margin-bottom: 20px;
    }

    ^ .caret {
      position: relative;
      pointer-events: none;
    }

    ^ .caret:before {
      content: '';
      position: absolute;
      top: -23px;
      left: 295px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }

    ^ .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }

    ^ .choice{
      margin-bottom: 20px;
    }


    ^ .confirmationContainer {
      margin-top: 18px;
      width: 100%;
    }

    ^ .confirmationLabel {
      display: inline-block;
      vertical-align: top;
      width: 80%;
      margin-left: 20px;
      font-size: 12px;
      cursor: pointer;
    }

    ^ input[type='checkbox'] {
      display: inline-block;
      vertical-align: top;
      margin:0 ;
      border: solid 1px rgba(164, 179, 184, 0.75);
      cursor: pointer;
    }

    ^ input[type='checkbox']:checked {
      background-color: black;
    }

    ^ .half-small-input-box {
      width: 100%;
    }
  `,

  messages: [
    { name: 'TransferFromLabel', message: 'Transfer from' },
    { name: 'TypeLabel', message: 'Type' },
    { name: 'DenominationLabel', message: 'Denomination' },
    { name: 'AccountLabel', message: 'Account' },
    { name: 'FromLabel', message: 'From' },
    { name: 'AmountLabel', message: 'Transfer Amount'}
  ],

  properties: [
    'payer',
    {
      class: 'Boolean',
      name: 'accountCheck',
      value: true,
      preSet: function(oldValue, newValue) {
        if ( ! this.partnerCheck && oldValue ) {
          return oldValue;
        }
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.accountCheck = newValue;
        if ( this.partnerCheck ) this.partnerCheck = false;
      }
    },
    {
      class: 'Boolean',
      name: 'partnerCheck',
      value: false,
      preSet: function(oldValue, newValue) {
        if ( ! this.accountCheck && oldValue ) {
          return oldValue;
        }
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.partnerCheck = newValue;
        if ( this.accountCheck ) this.accountCheck = false;
        if ( newValue ) {
          if ( this.accountOwner != this.partners ) this.accountOwner = this.partners;
        } else if (this.accountOwner != this.user.id) {
          this.accountOwner = this.user.id;
        }
      }
    },
    {
      name: 'partners',
      postSet: function(oldValue, newValue) {
        if ( this.partnerCheck && this.accountOwner != newValue ) {
          this.accountOwner = newValue;
        }
      },
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.data.userDAO.limit(50).where(
            X.data.AND(
              X.data.NEQ(X.data.User.ID, X.data.user.id),
              X.data.EQ(X.data.User.GROUP, 'business'))),
          objToChoice: function(user) {
            return [user.id, user.email];
          }
        });
      }
    },
    {
      name: 'accountOwner',
      postSet: function(oldValue, newValue) {
        this.viewData.payer = newValue;
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.EQ(this.Account.OWNER, newValue),
              this.NEQ(this.Account.TYPE, 'TrustAccount')))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            if ( self.types === undefined && self.viewData.type ) {
              self.types = self.viewData.type;
            } else {
              self.types = accounts[0].type;
            }      
          });
        this.userDAO
          .where(this.EQ(this.User.ID, newValue))
          .select()
          .then(function(u) {
            var users = u.array;
            if ( users.length > 0 ) self.payer = users[0];
          });
      }
    },
    {
      name: 'types',
      postSet: function(oldValue, newValue) {
        this.viewData.type = newValue;
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.EQ(this.Account.OWNER, this.accountOwner),
              this.EQ(this.Account.TYPE, newValue)))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            if ( self.denominations === undefined && self.viewData.denomination ) {
              self.denominations = self.viewData.denomination;
            } else {
              self.denominations = accounts[0].denomination;
            }          
          });
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.typeChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.typeChoices(view);
        });
        return view;
      }
    },
    {
      name: 'denominations',
      postSet: function(oldValue, newValue) {
        this.viewData.payerDenomination = newValue;     
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.AND(
                this.EQ(this.Account.TYPE, this.types),
                this.EQ(this.Account.DENOMINATION, newValue)), 
              this.EQ(this.Account.OWNER, this.accountOwner)))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            if ( self.accounts === undefined && self.viewData.payerAccount ) {
              self.accounts = self.viewData.payerAccount;
            } else {
              self.accounts = accounts[0].id;
            } 
          });
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.denominationChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.denominationChoices(view);
        });
        X.data.types$.sub(function() {
          X.data.denominationChoices(view);
        });
        return view;
      }
    },
    {
      name: 'accounts',
      postSet: function(oldValue, newValue) {
        this.viewData.payerAccount = newValue;
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.accountChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.accountChoices(view);
        });
        X.data.types$.sub(function() {
          X.data.accountChoices(view);
        });
        X.data.denominations$.sub(function() {
          X.data.accountChoices(view);
        });
        return view;
      }
    },
    {
      class: 'Currency',
      name: 'transferAmount',
      postSet: function(oldValue, newValue) {
        this.viewData.fromAmount = newValue;
      }
    },
    {
      name: 'hasPartnerPermission',
      value: false
    }
  ],

  methods: [
    function init() { 
      if ( this.viewData.fromAmount ) {
        this.transferAmount = this.viewData.fromAmount;
      } else {
        this.viewData.fromAmount = 0;
      }

      if ( this.viewData.partnerCheck ) {
        this.partners = this.viewData.payer;
        this.partnerCheck = true;
      } else {
        this.accountOwner =  this.user.id;
      }

      this.SUPER();
    },

    function initE() {
      this.checkPermission();
      this.SUPER();

      this.accounts$.sub(this.onAccountUpdate);
      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('p').add(this.TransferFromLabel).addClass('bold').end()

          .start().addClass('choice')
            .start('div').addClass('confirmationContainer')
              .tag({ class: 'foam.u2.md.CheckBox', data$: this.accountCheck$ })
              .start('p').addClass('confirmationLabel').add('Pay with my account').end()
            .end()
            .start('div').addClass('confirmationContainer').show(this.hasPartnerPermission$)
              .tag({ class: 'foam.u2.md.CheckBox', data$: this.partnerCheck$ })
              .start('p').addClass('confirmationLabel').add('Pay with partner account').end()
            .end()
          .end()

          .start('div').addClass('dropdownContainer').show(this.partnerCheck$)
            .start(this.PARTNERS).end()
            .start('div').addClass('caret').end()
          .end()
     
          .start('p').add(this.TypeLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.TYPES).end()
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.DenominationLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.DENOMINATIONS).end()
            .start('div').addClass('caret').end()
          .end()
          .br()

          .start('p').add(this.AccountLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.ACCOUNTS).end()
            .start('div').addClass('caret').end()
          .end()

          .start('p').add(this.AmountLabel).end()
          .start(this.TRANSFER_AMOUNT).addClass('half-small-input-box').end()

        .end()
        
        .start('div').addClass('divider').end()
        .start('div').addClass('fromToCol')
          .start('p').add(this.FromLabel).addClass('bold').end()
          .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user$: this.payer$ })
        .end();
    },
    
    function checkPermission() {
      var self = this;
      this.groupDAO.find(this.user.group).then(function(group) {
        if ( group )  {
          var permissions = group.permissions;
          self.hasPartnerPermission = permissions.filter(function(p) {
            return p.id == '*' || p.id == 'transfer.from.partner';
          }).length > 0;
        }
      })
    }
  ],

  listeners: [
    {
      name: 'onAccountUpdate',
      code: function onAccountUpdate() {
        var self = this;
        this.balanceDAO.find(this.accounts).then(function(balance) {
          var amount = (balance != null ? balance.balance : 0);
          self.viewData.balance = amount;
        });
      }
    },

    async function accountChoices(view) {
      var a = await this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner),
            this.AND(
              this.EQ(this.Account.DENOMINATION, this.denominations || ''),
              this.EQ(this.Account.TYPE, this.types || ''))))
        .select();
      var accounts = a.array;
      var length = accounts.length;
      var type = this.types;
      if ( type == 'DigitalAccount' ) {
        let choices = [];
        for ( var i = 0; i < length; ++i ) {
          let account = accounts[i];
          let balance = await account.findBalance(this);
          let currency = await this.currencyDAO.find(account.denomination);
          choices.push(
            [account.id,
            'Digital Account Balance: ' + currency.format(balance)]);
        }
        if ( this.types == 'DigitalAccount' ) view.choices = choices;
      }

      if ( type.length >= 11 && type.substring(type.length - 11) == 'BankAccount')  {
        view.choices = accounts.map(function(account) {
          var numLength = account.accountNumber.length;
          choice = account.name + ' ' + '***' + account.accountNumber.substring(numLength - 4, numLength);
          return [account.id, choice];
        });
      }
    },

    function typeChoices(view) {
      this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner),
            this.NEQ(this.Account.TYPE, 'TrustAccount')))
        .select(this.GROUP_BY(net.nanopay.account.Account.TYPE, this.COUNT()))        
        .then(function(g) {
          view.choices = Object.keys(g.groups).map(function(t) {
            return [t, t.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")];
        });
      });
    },

    function denominationChoices(view) {
      this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner),
            this.EQ(this.Account.TYPE, this.types || '')))
        .select(this.GROUP_BY(net.nanopay.account.Account.DENOMINATION, this.COUNT()))        
        .then(function(g) {
          view.choices = Object.keys(g.groups).map(function(d) {
            return [d, d];
        });
      });
    }
  ]
});
