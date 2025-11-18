import { useState } from 'react';
import { Upload, Image, Link, FileText, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Milestone } from '../lib/mockData';

interface SubmitEvidenceDialogProps {
  open: boolean;
  onClose: () => void;
  milestone: Milestone;
  projectId: string;
}

export function SubmitEvidenceDialog({ open, onClose, milestone, projectId }: SubmitEvidenceDialogProps) {
  const [evidenceType, setEvidenceType] = useState<'image' | 'app' | 'link' | 'document'>('image');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: Upload evidence to IPFS/Arweave and record hash on blockchain
    alert(`Evidence submitted for Stage ${milestone.stageNumber}! Community voting will begin. (Mock)`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Evidence - Stage {milestone.stageNumber}</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <h3 className="font-medium mb-1">{milestone.name}</h3>
          <p className="text-sm text-gray-600">{milestone.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              Upload tangible proof of your progress. Images, apps, links, and documents will be 
              reviewed by the community. Evidence is stored on decentralized storage (IPFS/Arweave).
            </AlertDescription>
          </Alert>

          <div>
            <Label>Evidence Type</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              <button
                type="button"
                onClick={() => setEvidenceType('image')}
                className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  evidenceType === 'image' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Image className="size-6" />
                <span className="text-sm">Image</span>
              </button>
              <button
                type="button"
                onClick={() => setEvidenceType('app')}
                className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  evidenceType === 'app' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="size-6" />
                <span className="text-sm">App</span>
              </button>
              <button
                type="button"
                onClick={() => setEvidenceType('link')}
                className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  evidenceType === 'link' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Link className="size-6" />
                <span className="text-sm">Link</span>
              </button>
              <button
                type="button"
                onClick={() => setEvidenceType('document')}
                className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  evidenceType === 'document' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText className="size-6" />
                <span className="text-sm">Document</span>
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Evidence Title</Label>
            <Input
              id="title"
              placeholder={
                evidenceType === 'image' ? 'e.g., Prototype Photos' :
                evidenceType === 'app' ? 'e.g., Beta App Demo' :
                evidenceType === 'link' ? 'e.g., GitHub Repository' :
                'e.g., Research Report'
              }
              required
            />
          </div>

          {evidenceType === 'image' && (
            <div>
              <Label htmlFor="image-upload">Upload Images</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="size-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <Button type="button" variant="outline" className="mt-4" asChild>
                  <label htmlFor="image-upload">
                    Select Images
                  </label>
                </Button>
              </div>
            </div>
          )}

          {evidenceType === 'app' && (
            <div>
              <Label htmlFor="app-upload">Upload App/Software</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="size-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload APK, IPA, or link to hosted app
                </p>
                <p className="text-xs text-gray-500">
                  Files up to 100MB or provide URL
                </p>
                <input
                  id="app-upload"
                  type="file"
                  className="hidden"
                />
                <div className="flex gap-3 justify-center mt-4">
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="app-upload">
                      Upload File
                    </label>
                  </Button>
                  <span className="text-gray-400">or</span>
                  <Input placeholder="https://app-demo.com" className="max-w-xs" />
                </div>
              </div>
            </div>
          )}

          {evidenceType === 'link' && (
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://github.com/yourproject or https://demo.yourproject.com"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                GitHub repos, demo sites, datasets, or any public link
              </p>
            </div>
          )}

          {evidenceType === 'document' && (
            <div>
              <Label htmlFor="document-upload">Upload Document</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload research reports, papers, or documentation
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOCX up to 25MB
                </p>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <Button type="button" variant="outline" className="mt-4" asChild>
                  <label htmlFor="document-upload">
                    Select Document
                  </label>
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this evidence and how it demonstrates milestone completion..."
              rows={4}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">What Happens Next?</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Your evidence is uploaded to decentralized storage (IPFS/Arweave)</li>
              <li>Evidence hash is recorded on Cardano blockchain</li>
              <li>Community funders are notified to review and vote</li>
              <li>75% approval triggers automatic fund release via smart contract</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Upload className="mr-2 size-4" />
              Submit Evidence
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
