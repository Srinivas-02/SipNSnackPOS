after installing the repo

run npm install

in node modules find the build.gradle of bluetooth-ecspos and replace all http: with https:
replace this
compileSdkVersion 35
    buildToolsVersion = "35.0.0"

    defaultConfig {
        minSdkVersion 24
        targetSdkVersion 35
        versionCode 1
        versionName "1.0"
    }


and then navigate to RNBluetoothManagerModule.java and there 

- import android.support.v4.app.ActivityCompat;
- import android.support.v4.content.ContextCompat;
+ import androidx.core.app.ActivityCompat;
+ import androidx.core.content.ContextCompat;


find and replace the first lines with next 2 lines.

launch and emulator or use physical device and run the npm run android