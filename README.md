# NANOPAY
Repository containing b2b, retail, common, admin-portal, ingenico

## Running locally

### Prerequisites
1. Brew (`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`)
2. Realpath from Coreutils (`brew install coreutils`)
3. Maven (`brew install maven`)
4. Git (`brew install git`)

### Setup
Checkout `NANOPAY`
```
git clone https://github.com/nanopayinc/NANOPAY.git
```

foam2 is added as a submodule.
Initialize the submodule
```
git submodule init
git submodule update
```

### Installing tomcat

Go into the NANOPAY/tools directory and run the following commands:

```
./tomcatInstall.sh

```


### Build all projects and run Nanos at once
You can run the script generateAll.sh to build all projects and run the nanos, go to the NANOPAY project root folder and execute:

`sh run-nanos.sh`
OR
`./run-nanos.sh`

### Build all projects and run tomcat at once
You can run the script generateAll.sh to build all projects and run tomcat, go to the NANOPAY project root folder and execute:

`sh run-tomcat.sh`
OR
`./run-tomcat.sh`

### Build manual procedures

1. Copy the services file from foam2 to the current directory

`cp foam2/src/services .`

2. Build foam2

```
cd foam2/src
./gen.sh
cd ../build
mvn compile package
mvn install:install-file -Dfile="target/foam-1.0-SNAPSHOT.jar" -DgroupId=com.google -DartifactId=foam -Dversion=1.0 -Dname=foam -Dpackaging=jar
cd ../..
```

3. Build NANOPAY

```
cd NANOPAY
./gen.sh
mvn compile package
cd ..
```

4. Run NANOS

```
./NANOPAY/tools/nanos.sh
```

### Loading a project

Visit [http://localhost:8080/static](http://localhost:8080/static) and go into any of the submodules to view that project
