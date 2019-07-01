# Serverless Goof vulnerable azure functions projects

A Todo serverless application that is vulnerable for education purposes for deployment on Azure Functions cloud and MongoDB Atlas.

## Project deployment

1. To deploy the project you'll need the set of Azure CLI and Azure Functions tools available
2. This project uses MongoDB Atlas as a SaaS database so you'll need to create an account there and grab the connection details for it

## Project configuration

The project includes a `config.js` in it's root directory that needs to be updated with your deployment:

```js
"use strict";

module.exports = {
  db: {
    url:
      "mongodb+srv://YOUR_DB_GOES_HERE.azure.mongodb.net/?retryWrites=true&w=majority;",
    name: "todos",
    username: "YOUR_DB_USERNAME",
    password: "YOUR_DB_PASSWORD"
  },
  functions: {
    backup: {
      url: "https://serverlessgoof.azurewebsites.net/api/zzadminbackup",
      secret: "v987239g2rug97g23r=="
    },
    restore: {
      url: "https://serverlessgoof.azurewebsites.net/api/zzadminrestore",
      secret: "vjb9837t9tgovb9831=="
    }
  }
};
```

### Database

Sign-up to MongoDB Atlas at https://cloud.mongodb.com/

Grab the database connection string and information from MongoDB Atlas and update the `config.db` keys with the relevant details, mostly the hostname, username and password. The database name can and should be kept as `todos` for the example application.

### Admin functions

There are 2 admin-based functions `backup` and `restore` which can only be triggered through Azure Function's own host or function key. You'll need to first deploy the project on Azure Functions which prints back all the invoking URLs and their functions. Then replace in this `config.js` file the `url` and `secret` keys for each of the functions and deploy again.

# Re-building Serverless Goof on Azure

To replicate this project setup on Azure from scratch follow along the steps in this section.

## Pre-requisites

1. macOS and Homebrew
2. A git client, Node.js and npm installed
3. An Azure account and Azure CLI tools

## Installing Azure CLI tools

Install the azure cli

```bash
brew update && brew install azure-cli
```

For other installation methods refer to the Azure CLI documentation at https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest

Next invoke the login command to authorize your CLI invocations with regards to your Azure account:

```bash
az login
```

Lastly, we'll need the Azure Functions CLI which can be installed from npm:

```bash
npm install -g azure-functions-core-tools
```

## Scaffold a new project

```bash
func init ServerlessGoof
```

### Scaffold new function templates

If you wish to re-write the logic for each function from scratch or just get a hang on how to create a function, this is how I scaffolded the HTTP functions:

```bash
func new --name ListTodos --template "HttpTrigger"
func new --name GetTodos --template "HttpTrigger"
func new --name CreateTodos --template "HttpTrigger"
func new --name UpdateTodos --template "HttpTrigger"
func new --name DeleteTodos --template "HttpTrigger"
func new --name RenderTodos --template "HttpTrigger"
```

## Create cloud resources

Following are commands that should be scripted for a deployment of the project.

create a new resource group to group all of the functions, dbs, storage etc under one grouping

```bash
az group create --name ServerlessGoofGroup --location westus2
```

will print out something like:

```json
{
  "id": "/subscriptions/18fead2f-b5a7-4ef5-a1ff-8e233c5ba0ce/resourceGroups/ServerlessGoofGroup",
  "location": "westus2",
  "managedBy": null,
  "name": "ServerlessGoofGroup",
  "properties": {
    "provisioningState": "Succeeded"
  },
  "tags": null,
  "type": null
}
```

then continue to create a storage

```bash
az storage account create --name serverlessgoofstorage --location westus2 --resource-group ServerlessGoofGroup --sku Standard_LRS
```

will print out something like:

