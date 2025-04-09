import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileUploadProps {
  onFileChange: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  accept = '.doc,.docx,.pdf,.txt,.jpg,.jpeg,.png',
  multiple = true,
  label = 'Enviar Arquivo',
  className = '',
}) => {
  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    setFiles(selectedFiles);
    onFileChange(selectedFiles);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="file-upload">{label}</Label>
      <Input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="cursor-pointer"
      />
      {files && files.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            {files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            {Array.from(files).map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;