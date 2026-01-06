# Generate GitHub-style Git Log for Report
# This script creates a formatted git log similar to GitHub's commit history

$outputFile = "GIT_LOG_REPORT.txt"

# Header
$header = @"
9.3 Git Log

Commits TravelEase Hub

"@

# Generate git log with date grouping
$gitLog = git log --pretty=format:"%ad|%s|%h|%an" --date=format:"%Y-%m-%d" --all --reverse

$output = $header
$currentDate = ""
$dateGroups = @{}

# Group commits by date
foreach ($line in $gitLog) {
    if ($line -match "^(\d{4}-\d{2}-\d{2})\|(.+)\|([a-f0-9]+)\|(.+)") {
        $date = $matches[1]
        $message = $matches[2]
        $hash = $matches[3]
        $author = $matches[4]
        
        # Convert date to readable format
        $dateObj = [DateTime]::ParseExact($date, "yyyy-MM-dd", $null)
        $readableDate = $dateObj.ToString("MMM dd, yyyy")
        
        if (-not $dateGroups.ContainsKey($readableDate)) {
            $dateGroups[$readableDate] = @()
        }
        
        $dateGroups[$readableDate] += @{
            Message = $message
            Hash = $hash
            Author = $author
            DateObj = $dateObj
        }
    }
}

# Format output by date groups (newest first)
$sortedDates = $dateGroups.Keys | Sort-Object -Descending { [DateTime]::Parse($_) }

foreach ($date in $sortedDates) {
    $output += "`nCommits on $date`n`n"
    
    foreach ($commit in $dateGroups[$date]) {
        # Calculate relative time
        $timeSpan = (Get-Date) - $commit.DateObj
        $relativeTime = ""
        
        if ($timeSpan.Days -gt 0) {
            if ($timeSpan.Days -eq 1) {
                $relativeTime = "1 day ago"
            } else {
                $relativeTime = "$($timeSpan.Days) days ago"
            }
        } elseif ($timeSpan.Hours -gt 0) {
            $relativeTime = "$($timeSpan.Hours) hours ago"
        } elseif ($timeSpan.Minutes -gt 0) {
            $relativeTime = "$($timeSpan.Minutes) minutes ago"
        } else {
            $relativeTime = "just now"
        }
        
        $output += "  $($commit.Message)`n"
        $output += "  $($commit.Hash) - $($commit.Author) committed $relativeTime`n`n"
    }
}

# Write to file
$output | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "Git log generated successfully: $outputFile" -ForegroundColor Green
Write-Host "Total commits: $($gitLog.Count)" -ForegroundColor Cyan



