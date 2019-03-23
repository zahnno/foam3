foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLimitState',

  properties: [
    {
      class: 'Long',
      name: 'lastActivity',
      value: 0
    },
    {
      class: 'Double',
      name: 'lastSpentAmount'
    }
  ],

  methods: [
    {
      name: 'update',
      args: [
        {
          name: 'rule',
          type: 'net.nanopay.tx.TransactionLimitRule'
        }
      ],
      javaCode: `
      long now   = System.currentTimeMillis();
      long delta = now - getLastActivity();;

      setLastActivity(now);
      setLastSpentAmount(rule.updateLimitAmount(getLastSpentAmount(), delta));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`

        public synchronized boolean check(TransactionLimitRule rule, double amount) {
          update(rule);

          if ( amount <= rule.getLimit() - getLastSpentAmount() ) {
            setLastSpentAmount(Math.max(0, getLastSpentAmount() + amount));
            return true;
          }
          return false;
        }
        `);
      }
    }
  ]
});
