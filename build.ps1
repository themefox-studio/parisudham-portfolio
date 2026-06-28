$publicDir = "C:\Users\arunr\.gemini\antigravity\scratch\parisudham-portfolio\public"
$outDir = "C:\Users\arunr\.gemini\antigravity\scratch\parisudham-portfolio\preview_build"
$dataFile = "C:\Users\arunr\.gemini\antigravity\scratch\parisudham-portfolio\data\database.json"

if (Test-Path $outDir) { Remove-Item -Path $outDir -Recurse -Force }
Copy-Item -Path $publicDir -Destination $outDir -Recurse -Force

$dbRaw = Get-Content -Raw -Path $dataFile
$dbObj = $dbRaw | ConvertFrom-Json
$dbObj.PSObject.Properties.Remove('users')
$staticDataJs = "window.STATIC_DB = " + ($dbObj | ConvertTo-Json -Depth 10 -Compress) + ";"
$staticDataJsPath = Join-Path $outDir "js\static-data.js"
Set-Content -Path $staticDataJsPath -Value $staticDataJs -Encoding UTF8

$mainJsPath = Join-Path $outDir "js\main.js"
$mainJs = Get-Content -Raw -Path $mainJsPath
$mainJs = $mainJs -replace '(?s)async function fetchSiteData\(\) \{.*?\}', "async function fetchSiteData() {`n    return window.STATIC_DB || { categories: [], products: [], siteDetails: {} };`n}"
Set-Content -Path $mainJsPath -Value $mainJs -Encoding UTF8

$htmlFiles = Get-ChildItem -Path $outDir -Filter "*.html"
foreach ($file in $htmlFiles) {
    $html = Get-Content -Raw -Path $file.FullName
    $html = $html -replace '<script src="js/main.js"></script>', "<script src=`"js/static-data.js`"></script>`n    <script src=`"js/main.js`"></script>"
    Set-Content -Path $file.FullName -Value $html -Encoding UTF8
}

Compress-Archive -Path "$outDir\*" -DestinationPath "C:\Users\arunr\.gemini\antigravity\scratch\parisudham-portfolio\Parisudham_Static_Preview.zip" -Force
