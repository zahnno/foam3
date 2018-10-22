foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISOPackager',

  methods: [
    {
      name: 'pack',
      javaReturns: 'byte[]',
      args: [
        {
          name: 'm',
          javaType: 'net.nanopay.iso8583.ISOComponent'
        }
      ]
    },
    {
      name: 'unpack',
      javaReturns: 'int',
      args: [
        {
          name: 'm',
          javaType: 'net.nanopay.iso8583.ISOComponent'
        },
        {
          name: 'b',
          javaType: 'byte[]'
        }
      ]
    }
  ]
});
