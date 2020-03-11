foam.ENUM({
  package: 'net.nanopay.model',
  name: 'InvitationStatus',

  documentation: 'Invitation status (open, accepted, ignored, completed, canceled)',

  values: [
    { name: 'SENT', label: 'Sent' },
    { name: 'ACCEPTED', label: 'Accepted' },
    { name: 'IGNORED', label: 'Ignored' },
    { name: 'COMPLETED', label: 'Completed' },
    { name: 'CANCELED', label: 'Canceled' }
  ]
});