```json
{
  "accessTier": null,
  "creationTime": "2019-06-12T11:28:59.810750+00:00",
  "customDomain": null,
  "enableAzureFilesAadIntegration": null,
  "enableHttpsTrafficOnly": false,
  "encryption": {
    "keySource": "Microsoft.Storage",
    "keyVaultProperties": null,
    "services": {
      "blob": {
        "enabled": true,
        "lastEnabledTime": "2019-06-12T11:28:59.888942+00:00"
      },
      "file": {
        "enabled": true,
        "lastEnabledTime": "2019-06-12T11:28:59.888942+00:00"
      },
      "queue": null,
      "table": null
    }
  },
  "failoverInProgress": null,
  "geoReplicationStats": null,
  "id": "/subscriptions/18fead2f-b5a7-4ef5-a1ff-8e233c5ba0ce/resourceGroups/ServerlessGoofGroup/providers/Microsoft.Storage/storageAccounts/serverlessgoofstorage",
  "identity": null,
  "isHnsEnabled": null,
  "kind": "Storage",
  "lastGeoFailoverTime": null,
  "location": "westus2",
  "name": "serverlessgoofstorage",
  "networkRuleSet": {
    "bypass": "AzureServices",
    "defaultAction": "Allow",
    "ipRules": [],
    "virtualNetworkRules": []
  },
  "primaryEndpoints": {
    "blob": "https://serverlessgoofstorage.blob.core.windows.net/",
    "dfs": null,
    "file": "https://serverlessgoofstorage.file.core.windows.net/",
    "queue": "https://serverlessgoofstorage.queue.core.windows.net/",
    "table": "https://serverlessgoofstorage.table.core.windows.net/",
    "web": null
  },
  "primaryLocation": "westus2",
  "provisioningState": "Succeeded",
  "resourceGroup": "ServerlessGoofGroup",
  "secondaryEndpoints": null,
  "secondaryLocation": null,
  "sku": {
    "capabilities": null,
    "kind": null,
    "locations": null,
    "name": "Standard_LRS",
    "resourceType": null,
    "restrictions": null,
    "tier": "Standard"
  },
  "statusOfPrimary": "available",
  "statusOfSecondary": null,
  "tags": {},
  "type": "Microsoft.Storage/storageAccounts"
}
```

after provisioning a storage we need to create a function app to host the function:

```bash
az functionapp create --resource-group ServerlessGoofGroup --consumption-plan-location westus2 \
--name ServerlessGoof --storage-account serverlessgoofstorage --runtime node
```

will output with

```json
{
  "availabilityState": "Normal",
  "clientAffinityEnabled": false,
  "clientCertEnabled": false,
  "clientCertExclusionPaths": null,
  "cloningInfo": null,
  "containerSize": 1536,
  "dailyMemoryTimeQuota": 0,
  "defaultHostName": "serverlessgoof.azurewebsites.net",
  "enabled": true,
  "enabledHostNames": [
    "serverlessgoof.azurewebsites.net",
    "serverlessgoof.scm.azurewebsites.net"
  ],
  "geoDistributions": null,
  "hostNameSslStates": [
    {
      "hostType": "Standard",
      "ipBasedSslResult": null,
      "ipBasedSslState": "NotConfigured",
      "name": "serverlessgoof.azurewebsites.net",
      "sslState": "Disabled",
      "thumbprint": null,
      "toUpdate": null,
      "toUpdateIpBasedSsl": null,
      "virtualIp": null
    },
    {
      "hostType": "Repository",
      "ipBasedSslResult": null,
      "ipBasedSslState": "NotConfigured",
      "name": "serverlessgoof.scm.azurewebsites.net",
      "sslState": "Disabled",
      "thumbprint": null,
      "toUpdate": null,
      "toUpdateIpBasedSsl": null,
      "virtualIp": null
    }
  ],
  "hostNames": ["serverlessgoof.azurewebsites.net"],
  "hostNamesDisabled": false,
  "hostingEnvironmentProfile": null,
  "httpsOnly": false,
  "hyperV": false,
  "id": "/subscriptions/18fead2f-b5a7-4ef5-a1ff-8e233c5ba0ce/resourceGroups/ServerlessGoofGroup/providers/Microsoft.Web/sites/ServerlessGoof",
  "identity": null,
  "inProgressOperationId": null,
  "isDefaultContainer": null,
  "isXenon": false,
  "kind": "functionapp",
  "lastModifiedTimeUtc": "2019-06-12T11:29:47.316666",
  "location": "westus2",
  "maxNumberOfWorkers": null,
  "name": "ServerlessGoof",
  "outboundIpAddresses": "13.77.160.237,13.77.162.15,13.66.163.227,13.66.158.57,13.66.165.49",
  "possibleOutboundIpAddresses": "13.77.160.237,13.77.162.15,13.66.163.227,13.66.158.57,13.66.165.49,13.66.175.2,13.66.163.18,13.77.161.12",
  "redundancyMode": "None",
  "repositorySiteName": "ServerlessGoof",
  "reserved": false,
  "resourceGroup": "ServerlessGoofGroup",
  "scmSiteAlsoStopped": false,
  "serverFarmId": "/subscriptions/18fead2f-b5a7-4ef5-a1ff-8e233c5ba0ce/resourceGroups/ServerlessGoofGroup/providers/Microsoft.Web/serverfarms/WestUS2Plan",
  "siteConfig": null,
  "slotSwapStatus": null,
  "state": "Running",
  "suspendedTill": null,
  "tags": null,
  "targetSwapSlot": null,
  "trafficManagerHostNames": null,
  "type": "Microsoft.Web/sites",
  "usageState": "Normal"
}
```

