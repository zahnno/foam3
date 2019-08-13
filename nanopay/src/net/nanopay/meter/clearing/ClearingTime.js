foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'ClearingTime',

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'objId'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      javaFactory: `
        if ( getOf() != null && ! SafetyUtil.isEmpty(getObjId()) ) {
          PropertyInfo idProp = (PropertyInfo) getOf().getAxiomByName("id");
          if ( idProp != null ) {
            return foam.mlang.MLang.EQ(idProp, getObjId());
          }
        }
        return foam.mlang.MLang.FALSE;
      `
    },
    {
      class: 'Int',
      name: 'duration',
      value: 2
    }
  ]
});
