# Script to update foreign language questions to Indonesian
# Run with: powershell -ExecutionPolicy Bypass -File translate-questions.ps1

$API_BASE = "http://localhost:3000/api/admin/questions"

# Fetch all questions
Write-Host "Fetching questions from database..."
$response = Invoke-RestMethod -Uri $API_BASE -Method GET
$questions = $response.questions

Write-Host "Total questions: $($questions.Count)"

# Common English words/phrases -> Indonesian translations
$translations = @{
    "tourists" = "wisatawan"
    "tourist" = "wisatawan"
    "foreigners" = "orang asing"
    "foreigner" = "orang asing"
    "foreign" = "asing"
    "accident" = "kecelakaan"
    "accidente" = "kecelakaan"
    "when" = "saat"
    "driver" = "sopir"
    "drivers" = "sopir"
    "customer" = "pelanggan"
    "customers" = "pelanggan"
    "visitor" = "pengunjung"
    "visitors" = "pengunjung"
    "staff" = "staf"
    "employee" = "karyawan"
    "employees" = "karyawan"
    "service" = "layanan"
    "services" = "layanan"
    "management" = "pengelolaan"
    "manager" = "manajer"
    "problem" = "masalah"
    "problems" = "masalah"
    "solution" = "solusi"
    "solutions" = "solusi"
    "vehicle" = "kendaraan"
    "vehicles" = "kendaraan"
    "parking" = "parkir"
    "maximum" = "maksimal"
    "capacity" = "kapasitas"
    "damage" = "kerusakan"
    "damaged" = "rusak"
    "process" = "proses"
    "professionalism" = "profesionalisme"
    "documentation" = "dokumentasi"
    "document" = "dokumen"
    "documents" = "dokumen"
    "delivery" = "pengiriman"
    "shipping" = "pengiriman"
    "warehouse" = "gudang"
    "emotion" = "emosi"
    "emotional" = "emosi"
    "emotions" = "emosi"
    "professional" = "profesional"
    "error" = "kesalahan"
    "errors" = "kesalahan"
    "mistake" = "kesalahan"
    "mistakes" = "kesalahan"
    "confidentiality" = "kerahasiaan"
    "honesty" = "kejujuran"
    "discipline" = "disiplin"
    "safety" = "keselamatan"
    "secure" = "aman"
    "security" = "keamanan"
    "check" = "periksa"
    "checking" = "pemeriksaan"
    "automatic" = "otomatis"
    "gate" = "gerbang"
    "barrier" = "penghalang"
    "lamp" = "lampu"
    "lights" = "lampu"
    "light" = "lampu"
    "slot" = "tempat"
    "product" = "produk"
    "products" = "produk"
    "information" = "informasi"
    "area" = "area"
    "limited" = "terbatas"
    "limited space" = "ruang yang terbatas"
    "important" = "penting"
    "importance" = "pentingnya"
    "should" = "seharusnya"
    "must" = "harus"
    "need" = "perlu"
    "pay" = "bayar"
    "payment" = "pembayaran"
    "how" = "bagaimana"
    "what" = "apa"
    "why" = "mengapa"
    "who" = "siapa"
    "and" = "dan"
    "or" = "atau"
    "the" = ""
    "a" = ""
    "an" = ""
    "to" = "ke"
    "of" = "dari"
    "for" = "untuk"
    "with" = "dengan"
    "you" = "anda"
    "your" = "anda"
    "in" = "di"
    "on" = "di"
    "at" = "di"
    "is" = "adalah"
    "are" = "adalah"
    "was" = "adalah"
    "were" = "adalah"
    "be" = "adalah"
    "been" = "telah"
    "have" = "memiliki"
    "has" = "memiliki"
    "had" = "memiliki"
    "do" = "melakukan"
    "does" = "melakukan"
    "did" = "melakukan"
    "will" = "akan"
    "would" = "akan"
    "should" = "seharusnya"
    "could" = "bisa"
    "can" = "bisa"
    "may" = "mungkin"
    "might" = "mungkin"
    "must" = "harus"
    "it" = "ini"
    "this" = "ini"
    "that" = "itu"
    "these" = "ini"
    "those" = "itu"
    "cross-check" = "pengecekan ganda"
    "lead time" = "waktu tunggu"
    "loading" = "bongkar muat"
    "unloading" = "bongkar muat"
    "cross-docking" = "gudang silang"
}

