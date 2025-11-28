import { X, CheckCircle, Target, FileText, Vote } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface SupportConfirmationModalProps {
  project: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SupportConfirmationModal({ project, onConfirm, onCancel }: SupportConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-gray-900">Support This Project</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Preview */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
            <ImageWithFallback
              src={project.image}
              alt={project.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-gray-900 mb-1">{project.title}</h3>
              <p className="text-sm text-gray-600">{project.researcher}</p>
              <p className="text-sm text-gray-500">{project.researcherInstitution}</p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">By supporting this project, you will:</h4>
                <ul className="space-y-3 mt-3">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Vote className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">Become a voter on milestone approvals</p>
                      <p className="text-sm text-gray-600">
                        Vote to approve or reject each of the 5 milestone stages. Your vote helps ensure funds are only released when progress is verified.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">Review evidence submissions</p>
                      <p className="text-sm text-gray-600">
                        Access detailed evidence and documentation submitted by researchers at each milestone stage.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">Track project progress</p>
                      <p className="text-sm text-gray-600">
                        Monitor the project's progress through all 5 stages from planning to final publication.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Milestone Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <h4 className="text-gray-900 mb-2">5-Stage Project Lifecycle</h4>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. Project Planning & Setup (20% funding)</li>
              <li>2. Data Collection & Analysis (25% funding)</li>
              <li>3. Testing & Validation (25% funding)</li>
              <li>4. Implementation & Documentation (20% funding)</li>
              <li>5. Final Review & Publication (10% funding)</li>
            </ol>
            <p className="text-sm text-gray-600 mt-3">
              75% community approval is required at each stage before funds are released.
            </p>
          </div>

          {/* Voting Power Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> As a supporter, your vote carries equal weight with all other supporters. Vote responsibly based on the evidence provided.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Confirm Support
          </button>
        </div>
      </div>
    </div>
  );
}
