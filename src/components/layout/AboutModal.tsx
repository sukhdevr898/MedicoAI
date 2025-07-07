
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Instagram, Globe } from 'lucide-react'; // Added Globe for a generic website/portfolio

interface AboutModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AboutModal({ isOpen, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card shadow-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold text-foreground">About medicoAI</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            AI-powered medical image analysis and assistance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4 text-sm text-foreground">
          <p>
            This application is developed and maintained by:
          </p>
          <div className="flex flex-col space-y-2 p-3 bg-muted/50 rounded-lg border border-border">
            <h3 className="font-semibold text-md">Sukhdev Singh</h3>
            <a 
              href="https://github.com/sukhdevr898" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>sukhdevr898</span>
            </a>
            <a 
              href="https://www.instagram.com/sukh_rai898" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              <Instagram className="h-4 w-4" />
              <span>@sukh_rai898</span>
            </a>
            {/* You can add a portfolio link here if available */}
            {/* <a 
              href="https://yourportfolio.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>Portfolio/Website</span>
            </a> */}
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            MedicoAI utilizes advanced AI models to provide insights from medical imagery and answer related questions. 
            It is intended for informational purposes and should not replace professional medical advice.
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
