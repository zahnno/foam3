foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'InvoiceFilteredSettlementReport',

  extends: [
    'foam.blob.ProxyBlobService'
  ],

  implements: [
    'foam.nanos.http.WebAgent'
  ],

  javaImports: [
    'com.itextpdf.text.*',
    'com.itextpdf.text.pdf.PdfWriter',
    'foam.blob.BlobService',
    'foam.blob.ProxyBlobService',
    'foam.core.X ',
    'foam.dao.DAO ',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.http.WebAgent',
    'foam.nanos.logger.Logger',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.util.SafetyUtil',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse',
    'java.io.*',
    'java.text.DateFormatSymbols',
    'java.text.SimpleDateFormat',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.zip.ZipEntry',
    'java.util.zip.ZipOutputStream',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.model.Business',
    'org.apache.commons.io.FileUtils',
    'org.apache.commons.io.IOUtils',
    'static foam.mlang.MLang.*'
  ],

  documentation: `
    This class is for a service, to generate a settlement report(pdf) based on a search field for dates.
      Example of Client Side Code to get this service call:
        // Let us assume that we want to search for invoices with a field 3 days before and 3 days after a specified invoice
        var inv = await this.invoiceDAO.find(1);
        var sDate = inv.paymentDate.getTime() - (1000*60*60*24*3);
        var dDate = inv.paymentDate.getTime() + (1000*60*60*24*3);
        console.log('sDate = '+sDate+ ' eDate = ' + dDate);
        var url = window.location.origin + "/service/settlementReports?userId=" + this.id + "&startDate="+sDate+"&endDate="+dDate;
        window.location.assign(url);
  `,

  properties: [
    {
      type: 'foam.dao.Sink',
      javaType: 'foam.dao.ArraySink',
      name: 'dao_'
    },
    {
      type: 'Date',
      name: 'endDate'
    },
    {
      type: 'Date',
      name: 'startDate'
    },
    {
      type: 'Boolean',
      name: 'dated'
    },
    {
      class: 'Proxy',
      of: 'foam.nanos.http.WebAgent',
      name: 'delegate'
    }

  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
            `
            protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
            @Override
            protected StringBuilder initialValue() {
              return new StringBuilder();
            }

            @Override
            public StringBuilder get() {
              StringBuilder b = super.get();
              b.setLength(0);
              return b;
            }
          };`
        }));
      }
    }
  ],

  methods: [
    {
      name: 'checkAndSetCalendarFields',
      args: [
        {
          name: 'start',
          type: 'String'
        },
        {
          name: 'end',
          type: 'String'
        }
      ],
      javaCode: `
        try {
          long sT = Long.parseLong(start);
          long eT = Long.parseLong(end);
          startDate  = Calendar.getInstance();
          endDate    = Calendar.getInstance();

          startDate.setTimeInMillis(sT);
          endDate.setTimeInMillis(eT);
          dated = true;
        } catch (Exception e ) { 
          // Integer.parseInt throws java.lang.NumberFormatException
          logger.warning("Error generating settlementReport - passed in date filter error: ", e); 
          dated = false;
        }
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode:
      `        
        DAO    userDAO           = (DAO) x.get("localUserDAO");
        DAO    agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");
        Logger logger            = (Logger) x.get("logger");
    
        // Id check:
        HttpServletRequest req   = x.get(HttpServletRequest.class);
        long id = Integer.parseInt(req.getParameter("userId"));
        if ( id <= 0 ) {
          logger.warning("Error generating settlementReport - business/user Id invalid.");
          return;
        }

        // Confirm Calendar search fields
        checkAndSetCalendarFields(req.getParameter("startDate"),req.getParameter("endDate"));

        // User check:
        User business = findUser(x,id);
        if ( business == null ) {
          logger.warning("Error generating settlementReport - user.id:" + id + " does not exist.");
          return;
        }

        // Gather data that will be displayed in the SettlementReport.pdf
        filterInvoiceDAO(x, business);

        try {
          // create a temporary folder to save files before zipping
          FileUtils.forceMkdir(new File("/opt/nanopay/SettlementReport/"));
    
          File settlementReport = collectInvoiceDataAndWriteToData(x, business);
    
          if ( settlementReport == null ){
            logger.warning("Error generating settlementReport - File null: ");
            return;
          }
    
          downloadZipFile(x, (Business)business, settlementReport);
    
          // delete the temporary folder.
          FileUtils.deleteDirectory(new File("/opt/nanopay/SettlementReport/"));

        } catch (IOException e) {
          logger.error("Error generating settlementReport: ", e);
        } catch (Throwable t) {
          logger.error("Error generating settlementReport: ", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'filterInvoiceDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'User'
        }
      ],
      javaCode:
      `
        DAO  invoiceDAO = (DAO) x.get("invoiceDAO");
        if ( dated ) {
          dao_ = (ArraySink) invoiceDAO.where(
            AND(
              NEQ(Invoice.PAYMENT_DATE, null),
              GTE(Invoice.PAYMENT_DATE, startDate.getTime()),
              LTE(Invoice.PAYMENT_DATE, endDate.getTime()),
              OR(
                EQ(Invoice.PAYER_ID, user.getId()),
                EQ(Invoice.PAYEE_ID, user.getId()),
                EQ(Invoice.CREATED_BY, user.getId())
              )
            ))
            .orderBy(new foam.mlang.order.Desc(Invoice.PAYMENT_DATE))
            .select(new ArraySink());

        } else {
          dao_ = (ArraySink) invoiceDAO.orderBy(new foam.mlang.order.Desc(Invoice.PAYMENT_DATE))
            .where(
              AND(
                NEQ(Invoice.PAYMENT_DATE, null),
                OR(
                  EQ(Invoice.PAYER_ID, user.getId()),
                  EQ(Invoice.PAYEE_ID, user.getId()),
                  EQ(Invoice.CREATED_BY, user.getId())
                )
              ))
            .select(new ArraySink());  
        }
      `
    },
    {
      name: 'getMonthName',
      javaType: 'String',
      args: [
        {
          name: 'num',
          type: 'int'
        }
      ],
      javaCode:
      `
        String month;
        String[] months = (new DateFormatSymbols()).getMonths();
        if (num >= 0 && num <= 11 ) {
            month = months[num];
        } else {
          throw new IllegalStateException("Month not defined.");
        }
        return month;
      `
    },
    {
      name: 'findUser',
      javaType: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'long'
        }
      ],
      javaCode:
      `
        DAO  userDAO = (DAO) x.get("userDAO");
        DAO  agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");

        User user = (User) userDAO.find(id);
    
        if ( ! user instanceof Business ) {
          UserUserJunction userUserJunction = (UserUserJunction) agentJunctionDAO
            .find(EQ(UserUserJunction.SOURCE_ID, user.getId()));
          user = (User) userDAO
            .find(userUserJunction.getTargetId());
        }

        return user;
      `
    },
    {
      name: 'collectInvoiceDataAndWriteToData',
      javaType: 'java.io.File',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode:
      `
        Logger logger = (Logger) x.get("logger");
        StringBuilder title = sb.get();

        if ( dated ) {
          try {
            title.append("Settlement report for ")
              .append(startDate.get(Calendar.YEAR))
              .append(getMonthName(startDate.get(Calendar.MONTH)))
              .append("-").append(startDate.get(Calendar.DAY_OF_MONTH))
              .append(" to ")
              .append(endDate.get(Calendar.YEAR)).append("-")
              .append(getMonthName(endDate.get(Calendar.MONTH)))
              .append("-").append(endDate.get(Calendar.DAY_OF_MONTH)))
              .append("\n for Business ID: ")
              .append(user.getId())
              .append("\n\n");
          } catch (Exception e) {
            logger.warning("Error generating settlementReport - Error in title", e);
            return;
          }
        } else {
          title.append("Settlement report\n for Business ID: ").append(user.getId()).append("\n\n");
        }
    
        String path = "/opt/nanopay/SettlementReport/[" + user.getOrganization() + "]SettlementReport.pdf";
    
        try {
          Document document = new Document();
          PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
          document.open();

          document.add(new Paragraph(title));
    
          List list = createListForOneInvoice(x, user.getOrganization());
    
          document.add(list);
          document.add(Chunk.NEWLINE);
          
          document.close();
          writer.close();
    
          return new File(path);
        } catch (Exception e) {
          logger.error("Error generating settlementReport - writing to document.", e);
        }
        return null; 
      `
    },
    {
      name: 'createListForInvoices',
      javaType: 'List<List>',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'businessName',
          type: 'String'
        }
      ],
      javaCode:
      `
        DAO  userDAO            = (DAO) x.get("localUserDAO");
        SimpleDateFormat df     = new SimpleDateFormat("yyyy/dd/MM, HH:mm:ss");
        User tempUser           = null;
        String title            = null;
        java.util.List<Invoice> invoiceArray_ = dao_.getArray();
        List list = new List(List.UNORDERED);

        String transDate = "";
        String createdBy_String = "";
        String businessNamePayer = "";
        String businessNamePayee = "";
        String srcCurrency = "";
        String dstCurrency = "";
        String exRate = "";
        String inStatus = "";
        String tanId = "";
        String inORN = "";
        String inID = "";
        String inAmount = "";

        for (Invoice invoice : invoiceArray_ ) {
          // Format Information variables for each Invoice
          transDate         = df.format(invoice.getPaymentDate());
          tempUser          = (User) userDAO.find(invoice.getCreatedBy());
          createdBy_String  = SafetyUtil.isEmpty(tempUser) ? "n/a" : tempUser.label();
          tempUser          = (User) userDAO.find(invoice.getPayerId());
          businessNamePayer = SafetyUtil.isEmpty(tempUser) ? "n/a" : tempUser.getOrganization();
          tempUser          = (User) userDAO.find(invoice.getPayeeId());
          businessNamePayee = SafetyUtil.isEmpty(tempUser) ? "n/a" : tempUser.getOrganization();
          srcCurrency       = invoice.getSourceCurrency();
          dstCurrency       = invoice.getDestinationCurrency();
          exRate            = invoice.getExchangeRate().toString();
          inStatus          = invoice.getStatus().getLabel();
          tanId             = invoice.getReferenceId();
          inORN             = invoice.getPurchaseOrder();
          inID              = invoice.getId().toString();
          inAmount          = invoice.getAmount().toString();

          // Put all variables with text for each line, for write to doc.pdf(settlementReport) 
          list.add(new ListItem("Invoice ID: " + inID + " PO: " + inORN ));
          list.add(new ListItem("\tTransaction Date: " + transDate));
          list.add(new ListItem("\tInvoice was established by: " + createdBy_String));
          list.add(new ListItem("\tPayer: " + businessNamePayer));
          list.add(new ListItem("\tPayee: " + businessNamePayee));
          list.add(new ListItem("\tSource Account Currency Type: " + srcCurrency));
          list.add(new ListItem("\tDestination Account Currency Type: " + dstCurrency));
          if ( exRate != null && exRate.length() != 0 && exRate != 1 ) {
            list.add(new ListItem("\tExchange Rate: " + exRate));
          }
          list.add(new ListItem("\tStatus of Payment: " + inStatus));
          list.add(new ListItem("\tTransaction ID: " + tanId));
          list.add(new ListItem("\tInvoice Amount: " + inAmount + "\n\n"));
        }
        return list;
      `
    },
    {
      name: 'downloadZipFile',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'business',
          type: 'net.nanopay.model.Business'
        },
        {
          name: 'file',
          type: 'File'
        }
      ],
      javaCode:
      `
        HttpServletResponse response = x.get(HttpServletResponse.class);
    
        response.setContentType("multipart/form-data");
    
        String businessName = business.getBusinessName();
        String downloadName = "[" + businessName + "]SettlementReport.zip";
    
        response.setHeader("Content-Disposition", "attachment;fileName=\"" + downloadName + "\"");
    
        DataOutputStream os = null;
        ZipOutputStream zipos = null;
        try {
          zipos = new ZipOutputStream(new BufferedOutputStream(response.getOutputStream()));
          zipos.setMethod(ZipOutputStream.DEFLATED);
    
          zipos.putNextEntry(new ZipEntry(file.getName()));
          os = new DataOutputStream(zipos);
          InputStream is = new FileInputStream(file);
          byte[] b = new byte[100];
          int length;
          while((length = is.read(b))!= -1){
            os.write(b, 0, length);
          }
          is.close();
          zipos.closeEntry();
          os.flush();
          
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error(e);
        } finally {
          IOUtils.closeQuietly(os);
          IOUtils.closeQuietly(zipos);
        }
      `
    }
  ]
});
