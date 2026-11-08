# Shows the site on this computer only, at http://localhost:8321/ . Nothing goes online.
# Run it from PowerShell:  powershell -ExecutionPolicy Bypass -File preview.ps1
# Press Ctrl+C to stop.
$root = Join-Path $PSScriptRoot 'site'
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.jpg'='image/jpeg'; '.png'='image/png'; '.gif'='image/gif'; '.svg'='image/svg+xml'; '.ico'='image/x-icon'; '.mp3'='audio/mpeg'; '.xml'='application/xml'; '.txt'='text/plain; charset=utf-8'; '.woff2'='font/woff2' }
$l = New-Object Net.HttpListener
$l.Prefixes.Add('http://localhost:8321/')
$l.Start()
Write-Host 'Site running at http://localhost:8321/'
while ($l.IsListening) {
  $c = $l.GetContext(); $res = $c.Response
  try {
    $path = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath)
    if ($path.EndsWith('/')) { $path += 'index.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $root $path.TrimStart('/')))
    $status = 200
    if (-not $file.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $file -PathType Leaf)) { $file = Join-Path $root '404.html'; $status = 404 }
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $res.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
    $res.AddHeader('Accept-Ranges','bytes')
    $fs = [IO.File]::OpenRead($file)
    try {
      $start = 0L; $end = $fs.Length - 1
      $range = $c.Request.Headers['Range']
      if ($status -eq 200 -and $range -match 'bytes=(\d+)-(\d*)') {
        $start = [long]$Matches[1]; if ($Matches[2]) { $end = [Math]::Min([long]$Matches[2], $end) }
        $end = [Math]::Min($end, $start + 512KB - 1)  # small pieces, so a playing MP3 doesn't hold up other pages
        $status = 206; $res.AddHeader('Content-Range', "bytes $start-$end/$($fs.Length)")
      }
      $res.StatusCode = $status
      $res.ContentLength64 = $end - $start + 1
      if ($c.Request.HttpMethod -ne 'HEAD') {
        [void]$fs.Seek($start,'Begin'); $buf = New-Object byte[] 65536; $left = $end - $start + 1
        while ($left -gt 0) { $n = $fs.Read($buf,0,[Math]::Min($buf.Length,$left)); if ($n -le 0) { break }; $res.OutputStream.Write($buf,0,$n); $left -= $n }
      }
    } finally { $fs.Close() }
  } catch { } finally { try { $res.Close() } catch { } }
}
