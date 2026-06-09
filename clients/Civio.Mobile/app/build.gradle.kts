plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

apply(plugin = "org.jetbrains.kotlin.android")

android {
    namespace = "com.example.civiomobile"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.civiomobile"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Fallback API base URL (used until the remote config is fetched).
        // 10.0.2.2 maps emulator -> host machine localhost.
        buildConfigField("String", "API_BASE_URL", "\"http://localhost:5214/\"")

        // Remote config: plain-text file holding the active API base URL
        // (one line, e.g. the tunnel URL). Update the file -> all APKs repoint
        // on next launch, no rebuild. Stable URL, set once.
        buildConfigField(
            "String",
            "API_CONFIG_URL",
            "\"https://gist.githubusercontent.com/dxsireq/5ec47b8f39814e78e8206f5066387d77/raw/gistfile1.txt\""
        )
    }

    buildTypes {
        debug {
            buildConfigField("String", "API_BASE_URL", "\"http://localhost:5214/\"")
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            buildConfigField("String", "API_BASE_URL", "\"http://localhost:5214/\"")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
        isCoreLibraryDesugaringEnabled = true
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Navigation Compose
    implementation(libs.androidx.navigation.compose)

    // Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.hilt.navigation.compose)

    // Retrofit / OkHttp
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging.interceptor)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // EncryptedSharedPreferences
    implementation(libs.androidx.security.crypto)

    // QR (ZXing)
    implementation(libs.zxing.android.embedded)

    // Desugaring for java.time on minSdk 24
    coreLibraryDesugaring(libs.desugar.jdk.libs)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
    }
}
