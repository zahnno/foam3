package net.nanopay.security.receipt;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import net.nanopay.security.MerkleTree;

import java.security.MessageDigest;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class TimedBasedReceiptGenerator
  extends ContextAwareSupport
  implements ReceiptGenerator
{
  protected byte[][] tree_;
  protected final String algorithm_;
  protected final MerkleTree builder_;
  protected final AtomicBoolean generated_ = new AtomicBoolean(false);
  protected final ReadWriteLock lock_ = new ReentrantReadWriteLock();
  protected final ThreadLocal<MessageDigest> md_ = new ThreadLocal<MessageDigest>() {
      @Override
      protected MessageDigest initialValue() {
        try {
          return MessageDigest.getInstance(algorithm_);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      }

      @Override
      public MessageDigest get() {
        MessageDigest md = super.get();
        md.reset();
        return md;
      }
    };

  public TimedBasedReceiptGenerator(X x) {
    this(x, "SHA-256");
  }

  public TimedBasedReceiptGenerator(X x, String algorithm) {
    setX(x);
    algorithm_ = algorithm;
    builder_ = new MerkleTree(algorithm);
  }

  @Override
  public void add(FObject obj) {
    synchronized ( lock_.writeLock() ) {
      builder_.addHash(obj.hash(md_.get()));
    }
  }

  @Override
  public void build() {
    synchronized ( generated_ ) {
      if ( tree_ == null ) {
        tree_ = builder_.buildTree();
        generated_.set(true);
        generated_.notifyAll();
      }
    }
  }

  @Override
  public Receipt generate(FObject obj) {
    try {
      synchronized ( generated_ ) {
        while (!generated_.get()) {
          generated_.wait();
        }

        return net.nanopay.security.MerkleTreeHelper.SetPath(tree_, obj.hash(md_.get()),
          new net.nanopay.security.receipt.Receipt.Builder(getX()).setData(obj).build());
      }
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public void start() throws Exception {
    new Thread(new Runnable() {
      @Override
      public void run() {
        try {
          Thread.sleep(10 * 1000);
          TimedBasedReceiptGenerator.this.build();
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      }
    }).start();
  }
}
