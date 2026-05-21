package com.viewcash.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // MUST be called before super.onCreate() — this installs the
        // AndroidX SplashScreen which shows the native branded splash
        // from the very first frame, before any WebView content loads.
        // On Android 12+, this bridges the OS splash to our custom theme.
        // On Android 11 and below, our windowBackground drawable handles it.
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);

        // Keep the splash on screen until Capacitor signals readiness.
        // Setting this to false means dismiss immediately when ready.
        splashScreen.setKeepOnScreenCondition(() -> false);

        super.onCreate(savedInstanceState);
    }
}
