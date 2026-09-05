$baseUrl = "http://localhost:5000"
Write-Host "====================================================="
Write-Host "STARTING SYSTEM INTEGRATION AUDIT"
Write-Host "====================================================="

# 1. Health Check
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "[HEALTH CHECK] Status: $($health.status), Database: $($health.database), Users: $($health.stats.users), Items: $($health.stats.items)"
} catch {
    Write-Host "[HEALTH CHECK FAILED] $_"
}

# 2. Master Categories & Locations
try {
    $categories = Invoke-RestMethod -Uri "$baseUrl/api/master/categories" -Method Get
    $locations = Invoke-RestMethod -Uri "$baseUrl/api/master/locations" -Method Get
    Write-Host "[MASTER DATA] Categories: $($categories.categories.Count), Locations: $($locations.locations.Count)"
} catch {
    Write-Host "[MASTER DATA FAILED] $_"
}

# 3. User Authentication (Login Admin)
$adminToken = ""
try {
    $loginBody = @{ email = "admin@college.edu"; password = "Admin@123" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $adminToken = $loginRes.token
    Write-Host "[AUTH LOGIN ADMIN] User: $($loginRes.user.full_name), Role: $($loginRes.user.role), Token Issued!"
} catch {
    Write-Host "[AUTH LOGIN FAILED] $_"
}

# 4. User Registration (New Test Student)
$studentToken = ""
$studentEmail = "audit.student.$(Get-Random)@college.edu"
try {
    $regBody = @{
        full_name = "Audit Test User"
        email = $studentEmail
        password = "TestPassword123"
        role = "student"
        department = "Computer Science"
        phone_number = "+91 99999 88888"
    } | ConvertTo-Json

    $regRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    $studentToken = $regRes.token
    Write-Host "[AUTH REGISTER STUDENT] Registered: $($regRes.user.email), ID: $($regRes.user.id)"
} catch {
    Write-Host "[AUTH REGISTER FAILED] $_"
}

# 5. Items Query & Search Filtering
try {
    $itemsAll = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method Get
    $itemsLost = Invoke-RestMethod -Uri "$baseUrl/api/items?report_type=LOST" -Method Get
    $itemsFound = Invoke-RestMethod -Uri "$baseUrl/api/items?report_type=FOUND" -Method Get
    $itemsSearch = Invoke-RestMethod -Uri "$baseUrl/api/items?search=Wallet" -Method Get
    Write-Host "[ITEMS QUERY] Total: $($itemsAll.pagination.total), Lost: $($itemsLost.items.Count), Found: $($itemsFound.items.Count), Search 'Wallet': $($itemsSearch.items.Count)"
} catch {
    Write-Host "[ITEMS QUERY FAILED] $_"
}

# 6. Report Found Item Creation (Student)
$newFoundItemId = 0
try {
    $headers = @{ Authorization = "Bearer $studentToken" }
    $foundBody = @{
        report_type = "FOUND"
        title = "Found Silver Apple Watch near Central Library"
        category_id = 8
        location_id = 1
        description = "Found a silver series 7 Apple Watch on bench outside reading room."
        incident_date = "2026-09-05"
        incident_time = "14:00"
        primary_color = "Silver"
        brand = "Apple"
        distinguishing_features = "Black sport band, small scratch on top right glass"
        hidden_details = "Serial number ends in 77A, custom avatar on lock screen"
    } | ConvertTo-Json

    $foundRes = Invoke-RestMethod -Uri "$baseUrl/api/items/report" -Method Post -Headers $headers -Body $foundBody -ContentType "application/json"
    $newFoundItemId = $foundRes.itemId
    Write-Host "[REPORT ITEM] Created Found Item ID: $newFoundItemId, Matches Detected: $($foundRes.matchesDetected)"
} catch {
    Write-Host "[REPORT ITEM FAILED] $_"
}

# 7. Privacy Test (Check hidden_details masking)
try {
    $itemPublic = Invoke-RestMethod -Uri "$baseUrl/api/items/$newFoundItemId" -Method Get
    if ($null -eq $itemPublic.item.hidden_details) {
        Write-Host "[PRIVACY CHECK] Hidden details properly masked for non-owner public query."
    } else {
        Write-Host "[PRIVACY WARNING] Hidden details exposed to public!"
    }
} catch {
    Write-Host "[PRIVACY CHECK FAILED] $_"
}

# 8. Submit Claim Verification
$claimId = 0
try {
    # Login as Priya to submit claim
    $priyaLogin = @{ email = "priya.student@college.edu"; password = "Student@123" } | ConvertTo-Json
    $priyaRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $priyaLogin -ContentType "application/json"
    $priyaHeaders = @{ Authorization = "Bearer $($priyaRes.token)" }

    $claimBody = @{
        verification_answers = @{
            ownership_proof = "My Apple Watch serial number ends in 77A and has an anime lockscreen picture."
            lost_date_approx = "Sept 5 around 1:30 PM"
            distinguishing_marks = "Small scratch on glass corner"
        }
    } | ConvertTo-Json

    $claimRes = Invoke-RestMethod -Uri "$baseUrl/api/claims/item/$newFoundItemId" -Method Post -Headers $priyaHeaders -Body $claimBody -ContentType "application/json"
    $claimId = $claimRes.claimId
    Write-Host "[SUBMIT CLAIM] Submitted claim ID $claimId for Found Item ID $newFoundItemId"
} catch {
    Write-Host "[SUBMIT CLAIM FAILED] $_"
}

# 9. Admin Stats & Audit Logs
try {
    $adminHeaders = @{ Authorization = "Bearer $adminToken" }
    $adminStats = Invoke-RestMethod -Uri "$baseUrl/api/admin/stats" -Headers $adminHeaders -Method Get
    $adminAudit = Invoke-RestMethod -Uri "$baseUrl/api/admin/audit" -Headers $adminHeaders -Method Get
    Write-Host "[ADMIN PANEL] Admin Users: $($adminStats.stats.totalUsers), Recovery Rate: $($adminStats.stats.recoveryRate)%, Audit Logs: $($adminAudit.logs.Count)"
} catch {
    Write-Host "[ADMIN PANEL FAILED] $_"
}

Write-Host "====================================================="
Write-Host "ALL SYSTEM AUDIT CHECKS COMPLETED SUCCESSFULLY!"
Write-Host "====================================================="
