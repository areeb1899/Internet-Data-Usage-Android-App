package com.netusage.datausage

import android.app.AppOpsManager
import android.app.usage.NetworkStats
import android.app.usage.NetworkStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*

class NetworkStatsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NetworkStatsModule"

    @ReactMethod
    fun checkPermission(promise: Promise) {
        try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactContext.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactContext.packageName
                )
            }
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INTENT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun queryUsage(startTime: Double, endTime: Double, promise: Promise) {
        try {
            val startMs = startTime.toLong()
            val endMs = endTime.toLong()

            val nsm = reactContext.getSystemService(Context.NETWORK_STATS_SERVICE) as? NetworkStatsManager
            if (nsm == null) {
                promise.reject("UNAVAILABLE", "NetworkStatsManager is not available on this device")
                return
            }

            val pm = reactContext.packageManager

            // Map: UID -> Stats
            class UidStats {
                var wifiRx: Long = 0L
                var wifiTx: Long = 0L
                var mobileRx: Long = 0L
                var mobileTx: Long = 0L
            }
            val statsMap = mutableMapOf<Int, UidStats>()

            // 1. Query Wi-Fi
            try {
                val wifiStats = nsm.querySummary(ConnectivityManager.TYPE_WIFI, null, startMs, endMs)
                val bucket = NetworkStats.Bucket()
                while (wifiStats.hasNextBucket()) {
                    wifiStats.getNextBucket(bucket)
                    val uid = bucket.uid
                    if (uid > 0) {
                        val stat = statsMap.getOrPut(uid) { UidStats() }
                        stat.wifiRx += bucket.rxBytes
                        stat.wifiTx += bucket.txBytes
                    }
                }
                wifiStats.close()
            } catch (e: Exception) {
                // Ignore empty or restricted query errors
            }

            // 2. Query Mobile
            try {
                val mobileStats = nsm.querySummary(ConnectivityManager.TYPE_MOBILE, null, startMs, endMs)
                val bucket = NetworkStats.Bucket()
                while (mobileStats.hasNextBucket()) {
                    mobileStats.getNextBucket(bucket)
                    val uid = bucket.uid
                    if (uid > 0) {
                        val stat = statsMap.getOrPut(uid) { UidStats() }
                        stat.mobileRx += bucket.rxBytes
                        stat.mobileTx += bucket.txBytes
                    }
                }
                mobileStats.close()
            } catch (e: Exception) {
                // Ignore
            }

            // Map UIDs to app package names and labels
            val resultList = Arguments.createArray()

            for ((uid, stat) in statsMap) {
                // Skip apps that have 0 usage across both networks
                if (stat.wifiRx == 0L && stat.wifiTx == 0L && stat.mobileRx == 0L && stat.mobileTx == 0L) {
                    continue
                }

                val packages = pm.getPackagesForUid(uid)
                val packageName = packages?.firstOrNull() ?: "uid_$uid"
                var appName = packageName

                try {
                    val appInfo: ApplicationInfo = pm.getApplicationInfo(packageName, 0)
                    appName = pm.getApplicationLabel(appInfo).toString()
                } catch (e: Exception) {
                    // Fallback to package or formatted UID
                    if (uid == 1000) appName = "Android System"
                }

                val map = Arguments.createMap().apply {
                    putInt("uid", uid)
                    putString("packageName", packageName)
                    putString("appName", appName)
                    putDouble("wifiRxBytes", stat.wifiRx.toDouble())
                    putDouble("wifiTxBytes", stat.wifiTx.toDouble())
                    putDouble("mobileRxBytes", stat.mobileRx.toDouble())
                    putDouble("mobileTxBytes", stat.mobileTx.toDouble())
                }
                resultList.pushMap(map)
            }

            promise.resolve(resultList)
        } catch (e: Exception) {
            promise.reject("QUERY_ERROR", e.message)
        }
    }
}

