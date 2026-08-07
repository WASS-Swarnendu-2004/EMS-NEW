import { useEffect, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";

type EmployeePhotoUploadProps = {
  file: File | null;
  preview: string | null;
  onChange: (file: File | null) => void;
};

export function EmployeePhotoUpload({
  file,
  preview,
  onChange,
}: EmployeePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleFileChange(
  event: React.ChangeEvent<HTMLInputElement>,
) {
  const selectedFile = event.target.files?.[0];

  if (!selectedFile) {
    return;
  }

  if (!selectedFile.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  const maxSize = 5 * 1024 * 1024;

  if (selectedFile.size > maxSize) {
    alert("Image size must be less than 5MB.");
    return;
  }

  onChange(selectedFile);
}

  function handleRemove() {
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="mb-6 flex flex-col items-center">
      <div className="relative">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100">
          {preview ? (
            <img
              src={preview}
              alt="Employee profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="h-12 w-12 text-gray-400" />
          )}
        </div>

        {preview && (
          <button
            type="button"
            className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow"
            onClick={handleRemove}
            title="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        className="btn btn-sm mt-3"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {file || preview ? "Change Photo" : "Upload Photo"}
      </button>

      <p className="mt-2 text-xs text-gray-500">
        JPG, PNG or WEBP • Max 5MB
      </p>
    </div>
  );
}