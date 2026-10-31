package expo.modules.networkstats

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
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

class NetworkStatsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NetworkStatsModule")

    AsyncFunction("checkPermission") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        appOps.unsafeCheckOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          Process.myUid(),
          context.packageName
        )
      } else {
        @Suppress("DEPRECATION")
        appOps.checkOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          Process.myUid(),
          context.packageName
        )
      }
      return@AsyncFunction (mode == AppOpsManager.MODE_ALLOWED)
    }

    AsyncFunction("requestPermission") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      context.startActivity(intent)
      return@AsyncFunction true
    }

    AsyncFunction("queryUsage") { startTime: Double, endTime: Double ->
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, Any>>()
      val startMs = startTime.toLong()
      val endMs = endTime.toLong()

      val nsm = context.getSystemService(Context.NETWORK_STATS_SERVICE) as? NetworkStatsManager
        ?: return@AsyncFunction emptyList<Map<String, Any>>()

      val pm = context.packageManager

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
      } catch (e: Exception) {}

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
      } catch (e: Exception) {}

      val resultList = mutableListOf<Map<String, Any>>()
      for ((uid, stat) in statsMap) {
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
          if (uid == 1000) appName = "Android System"
        }

        resultList.add(
          mapOf(
            "uid" to uid,
            "packageName" to packageName,
            "appName" to appName,
            "wifiRxBytes" to stat.wifiRx.toDouble(),
            "wifiTxBytes" to stat.wifiTx.toDouble(),
            "mobileRxBytes" to stat.mobileRx.toDouble(),
            "mobileTxBytes" to stat.mobileTx.toDouble()
          )
        )
      }

      return@AsyncFunction resultList
    }
  }
}

