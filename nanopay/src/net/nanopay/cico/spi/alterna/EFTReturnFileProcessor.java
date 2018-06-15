package net.nanopay.cico.spi.alterna;

import com.jcraft.jsch.*;
import foam.core.ContextAgent;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.cico.model.EFTReturnFileCredentials;
import net.nanopay.cico.model.EFTReturnRecord;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.alterna.AlternaTxn;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static foam.mlang.MLang.*;

public class EFTReturnFileProcessor implements ContextAgent
{
  @Override
  public void execute(X x) {
    Logger logger = (Logger) x.get("logger");
    EFTReturnFileCredentials credentials = (EFTReturnFileCredentials) x.get("EFTReturnFileCredentials");

    EFTReturnFileParser eftReturnFileParser = new EFTReturnFileParser();
    DAO transactionDao = (DAO)x.get("localTransactionDAO");

    List<String> fileNames = new ArrayList<>();
    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp;

    try {
      // create session with user name and password
      JSch jsch = new JSch();
      session = jsch.getSession(credentials.getUser(), credentials.getHost(), credentials.getPort());
      session.setPassword(credentials.getPassword());

      // add configuration
      Properties config = new Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.connect();

      // open SFTP connection and download file
      channel = session.openChannel("sftp");
      channel.connect();
      channelSftp = (ChannelSftp) channel;

      Vector fileList = channelSftp.ls("/Returns/");
      Pattern pattern = Pattern.compile("[0-9]{12}.txt");
      for ( Object entry : fileList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        Matcher matcher = pattern.matcher(e.getFilename());
        if ( matcher.find() ) {
          fileNames.add(matcher.group());
        }
      }

      for ( int i = 0; i < fileNames.size(); i++ ) {
        InputStream is = channelSftp.get("/Returns/" + fileNames.get(i));
        List<FObject> list = eftReturnFileParser.parse(is);

        for ( int j = 0; j < list.size(); j++ ) {
          EFTReturnRecord item = (EFTReturnRecord) list.get(j);

          AlternaTxn tran = (AlternaTxn)transactionDao.find(AND(
            EQ(AlternaTxn.ID, item.getExternalReference()),
            EQ(AlternaTxn.AMOUNT, (long)(item.getAmount() * 100)),
            OR(
              EQ(AlternaTxn.TYPE, TransactionType.CASHIN),
              EQ(AlternaTxn.TYPE,TransactionType.CASHOUT))
            )
          );

          // if corresponding transaction is found
          if ( tran != null ) {
            tran = (AlternaTxn) tran.fclone();
            tran.setReturnCode(item.getReturnCode());
            tran.setReturnDate(item.getReturnDate());

            if ( "900".equals(item.getReturnCode()) ) {
              tran.setReturnType("Reject");
            } else {
              tran.setReturnType("Return");
            }

            if ( tran.getStatus() == TransactionStatus.SENT ) {
              tran.setStatus(TransactionStatus.DECLINED);
              sendEmail(x, "Transaction was rejected or returned by EFT return file",
                "Transaction id: " + tran.getId() + ", Return code: " + tran.getReturnCode() + ", Return date: " + tran.getReturnDate());
            } else if ( tran.getStatus() == TransactionStatus.COMPLETED && "Return".equals(tran.getReturnType()) ) {
              tran.setStatus(TransactionStatus.DECLINED);
              sendEmail(x, "Transaction was returned outside of the 2 business day return period",
                "Transaction id: " + tran.getId() + ", Return code: " + tran.getReturnCode() + ", Return date: " + tran.getReturnDate());
            }

            transactionDao.put(tran);
          }
        }
      }

      Vector folderList = channelSftp.ls("/");
      boolean exist = false;
      for ( Object entry : folderList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        if ( "Archive_EFTReturnFile".equals(e.getFilename()) ) {
          exist = true;
        }
      }

      if ( ! exist ) {
        channelSftp.mkdir("Archive_EFTReturnFile");
      }

      String srcFileDirectory = "/Returns/";
      String dstFileDirectory = "/Archive_EFTReturnFile/";

      // move processed files
      for ( int i = 0; i < fileNames.size(); i++ ) {
        channelSftp.rename(srcFileDirectory + fileNames.get(i), dstFileDirectory + fileNames.get(i));
      }

      logger.debug("EFT Return file processing finished");
      channelSftp.exit();

    } catch ( JSchException | SftpException e ) {
      logger.error(e);
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }

  public void sendEmail(X x, String subject, String content) {
    EmailService emailService = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();

    message.setTo(new String[]{"ops@nanopay.net"});
    message.setSubject(subject);
    message.setBody(content);
    emailService.sendEmail(message);
  }
}
