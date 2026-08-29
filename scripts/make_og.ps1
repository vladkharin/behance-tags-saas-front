Add-Type -AssemblyName System.Drawing
$width = 1200
$height = 630
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Background dark gradient
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(10, 10, 15), [System.Drawing.Color]::FromArgb(18, 22, 38), [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
$g.FillRectangle($brush, $rect)

# Glow borders
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 0, 87, 255), 3)
$g.DrawRectangle($borderPen, 30, 30, $width - 60, $height - 60)

# Logo badge
$logoRect = New-Object System.Drawing.Rectangle(90, 85, 75, 75)
$logoBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 87, 255))
$g.FillRectangle($logoBrush, $logoRect)
$fontLogo = New-Object System.Drawing.Font("Arial", 40, [System.Drawing.FontStyle]::Bold)
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.DrawString("B", $fontLogo, $whiteBrush, 106, 92)

# Brand title
$fontTitle = New-Object System.Drawing.Font("Arial", 42, [System.Drawing.FontStyle]::Bold)
$g.DrawString("BeRanked", $fontTitle, $whiteBrush, 185, 95)
$fontSuite = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 87, 255))
$g.DrawString("SEO SUITE FOR BEHANCE", $fontSuite, $blueBrush, 430, 112)

# Subtitle
$fontSub = New-Object System.Drawing.Font("Arial", 26, [System.Drawing.FontStyle]::Regular)
$grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 220, 240))
$g.DrawString("Выводите свои кейсы в ТОП поиска Behance на основе данных", $fontSub, $grayBrush, 90, 200)

# 3 Feature Pills
$fontPill = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Bold)
$pillBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 32, 50))
$pillGreen = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(50, 215, 100))
$pillBlue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 180, 255))
$pillAmber = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 200, 50))

# Pill 1
$g.FillRectangle($pillBg, 90, 285, 320, 60)
$g.DrawString("[+] Трекинг позиций 24/7", $fontPill, $pillBlue, 110, 302)

# Pill 2
$g.FillRectangle($pillBg, 440, 285, 320, 60)
$g.DrawString("[*] 100% Без риска бана", $fontPill, $pillGreen, 460, 302)

# Pill 3
$g.FillRectangle($pillBg, 790, 285, 320, 60)
$g.DrawString("[#] Умная матрица тегов", $fontPill, $pillAmber, 810, 302)

# Mock Tag Chips
$fontChip = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
$chipGreenBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 60, 35))
$g.FillRectangle($chipGreenBg, 90, 385, 260, 60)
$g.DrawString("#ui ux design    #2", $fontChip, $pillGreen, 110, 400)

$g.FillRectangle($chipGreenBg, 375, 385, 260, 60)
$g.DrawString("#mobile app      #4", $fontChip, $pillGreen, 395, 400)

$chipBlueBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 45, 80))
$g.FillRectangle($chipBlueBg, 660, 385, 240, 60)
$g.DrawString("#figma           #7", $fontChip, $pillBlue, 680, 400)

# Bottom URL & Badge
$fontUrl = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$g.DrawString("https://beranked.domcraft.digital", $fontUrl, $whiteBrush, 90, 505)

$bmp.Save("public/og-image.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "OG image successfully saved to public/og-image.png"
