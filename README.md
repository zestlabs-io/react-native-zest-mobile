# Zest Mobile React Native Plugin

## Usage

 * First create your react native project 
   ```console
   npx react-native init MyProjectName --typescript
   ```

 * Import the necessary libraries
   ```console
   npm i pouchdb-adapter-http pouchdb-mapreduce @craftzdog/pouchdb-core-react-native @craftzdog/pouchdb-replication-react-native pouchdb-adapter-react-native-sqlite react-native-sqlite-2 base-64 events jwt-decode react-native-app-auth pouchdb-find pouchdb-upsert
   cd ios; pod install; cd ..
   ```

 * Add authentication client to IOS in [PROJECT_DIR/ios/PROJECT_NAME/Info.plist](PROJECT_DIR/ios/PROJECT_NAME/Info.plist)
   ```xml
   <key>CFBundleURLTypes</key>
    <array>
      <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>zestlabs</string>
        <key>CFBundleURLSchemes</key>
        <array>
          <string>zestclientid</string>
        </array>
      </dict>
    </array>
    ```
    Update the files according to description in [react-native-app-auth](https://github.com/FormidableLabs/react-native-app-auth)

 * Add schema to Android client in [android/app/build.gradle](android/app/build.gradle)
   ```gradle
   defaultConfig {
        ...
        manifestPlaceholders = [
            appAuthRedirectScheme: 'zestclientid'
        ]
    }
   ```

 * Install [react-native-zest-mobile](https://www.npmjs.com/package/@zestlabs-io/react-native-zest-mobile) plugin
    ```console
    npm i @zestlabs-io/react-native-zest-mobile
    ```

 * Download from your ZEST Mobile Cloud account the credentials and place them in [src/zest-mobile.js](src/zest-mobile.js). Example:
    ```js
    const authConfig = {
      issuer: 'https://dev.zestlabs.cloud/auth',
      clientId: 'zestclientid',
      clientSecret: '...',
      redirectUrl: 'zestclientid:/callback',
      scopes: ['openid', 'profile', 'email', 'account_id'],
      dangerouslyAllowInsecureHttpRequests: true,
    };

    export const DB_CUSTOMERS = 'fd_customers';
    export const DB_ORDERS = 'fd_orders';
    export const DB_DELIVERIES = 'fd_deliveries';

    const syncConfig = {
      syncUrl: 'https://dev.zestlabs.cloud/sync',
      download: [DB_CUSTOMERS, DB_ORDERS],
      upload: [DB_DELIVERIES],
    };

    export { syncConfig, authConfig };
    ```

    In your store or in the application import the `AuthBridge` and `SyncManager`
    ```js
    import { syncConfig, authConfig } from './src/zest-config';
    import { AuthBridge, SyncManager } from '@zestlabs-io/react-native-zest-mobile';

    const authBridge = new AuthBridge(authConfig);
    const syncManager = new SyncManager(syncConfig, authBridge);
    ```
 
 * Use the auth manager and sync manager:
   
   TBD 

## License

Copyright (C) Zest Labs GmbH - All Rights Reserved
Unauthorized copying of files from this project, via any medium is strictly prohibited
Proprietary and confidential