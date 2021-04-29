/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.bank',
  name: 'MockBankAccountValidationService',

  implements: [
    'net.nanopay.bank.BankAccountValidationService'
  ],

  properties: [
    {
      class: 'Map',
      name: 'stubRoutingCodeMap'
    },
    {
      class: 'Map',
      name: 'stubIbanMap'
    }
  ],

  methods: [
    {
      name: 'convertToRoutingCode',
      javaCode: `
        return (String) getStubRoutingCodeMap().get(countryCode);
      `
    },
    {
      name: 'convertToSwiftCode',
      javaCode: `
        return "ABCDEFGH";
      `
    },
    {
      name: 'convertToIbanAndSwiftCode',
      javaCode: `
        return new String[] {
          (String) getStubIbanMap().get(countryCode),
          "ABCDEFGH",
        };
      `
    }
  ]
});
