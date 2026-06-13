param(
    [int]$RetryCount = 3,
    [switch]$SkipClean,
    [int]$TestTimeoutSeconds = 180,
    [switch]$BuildOnly
)

$ErrorActionPreference = "Stop"

function Resolve-LatestDirectory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$Filter
    )

    if (-not (Test-Path $Path)) {
        return $null
    }

    Get-ChildItem -Path $Path -Directory -Filter $Filter -ErrorAction SilentlyContinue |
        Sort-Object -Property Name -Descending |
        Select-Object -First 1
}

function Resolve-SwiftEnvironment {
    $swiftRoot = Join-Path $env:LOCALAPPDATA "Programs\Swift"

    $toolchainDir = Resolve-LatestDirectory -Path (Join-Path $swiftRoot "Toolchains") -Filter "*"
    $runtimeDir = Resolve-LatestDirectory -Path (Join-Path $swiftRoot "Runtimes") -Filter "*"
    $platformDir = Resolve-LatestDirectory -Path (Join-Path $swiftRoot "Platforms") -Filter "*"

    if (-not $toolchainDir) {
        throw "No Swift toolchain found under $swiftRoot\Toolchains"
    }

    if (-not $runtimeDir) {
        throw "No Swift runtime found under $swiftRoot\Runtimes"
    }

    if (-not $platformDir) {
        throw "No Swift platform SDK found under $swiftRoot\Platforms"
    }

    $toolBin = Join-Path $toolchainDir.FullName "usr\bin"
    $runtimeBin = Join-Path $runtimeDir.FullName "usr\bin"
    $sdkRoot = Join-Path $platformDir.FullName "Windows.platform\Developer\SDKs\Windows.sdk"

    $swiftExe = Join-Path $toolBin "swift.exe"
    $swiftCoreDll = Join-Path $runtimeBin "swiftCore.dll"

    if (-not (Test-Path $swiftExe)) {
        throw "Swift executable not found at $swiftExe"
    }

    if (-not (Test-Path $swiftCoreDll)) {
        throw "Swift runtime not found at $swiftCoreDll"
    }

    if (-not (Test-Path $sdkRoot)) {
        throw "Windows Swift SDK not found at $sdkRoot"
    }

    return [PSCustomObject]@{
        ToolBin = $toolBin
        RuntimeBin = $runtimeBin
        SDKRoot = $sdkRoot
        SwiftExe = $swiftExe
    }
}

function Resolve-LinkerDirectory {
    $vsRoots = @(
        "C:\Program Files (x86)\Microsoft Visual Studio",
        "C:\Program Files\Microsoft Visual Studio"
    )

    foreach ($root in $vsRoots) {
        if (-not (Test-Path $root)) {
            continue
        }

        $link = Get-ChildItem -Path $root -Recurse -Filter "link.exe" -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -like "*\VC\Tools\MSVC\*\bin\Hostx64\x64\link.exe" } |
            Sort-Object -Property FullName -Descending |
            Select-Object -First 1

        if ($link) {
            return $link.Directory.FullName
        }
    }

    throw "MSVC linker (link.exe) not found. Install Visual Studio Build Tools with C++ workload."
}

function Initialize-Environment {
    param(
        [Parameter(Mandatory = $true)]
        [string]$LinkDir,
        [Parameter(Mandatory = $true)]
        [string]$RuntimeBin,
        [Parameter(Mandatory = $true)]
        [string]$ToolBin,
        [Parameter(Mandatory = $true)]
        [string]$SDKRoot
    )

    $env:PATH = "$LinkDir;$RuntimeBin;$ToolBin;" + $env:PATH
    $env:SDKROOT = $SDKRoot
}

function Cleanup-BuildArtifacts {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ProjectRoot,
        [Parameter(Mandatory = $true)]
        [string]$ScratchPath
    )

    if (Test-Path $ScratchPath) {
        Remove-Item -Path $ScratchPath -Force -Recurse -ErrorAction SilentlyContinue
    }

    $debugLink = Join-Path $ProjectRoot ".build\debug"
    if (Test-Path $debugLink) {
        Remove-Item -Path $debugLink -Force -Recurse -ErrorAction SilentlyContinue
    }
}

$projectRoot = Split-Path -Parent $PSScriptRoot

$swift = Resolve-SwiftEnvironment
$linkDir = Resolve-LinkerDirectory

Initialize-Environment -LinkDir $linkDir -RuntimeBin $swift.RuntimeBin -ToolBin $swift.ToolBin -SDKRoot $swift.SDKRoot

Write-Host "Swift executable: $($swift.SwiftExe)"
Write-Host "MSVC linker dir: $linkDir"
Write-Host "SDKROOT: $($swift.SDKRoot)"

Set-Location $projectRoot

if (-not $SkipClean) {
    & $swift.SwiftExe package clean
    if ($LASTEXITCODE -ne 0) {
        throw "swift package clean failed with exit code $LASTEXITCODE"
    }
}

for ($attempt = 1; $attempt -le $RetryCount; $attempt++) {
    $swiftSubcommand = if ($BuildOnly) { "build" } else { "test" }
    Write-Host "Running swift $swiftSubcommand (attempt $attempt/$RetryCount)..."

    $attemptScratchPath = Join-Path $projectRoot ".build\attempt-$attempt"

    Cleanup-BuildArtifacts -ProjectRoot $projectRoot -ScratchPath $attemptScratchPath

    $process = Start-Process -FilePath $swift.SwiftExe -ArgumentList @($swiftSubcommand, "--scratch-path", $attemptScratchPath) -NoNewWindow -PassThru
    $null = $process | Wait-Process -Timeout $TestTimeoutSeconds -ErrorAction SilentlyContinue

    if (-not $process.HasExited) {
        Write-Warning "swift $swiftSubcommand timed out after $TestTimeoutSeconds seconds; terminating process."
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        $exitCode = 124
    }
    else {
        $exitCode = $process.ExitCode
    }

    if ($exitCode -eq 0) {
        Write-Host "swift $swiftSubcommand succeeded on attempt $attempt"
        exit 0
    }

    Write-Warning "swift $swiftSubcommand failed with exit code $exitCode"

    if ($attempt -lt $RetryCount) {
        Write-Host "Retrying after cleanup..."
    }
}

if ($BuildOnly) {
    throw "swift build failed after $RetryCount attempts"
}

throw "swift test failed after $RetryCount attempts"
