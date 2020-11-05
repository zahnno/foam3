/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'TwoFactorAuthView',
  extends: 'foam.u2.Controller',

  documentation: 'Two factor auth view for Ablii',

  imports: [
    'subject',
    'ctrl',
    'twofactor'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup'
  ],

  css: `
    ^two-factor-qr-code {
      align-items: center;
      border: solid 1px #e2e2e3;
      display: flex;
      width: 157px;
      height: 157px;
      justify-content: center;
      margin-top: 16px;
    }
    ^two-factor-key {
      display: flex;
      margin-top: 16px;
      min-width: 210px;
    }
    ^two-factor-enable {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: 30px;
    }
    ^two-factor-disable {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    ^status-container {
      display: flex;
      min-width: 140px;
    }
    ^status {
      font-size: 14px;
      line-height: 1.5;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^two-factor-enabled {
      font-size: 14px;
      line-height: 1.36;
      color: #03cf1f;
      display: inline-block;
      margin-left: 10px;
      min-width: 215px;
    }
    ^two-factor-disabled {
      font-size: 14px;
      line-height: 1.36;
      color: #f91c1c;
      display: inline-block;
      margin-left: 10px;
    }
    ^enter-validation-code {
      color: /*%BLACK%*/ #1e1f21;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    ^ .validation-input .property-twoFactorToken {
      width: 125px;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    ^ .foam-u2-ActionView-enableTwoFactor {
      width: 96px;
      margin-left: 8px;
    }
    ^ .foam-u2-ActionView-disableTwoFactor {
      width: 96px;
      color: #f91c1c;
      background-color: transparent;
      border: 1px solid #f91c1c;
      margin-left: auto;
    }
    ^ .foam-u2-ActionView-disableTwoFactor:hover {
      color: #f91c1c;
      background-color: transparent !important;
      border: 1px solid #f91c1c;
    }
    ^ .validation-input {
      margin-top: 12px;
      min-width: 215px;
    }
    ^two-factor-benefit {
      padding-right: 25px;
    }
    ^flex-div {
      display: flex;
    }
    ^qr-and-key {
      display: flex;
      flex-direction: column;
    }
    ^ .image-qr-code {
      width: 120px;
      height: 120px
    }
  `,

  messages: [
    { name: 'TWO_FACTOR_NO_TOKEN_ERROR', message: 'Please enter a verification token' },
    { name: 'TWO_FACTOR_ENABLE_SUCCESS', message: 'Two-factor authentication enabled' },
    { name: 'TWO_FACTOR_ENABLE_ERROR', message: 'Could not enable two-factor authentication. Please try again.' },
    { name: 'TWO_FACTOR_BENEFIT', message: 'Your account is protected with two-factor authentication' },
    { name: 'TWO_FACTOR_LABEL', message: 'Enter verification code' },
    { name: 'STATUS', message: 'Status' },
    { name: 'ENABLED', message: '• Enabled' },
    { name: 'DISABLED', message: '• Disabled' },
    { name: 'QR_LABEL', message: 'QR code' },
    { name: 'QR_KEY_LABEL', message: 'Key: ' }
  ],

  properties: [
    {
      class: 'String',
      name: 'twoFactorQrCode',
      documentation: 'Two-factor authentication QR code string'
    },
    {
      class: 'String',
      name: 'twoFactorKey',
      documentation: 'Two-factor authentication key'
    },
    {
      class: 'String',
      name: 'twoFactorToken',
      documentation: 'Two-factor token generated by authenticator app',
      placeholder: '123456'
    },
    {
      class: 'Boolean',
      name: 'hideDisableButton',
      value: 'false'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass(this.myClass('flex-div'))
          .add(this.subject.realUser$.dot('twoFactorEnabled').map((twoFactorEnabled) => {
            if ( ! twoFactorEnabled ) {
              // two factor disabled
              var self = this;
              this.twofactor.generateKeyAndQR(null)
                .then(function(otpKey) {
                  self.twoFactorKey = otpKey.key;
                  self.twoFactorQrCode = otpKey.qrCode;
                }).catch(function(err) {
                  self.ctrl.notify(err.message, '', self.LogLevel.ERROR, true);
                });

              return this.E().addClass(this.myClass('flex-div'))
                .start()
                  .addClass(this.myClass('qr-and-key'))
                  .add(this.QR_LABEL)
                  .start().addClass(this.myClass('two-factor-qr-code'))
                    .start('img').attrs({ src: this.twoFactorQrCode$ }).addClass('image-qr-code').end()
                  .end()
                  .start().addClass(this.myClass('two-factor-key'))
                    .add(this.slot(function(twoFactorKey) {
                      return this.QR_KEY_LABEL + (twoFactorKey.match(/.{4}/g) || []).join('-');
                    }))
                  .end()
                .end()

                .start().addClass(this.myClass('two-factor-enable'))
                  .start()
                    .start('b').addClass(this.myClass('status'))
                      .add(this.STATUS)
                    .end()
                    .start().addClass(this.myClass('two-factor-disabled'))
                      .add(this.DISABLED)
                    .end()
                  .end()

                  .start().addClass('validation-input')
                    .start().addClass(this.myClass('enter-validation-code'))
                      .add(this.TWO_FACTOR_LABEL)
                    .end()
                    .start(this.TWO_FACTOR_TOKEN)
                    .end()
                    .start(this.ENABLE_TWO_FACTOR)
                      .addClass('sme').addClass('button').addClass('primary')
                    .end()
                  .end()
                .end();
            } else {
              // two factor enabled
              return this.E()
                .br()
                .start().addClass(this.myClass('two-factor-disable'))
                  .start().addClass(this.myClass('status-container'))
                    .start('b').addClass(this.myClass('status'))
                      .add(this.Status)
                    .end()
                    .start().addClass(this.myClass('two-factor-enabled'))
                      .add(this.ENABLED)
                    .end()
                  .end()
                  .start().addClass(this.myClass('two-factor-benefit'))
                    .add(this.TWO_FACTOR_BENEFIT)
                  .end()
                  .start(this.DISABLE_TWO_FACTOR, {
                    buttonStyle: 'SECONDARY'
                  })
                    .hide(this.hideDisableButton$)
                  .end()
                .end();
            }
          }))
        .end();
    }
  ],

  actions: [
    {
      name: 'enableTwoFactor',
      label: 'Verify',
      code: function(x) {
        var self = this;

        if ( ! this.twoFactorToken ) {
          this.ctrl.notify(self.TWO_FACTOR_NO_TOKEN_ERROR, '', this.LogLevel.ERROR, true);
          return;
        }

        this.twofactor.verifyToken(null, this.twoFactorToken)
        .then(function(result) {
          if ( ! result ) {
            self.ctrl.notify(self.TWO_FACTOR_ENABLE_ERROR, '', self.LogLevel.ERROR, true);
            return;
          }

          self.twoFactorToken = null;
          self.subject.realUser.twoFactorEnabled = true;
          self.ctrl.notify(self.TWO_FACTOR_ENABLE_SUCCESS, '', self.LogLevel.INFO, true);
        })
        .catch(function(err) {
          console.warn(err);
          self.ctrl.notify(self.TWO_FACTOR_ENABLE_ERROR, '', self.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'disableTwoFactor',
      label: 'Disable',
      code: function() {
        this.add(this.Popup.create().tag({
          class: 'net.nanopay.sme.ui.ConfirmDisable2FAModal',
        }));
      }
    }
  ]
});
