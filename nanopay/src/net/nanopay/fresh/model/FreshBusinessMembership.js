foam.CLASS({
  package: 'net.nanopay.fresh.model',
  name: 'FreshBusinessMembership',
  properties: [
    {
      class:'FObjectProperty',
      of: 'net.nanopay.fresh.model.Business',
      name: 'business'
    }
  ]
})