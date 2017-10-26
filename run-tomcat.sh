#!/bin/sh

# Build root and compile
./gen.sh
mvn clean install

# Find and concatenate files
find **/src -type f -name accounts -exec cat {} \; > accounts
find **/src -type f -name branches -exec cat {} \; > branches
find **/src -type f -name bankAccounts -exec cat {} \; > bankAccounts
find **/src -type f -name branches -exec cat {} \; > branches
find **/src -type f -name brokers -exec cat {} \; > brokers
find **/src -type f -name businesses -exec cat {} \; > businesses
find **/src -type f -name canadaTransactions -exec cat {} \; > canadaTransactions
find **/src -type f -name cicoServiceProviders -exec cat {} \; > cicoServiceProviders
find **/src -type f -name countries -exec cat {} \; > countries
find **/src -type f -name countryAgents -exec cat {} \; > countryAgents
find **/src -type f -name cronjobs -exec cat {} \; > cronjobs
find **/src -type f -name currency -exec cat {} \; > currency
find **/src -type f -name devices -exec cat {} \; > devices
find **/src -type f -name dateofbirth -exec cat {} \; > dateofbirth
find **/src -type f -name exchangeRates -exec cat {} \; > exchangeRates
find **/src -type f -name exportDriverRegistrys -exec cat {} \; > exportDriverRegistrys
find **/src -type f -name groups -exec cat {} \; > groups
find **/src -type f -name historyRecords -exec cat {} \; > historyRecords
find **/src -type f -name indiaTransactions -exec cat {} \; > indiaTransactions
find **/src -type f -name identification -exec cat {} \; > identification
find **/src -type f -name invoices -exec cat {} \; > invoices
find **/src -type f -name invoiceResolutions -exec cat {} \; > invoiceResolutions
find **/src -type f -name languages -exec cat {} \; > languages
find **/src -type f -name menus -exec cat {} \; > menus
find **/src -type f -name pacs8india -exec cat {} \; > pacs8india
find **/src -type f -name pacs8iso -exec cat {} \; > pacs8iso
find **/src -type f -name payees -exec cat {} \; > payees
find **/src -type f -name permissions -exec cat {} \; > permissions
find **/src -type f -name regions -exec cat {} \; > regions
find **/src -type f -name scripts -exec cat {} \; > scripts
find **/src -type f -name services -exec cat {} \; > services
find **/src -type f -name tests -exec cat {} \; > tests
find **/src -type f -name transactions -exec cat {} \; > transactions
find **/src -type f -name users -exec cat {} \; > users

#Copy over all required files to $CATALINA_HOME/bin/
#cp server.xml $CATALINA_HOME/conf
