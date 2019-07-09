var npRoot = __dirname + '/../';

global.FOAM_FLAGS = {
  js: true,
  web: true,
  node: true,
  java: true,
  swift: true,
};

require(npRoot + 'foam2/src/foam.js');
require(npRoot + 'foam2/src/foam/nanos/nanos.js');
require(npRoot + 'foam2/src/foam/support/support.js');

var classloader = foam.__context__.classloader;
[
  npRoot + 'nanopay/src',
].forEach(classloader.addClassPath.bind(classloader));

var old = global.FOAM_FLAGS.src;
var oldRoot = global.FOAM_ROOT;
global.FOAM_FLAGS.src = npRoot + 'nanopay/src/'; // Hacky
require(npRoot + 'nanopay/src/net/nanopay/files.js');
require(npRoot + 'nanopay/src/net/nanopay/iso20022/files.js');
require(npRoot + 'nanopay/src/net/nanopay/iso8583/files.js');
require(npRoot + 'nanopay/src/net/nanopay/flinks/utils/files.js');
global.FOAM_FLAGS.src = old;
global.FOAM_ROOT = oldRoot;

var accountTree = [
  {
    type: 'Bank',
    name: 'ABC Toronto',
    denomination: 'CAD',
    children: [
      {
        type: 'Aggregate',
        name: 'CA East',
        children: [
          {
            type: 'Virtual',
            name: 'Widgets and Things'
          },
          {
            type: 'Virtual',
            name: 'Odds and Ends'
          }
        ]
      },
      {
        type: 'Aggregate',
        name: 'CA West',
        children: [
          {
            type: 'Virtual',
            name: 'West Coast Communications'
          }
        ]
      }
    ],
  },
  {
    name: 'ABC New York',
    type: 'Bank',
    // TODO: Enable USD and FX transactions.
    // There appears to be no pre-loaded USD trust account so

    // denomination: 'USD',
    denomination: 'CAD',
    children: [
      {
        type: 'Aggregate',
        name: 'US East',
        children: [
          {
            type: 'Virtual',
            name: 'Boston Bookends'
          },
          {
            type: 'Virtual',
            name: 'Purchasable Potables'
          }
        ]
      }
    ]
  }
];

// need this declared outside of the tree because we first create the accounts, then add the settings after they have an initial balance
var accountNamesToLiquidity = {
  'Widgets and Things': 'Low And High Rebalance Email',
  'Odds and Ends': 'Low Rebalance Only',
  'West Coast Communications': 'Low and High Email Only',
  'Boston Bookends': 'High Rebalance Only',
  'Purchasable Potables': 'Low And High Rebalance Email'
}


// to be filled out as accounts are created
const accountNamesToId = {};
const accountNamesToAccount = {};

// assign to only CAD accounts and push/pull from CAD accounts for now
const liquiditySettings = [
  {
    type: 'email',
    name: 'Low and High Email Only',
    userToEmail: 8005,
    highLiquidity: 1000000,
    lowLiquidity: 200000
  },
  {
    type: 'rebalance',
    name: 'Low Rebalance Only',
    lowLiquidity: 200000,
    lowPull: 'ABC Toronto Shadow Account',
    lowResetBalance: 300000
  },
  {
    type: 'rebalance',
    name: 'High Rebalance Only',
    highLiquidity: 1000000,
    highPush: 'ABC Toronto Shadow Account',
    highResetBalance: 500000
  },
  {
    type: 'emailRebalance',
    name: 'Low And High Rebalance Email',
    highLiquidity: 1000000,
    highPush: 'ABC Toronto Shadow Account',
    highResetBalance: 500000,
    lowLiquidity: 200000,
    lowPull: 'ABC Toronto Shadow Account',
    lowResetBalance: 300000
  }
];

// to be filled out as liquidity settings get created
const liquidityNamesToId = {};

function createEmailLiquiditySetting(X, s) {
  var liquiditySettingsObj = {
    id: foam.next$UID(),
    name: s.name,
    userToEmail: s.userToEmail,
    cashOutFrequency: net.nanopay.util.Frequency.PER_TRANSACTION,
  };

  if (s.lowLiquidity !== undefined && s.lowLiquidity >= 0) {
    liquiditySettingsObj.lowLiquidity = net.nanopay.liquidity.Liquidity.create({
      enabled: true,
      threshold: s.lowLiquidity
    });
  }

  if (s.highLiquidity !== undefined && s.highLiquidity >= 0) {
    liquiditySettingsObj.highLiquidity = net.nanopay.liquidity.Liquidity.create({
      enabled: true,
      threshold: s.highLiquidity
    });
  }

  var liquiditySettings = net.nanopay.liquidity.LiquiditySettings.create(liquiditySettingsObj);

  liquidityNamesToId[liquiditySettings.name] = liquiditySettings.id;

  X.liquiditySettingsDAO.put(liquiditySettings);
}

