import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  url: string;
}

export default function DocumentViewerModal({ open, onOpenChange, url }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url || "");
  const isPDF = /\.pdf$/i.test(url || "");

  useEffect(() => {
    setIsLoading(true);
  }, [url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#214B7B]">📄 View Document</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-gray-500 mb-2 animate-pulse">Loading document...</p>
        )}

        {isImage ? (
          <img
            src={url}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            className="max-w-full max-h-[75vh] mx-auto rounded shadow"
          />
        ) : isPDF ? (
          <iframe
            key={url}
            src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
            onLoad={() => setIsLoading(false)}
            className="w-full h-[75vh] rounded"
          />
        ) : (
          <p className="text-red-600 font-medium">
            Unsupported file type or preview not available.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
