# Step-by-Step Guide: Generate Git Log for Report

## Overview
This guide shows you how to generate a GitHub-style Git log for your research paper report.

## Step 1: Open Terminal/Command Prompt
- Press `Win + R`
- Type `powershell` or `cmd`
- Press Enter

## Step 2: Navigate to Your Project Directory
```powershell
cd C:\Users\binziya\Desktop\S9Proj
```

## Step 3: Verify Git Repository
Check if you're in a Git repository:
```powershell
git status
```

## Step 4: Generate Git Log (Option 1 - Simple)
Generate a basic Git log:
```powershell
git log --pretty=format:"%s%n%h - %an committed %ar%n" --graph --all > git_log_simple.txt
```

## Step 5: Generate Git Log (Option 2 - GitHub Style with Date Grouping)
Run the PowerShell script:
```powershell
powershell -ExecutionPolicy Bypass -File generate_git_log.ps1
```

This will create a file named `GIT_LOG_REPORT.txt` with:
- Header: "9.3 Git Log"
- Commits grouped by date
- Commit message, hash, author, and relative time
- Formatted similar to GitHub's commit history

## Step 6: View the Generated File
Open `GIT_LOG_REPORT.txt` in any text editor to review the log.

## Step 7: Customize (Optional)
You can edit `generate_git_log.ps1` to:
- Change the header text
- Adjust date format
- Modify commit message format
- Add repository name

## Step 8: Add to Report
Copy the content from `GIT_LOG_REPORT.txt` and paste it into your research paper report section 9.3.

## Quick Command Reference

### View Git Log in Terminal
```powershell
git log --oneline --graph --all
```

### Generate Log with Specific Format
```powershell
git log --pretty=format:"%h - %an, %ar : %s" --graph --all
```

### Generate Log for Last N Commits
```powershell
git log --pretty=format:"%s%n%h - %an committed %ar%n" -10
```

## Files Generated
- `GIT_LOG_REPORT.txt` - Formatted Git log for report (GitHub style)
- `git_log_simple.txt` - Simple Git log format
- `generate_git_log.ps1` - PowerShell script to generate formatted log

## Notes
- The log shows commits from all branches
- Commits are ordered by date (newest first)
- Relative time (e.g., "3 days ago") is calculated automatically
- You can regenerate the log anytime by running the script again