function createRebalanceLiquiditySetting(X, s) {
  var liquiditySettingsObj = {
    id: foam.next$UID(),
    name: s.name,
    cashOutFrequency: net.nanopay.util.Frequency.PER_TRANSACTION,
  };

  if (s.lowLiquidity !== undefined && s.lowLiquidity >= 0) {
    liquiditySettingsObj.lowLiquidity = net.nanopay.liquidity.Liquidity.create({
      enabled: true,
      threshold: s.lowLiquidity,
      rebalancingEnabled: true,
      pushPullAccount: accountNamesToId[s.lowPull],
      resetBalance: s.lowResetBalance
    });
  }

  if (s.highLiquidity !== undefined && s.highLiquidity >= 0) {
    liquiditySettingsObj.highLiquidity = net.nanopay.liquidity.Liquidity.create({
      enabled: true,
      threshold: s.highLiquidity,
      rebalancingEnabled: true,
      pushPullAccount: accountNamesToId[s.highPush],
      resetBalance: s.highResetBalance
    });
  }

  debugger;

  var liquiditySettings = net.nanopay.liquidity.LiquiditySettings.create(liquiditySettingsObj);

  liquidityNamesToId[liquiditySettings.name] = liquiditySettings.id;

  X.liquiditySettingsDAO.put(liquiditySettings);
}

function createEmailRebalanceLiquiditySetting(X, s) {
  var liquiditySettingsObj = {
    id: foam.next$UID(),
    name: s.name,
    userToEmail: s.userToEmail,
    cashOutFrequency: net.nanopay.util.Frequency.PER_TRANSACTION,
  };

  if (s.lowLiquidity !== undefined && s.lowLiquidity >= 0) {
    liquiditySettingsObj.lowLiquidity = net.nanopay.liquidity.Liquidity.create({
      enabled: true,
      threshold: s.lowLiquidity,
      rebalancingEnabled: true,
      pushPullAccount: accountNamesToId[s.lowPull],
      resetBalance: s.lowResetBalance
    });
  }

  if (s.highLiquidity !== undefined && s.highLiquidity >= 0) {
    liquiditySettingsObj.highLiquidity = net.nanopay.liquidity.Liquidity.create({
      enabled: true,
      threshold: s.highLiquidity,
      rebalancingEnabled: true,
      pushPullAccount: accountNamesToId[s.highPush],
      resetBalance: s.highResetBalance
    });
  }

  var liquiditySettings = net.nanopay.liquidity.LiquiditySettings.create(liquiditySettingsObj);

  liquidityNamesToId[liquiditySettings.name] = liquiditySettings.id;

  X.liquiditySettingsDAO.put(liquiditySettings);
}

function bank(X, a) {
  var cls = a.denomination == 'CAD' ?
  net.nanopay.bank.CABankAccount :
  net.nanopay.bank.USBankAccount;

  var bank = cls.create({
    id: foam.next$UID(),
    owner: X.userId,
    status: net.nanopay.bank.BankAccountStatus.VERIFIED,
    name: a.name + ' Bank Account',
    createdBy: X.userId,
    created: X.currentDate,
    lastModified: X.currentDate,
    lastModifiedBy: X.userID,
    denomination: a.denomination
  }, X);

  var shadow = net.nanopay.account.ShadowAccount.create({
    id: foam.next$UID(),
    denomination: a.denomination,
    name: a.name + ' Shadow Account',
    created: X.currentDate,
    createdBy: X.userId,
    lastModified: X.currentDate,
    lastModifiedBy: X.userId,
    owner: X.userId
  }, X);

  accountNamesToId[bank.name] = bank.id;
  accountNamesToId[shadow.name] = shadow.id;
  accountNamesToAccount[shadow.name] = shadow;
  accountNamesToAccount[bank.name] = bank;

  X.accountDAO.put(bank);
  X.accountDAO.put(shadow);

  X = X.createSubContext({
    denomination: a.denomination,
    parentAccount: shadow.id
  });


  X.balances[shadow.id] = 0;
  X.balances[bank.id] = 0;

  a.children = a.children.map(inflate.bind(null, X));

  a.bank = bank;
  a.shadow = shadow;

  return a;
}

