import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  accept?: string;
}

export function ImageUpload({ value, onChange, className = "", accept = "image/*" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a preview URL for immediate display
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreviewUrl(dataUrl);
        onChange(dataUrl); // For now, we'll use the data URL directly
        setIsDialogOpen(false);
        
        toast({
          title: "Image Uploaded",
          description: "Your image has been successfully uploaded",
        });
      };
      reader.readAsDataURL(file);

      // In a production app, you would upload to a service like Firebase Storage, AWS S3, etc.
      // Here's how you might implement that:
      /*
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const { url } = await response.json();
      setPreviewUrl(url);
      onChange(url);
      setIsDialogOpen(false);
      */

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className={className}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={accept}
        capture="environment" // Prefer back camera
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
      />

      {previewUrl ? (
        <Card className="relative">
          <CardContent className="p-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer transition-colors">
              <CardContent className="p-8 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Add meal photo</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Take a photo or choose from gallery
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Meal Photo</DialogTitle>
              <DialogDescription>
                Choose how you'd like to add a photo of your meal
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Button
                onClick={handleCameraCapture}
                disabled={isUploading}
                className="w-full h-16 flex items-center justify-center space-x-3"
                variant="outline"
              >
                <Camera className="w-6 h-6" />
                <span>Take Photo</span>
              </Button>

              <Button
                onClick={handleGallerySelect}
                disabled={isUploading}
                className="w-full h-16 flex items-center justify-center space-x-3"
                variant="outline"
              >
                <Upload className="w-6 h-6" />
                <span>Choose from Gallery</span>
              </Button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Maximum file size: 5MB</p>
                <p>Supported formats: JPG, PNG, WebP</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
            <p className="text-sm">Uploading...</p>
          </div>
        </div>
      )}
    </div>
  );
}