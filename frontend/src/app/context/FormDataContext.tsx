import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface ExtractedData {
  answers: Record<string, string>;
  autoFilledFields: string[];
}

interface FormDataContextType {
  formFile: File | null;
  setFormFile: (file: File | null) => void;
  documentFiles: File[];
  setDocumentFiles: (files: File[]) => void;
  addDocumentFiles: (files: File[]) => void;
  removeDocumentFile: (index: number) => void;
  extractedData: ExtractedData | null;
  setExtractedData: (data: ExtractedData) => void;
  clearExtractedData: () => void;
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export function FormDataProvider({ children }: { children: ReactNode }) {
  const [formFile, setFormFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [extractedData, setExtractedDataState] = useState<ExtractedData | null>(null);

  const setExtractedData = useCallback((data: ExtractedData) => {
    setExtractedDataState(data);
  }, []);

  const clearExtractedData = useCallback(() => {
    setExtractedDataState(null);
  }, []);

  const addDocumentFiles = useCallback((files: File[]) => {
    setDocumentFiles((prev) => [...prev, ...files]);
  }, []);

  const removeDocumentFile = useCallback((index: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <FormDataContext.Provider
      value={{
        formFile,
        setFormFile,
        documentFiles,
        setDocumentFiles,
        addDocumentFiles,
        removeDocumentFile,
        extractedData,
        setExtractedData,
        clearExtractedData,
      }}
    >
      {children}
    </FormDataContext.Provider>
  );
}

export function useFormData() {
  const context = useContext(FormDataContext);
  if (!context) {
    throw new Error("useFormData must be used within FormDataProvider");
  }
  return context;
}