function virtual(X, a) {
  var obj = net.nanopay.account.DigitalAccount.create({
    id: foam.next$UID(),
    denomination: X.denomination,
    name: a.name,
    created: X.currentDate,
    createdBy: X.userId,
    lastModified: X.currentDate,
    lastModifiedBy: X.userId,
    parent: X.parentAccount,
    owner: X.userId,
    liquiditySetting: a.liquiditySetting
  }, X);

  a.obj = obj;
  accountNamesToId[obj.name] = obj.id;
  accountNamesToAccount[obj.name] = obj;

  X.accountDAO.put(obj);

  X.balances[obj.id] = 0;

  return a;
}

function aggregate(X, a) {
  var obj = net.nanopay.account.AggregateAccount.create({
    denomination: X.denomination,
    id: foam.next$UID(),
    created: X.currentDate,
    createdBy: X.userId,
    lastModified: X.currentDate,
    lastModifiedBy: X.userId,
    parent: X.parentAccount,
    owner: X.userId,
    name: a.name,
    liquiditySetting: a.liquiditySetting
  }, X);

  X.accountDAO.put(obj);

  a.obj = obj;
  accountNamesToId[obj.name] = obj.id;
  accountNamesToAccount[obj.name] = obj;

  X = X.createSubContext({
    parentAccount: obj.id
  });

  X.balances[obj.id] = 0;

  a.children = a.children.map(inflate.bind(null, X));

  return a;
}

function inflate(X, a) {
  switch (a.type) {
    case "Bank":
      return bank(X, a);
    case "Aggregate":
      return aggregate(X, a);
    case "Virtual":
      return virtual(X, a);
  }
}

function jdao(journal) {
  var stringifier = foam.json.Outputter.create({
    pretty: false,
    strict: true,
    formatDatesAsNumbers: false,
    outputDefaultValues: false,
    useShortNames: false,
    propertyPredicate: function (o, p) { return ! p.storageTransient; }
  });

  var stream = require('fs').createWriteStream(journal, { flags: 'a' });

  return {
    put: function (o) {
      stream.write('p(', 'utf8');
      stream.write(stringifier.stringify(o), 'utf8');
      stream.write(');\n', 'utf8');
    },
    close: function () {
      stream.end();
    }
  };
}

function cashIn(X, bank, dest, amount) {
  var tx = net.nanopay.tx.alterna.AlternaCITransaction.create({
    id: foam.next$UID().toString(),
    name: "Cash In",
    sourceAccount: bank.id,
    destinationAccount: dest.id,
    amount: amount,
    createdBy: X.userId,
    payerId: X.userId,
    payeeId: X.userId,
    completionDate: X.currentDate,
    created: X.currentDate,
    lastModified: X.currentDate,
    sourceCurrency: bank.denomination,
    destinationCurrency: dest.denomination,
    status: net.nanopay.tx.model.TransactionStatus.PENDING,
    initialStatus: net.nanopay.tx.model.TransactionStatus.PENDING,
    isQuoted: false,
    lineItems: [
      net.nanopay.tx.ETALineItem.create({
        eta: 172800000
      })
    ]
  }, X);

  X.transactionDAO.put(tx);

  tx = net.nanopay.tx.alterna.AlternaCITransaction.create({
    id: tx.id,
    status: net.nanopay.tx.model.TransactionStatus.COMPLETED,
    lineItems: [
      net.nanopay.tx.ETALineItem.create({ eta: 172800000, id: foam.uuid.randomGUID() })
    ],
    balances: [
      net.nanopay.account.Balance.create({
        account: 1,
        balance: amount * -1
      }),
      net.nanopay.account.Balance.create({
        account: tx.destinationAccount,
        balance: amount
      })
    ],
    lastModified: X.currentDate
  }, X);

  X.transactionDAO.put(tx);
}

