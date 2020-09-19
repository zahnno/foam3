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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessIncorporationDateData',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  sections: [
    {
      name: 'businessIncorporationDateSection',
      title: 'Enter business incorporated date'
    },
  ],

  messages: [
    { name: 'BUSINESS_INCORPORATION_DATE_ERROR', message: 'Cannot be future dated.' }
  ],

  properties: [
    {
      section: 'businessIncorporationDateSection',
      name: 'businessIncorporationDate',
      label: 'Date of Incorporation',
      class: 'Date',
      documentation: 'Date of Business Incorporation.',
      validationPredicates: [
        {
          args: ['businessIncorporationDate'],
          predicateFactory: function(e) {
            return e.LTE(net.nanopay.crunch.onboardingModels.BusinessIncorporationDateData.BUSINESS_INCORPORATION_DATE, new Date());
          },
          errorMessage: 'BUSINESS_INCORPORATION_DATE_ERROR'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});