update function settings to use latest resource versions and latest supported Node.js runtime version:

```bash
az functionapp config appsettings set --name ServerlessGoof --resource-group ServerlessGoofGroup --settings "FUNCTIONS_EXTENSION_VERSION=~2"
az functionapp config appsettings set --name ServerlessGoof --resource-group ServerlessGoofGroup --settings "WEBSITE_NODE_DEFAULT_VERSION=10.14.1"
```

### Create a CosmosDB account with support for MongoDB API

```bash
az cosmosdb create --name serverlessgoof --resource-group ServerlessGoofGroup --kind MongoDB
```

will print out:

```json
{
  "capabilities": [],
  "consistencyPolicy": {
    "defaultConsistencyLevel": "Session",
    "maxIntervalInSeconds": 5,
    "maxStalenessPrefix": 100
  },
  "databaseAccountOfferType": "Standard",
  "documentEndpoint": "https://serverlessgoof.documents.azure.com:443/",
  "enableAutomaticFailover": false,
  "enableMultipleWriteLocations": false,
  "failoverPolicies": [
    {
      "failoverPriority": 0,
      "id": "serverlessgoof-westus2",
      "locationName": "West US 2"
    }
  ],
  "id": "/subscriptions/18fead2f-b5a7-4ef5-a1ff-8e233c5ba0ce/resourceGroups/ServerlessGoofGroup/providers/Microsoft.DocumentDB/databaseAccounts/serverlessgoof",
  "ipRangeFilter": "",
  "isVirtualNetworkFilterEnabled": false,
  "kind": "MongoDB",
  "location": "West US 2",
  "name": "serverlessgoof",
  "provisioningState": "Succeeded",
  "readLocations": [
    {
      "documentEndpoint": "https://serverlessgoof-westus2.documents.azure.com:443/",
      "failoverPriority": 0,
      "id": "serverlessgoof-westus2",
      "isZoneRedundant": false,
      "locationName": "West US 2",
      "provisioningState": "Succeeded"
    }
  ],
  "resourceGroup": "ServerlessGoofGroup",
  "tags": {},
  "type": "Microsoft.DocumentDB/databaseAccounts",
  "virtualNetworkRules": [],
  "writeLocations": [
    {
      "documentEndpoint": "https://serverlessgoof-westus2.documents.azure.com:443/",
      "failoverPriority": 0,
      "id": "serverlessgoof-westus2",
      "isZoneRedundant": false,
      "locationName": "West US 2",
      "provisioningState": "Succeeded"
    }
  ]
}
```

Get the connection string to the database:

```bash
endpoint=\$(az cosmosdb show --name serverlessgoof --resource-group ServerlessGoofGroup --query documentEndpoint --output tsv)
https://serverlessgoof.documents.azure.com:10250/
```

Get the access key for the database:

```bash
key=\$(az cosmosdb list-keys --name serverlessgoof --resource-group ServerlessGoofGroup --query primaryMasterKey --output tsv)
AglL3Cx700W4oBaWJLuiwVG7t1ReZWN0BA8eVmALhbeZEErFxWAJldqulwlqFxsjBVUNGfvf04dHHUIBiwCUOA==
```

Update the connection settings for the function to be able to access the database

```bash
az functionapp config appsettings set --name serverlessgoof --resource-group ServerlessGoofGroup --setting CosmosDB_Endpoint=$endpoint CosmosDB_Key=$key
```

## Publish the functions

From the project's root directory publish all the functions:

```bash
func azure functionapp publish ServerlessGoof
```

will print:

```
Extensions command requires dotnet on your path. Please make sure to install dotnet (.NET Core SDK) for your system from https://www.microsoft.com/net/download
Getting site publishing info...
Creating archive for current directory...
Uploading 679.83 KB [#############################################################################]
Upload completed successfully.
Deployment completed successfully.
Syncing triggers...
Functions in ServerlessGoof:
ListTodos - [httpTrigger]
Invoke url: https://serverlessgoof.azurewebsites.net/api/listtodos?code=8mmnrraQAMAZIfBOUCYbdqunPHcpRfY7Lvl2g6LkPk52/YP0vpRssw==
```

## Cleanup

To cleanup we can delete all the resources provisioned with:

```bash
az group delete --name ServerlessGoofGroup
```

## Test locally

```bash
func host start --build
```

## Deploy the project

From the project's root directory:

```bash
func azure functionapp publish ServerlessGoof
```
