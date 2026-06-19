param(
  [string]$ProjectPath = "D:\PersonalSite\ameko-ry-theater",
  [string]$Remote = "origin",
  [string]$Branch = "main",
  [string]$ProcessName = "ameko-ry-theater",
  [ValidateSet("pm2", "none")]
  [string]$RestartMode = "pm2"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-DeployLog {
  param(
    [string]$Message,
    [string]$Level = "INFO"
  )

  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$timestamp][$Level] $Message"
  Write-Host $line
  Add-Content -LiteralPath $script:LogFile -Value $line -Encoding UTF8
}

function Invoke-DeployCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  $displayCommand = "$FilePath $($Arguments -join ' ')"
  Write-DeployLog "Running: $displayCommand"

  $output = & $FilePath @Arguments 2>&1
  $exitCode = $LASTEXITCODE

  foreach ($line in $output) {
    if ($null -ne $line) {
      Write-DeployLog $line.ToString() "CMD"
    }
  }

  if ($exitCode -ne 0) {
    throw "Command failed with exit code ${exitCode}: $displayCommand"
  }

  return $output
}

function Test-RequiredCommand {
  param([string]$CommandName)

  if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
    throw "Required command '$CommandName' was not found in PATH."
  }
}

function Get-GitValue {
  param([string[]]$Arguments)

  $output = Invoke-DeployCommand "git" $Arguments
  return ($output | Select-Object -Last 1).ToString().Trim()
}

function Get-DependencyFingerprint {
  $files = @("package.json", "package-lock.json", "npm-shrinkwrap.json")
  $parts = foreach ($file in $files) {
    $fullPath = Join-Path $ProjectPath $file
    if (Test-Path -LiteralPath $fullPath) {
      $hash = (Get-FileHash -LiteralPath $fullPath -Algorithm SHA256).Hash
      "${file}:${hash}"
    } else {
      "${file}:<missing>"
    }
  }

  return $parts -join "|"
}

function Test-GitAncestor {
  param(
    [string]$Ancestor,
    [string]$Descendant
  )

  & git merge-base --is-ancestor $Ancestor $Descendant 2>$null
  return $LASTEXITCODE -eq 0
}

function Install-DependenciesIfNeeded {
  param(
    [string]$BeforeFingerprint,
    [string]$AfterFingerprint
  )

  if ($BeforeFingerprint -eq $AfterFingerprint) {
    Write-DeployLog "Dependency files did not change; skipping dependency install."
    return
  }

  if (Test-Path -LiteralPath (Join-Path $ProjectPath "package-lock.json")) {
    Write-DeployLog "Dependency files changed; running npm ci."
    Invoke-DeployCommand "npm" @("ci")
  } else {
    Write-DeployLog "Dependency files changed; package-lock.json missing, running npm install."
    Invoke-DeployCommand "npm" @("install")
  }
}

function Restart-Site {
  if ($RestartMode -eq "none") {
    Write-DeployLog "RestartMode is none; build completed but site process was not restarted." "WARN"
    return
  }

  if (-not (Get-Command "pm2" -ErrorAction SilentlyContinue)) {
    throw "PM2 was not found. Install it with 'npm install -g pm2' or rerun with -RestartMode none for a build-only update."
  }

  $null = & pm2 describe $ProcessName 2>$null
  $processExists = $LASTEXITCODE -eq 0

  if ($processExists) {
    Write-DeployLog "Reloading PM2 process '$ProcessName'."
    Invoke-DeployCommand "pm2" @("reload", $ProcessName, "--update-env")
  } else {
    Write-DeployLog "PM2 process '$ProcessName' was not found; starting npm run start."
    Invoke-DeployCommand "pm2" @("start", "npm", "--name", $ProcessName, "--", "run", "start")
  }

  Invoke-DeployCommand "pm2" @("save")
}

if (-not (Test-Path -LiteralPath $ProjectPath)) {
  throw "ProjectPath does not exist: $ProjectPath"
}

$ProjectPath = (Resolve-Path -LiteralPath $ProjectPath).Path
$logDirectory = Join-Path $ProjectPath "logs\deploy"
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
$script:LogFile = Join-Path $logDirectory ("deploy-update-{0}.log" -f (Get-Date -Format "yyyy-MM-dd"))

try {
  Write-DeployLog "Starting deploy update for $ProjectPath."
  Set-Location -LiteralPath $ProjectPath

  Test-RequiredCommand "git"
  Test-RequiredCommand "npm"
  Test-RequiredCommand "npx"

  $currentBranch = Get-GitValue @("branch", "--show-current")
  if ($currentBranch -ne $Branch) {
    throw "Current branch is '$currentBranch', expected '$Branch'. Checkout the deployment branch before updating."
  }

  $workingTreeStatus = Invoke-DeployCommand "git" @("status", "--porcelain")
  if (($workingTreeStatus | Measure-Object).Count -gt 0) {
    throw "Working tree is not clean. Commit, stash, or discard local changes before deploying."
  }

  Invoke-DeployCommand "git" @("fetch", $Remote, $Branch)

  $localHead = Get-GitValue @("rev-parse", "HEAD")
  $remoteRef = "$Remote/$Branch"
  $remoteHead = Get-GitValue @("rev-parse", $remoteRef)

  Write-DeployLog "Local HEAD: $localHead"
  Write-DeployLog "$remoteRef HEAD: $remoteHead"

  if ($localHead -eq $remoteHead) {
    Write-DeployLog "No updates found. Exiting without build or restart."
    exit 0
  }

  $remoteContainsLocal = Test-GitAncestor "HEAD" $remoteRef
  $localContainsRemote = Test-GitAncestor $remoteRef "HEAD"

  if (-not $remoteContainsLocal) {
    if ($localContainsRemote) {
      Write-DeployLog "Local branch is ahead of $remoteRef. No remote update will be applied." "WARN"
      exit 0
    }

    throw "Local HEAD and $remoteRef have diverged. Resolve Git history manually before deploying."
  }

  $beforeDependencyFingerprint = Get-DependencyFingerprint

  Invoke-DeployCommand "git" @("pull", "--ff-only", $Remote, $Branch)

  $afterDependencyFingerprint = Get-DependencyFingerprint
  Install-DependenciesIfNeeded $beforeDependencyFingerprint $afterDependencyFingerprint

  Invoke-DeployCommand "npx" @("prisma", "generate")
  Invoke-DeployCommand "npm" @("run", "build")

  Restart-Site

  $newHead = Get-GitValue @("rev-parse", "HEAD")
  Write-DeployLog "Deploy update completed successfully at HEAD $newHead."
  exit 0
} catch {
  Write-DeployLog $_.Exception.Message "ERROR"
  Write-DeployLog "Deploy update failed. Check this log before retrying: $script:LogFile" "ERROR"
  exit 1
}
