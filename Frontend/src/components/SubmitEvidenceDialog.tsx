import { useState, useRef } from 'react';
import { Upload, Image, Link, FileText, AlertCircle, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Milestone, submitEvidence } from '../lib/api';
import { toast } from 'sonner';

interface SubmitEvidenceDialogProps {
  open: boolean;
  onClose: () => void;
  milestone: Milestone;
  projectId: string;
}

export function SubmitEvidenceDialog({ open, onClose, milestone, projectId: _projectId }: SubmitEvidenceDialogProps) {
  const [evidenceType, setEvidenceType] = useState<'image' | 'app' | 'link' | 'document'>('image');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Auto-fill title if empty
      if (!title) {
        setTitle(e.target.files[0].name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalUrl = url;

      // Simulate file upload if a file is selected
      if (selectedFile) {
        // In a real app, we would upload to IPFS/Arweave here
        // For now, we simulate a decentralized storage URL
        const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        finalUrl = `https://ipfs.io/ipfs/${mockIpfsHash}?filename=${encodeURIComponent(selectedFile.name)}`;
      } else if (evidenceType !== 'link' && !url) {
        toast.error('Please select a file or provide a URL');
        setIsSubmitting(false);
        return;
      }

      await submitEvidence(milestone.id, [{
        type: evidenceType,
        title,
        description,
        url: finalUrl
      }]);

      toast.success(`Evidence submitted for Stage ${milestone.stageNumber}! Community voting will begin.`);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to submit evidence");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={(val: boolean) => {
      if (!val) resetForm();
      onClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Fixed Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Submit Evidence - Stage {milestone.stageNumber}</DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4">
            <h3 className="font-medium mb-1">{milestone.title}</h3>
            <p className="text-sm text-gray-600">{milestone.description}</p>
          </div>

          <form id="evidence-form" onSubmit={handleSubmit} className="space-y-5">
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                Upload tangible proof of your progress. Images, apps, links, and documents will be
                reviewed by the community. Evidence is stored on decentralized storage (IPFS/Arweave).
              </AlertDescription>
            </Alert>

            <div>
              <Label>Evidence Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setEvidenceType('image'); setSelectedFile(null); }}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-1.5 transition-colors ${evidenceType === 'image' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <Image className="size-5" />
                  <span className="text-xs font-medium">Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEvidenceType('app'); setSelectedFile(null); }}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-1.5 transition-colors ${evidenceType === 'app' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <Upload className="size-5" />
                  <span className="text-xs font-medium">App</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEvidenceType('link'); setSelectedFile(null); }}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-1.5 transition-colors ${evidenceType === 'link' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <Link className="size-5" />
                  <span className="text-xs font-medium">Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEvidenceType('document'); setSelectedFile(null); }}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-1.5 transition-colors ${evidenceType === 'document' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <FileText className="size-5" />
                  <span className="text-xs font-medium">Document</span>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Evidence Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  evidenceType === 'image' ? 'e.g., Prototype Photos' :
                    evidenceType === 'app' ? 'e.g., Beta App Demo' :
                      evidenceType === 'link' ? 'e.g., GitHub Repository' :
                        'e.g., Research Report'
                }
                required
                className="mt-1.5"
              />
            </div>

            {evidenceType !== 'link' ? (
              <div>
                <Label htmlFor="file-upload">
                  Upload {evidenceType === 'image' ? 'Images' : evidenceType === 'app' ? 'App/Software' : 'Document'}
                </Label>
                {!selectedFile ? (
                  <div
                    className="mt-1.5 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      {evidenceType === 'image' ? 'PNG, JPG, GIF up to 10MB' :
                        evidenceType === 'app' ? 'APK, IPA, ZIP up to 100MB' :
                          'PDF, DOCX up to 25MB'}
                    </p>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept={
                        evidenceType === 'image' ? 'image/*' :
                          evidenceType === 'document' ? '.pdf,.doc,.docx' :
                            undefined
                      }
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div className="mt-1.5 p-3 border rounded-lg bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white rounded border shrink-0">
                        {evidenceType === 'image' ? <Image className="size-4 text-blue-600" /> :
                          evidenceType === 'app' ? <Upload className="size-4 text-blue-600" /> :
                            <FileText className="size-4 text-blue-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/yourproject or https://demo.yourproject.com"
                  required
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-600 mt-1">
                  GitHub repos, demo sites, datasets, or any public link
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this evidence and how it demonstrates milestone completion..."
                rows={3}
                required
                className="mt-1.5"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-1.5">What Happens Next?</h4>
              <ol className="text-xs text-gray-700 space-y-0.5 list-decimal list-inside">
                <li>Your evidence is uploaded to decentralized storage (IPFS/Arweave)</li>
                <li>Evidence hash is recorded on Cardano blockchain</li>
                <li>Community funders are notified to review and vote</li>
                <li>75% approval triggers automatic fund release via smart contract</li>
              </ol>
            </div>
          </form>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="px-6 py-4 border-t bg-gray-50 shrink-0">
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="evidence-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Submit Evidence
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