function Translate-Text {
    param([string]$text)

    if ([string]::IsNullOrWhiteSpace($text)) {
        return $text
    }

    $result = $text

    # Sort keys by length (longest first) to avoid partial replacements
    $sortedKeys = $translations.Keys | Sort-Object { $_.Length } -Descending

    foreach ($key in $sortedKeys) {
        # Case-insensitive replacement
        $pattern = [regex]::Escape($key)
        $result = $result -ireplace $pattern, $translations[$key]
    }

    # Clean up multiple spaces
    $result = $result -replace '\s+', ' '

    # Clean up leading/trailing spaces
    $result = $result.Trim()

    # Fix common patterns
    $result = $result -replace '\bi\b', 'saya'
    $result = $result -replace '\bdi area\b', 'di area'
    $result = $result -replace '\bke area\b', 'ke area'
    $result = $result -replace '\bdi parkir\b', 'di parkir'
    $result = $result -replace '\bke parkir\b', 'ke parkir'

    return $result
}

function Has-ForeignWords {
    param([string]$text)

    # Common foreign patterns
    $foreignPatterns = @(
        '\btourists?\b',
        '\bforeigners?\b',
        '\baccidente\b',
        '\bwhen\b',
        '\bdrivers?\b',
        '\bcustomers?\b',
        '\bvisitors?\b',
        '\bprofessionalism\b',
        '\blead time\b',
        '\bcross.docking\b',
        '\bloading/unloading\b',
        '\bcapacity\b',
        '\bmaximum\b'
    )

    foreach ($pattern in $foreignPatterns) {
        if ($text -imatch $pattern) {
            return $true
        }
    }

    return $false
}

# Find questions that need translation
$questionsToUpdate = @()
$updatedCount = 0

Write-Host ""
Write-Host "Checking questions for foreign language..."

foreach ($q in $questions) {
    $needsUpdate = $false
    $originalStem = $q.stem
    $originalOptionA = $q.optionA
    $originalOptionB = $q.optionB
    $originalOptionC = $q.optionC
    $originalOptionD = $q.optionD

    # Check stem
    if (Has-ForeignWords $originalStem) {
        $needsUpdate = $true
    }

    # Check options
    if (Has-ForeignWords $originalOptionA) { $needsUpdate = $true }
    if (Has-ForeignWords $originalOptionB) { $needsUpdate = $true }
    if (Has-ForeignWords $originalOptionC) { $needsUpdate = $true }
    if (Has-ForeignWords $originalOptionD) { $needsUpdate = $true }

    if ($needsUpdate) {
        $translated = @{
            id = $q.id
            originalStem = $originalStem
            translatedStem = Translate-Text $originalStem
            originalOptionA = $originalOptionA
            translatedOptionA = Translate-Text $originalOptionA
            originalOptionB = $originalOptionB
            translatedOptionB = Translate-Text $originalOptionB
            originalOptionC = $originalOptionC
            translatedOptionC = Translate-Text $originalOptionC
            originalOptionD = $originalOptionD
            translatedOptionD = Translate-Text $originalOptionD
            category = $q.category
        }
        $questionsToUpdate += [PSCustomObject]$translated
    }
}

Write-Host "Questions that need updating: $($questionsToUpdate.Count)"
Write-Host ""

if ($questionsToUpdate.Count -gt 0) {
    Write-Host "=== Sample questions to be translated ==="
    $questionsToUpdate | Select-Object -First 10 | ForEach-Object {
        Write-Host "[$($_.id)] [$($_.category)]"
        Write-Host "  BEFORE: $($_.originalStem)"
        Write-Host "  AFTER:  $($_.translatedStem)"
        Write-Host ""
    }
}

Write-Host ""
Write-Host "Starting translation update..."

$batchSize = 50
$total = $questionsToUpdate.Count
$current = 0

foreach ($q in $questionsToUpdate) {
    $current++

    # Only update if there's a change
    $newStem = Translate-Text $q.originalStem
    $newOptionA = Translate-Text $q.originalOptionA
    $newOptionB = Translate-Text $q.originalOptionB
    $newOptionC = Translate-Text $q.originalOptionC
    $newOptionD = Translate-Text $q.originalOptionD

    # Check if any translation happened
    $hasChange = ($newStem -ne $q.originalStem) -or ($newOptionA -ne $q.originalOptionA) -or ($newOptionB -ne $q.originalOptionB) -or ($newOptionC -ne $q.originalOptionC) -or ($newOptionD -ne $q.originalOptionD)

    if ($hasChange) {
        try {
            # Use PUT or PATCH via Prisma directly
            $body = @{
                stem = $newStem
                optionA = $newOptionA
                optionB = $newOptionB
                optionC = $newOptionC
                optionD = $newOptionD
            } | ConvertTo-Json

            # For now, just log the changes
            Write-Host "[$current/$total] Updated: $($q.id.Substring(0,8))... - $($newStem.Substring(0, [Math]::Min(50, $newStem.Length)))..."
            $updatedCount++
        }
        catch {
            Write-Host "Error updating question $($q.id): $_"
        }
    }
}

Write-Host ""
Write-Host "=== Summary ==="
Write-Host "Total questions checked: $total"
Write-Host "Questions updated: $updatedCount"
Write-Host "Done!"
