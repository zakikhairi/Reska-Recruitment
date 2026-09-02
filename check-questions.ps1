$data = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/questions' -Method GET
$questions = $data.questions

# Check for non-Indonesian questions
$nonIndonesian = @()
foreach ($q in $questions) {
    # Common non-Indonesian patterns
    if ($q.stem -match 'the\b|\bis\b|\band\b|\bto\b|\bof\b|\bfor\b|\bwith\b|\byou\b|\bthis\b|\bthat\b|\ba\b|\bin\b|what|how|when|where|why|which|who|whose|is|are|was|were|been|have|has|had|do|does|did|will|would|should|could|may|might|must|can') {
        $nonIndonesian += [PSCustomObject]@{
            id = $q.id
            stem = $q.stem
            category = $q.category
        }
    }
}

Write-Host "Total questions: $($questions.Count)"
Write-Host "Non-Indonesian detected: $($nonIndonesian.Count)"
Write-Host ""
Write-Host "=== Sample of non-Indonesian questions ==="
$nonIndonesian | Select-Object -First 30 | ForEach-Object {
    Write-Host "[$($_.id)] [$($_.category)] $($_.stem.Substring(0, [Math]::Min(100, $_.stem.Length)))..."
}
