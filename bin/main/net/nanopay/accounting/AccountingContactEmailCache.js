foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'AccountingContactEmailCache',

  ids: ['quickId', 'realmId', 'xeroId'],

  properties: [
    {
      class: 'String',
      name: 'quickId'
    },
    {
      class: 'String',
      name: 'realmId'
    },
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'String',
      name: 'email'
    }
  ]
});
