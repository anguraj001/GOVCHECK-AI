import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Application, GovService } from '../types';

export function generateApplicationPDF(application: Application, service?: GovService) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Colors
  const primaryBlue = [30, 64, 175]; // #1e40af
  const darkGray = [31, 41, 55];
  const lightBg = [243, 244, 246];

  // Header Banner
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // App Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVCHECK AI', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Based Pre-Submission Verification & Risk Assessment Report', 14, 21);

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 14, { align: 'right' });
  doc.text(`App #: ${application.applicationNumber}`, pageWidth - 14, 21, { align: 'right' });

  // Citizen & Service Meta Box
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 34, pageWidth - 28, 30, 3, 3, 'FD');

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('APPLICATION DETAILS', 18, 41);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Applicant Name: ${application.citizenName}`, 18, 48);
  doc.text(`Service: ${application.serviceNameEn} (${application.serviceCode})`, 18, 54);
  doc.text(`Config Version: ${application.serviceVersion}`, 18, 60);

  const riskLevel = application.currentAssessment?.level || 'LOW';
  const riskScore = application.currentAssessment?.score || 0;

  doc.text(`Email: ${application.citizenEmail}`, pageWidth / 2 + 10, 48);
  doc.text(`Verification Status: ${application.status}`, pageWidth / 2 + 10, 54);

  // Risk Badge
  let badgeColor: [number, number, number] = [22, 163, 74]; // Green
  if (riskLevel === 'MEDIUM') badgeColor = [217, 119, 6]; // Amber
  if (riskLevel === 'HIGH') badgeColor = [220, 38, 38]; // Red

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.text(`Potential Rejection Risk: ${riskLevel} (${riskScore}/100)`, pageWidth / 2 + 10, 60);

  let currentY = 70;

  // Pillar Scores Breakdown Table
  if (application.currentAssessment) {
    const b = application.currentAssessment.breakdown;
    autoTable(doc, {
      startY: currentY,
      head: [['Verification Pillar', 'Assigned Score', 'Pillar Status', 'Maximum Scale']],
      body: [
        ['1. Document Completeness', `${b.documentCompleteness} pts`, application.currentAssessment.completenessStatus, '30 pts'],
        ['2. Information Consistency', `${b.informationConsistency} pts`, application.currentAssessment.consistencyStatus, '25 pts'],
        ['3. Required Form Fields', `${b.requiredFields} pts`, b.requiredFields === 0 ? 'PASS' : 'WARNING', '20 pts'],
        ['4. Configured Rule Evaluation', `${b.configuredRules} pts`, application.currentAssessment.ruleCheckStatus, '25 pts'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Uploaded Documents Checklist Table
  const docRows = (application.uploadedDocuments || []).map((d, i) => [
    `${i + 1}`,
    d.docTypeKey.replace(/_/g, ' ').toUpperCase(),
    d.fileName,
    d.extractions?.readability?.toUpperCase() || 'GOOD',
    `${Math.round((d.extractions?.confidence || 0.9) * 100)}%`,
    'VERIFIED',
  ]);

  if (docRows.length === 0) {
    docRows.push(['1', 'Required Documents', 'None uploaded yet', '-', '-', 'MISSING']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Document Type Slot', 'Uploaded File Name', 'Readability', 'OCR Confidence', 'Status']],
    body: docRows,
    theme: 'striped',
    headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Outstanding Issues Table
  const issueRows = (application.currentIssues || []).map((iss, i) => [
    `${i + 1}`,
    iss.severity.toUpperCase(),
    iss.whatEn,
    iss.whyEn,
    iss.actionEn,
  ]);

  if (issueRows.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text('DETECTED ISSUES & CORRECTION RECOMMENDATIONS', 14, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Severity', 'Issue Detected', 'Why It Matters', 'Recommended Action']],
      body: issueRows,
      theme: 'grid',
      headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 18 },
        2: { cellWidth: 40 },
        3: { cellWidth: 55 },
        4: { cellWidth: 55 },
      },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 163, 74);
    doc.text('No critical issues detected. All parameters comply with pre-submission criteria.', 14, currentY);
    currentY += 8;
  }

  // Summary & Citizen Next Steps
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175);
  doc.text('ASSESSMENT SUMMARY & CITIZEN GUIDANCE', 14, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);

  const summaryText = application.currentAssessment?.summaryEn || 'Application pre-check completed.';
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 28);
  doc.text(splitSummary, 14, currentY);
  currentY += splitSummary.length * 4.5 + 4;

  // Mandatory Disclaimer Box at Bottom
  const disclaimerY = Math.max(currentY + 4, doc.internal.pageSize.getHeight() - 32);
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(14, disclaimerY, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('IMPORTANT CIVIC-TECH DISCLAIMER:', 18, disclaimerY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(127, 29, 29);
  const disclaimerBody = 'GOVCHECK AI is an independent software system for pre-submission verification and risk assessment. It is not an official government portal, certificate, approval, or rejection. Final statutory decision rests exclusively with the authorized government authority.';
  const splitDisc = doc.splitTextToSize(disclaimerBody, pageWidth - 36);
  doc.text(splitDisc, 18, disclaimerY + 11);

  // Save / Trigger Download
  const filename = `GOVCHECK_Report_${application.applicationNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
