import { Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface ComingSoonDialogProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export function ComingSoonDialog({ open, onClose, feature = 'Campaign Management' }: ComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Coming Soon</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Briefcase className="size-12 text-blue-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <Calendar className="size-5 text-yellow-900" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-3">
            <h3 className="text-xl">{feature}</h3>
            <p className="text-gray-600">
              We're working hard to bring you campaign management features. Soon you'll be able to:
            </p>
          </div>

          {/* Features List */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Create Funding Campaigns</p>
                <p className="text-sm text-gray-600">
                  Set up campaigns with customizable milestone stages (3-10 stages)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Manage Multiple Projects</p>
                <p className="text-sm text-gray-600">
                  Group related projects under themed campaigns
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Track Campaign Performance</p>
                <p className="text-sm text-gray-600">
                  Monitor funding progress and milestone completion across all campaign projects
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center text-sm text-gray-500">
            Stay tuned for updates!
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
