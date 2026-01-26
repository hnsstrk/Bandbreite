<script lang="ts">
  import { jsPDF } from 'jspdf';
  import html2canvas from 'html2canvas';

  interface Props {
    /** Target element to export (chart container) */
    targetElement?: HTMLElement | null;
    /** Filename without extension */
    filename?: string;
    /** Additional data for PDF export */
    exportData?: {
      title?: string;
      values?: Array<{ label: string; value: string }>;
      notes?: string;
    };
  }

  let { targetElement = null, filename = 'bandbreite-export', exportData }: Props = $props();

  // State
  let isExporting = $state(false);
  let exportError = $state<string | null>(null);
  let showMenu = $state(false);

  /**
   * Export the target element as PNG image
   */
  async function exportPNG(): Promise<void> {
    if (!targetElement) {
      exportError = 'Kein Export-Element verfuegbar';
      return;
    }

    isExporting = true;
    exportError = null;

    try {
      // Use html2canvas to capture the element
      const canvas = await html2canvas(targetElement, {
        backgroundColor: null,
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
      });

      // Convert to PNG and download
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showMenu = false;
    } catch (err) {
      console.error('PNG export error:', err);
      exportError = 'PNG-Export fehlgeschlagen';
    } finally {
      isExporting = false;
    }
  }

  /**
   * Export as PDF with optional calculation data
   */
  async function exportPDF(): Promise<void> {
    isExporting = true;
    exportError = null;

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(exportData?.title ?? 'Bandbreite Export', margin, yPos);
      yPos += 10;

      // Date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE')}`, margin, yPos);
      yPos += 15;

      // Values table
      if (exportData?.values && exportData.values.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0);
        pdf.text('Berechnete Werte:', margin, yPos);
        yPos += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        for (const item of exportData.values) {
          pdf.text(`${item.label}:`, margin + 5, yPos);
          pdf.setFont('helvetica', 'bold');
          pdf.text(item.value, margin + 60, yPos);
          pdf.setFont('helvetica', 'normal');
          yPos += 6;
        }
        yPos += 5;
      }

      // Chart image
      if (targetElement) {
        try {
          const canvas = await html2canvas(targetElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - (margin * 2);
          const imgHeight = (canvas.height / canvas.width) * imgWidth;

          // Check if image fits on page
          if (yPos + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }

          pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, Math.min(imgHeight, pageHeight - yPos - margin));
          yPos += imgHeight + 10;
        } catch (imgErr) {
          console.error('Error adding image to PDF:', imgErr);
        }
      }

      // Notes
      if (exportData?.notes) {
        if (yPos + 20 > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100);
        const splitNotes = pdf.splitTextToSize(exportData.notes, pageWidth - (margin * 2));
        pdf.text(splitNotes, margin, yPos);
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text('Generiert mit Bandbreite - RF Frequency Calculator', margin, pageHeight - 8);
      pdf.text('https://bandbreite.app', pageWidth - margin - 40, pageHeight - 8);

      // Save PDF
      pdf.save(`${filename}.pdf`);
      showMenu = false;
    } catch (err) {
      console.error('PDF export error:', err);
      exportError = 'PDF-Export fehlgeschlagen';
    } finally {
      isExporting = false;
    }
  }

  /**
   * Copy chart as image to clipboard
   */
  async function copyToClipboard(): Promise<void> {
    if (!targetElement) {
      exportError = 'Kein Export-Element verfuegbar';
      return;
    }

    isExporting = true;
    exportError = null;

    try {
      const canvas = await html2canvas(targetElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            showMenu = false;
          } catch (clipErr) {
            console.error('Clipboard write error:', clipErr);
            exportError = 'Kopieren in Zwischenablage fehlgeschlagen';
          }
        }
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard export error:', err);
      exportError = 'Kopieren fehlgeschlagen';
    } finally {
      isExporting = false;
    }
  }

  // Close menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.export-menu-container')) {
      showMenu = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="export-menu-container relative inline-block">
  <!-- Export Button -->
  <button
    type="button"
    onclick={() => showMenu = !showMenu}
    class="btn-secondary flex items-center gap-2"
    aria-label="Export-Menue oeffnen"
    aria-expanded={showMenu}
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    <span class="hidden sm:inline">Export</span>
  </button>

  <!-- Dropdown Menu -->
  {#if showMenu}
    <div
      class="absolute right-0 top-full mt-2 w-48 bg-surface-primary border border-default rounded-lg shadow-lg z-50"
      role="menu"
    >
      {#if exportError}
        <div class="px-4 py-2 text-xs text-red-500 dark:text-red-400 border-b border-default">
          {exportError}
        </div>
      {/if}

      <!-- PNG Export -->
      <button
        type="button"
        onclick={exportPNG}
        disabled={isExporting || !targetElement}
        class="w-full px-4 py-3 text-left text-sm text-primary hover:bg-surface-secondary transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        role="menuitem"
      >
        <svg class="w-4 h-4 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <div>
          <div class="font-medium">Als PNG speichern</div>
          <div class="text-xs text-muted">Bild herunterladen</div>
        </div>
      </button>

      <!-- PDF Export -->
      <button
        type="button"
        onclick={exportPDF}
        disabled={isExporting}
        class="w-full px-4 py-3 text-left text-sm text-primary hover:bg-surface-secondary transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border-t border-default"
        role="menuitem"
      >
        <svg class="w-4 h-4 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <div>
          <div class="font-medium">Als PDF speichern</div>
          <div class="text-xs text-muted">Mit Berechnungsdaten</div>
        </div>
      </button>

      <!-- Copy to Clipboard -->
      <button
        type="button"
        onclick={copyToClipboard}
        disabled={isExporting || !targetElement}
        class="w-full px-4 py-3 text-left text-sm text-primary hover:bg-surface-secondary transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border-t border-default rounded-b-lg"
        role="menuitem"
      >
        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <div>
          <div class="font-medium">In Zwischenablage</div>
          <div class="text-xs text-muted">Als Bild kopieren</div>
        </div>
      </button>

      <!-- Loading indicator -->
      {#if isExporting}
        <div class="absolute inset-0 bg-surface-primary/80 flex items-center justify-center rounded-lg">
          <div class="flex items-center gap-2 text-sm text-secondary">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-dashoffset="0" />
            </svg>
            Exportiere...
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .export-menu-container {
    /* Ensure menu stays on top */
    z-index: 40;
  }
</style>
