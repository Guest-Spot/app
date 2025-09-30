# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Keep line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable

# Keep JavaScript interface methods for Capacitor
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep class org.apache.cordova.** { *; }

# Keep WebView related classes
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep R8 mapping file for deobfuscation
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep application class
-keep public class * extends android.app.Application

# Keep activity classes
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# Keep Capacitor plugin classes
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.Bridge { *; }

# Keep reflection-based classes
-keepclassmembers class * {
    @com.getcapacitor.annotation.CapacitorPlugin <methods>;
}

# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
