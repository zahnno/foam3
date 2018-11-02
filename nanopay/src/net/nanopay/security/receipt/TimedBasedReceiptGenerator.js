foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'TimedBasedReceiptGenerator',

  implements: [
    'net.nanopay.security.receipt.ReceiptGenerator'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected byte[][] tree_ = null;

          protected net.nanopay.security.MerkleTree builder_ = null;

          protected final java.util.concurrent.atomic.AtomicInteger count_ =
              new java.util.concurrent.atomic.AtomicInteger(0);

          protected final java.util.concurrent.atomic.AtomicBoolean generated_ =
              new java.util.concurrent.atomic.AtomicBoolean(false);

          protected final ThreadLocal<java.security.MessageDigest> md_ =
            new ThreadLocal<java.security.MessageDigest>() {
              @Override
              protected java.security.MessageDigest initialValue() {
                try {
                  return java.security.MessageDigest.getInstance(algorithm_);
                } catch ( Throwable t ) {
                  throw new RuntimeException(t);
                }
              }

              @Override
              public java.security.MessageDigest get() {
                java.security.MessageDigest md = super.get();
                md.reset();
                return md;
              }
            };
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      value: 'SHA-256'
    },
    {
      class: 'Long',
      name: 'interval',
      value: 100
    }
  ],

  methods: [
    {
      name: 'getBuilder',
      synchronized: true,
      javaReturns: 'net.nanopay.security.MerkleTree',
      javaCode: `
        if ( builder_ == null ) {
          builder_ = new net.nanopay.security.MerkleTree(getAlgorithm());
        }
        return builder_;
      `
    },
    {
      name: 'add',
      javaCode: `
        synchronized (generated_) {
          while (generated_.get()) {
            generated_.wait();
          }

          getBuilder().addHash(obj.hash(md_.get()));
          count_.incrementAndGet();
        }
      `
    },
    {
      name: 'build',
      javaCode: `
        synchronized ( generated_ ) {
          if ( tree_ == null && count_.get() != 0 ) {
            tree_ = getBuilder().buildTree();
            generated_.set(true);
            generated_.notifyAll();
          }
        }
      `
    },
    {
      name: 'generate',
      javaCode: `
        synchronized ( generated_ ) {
          while ( ! generated_.get() ) {
            generated_.wait();
          }

          Receipt receipt = net.nanopay.security.MerkleTreeHelper.SetPath(tree_, obj.hash(md_.get()),
            new net.nanopay.security.receipt.Receipt.Builder(getX()).setData(obj).build());

          if ( count_.decrementAndGet() == 0 ) {
            tree_ = null;
            generated_.set(false);
            generated_.notifyAll();
          }

          return receipt;
        }
      `
    },
    {
      name: 'start',
      javaCode: `
        java.util.concurrent.Executors.newScheduledThreadPool(16).scheduleAtFixedRate(new Runnable() {
          @Override
          public void run() {
            TimedBasedReceiptGenerator.this.build();
          }
        }, 1000, getInterval(), java.util.concurrent.TimeUnit.MILLISECONDS);
      `
    }
  ]
});
