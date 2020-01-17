foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AddressModel',

  documentation: 'model for the Flinks address mode',

  properties: [
    {
      class: 'String',
      name: 'CivicAddress',
      validateObj: function(CivicAddress) {
        if ( ! CivicAddress || CivicAddress > 70 ) {
          return this.AddressError;
        }
      }
    },
    {
      class: 'String',
      name: 'City',
      validateObj: function(City) {
        if ( ! City || City.length > 35 ) {
          return this.AddressCityError;
        }
      }
    },
    {
      class: 'String',
      name: 'Province',
      validateObj: function(Province) {
        if ( ! Province || ! Province.name || Province.name.length > 35 ) {
          return this.AddressProvinceError;
        }
      }
    },
    {
      class: 'String',
      name: 'PostalCode',
      validateObj: function(PostalCode) {
        var postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

        if ( ! postalCodeRegex.test(PostalCode) ) {
          return this.AddressPostalCodeError;
        }
      }
    },
    {
      class: 'String',
      name: 'POBox'
    }
  ],

  messages: [
    { name: 'ADDRESS_ERROR', message: 'Street address is invalid' },
    { name: 'ADDRESS_CITY_ERROR', message: 'City name is invalid' },
    { name: 'ADDRESS_PROVINCE_ERROR', message: 'Invalid province option' },
    { name: 'ADDRESS_POSTAL_ERROR', message: 'Invalid postal code' }
  ]
});
