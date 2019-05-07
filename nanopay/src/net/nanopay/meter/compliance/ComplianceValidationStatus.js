foam.ENUM({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceValidationStatus',

  documentation: 'Compliance validation status (Pending, Validated, Investigating, Rejected, Approved, Reinvestigating)',

  values: [
    { name: 'PENDING', label: 'Pending' },
    { name: 'VALIDATED', label: 'Validated' },
    { name: 'INVESTIGATING', label: 'Investigating' },
    { name: 'REJECTED', label: 'Rejected' },
    { name: 'APPROVED', label: 'Approved' },
    { name: 'REINVESTIGATING', label: 'Reinvestigating' }
  ]
});
