# UptimeRobot + Discord Alerting Setup

## 1. Create UptimeRobot Monitor
1. Go to uptimerobot.com and create a free account.
2. Click Add New Monitor.
3. Configure monitor values:
- Monitor Type: HTTP(s)
- Friendly Name: URL Shortener API
- URL: https://your-app.onrender.com/health
- Monitoring Interval: 5 minutes

## 2. Create Discord Webhook
1. Create or open a Discord server and choose an alerts channel.
2. Open Channel Settings.
3. Go to Integrations, then Webhooks.
4. Create a webhook and copy its URL.

## 3. Connect Discord to UptimeRobot
1. In UptimeRobot, open My Settings, then Alert Contacts.
2. Add Alert Contact and choose webhook or custom integration method.
3. Paste the Discord webhook URL.
4. Save and attach the alert contact to the URL Shortener monitor.

## 4. Validate Alerts
1. Temporarily make /health return non-200 or stop API containers.
2. Wait up to 5 minutes for UptimeRobot to detect failure.
3. Confirm Discord channel receives alert notification.
4. Restore service and confirm recovery alert is sent.

## Recommended Thresholds
- ServiceDown: 2 consecutive failed checks.
- HighErrorRate: >5% over 10 minutes from app or gateway telemetry.
