from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from ..database import get_db
from ..security import get_current_admin

router = APIRouter(tags=["Analytics"])

@router.get("/analytics")
def get_analytics(current_user: dict = Depends(get_current_admin)):
    db = get_db()
    apps = db.get("apps", [])
    categories = db.get("categories", [])
    downloads = db.get("downloads", [])
    messages = db.get("messages", [])
    total_downloads = sum(int(a.get("totalDownloads", 0) or 0) for a in apps)
    category_downloads = []
    for category in categories:
        related = [app for app in apps if app.get("category") == category.get("slug")]
        category_downloads.append({"name": category.get("name", {}).get("en", ""), "nameAr": category.get("name", {}).get("ar", ""), "downloads": sum(int(app.get("totalDownloads", 0) or 0) for app in related)})
    sorted_apps = sorted(apps, key=lambda item: int(item.get("totalDownloads", 0) or 0), reverse=True)[:5]
    now = datetime.now(timezone.utc)
    daily = []
    for days_ago in range(13, -1, -1):
        day = (now - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        count = sum(1 for item in downloads if item.get("timestamp", "").startswith(day))
        daily.append({"date": day, "downloads": count})
    return {
        "summary": {"totalDownloads": total_downloads, "totalApps": len(apps), "publishedApps": sum(1 for app in apps if app.get("status") == "published"), "totalVersions": sum(len(app.get("versions", [])) for app in apps), "totalMessages": len(messages), "unreadMessages": sum(1 for message in messages if message.get("status") == "unread"), "pendingSuggestions": sum(1 for item in db.get("suggestions", []) if item.get("status") == "pending")},
        "categoryDownloads": category_downloads,
        "topApps": [{"id": app.get("id"), "name": app.get("title", {}).get("en", ""), "nameAr": app.get("title", {}).get("ar", ""), "downloads": int(app.get("totalDownloads", 0) or 0), "rating": app.get("rating", 0), "category": app.get("category", "")} for app in sorted_apps],
        "dailyTrends": daily,
    }

@router.get("/analytics/realtime")
def get_realtime_analytics(timeframe: str = Query("24h", pattern="^(24h|7d|30d)$"), current_user: dict = Depends(get_current_admin)):
    db = get_db()
    downloads = db.get("downloads", [])
    now = datetime.now(timezone.utc)
    intervals = 24 if timeframe == "24h" else 7 if timeframe == "7d" else 30
    chart = []
    for offset in range(intervals - 1, -1, -1):
        point = now - (timedelta(hours=offset) if timeframe == "24h" else timedelta(days=offset))
        prefix = point.strftime("%Y-%m-%dT%H") if timeframe == "24h" else point.strftime("%Y-%m-%d")
        count = sum(1 for item in downloads if item.get("timestamp", "").startswith(prefix))
        chart.append({"timestamp": point.isoformat(), "label": point.strftime("%H:00") if timeframe == "24h" else point.strftime("%m/%d"), "downloads": count, "verifiedCount": count})
    today = now.strftime("%Y-%m-%d")
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    today_count = sum(1 for item in downloads if item.get("timestamp", "").startswith(today))
    yesterday_count = sum(1 for item in downloads if item.get("timestamp", "").startswith(yesterday))
    growth = round((today_count - yesterday_count) / yesterday_count * 100, 1) if yesterday_count else 0
    values = [item["downloads"] for item in chart]
    peak = max(values, default=0)
    return {"timeframe": timeframe, "lastUpdated": now.isoformat(), "metrics": {"todayDownloads": today_count, "yesterdayDownloads": yesterday_count, "hourlyRate": round(today_count / max(1, now.hour + 1)), "growthPercent": growth, "peakValue": peak, "peakLabel": next((item["label"] for item in chart if item["downloads"] == peak), ""), "avgPerInterval": round(sum(values) / max(1, len(values))), "successRate": 100 if downloads else 0}, "chartData": chart, "recentEvents": []}