function transfer(X, source, dest, amount) {
  if ( source.id == dest.id ) {
    throw new Error("Transfer from same account " + source.id);
  }

  X.balances[source.id] -= amount;
  X.balances[dest.id] += amount

  var tx = net.nanopay.tx.DigitalTransaction.create({
    name: 'Digital Transfer',
    isQuoted: true,
    id: foam.next$UID(),
    amount: amount,
    completionDate: X.currentDate,
    status: net.nanopay.tx.model.TransactionStatus.COMPLETED,
    initialStatus: net.nanopay.tx.model.TransactionStatus.COMPLETED,
    sourceCurrency: source.denomination,
    destinationCurrency: dest.denomination,
    destinationAccount: dest.id,
    sourceAccount: source.id,
    lastModified: X.currentDate,
    lastModifiedBy: X.userId,
    created: X.currentDate,
    createdBy: X.userId,
    balances: [
      net.nanopay.account.Balance.create({
        account: source.id,
        balance: X.balances[source.id]
      }),
      net.nanopay.account.Balance.create({
        account: dest.id,
        balance: X.balances[dest.id]
      })
    ],
  }, X);

  X.transactionDAO.put(tx);
}

function createLiquiditySettings(X) {
  liquiditySettings.forEach(s => {
    switch (s.type) {
      case 'email':
        return createEmailLiquiditySetting(X, s);
      case 'rebalance':
        return createRebalanceLiquiditySetting(X, s);
      case 'emailRebalance':
        return createEmailRebalanceLiquiditySetting(X, s);
    }
  })
}

function addLiquiditySettingsToAccounts(X) {
  Object.keys(accountNamesToLiquidity).forEach(accountName => {
    var account = accountNamesToAccount[accountName];

    var liquiditySettingName = accountNamesToLiquidity[accountName];

    account.liquiditySetting = liquidityNamesToId[liquiditySettingName];

    X.accountDAO.put(account);
  })
}

function randomTransfer(X) {
  var root = randomItem(accountTree);
  var accounts = virtualAccounts(root);

  if ( accounts.length < 2 ) {
    throw new Error("Cannot created transfer in account tree " + root.name + " as there is only one virtual account.");
  }

  var source = randomItem(accounts);
  var dest;
  do {
    dest = randomItem(accounts);
  } while ( dest === source );

  var amount = Math.floor(
    X.balances[source.id] * 0.05 +
    X.balances[source.id] * Math.random() * 0.02);

  transfer(X, source, dest, amount);
}

function virtualAccounts(root) {
  var ret = [];

  function collect(node) {
    if ( ! net.nanopay.account.AggregateAccount.isInstance(node.obj) &&
      net.nanopay.account.DigitalAccount.isInstance(node.obj) ) {
      ret.push(node.obj);
    }

    if ( node.children ) node.children.forEach(collect);
  }

  collect(root);

  return ret;
}

function randomItem(a) {
  return a[Math.floor(Math.random() * a.length)];
}

function main() {
  var currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() - 5);

  var X = foam.createSubContext({
    accountDAO: jdao("target/journals/accounts.0"),
    debtAccountDAO: foam.dao.NullDAO.create(),
    transactionDAO: jdao("target/journals/transactions.0"),
    liquiditySettingsDAO: jdao("target/journals/liquiditySettings.0"),
    currentDate: currentDate,
    balances: {},
    currencyDAO: foam.dao.NullDAO.create(),
    userDAO: foam.dao.NullDAO.create(),
    complianceHistoryDAO: foam.dao.NullDAO.create(),
    userId: 8005,
    addCommas: function (a) { return a; }
  });

  accountTree = accountTree.map(inflate.bind(null, X));

  accountTree.forEach(function foo(a) {
    if ( a.bank )
      console.log("Bank: ", a.name, a.bank.id, a.shadow.id);
    else if ( a.obj )
      console.log(a.obj.cls_.name, a.name, a.obj.id);
    else
      console.log("Wut:", a);

    if ( a.children ) a.children.forEach(foo);
  });

  accountTree.forEach(function (root) {
    var balance = 10000000;

    cashIn(X, root.bank, root.shadow, balance);

    var virtuals = virtualAccounts(root);

    var amount = Math.floor(balance / virtuals.length);

    virtuals.forEach(function (v) {
      transfer(X, root.shadow, v, amount);
    });
  });

  createLiquiditySettings(X);

  addLiquiditySettingsToAccounts(X);

  var end = new Date();

  var targetTransactionCount = 5000;
  var timeStep = Math.floor((end.getTime() - currentDate.getTime()) / targetTransactionCount);

  while ( foam.Date.compare(currentDate, end) < 0 ) {
    currentDate.setTime(currentDate.getTime() + timeStep);
    randomTransfer(X);
  }

  X.accountDAO.close();
  X.transactionDAO.close();
  X.liquiditySettingsDAO.close();
}

main();
