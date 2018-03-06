foam.CLASS({
  package: 'net.nanopay.cico.spi.alterna',
  name: 'AlternaSFTPService',

  implements: [
    'net.nanopay.cico.spi.alterna.SFTPService'
  ],

  javaImports: [
    'com.jcraft.jsch.Channel',
    'com.jcraft.jsch.ChannelSftp',
    'com.jcraft.jsch.JSch',
    'com.jcraft.jsch.Session',
    'foam.lib.json.OutputterMode',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.util.Date',
    'java.util.Properties'
  ],

  properties: [
    {
      class: 'String',
      name: 'host'
    },
    {
      class: 'Int',
      name: 'port',
      value: 22
    },
    {
      class: 'String',
      name: 'username'
    },
    {
      class: 'String',
      name: 'password',
      networkTransient: true
    },
    {
      class: 'String',
      name: 'directory',
      value: '/'
    }
  ],

  methods: [
    {
      name: 'sendCICOFile',
      javaCode:
`Date now = new Date();
ByteArrayOutputStream baos = new ByteArrayOutputStream();
CsvUtil.writeCsvFile(getX(), baos, OutputterMode.STORAGE);

Session session = null;
Channel channel = null;
ChannelSftp channelSftp;

try {
  // create session with user name and password
  JSch jsch = new JSch();
  session = jsch.getSession(getUsername(), getHost(), getPort());
  session.setPassword(getPassword());

  // add configuration
  Properties config = new Properties();
  config.put("StrictHostKeyChecking", "no");
  session.setConfig(config);
  session.connect();

  // open SFTP connection and upload file
  channel = session.openChannel("sftp");
  channel.connect();

  channelSftp = (ChannelSftp) channel;
  channelSftp.cd(getDirectory());
  channelSftp.put(new ByteArrayInputStream(baos.toByteArray()), CsvUtil.generateFilename(now));
  channelSftp.exit();
} catch ( Exception e ) {
  e.printStackTrace();
} finally {
  // close channels
  if ( channel != null ) channel.disconnect();
  if ( session != null ) session.disconnect();
  System.out.println("Host Session disconnected.");
}`
    }
  ]
});