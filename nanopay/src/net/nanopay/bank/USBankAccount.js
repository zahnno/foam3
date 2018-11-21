foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'USBankAccount',
  extends: 'net.nanopay.bank.BankAccount',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  documentation: 'US Bank account information.',

  properties: [
    ['country', 'images/flags/us.png'],
    {
      name: 'branchId',
      label: 'Routing #',
      validateObj: function(branchId) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(branchId) ) {
          return 'Invalid routing number.';
        }
      }
    }
  ]
});
