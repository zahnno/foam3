foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones.model',
  name: 'BaseSearch',
  extends: 'net.nanopay.meter.compliance.dowJones.model.DowJonesCall',
  abstract: 'true',

  documentation: `Base class model for searching the Dow Jones Risk Database.`,

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.ContentSet',
      name: 'contentSet',
      documentation: 'The content sets included in the search.'
    },
    {
      class: 'Int',
      name: 'hitsFrom',
      documentation: 'The starting index (zero-indexed, lower bound inclusive) of the range of matches to return.'
    },
    {
      class: 'Int',
      name: 'hitsTo',
      documentation: 'The ending index (zero-indexed, upper bound exclusive) of the range of matches to return.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.FilterRegionKeys',
      name: 'filterRegionKeys',
      documentation: 'Filter to restrict the search results by region types.'
    },
    {
      class: 'String',
      name: 'filterRegionKeysOperator',
      choices: ['AND', 'OR'],
      documentation: 'Operator to combine filterRegionKeys values.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.FilterRegion',
      name: 'filterRegion',
      documentation: 'Filter to restrict the search results by region.'
    },
    {
      class: 'String',
      name: 'filterRegionOperator',
      choices: ['AND', 'OR'],
      documentation: 'Operator to combine filterRegion values.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.FilterPEP',
      name: 'filterPEP',
      documentation: 'Filter to restrict the search results by PEP category.'
    },
    {
      class: 'String',
      name: 'filterPEPOperator',
      choices: ['AND', 'OR'],
      documentation: 'Operator to combine filterPEP values.'
    },
    {
      class: 'Boolean',
      name: 'filterPEPExcludeADSR',
      documentation: 'Indicates whether or not to exclude ADSR (Additional Domestic Screening Requirement) PEPs in the PEP Category filter.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.FilterSIC',
      name: 'filterSIC',
      documentation: 'Filter to restrict the search results by Special Interest Category.'
    },
    {
      class: 'String',
      name: 'filterSICOperator',
      choices: ['AND', 'OR'],
      documentation: 'Filter to combine filterSIC values.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.FilterAMC',
      name: 'filterAMC',
      documentation: 'Filter to restrict the search results by Adverse Media Category.'
    },
    {
      class: 'String',
      name: 'filterAMCOperator',
      choices: ['AND', 'OR'],
      documentation: 'Operator to combine filterAMC values.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.FilterSL',
      name: 'filterSL',
      documentation: 'Filter to restrict the search results by Sanctions Lists.'
    },
    {
      class: 'Boolean',
      name: 'filterSLExcludeSuspended',
      documentation: 'Filter to exclude suspended Sanctions Lists.'
    },
    {
      class: 'String',
      name: 'filterSLOperator',
      choices: ['AND', 'OR'],
      documentation: 'Operator to combine filterSL values.'
    },
    {
      class: 'Date',
      name: 'filterSLLRDFrom',
      documentation: 'The From Date (date inclusive) for the Entries changed since filter associated with the Sanctions Lists filter.'
    },
    {
      class: 'Date',
      name: 'filterSLLRDTo',
      documentation: 'The To Date (date inclusive) for the Entries changed since filter associated with the Sanctions Lists filter.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.FilterOOL',
      name: 'filterOOL',
      documentation: 'Filter to restrict the search results by Other Official Lists.'
    },
    {
      class: 'Boolean',
      name: 'filterOOLExcludeSuspended',
      documentation: 'Filter to exclude suspended Other Official Lists.'
    },
    {
      class: 'String',
      name: 'filterOOLOperator',
      choices: ['AND', 'OR'],
      documentation: 'Operator to combine filterOOL values.'
    },
    {
      class: 'Date',
      name: 'filterOOLLRDFrom',
      documentation: 'The From Date (date inclusive) for the Entries changed since filter associated with the Other Official Lists filter.'
    },
    {
      class: 'Date',
      name: 'filterOOLLRDTo',
      documentation: 'The To Date (date inclusive) for the Entries changed since filter associated with the Other Official Lists filter.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.FilterOEL',
      name: 'filterOEL',
      documentation: 'Filter to restrict the search results by Other Exclusion Lists.'
    },
    {
      class: 'Boolean',
      name: 'filterOELExcludeSuspended',
      documentation: 'Filter to exclude suspended Other Exclusion Lists.'
    },
    {
      class: 'String',
      name: 'filterOELOperator',
      choices: ['AND', 'OR'],
      documentation: 'Operator to combine filterOEL values.'
    },
    {
      class: 'Date',
      name: 'filterOELLRDFrom',
      documentation: 'The From Date (date inclusive) for the Entries changed since filter associated with the Other Exclusion Lists filter.'
    },
    {
      class: 'Date',
      name: 'filterOELLRDTo',
      documentation: 'The To Date (date inclusive) for the Entries changed since filter associated with the Other Exclusion Lists filter.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.FilterSOC',
      name: 'filterSOC',
      documentation: 'Filter to restrict the search results by State Ownership.'
    },
    {
      class: 'Boolean',
      name: 'filterSOCIncludeUnknown',
      documentation: 'Indicates whether or not to include unknown State Ownership Level values in the State Ownership filter.'
    },
    {
      class: 'Date',
      name: 'filterLRDFrom',
      documentation: 'The From Date (date inclusive) of the revision date range filter.'
    },
    {
      class: 'Date',
      name: 'filterLRDTo',
      documentation: 'The To Date (date inclusive) of the revision date range filter.'
    }
  ]
});
