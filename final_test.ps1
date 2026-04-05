$ErrorActionPreference = "Stop"

$BASE = "http://localhost"
$PASS = 0
$FAIL = 0

function Check([string]$desc, [string]$expected, [string]$actual) {
    if ($actual -eq $expected) {
        Write-Host "PASS $desc"
        $script:PASS++
    }
    else {
        Write-Host "FAIL $desc"
        Write-Host "  Expected: $expected"
        Write-Host "  Got     : $actual"
        $script:FAIL++
    }
}

function Check-True([string]$desc, [bool]$condition) {
    Check $desc "true" ($(if ($condition) { "true" } else { "false" }))
}

function Get-StatusCode([string]$url, [string]$method = "GET", [string]$jsonBody = "") {
    if ($method -eq "GET") {
        return (curl.exe -s -o NUL -w "%{http_code}" $url)
    }

    try {
        if ($jsonBody -ne "") {
            $resp = Invoke-WebRequest -Uri $url -Method $method -ContentType "application/json" -Body $jsonBody -MaximumRedirection 0 -UseBasicParsing -ErrorAction Stop
            return [string]$resp.StatusCode
        }

        $resp = Invoke-WebRequest -Uri $url -Method $method -MaximumRedirection 0 -UseBasicParsing -ErrorAction Stop
        return [string]$resp.StatusCode
    }
    catch [System.Net.WebException] {
        if ($_.Exception.Response -ne $null) {
            return [string][int]$_.Exception.Response.StatusCode
        }
        throw
    }
}

Write-Host "======================================"
Write-Host "  URL SHORTENER - WINDOWS TEST SUITE"
Write-Host "======================================"

# Health
$health = $null
for ($i = 0; $i -lt 200000; $i++) {
    try {
        $healthText = curl.exe -s "$BASE/health"
        $health = $healthText | ConvertFrom-Json
        if ($health.status -eq "ok") {
            break
        }
    }
    catch {
    }
}

if ($null -eq $health -or $health.status -ne "ok") {
    Write-Host "FAIL stack readiness check"
    exit 1
}

Check "GET /health returns ok" "ok" "$($health.status)"

# Seed sanity
$seedUser1 = (curl.exe -s "$BASE/users/1" | ConvertFrom-Json)
Check "Seed user id=1 exists" "cobaltlagoon85" "$($seedUser1.username)"

$seedUser2 = (curl.exe -s "$BASE/users/2" | ConvertFrom-Json)
Check "Seed user id=2 exists" "urbananchor00" "$($seedUser2.username)"

Check "Seed short code HudIG9 redirects" "302" (Get-StatusCode "$BASE/HudIG9")
Check "Inactive short code xrf6Jp is not found" "404" (Get-StatusCode "$BASE/xrf6Jp")

# User create + duplicate + validation
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$username = "testuser_$stamp"
$email = "test_$stamp@example.com"

$createUserBody = (@{ username = $username; email = $email } | ConvertTo-Json -Compress)
Check "POST /users creates user" "201" (Get-StatusCode "$BASE/users" "POST" $createUserBody)
Check "POST /users duplicate conflicts" "409" (Get-StatusCode "$BASE/users" "POST" $createUserBody)
Check "POST /users invalid payload is rejected" "422" (Get-StatusCode "$BASE/users" "POST" '{"username":123,"email":"bad"}')

$newOwnerBody = (@{ username = "owner_$stamp"; email = "owner_$stamp@example.com" } | ConvertTo-Json -Compress)
$newUser = Invoke-RestMethod -Uri "$BASE/users" -Method Post -ContentType "application/json" -Body $newOwnerBody
$userId = [int]$newUser.id
Check-True "Owner user id created" ($userId -gt 0)

# URL create + redirect + deactivate
$createUrlBody = (@{ user_id = $userId; original_url = "https://example.com" } | ConvertTo-Json -Compress)
$createUrl = Invoke-RestMethod -Uri "$BASE/urls" -Method Post -ContentType "application/json" -Body $createUrlBody
$urlId = [int]$createUrl.id
$shortCode = "$($createUrl.short_code)"

$createUrl2Body = (@{ user_id = $userId; original_url = "https://example.com/another" } | ConvertTo-Json -Compress)
Check "POST /urls creates short url" "201" (Get-StatusCode "$BASE/urls" "POST" $createUrl2Body)
Check-True "short_code returned" (-not [string]::IsNullOrWhiteSpace($shortCode))
Check "GET /{short_code} redirects" "302" (Get-StatusCode "$BASE/$shortCode")
Check "GET /urls/{id} works" "200" (Get-StatusCode "$BASE/urls/$urlId")

$badUrlBody = (@{ user_id = $userId; original_url = "not-a-url" } | ConvertTo-Json -Compress)
Check "POST /urls invalid URL is rejected" "422" (Get-StatusCode "$BASE/urls" "POST" $badUrlBody)

$deactCreateBody = (@{ user_id = $userId; original_url = "https://deactivate.com" } | ConvertTo-Json -Compress)
$deactObj = Invoke-RestMethod -Uri "$BASE/urls" -Method Post -ContentType "application/json" -Body $deactCreateBody
$deactId = [int]$deactObj.id
$deactCode = "$($deactObj.short_code)"

$deactBody = (@{ is_active = $false } | ConvertTo-Json -Compress)
Invoke-RestMethod -Uri "$BASE/urls/$deactId" -Method Put -ContentType "application/json" -Body $deactBody | Out-Null
Check "Deactivated short code is blocked" "404" (Get-StatusCode "$BASE/$deactCode")

# Events checks
$events = (curl.exe -s "$BASE/events" | ConvertFrom-Json)
Check-True "GET /events returns entries" ($events.Count -gt 0)

$eventTypes = @{}
foreach ($e in $events) { $eventTypes[$e.event_type] = $true }
Check-True "Seed event type exists" ($eventTypes.ContainsKey("created"))
Check-True "App event type url_created exists" ($eventTypes.ContainsKey("url_created"))
Check-True "App event type url_visited exists" ($eventTypes.ContainsKey("url_visited"))
Check-True "App event type url_deactivated exists" ($eventTypes.ContainsKey("url_deactivated"))
Check-True "App event type user_created exists" ($eventTypes.ContainsKey("user_created"))

Check "GET /events filter by user" "200" (Get-StatusCode "$BASE/events?user_id=$userId")
Check "GET /events filter by url" "200" (Get-StatusCode "$BASE/events?url_id=$urlId")

# Redis chaos test
Write-Host "Stopping redis for fallback test..."
docker compose stop redis | Out-Null
Start-Sleep -Seconds 3
Check "Redirect works without redis" "302" (Get-StatusCode "$BASE/$shortCode")

Write-Host "Starting redis again..."
docker compose start redis | Out-Null
Start-Sleep -Seconds 3
Check "Redirect works after redis restart" "302" (Get-StatusCode "$BASE/$shortCode")

Write-Host "======================================"
Write-Host "RESULTS: $PASS passed, $FAIL failed"
Write-Host "======================================"

if ($FAIL -gt 0) {
    exit 1
}

exit 0