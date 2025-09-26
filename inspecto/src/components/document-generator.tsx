"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateDocumentContent, extractFileContent, validateFile } from "@/lib/cohere";

export function DocumentGenerator() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file using the utility function
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      toast({
        title: "Template uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Validate file using the utility function
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      toast({
        title: "Template uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    }
  };

  const generateDocument = async () => {
    if (!uploadedFile || !description.trim()) {
      toast({
        title: "Missing requirements",
        description: "Please upload a template and provide a description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Extract content from uploaded file
      const templateContent = await extractFileContent(uploadedFile);
      
      // Generate document using Cohere API
      const result = await generateDocumentContent({
        template: templateContent,
        description: description,
        fileName: uploadedFile.name,
      });

      if (result.success) {
        setGeneratedDocument(result.content);
        toast({
          title: "Document generated",
          description: "Your document has been generated successfully using Cohere AI",
        });
      } else {
        throw new Error(result.error || "Failed to generate document");
      }
    } catch (error) {
      console.error("Document generation error:", error);
      
      // Show specific error messages
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      if (errorMessage.includes("API key")) {
        toast({
          title: "Configuration Error",
          description: "Cohere API key is not configured. Please check your environment variables.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        toast({
          title: "Network Error",
          description: "Unable to connect to Cohere API. Please check your internet connection.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const exportDocument = () => {
    if (!generatedDocument) return;

    const blob = new Blob([generatedDocument], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-document-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Document exported",
      description: "Your document has been downloaded successfully",
    });
  };

  const resetForm = () => {
    setUploadedFile(null);
    setDescription("");
    setGeneratedDocument(null);
    setPreviewMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-balance mb-4">
          Document Generator
        </h1>
        <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
          Upload your template, add your description, and generate professional
          documents instantly
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Input Section */}
        <div className="space-y-6">
          {/* Step 1: Upload Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 1: Upload Template
              </CardTitle>
              <CardDescription>
                Upload a document template (.docx, .txt, .md, .html, .pdf)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt,.md,.html,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadedFile ? (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 mx-auto text-accent" />
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetForm();
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports .docx, .txt, .md, .html, .pdf files
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Step 2: Add Description
              </CardTitle>
              <CardDescription>
                Describe the content you want to generate based on your template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="description">Document Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you want to generate... For example: 'Create a project proposal for a mobile app development project with timeline, budget, and team requirements.'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  {description.length}/1000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateDocument}
            disabled={!uploadedFile || !description.trim() || isGenerating}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Generate Document
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Output Section */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Generated Document
                </span>
                {generatedDocument && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      {previewMode ? "Edit" : "Preview"}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={exportDocument}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Your generated document will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              {generatedDocument ? (
                <div className="h-full">
                  {previewMode ? (
                    <div
                      className="prose prose-invert max-w-none h-full overflow-auto p-4 bg-muted rounded-md"
                      dangerouslySetInnerHTML={{
                        __html: generatedDocument
                          .replace(/\n/g, "<br>")
                          .replace(/#{3}\s(.+)/g, "<h3>$1</h3>")
                          .replace(/#{2}\s(.+)/g, "<h2>$1</h2>")
                          .replace(/#{1}\s(.+)/g, "<h1>$1</h1>")
                          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.+?)\*/g, "<em>$1</em>"),
                      }}
                    />
                  ) : (
                    <Textarea
                      value={generatedDocument}
                      onChange={(e) => setGeneratedDocument(e.target.value)}
                      className="h-full resize-none font-mono text-sm"
                      placeholder="Generated document will appear here..."
                    />
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="space-y-4">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium text-muted-foreground">
                        No document generated yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Upload a template and add a description to get started
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
