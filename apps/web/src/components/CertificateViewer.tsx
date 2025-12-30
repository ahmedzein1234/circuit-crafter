/**
 * Certificate Viewer Component
 *
 * Displays earned certificates and allows printing
 */

import { useRef } from 'react';
import { useLearningPathStore } from '../stores/learningPathStore';
import {
  CERTIFICATES,
  getLearningPathById,
} from '@circuit-crafter/shared';
import type { Certificate } from '@circuit-crafter/shared';

interface CertificateViewerProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId?: string;
}

const BADGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  green: { bg: 'from-green-500 to-emerald-600', border: 'border-green-400', text: 'text-green-400' },
  yellow: { bg: 'from-yellow-500 to-orange-500', border: 'border-yellow-400', text: 'text-yellow-400' },
  blue: { bg: 'from-blue-500 to-indigo-600', border: 'border-blue-400', text: 'text-blue-400' },
  purple: { bg: 'from-purple-500 to-pink-600', border: 'border-purple-400', text: 'text-purple-400' },
  gold: { bg: 'from-yellow-400 to-amber-600', border: 'border-yellow-300', text: 'text-yellow-300' },
  red: { bg: 'from-red-500 to-rose-600', border: 'border-red-400', text: 'text-red-400' },
};

export function CertificateViewer({ isOpen, onClose, certificateId }: CertificateViewerProps) {
  const { studentName, earnedCertificates, pathProgress } = useLearningPathStore();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Get certificates to display
  const certificatesToShow = certificateId
    ? CERTIFICATES.filter((c) => c.id === certificateId)
    : CERTIFICATES.filter((c) => earnedCertificates.includes(c.id));

  // Handle print
  const handlePrint = (cert: Certificate) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const progress = pathProgress[cert.pathId];
    const earnedDate = progress?.certificateEarnedAt
      ? new Date(progress.certificateEarnedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${cert.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;600&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Open Sans', sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }

          .certificate {
            width: 800px;
            height: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 8px solid #ffd700;
            border-radius: 12px;
            padding: 40px;
            position: relative;
            overflow: hidden;
          }

          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid rgba(255, 215, 0, 0.3);
            border-radius: 8px;
            pointer-events: none;
          }

          .header {
            text-align: center;
            margin-bottom: 20px;
          }

          .header h1 {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            color: #ffd700;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          .header .subtitle {
            font-size: 14px;
            color: #888;
            letter-spacing: 2px;
          }

          .badge {
            width: 100px;
            height: 100px;
            margin: 20px auto;
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
          }

          .content {
            text-align: center;
            color: white;
          }

          .presented-to {
            font-size: 14px;
            color: #888;
            margin-bottom: 8px;
          }

          .student-name {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            color: white;
            margin-bottom: 20px;
          }

          .achievement {
            font-size: 16px;
            color: #ccc;
            margin-bottom: 8px;
          }

          .certificate-title {
            font-size: 24px;
            font-weight: 600;
            color: #ffd700;
            margin-bottom: 20px;
          }

          .skills {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
            margin: 20px 0;
          }

          .skill {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            color: #ddd;
          }

          .footer {
            position: absolute;
            bottom: 40px;
            left: 60px;
            right: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .date {
            font-size: 14px;
            color: #888;
          }

          .signature {
            text-align: right;
          }

          .signature-line {
            width: 150px;
            border-bottom: 1px solid #888;
            margin-bottom: 5px;
          }

          .signature-text {
            font-size: 12px;
            color: #888;
          }

          .logo {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            color: #666;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }
            .certificate {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <h1>Certificate</h1>
            <div class="subtitle">OF ACHIEVEMENT</div>
          </div>

          <div class="badge">${cert.badgeIcon}</div>

          <div class="content">
            <div class="presented-to">This certificate is proudly presented to</div>
            <div class="student-name">${studentName || 'Student'}</div>
            <div class="achievement">for successfully completing</div>
            <div class="certificate-title">${cert.title}</div>

            <div class="skills">
              ${cert.skills.map((skill) => `<span class="skill">${skill}</span>`).join('')}
            </div>
          </div>

          <div class="footer">
            <div class="date">Awarded on ${earnedDate}</div>
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-text">Circuit Crafter</div>
            </div>
          </div>

          <div class="logo">Circuit Crafter - Learn Electronics Through Play</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Certificates & Badges</h2>
                <p className="text-yellow-100 text-sm">Your achievements and accomplishments</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {certificatesToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificatesToShow.map((cert) => {
                const path = getLearningPathById(cert.pathId);
                const progress = pathProgress[cert.pathId];
                const colors = BADGE_COLORS[cert.badgeColor] || BADGE_COLORS.blue;
                const earnedDate = progress?.certificateEarnedAt
                  ? new Date(progress.certificateEarnedAt).toLocaleDateString()
                  : null;

                return (
                  <div
                    key={cert.id}
                    ref={printRef}
                    className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border ${colors.border}`}
                  >
                    {/* Certificate Preview */}
                    <div className={`bg-gradient-to-r ${colors.bg} p-6`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                            {cert.badgeIcon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{cert.title}</h3>
                            <p className="text-white/80 text-sm">Level: {cert.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {earnedDate ? (
                            <div className="text-white/80 text-sm">
                              <div className="text-xs uppercase">Earned</div>
                              <div className="font-medium">{earnedDate}</div>
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <p className="text-gray-400 text-sm mb-4">{cert.description}</p>

                      {/* Skills */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Skills Demonstrated</h4>
                        <div className="flex flex-wrap gap-2">
                          {cert.skills.map((skill) => (
                            <span key={skill} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Path Info */}
                      {path && (
                        <div className="text-xs text-gray-500 mb-4">
                          From: {path.title}
                        </div>
                      )}

                      {/* Actions */}
                      {earnedCertificates.includes(cert.id) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePrint(cert)}
                            className={`flex-1 px-4 py-2 bg-gradient-to-r ${colors.bg} text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Certificate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎯</span>
              <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Complete learning paths to earn certificates! Each certificate demonstrates your mastery of important concepts.
              </p>
            </div>
          )}

          {/* All Available Certificates Section */}
          {!certificateId && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">All Available Certificates</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {CERTIFICATES.map((cert) => {
                  const isEarned = earnedCertificates.includes(cert.id);
                  const colors = BADGE_COLORS[cert.badgeColor] || BADGE_COLORS.blue;

                  return (
                    <div
                      key={cert.id}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        isEarned
                          ? `bg-gradient-to-br ${colors.bg} border-transparent`
                          : 'bg-gray-800 border-gray-700 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cert.badgeIcon}</div>
                      <div className={`text-sm font-medium ${isEarned ? 'text-white' : 'text-gray-400'}`}>
                        {cert.title}
                      </div>
                      <div className={`text-xs ${isEarned ? 'text-white/80' : 'text-gray-500'}`}>
                        {isEarned ? '✓ Earned' : 'Locked'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
