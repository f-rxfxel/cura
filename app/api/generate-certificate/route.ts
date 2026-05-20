import { type NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import * as fs from 'fs'
import * as path from 'path'

// Ensure this route runs on the Node runtime (required for jspdf)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { playerName, totalPercentage, date } = await request.json()

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Background gradient effect (using rectangles)
    doc.setFillColor(240, 252, 252)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Border
    doc.setDrawColor(0, 164, 164)
    doc.setLineWidth(2)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

    // Inner border
    doc.setDrawColor(102, 204, 204)
    doc.setLineWidth(0.5)
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

    // Load and add logo
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png')
      const logoImage = fs.readFileSync(logoPath)
      const logoBase64 = `data:image/png;base64,${logoImage.toString('base64')}`

      // Add logo with proportional size
      const logoX = 70
      const logoY = 20
      const maxLogoHeight = 35 // Maximum height in mm

      // Add image and let jsPDF maintain aspect ratio
      doc.addImage(logoBase64, 'PNG', logoX, logoY, 0, maxLogoHeight)
    } catch (error) {
      console.error('Error loading logo:', error)
    }

    // Title
    doc.setFontSize(40)
    doc.setTextColor(0, 164, 164)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO', pageWidth / 2, 40, { align: 'center' })

    // Subtitle
    doc.setFontSize(16)
    doc.setTextColor(80, 80, 80)
    doc.setFont('helvetica', 'normal')
    doc.text('DE CONCLUSÃO', pageWidth / 2, 52, { align: 'right' })

    // Decorative line
    doc.setDrawColor(0, 164, 164)
    doc.setLineWidth(0.5)
    doc.line(60, 58, pageWidth - 60, 58)

    // Main text
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    doc.text('Certificamos que', pageWidth / 2, 75, { align: 'center' })

    // Player name
    doc.setFontSize(28)
    doc.setTextColor(0, 130, 130)
    doc.setFont('helvetica', 'bold')
    doc.text(playerName, pageWidth / 2, 90, { align: 'center' })

    // Achievement text
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    const achievementText = 'concluiu com sucesso todas as 6 fases do'
    doc.text(achievementText, pageWidth / 2, 105, { align: 'center' })

    // Game title
    doc.setFontSize(22)
    doc.setTextColor(0, 164, 164)
    doc.setFont('helvetica', 'bold')
    doc.text('CicatriGame', pageWidth / 2, 118, { align: 'center' })

    // Performance box
    doc.setFillColor(230, 250, 250)
    doc.setDrawColor(0, 164, 164)
    doc.setLineWidth(1)
    doc.roundedRect(pageWidth / 2 - 40, 128, 80, 25, 3, 3, 'FD')

    doc.setFontSize(12)
    doc.setTextColor(80, 80, 80)
    doc.setFont('helvetica', 'normal')
    doc.text('Desempenho Total', pageWidth / 2, 137, { align: 'center' })

    doc.setFontSize(32)
    doc.setTextColor(0, 164, 164)
    doc.setFont('helvetica', 'bold')
    doc.text(`${totalPercentage}%`, pageWidth / 2, 148, { align: 'center' })

    // Date
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(`Data de conclusão: ${date}`, pageWidth / 2, 168, {
      align: 'center',
    })

    // Footer text
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.setFont('helvetica', 'italic')
    doc.text(
      'Este certificado atesta a conclusão bem-sucedida de todas as fases do CicatriGame,',
      pageWidth / 2,
      175,
      {
        align: 'center',
      }
    )
    doc.text(
      'demonstrando conhecimento em definição do cateter CicatriGame, indicações para inserção,',
      pageWidth / 2,
      181,
      { align: 'center' }
    )
    doc.text(
      'técnica de passagem, cuidados de manutenção, e critérios para remoção.',
      pageWidth / 2,
      187,
      { align: 'center' }
    )

    // Generate PDF as an ArrayBuffer and convert to Uint8Array for the response
    const pdfArrayBuffer = doc.output('arraybuffer')
    const pdfUint8 = new Uint8Array(pdfArrayBuffer)

    // Return PDF as response (binary)
    return new NextResponse(pdfUint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${playerName.replace(
          /\s+/g,
          '-'
        )}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    )
  }
}
