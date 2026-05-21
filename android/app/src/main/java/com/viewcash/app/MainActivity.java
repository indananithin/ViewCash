package com.viewcash.app;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Install native splash screen BEFORE super.onCreate()
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        splashScreen.setKeepOnScreenCondition(() -> false);

        // Enable Chrome DevTools remote debugging for this WebView.
        // Connect via: chrome://inspect on your desktop Chrome.
        // This lets you see JS errors causing the blank screen.
        // IMPORTANT: Only enable in debug builds to avoid security risk in production.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        super.onCreate(savedInstanceState);
    }
}
