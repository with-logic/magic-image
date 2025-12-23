import { useState, useCallback, useEffect } from "react";
import { Button } from "./components/Button";
import { NumberStepper } from "./components/NumberStepper";
import { useMagicImageConfig } from "./MagicImageProvider";
import { cn } from "./utils/cn";
import type { MagicImageProps, ImageState } from "./types";

function getAspectRatioFromPath(path: string): "4:3" | "16:9" {
  if (path.includes("diagram")) return "16:9";
  if (path.includes("workflow_headers")) return "16:9";
  if (path.includes("header")) return "16:9";
  return "4:3";
}

export function MagicImage({
  src,
  alt,
  prompt,
  className = "",
  aspectRatio,
  devMode: devModeProp,
  ...imgProps
}: MagicImageProps) {
  const [state, setState] = useState<ImageState>("idle");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedForSave, setSelectedForSave] = useState<Set<number>>(
    new Set(),
  );
  const [savedImages, setSavedImages] = useState<Set<number>>(new Set());
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSrc, setSavedSrc] = useState(src);
  const [generateCount, setGenerateCount] = useState(1);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt || "");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const config = useMagicImageConfig();

  const handleReferenceImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  useEffect(() => {
    setEditedPrompt(prompt || "");
  }, [prompt]);

  const isDevMode = devModeProp ?? config?.devMode ?? false;
  const resolvedAspectRatio = aspectRatio ?? getAspectRatioFromPath(src);
  const count = Math.max(1, Math.min(generateCount, 10));

  useEffect(() => {
    if (isGridOpen || isPromptEditorOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isGridOpen, isPromptEditorOpen]);

  // Preload all generated images to prevent flashing when navigating carousel
  useEffect(() => {
    if (generatedImages.length > 1) {
      generatedImages.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [generatedImages]);

  const generateSingleImage = useCallback(async (): Promise<string> => {
    if (!config) {
      throw new Error("MagicImage requires a MagicImageProvider");
    }

    let finalPrompt = editedPrompt || prompt || "";
    if (config.refinePrompt && finalPrompt) {
      finalPrompt = await config.refinePrompt(finalPrompt);
    }

    const result = await config.generateImage({
      prompt: finalPrompt,
      aspectRatio: resolvedAspectRatio,
      referenceImage: referenceImage || undefined,
    });

    return result.imageUrl;
  }, [config, editedPrompt, prompt, resolvedAspectRatio, referenceImage]);

  const handleGenerate = useCallback(async () => {
    setState("generating");
    setError(null);
    setGeneratedImages([]);
    setCurrentIndex(0);
    setSelectedForSave(new Set());
    setSavedImages(new Set());

    try {
      const promises = Array.from({ length: count }, () =>
        generateSingleImage(),
      );
      const images = await Promise.all(promises);
      setGeneratedImages(images);
      if (count === 1) {
        setSelectedForSave(new Set([0]));
      }
      setState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
      setState("idle");
    }
  }, [count, generateSingleImage]);

  const handleSave = useCallback(async () => {
    if (!config) {
      setError("MagicImage requires a MagicImageProvider");
      return;
    }

    const indicesToSave =
      selectedForSave.size > 0 ? Array.from(selectedForSave) : [currentIndex];

    if (indicesToSave.length === 0) return;

    setState("generating");
    setError(null);

    try {
      for (let i = 0; i < indicesToSave.length; i++) {
        const idx = indicesToSave[i];
        const imageData = generatedImages[idx];
        const targetPath =
          indicesToSave.length === 1
            ? src
            : src.replace(/(\.[^.]+)$/, `-${idx + 1}$1`);

        const result = await config.saveImage({
          imageData,
          targetPath,
        });

        if (!result.success) {
          throw new Error("Failed to save image");
        }

        if (indicesToSave.length === 1 || i === 0) {
          setSavedSrc(`${src}?t=${Date.now()}`);
        }
      }

      setSavedImages((prev) => new Set([...prev, ...indicesToSave]));
      setSelectedForSave(new Set());
      setState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save image");
      setState("preview");
    }
  }, [config, generatedImages, selectedForSave, currentIndex, src]);

  const handleRegenerate = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const toggleImageSelection = useCallback((index: number) => {
    setSelectedForSave((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const displaySrc =
    generatedImages.length > 0 ? generatedImages[currentIndex] : savedSrc;

  if (!isDevMode || !prompt) {
    return <img src={src} alt={alt} className={className} {...imgProps} />;
  }

  return (
    <>
      <div
        className={cn(
          "magic-wrapper",
          state === "generating" && "magic-wrapper--generating",
        )}
      >
        <img
          src={displaySrc}
          alt={alt}
          className={cn("magic-wrapper__image", className)}
          {...imgProps}
        />

        {state === "generating" && (
          <div className="magic-loading">
            <div className="magic-loading__content">
              <svg
                className="magic-loading__spinner"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="magic-loading__spinner-track"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="magic-loading__spinner-head"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Generating{count > 1 ? ` ${count} images...` : "..."}</span>
            </div>
          </div>
        )}

        {error && <div className="magic-error">{error}</div>}

        {state === "preview" && generatedImages.length === 1 && (
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            className="magic-save-btn"
          >
            Save
          </Button>
        )}

        {state === "preview" && generatedImages.length > 1 && (
          <>
            {savedImages.has(currentIndex) ? (
              <div className="magic-saved-badge magic-badge magic-badge--success">
                <svg
                  className="magic-badge__icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved
              </div>
            ) : (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => toggleImageSelection(currentIndex)}
                className="magic-select-btn"
              >
                {selectedForSave.has(currentIndex) ? "Selected" : "Select"}
                {selectedForSave.has(currentIndex) && (
                  <svg
                    className="magic-icon--sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </Button>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              shape="rounded"
              onClick={() =>
                setCurrentIndex((i) =>
                  i === 0 ? generatedImages.length - 1 : i - 1,
                )
              }
              className="magic-carousel-btn magic-carousel-btn--prev"
              aria-label="Previous image"
            >
              <svg
                className="magic-icon--md"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              shape="rounded"
              onClick={() =>
                setCurrentIndex((i) =>
                  i === generatedImages.length - 1 ? 0 : i + 1,
                )
              }
              className="magic-carousel-btn magic-carousel-btn--next"
              aria-label="Next image"
            >
              <svg
                className="magic-icon--md"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsGridOpen(true)}
              className="magic-grid-btn"
              leftIcon={
                <svg
                  className="magic-icon--sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              }
            >
              {currentIndex + 1}/{generatedImages.length}
            </Button>
            {selectedForSave.size > 0 && (
              <Button
                size="sm"
                variant="default"
                onClick={handleSave}
                className="magic-save-btn"
              >
                Save Selected
                {selectedForSave.size > 1 ? ` (${selectedForSave.size})` : ""}
              </Button>
            )}
          </>
        )}

        <div className="magic-controls">
          {state === "idle" && (
            <div className="magic-controls__group">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPromptEditorOpen(true)}
                leftIcon={
                  <svg
                    className="magic-icon--sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                }
              >
                Edit Prompt
              </Button>
              <NumberStepper
                value={generateCount}
                onChange={setGenerateCount}
                min={1}
                max={10}
              />
              <Button size="sm" variant="ghost" onClick={handleGenerate}>
                Generate
              </Button>
            </div>
          )}

          {state === "preview" && (
            <div className="magic-controls__group">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPromptEditorOpen(true)}
                leftIcon={
                  <svg
                    className="magic-icon--sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                }
              >
                Edit Prompt
              </Button>
              <NumberStepper
                value={generateCount}
                onChange={setGenerateCount}
                min={1}
                max={10}
              />
              <Button size="sm" variant="ghost" onClick={handleRegenerate}>
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </div>

      {isGridOpen && (
        <>
          <div
            className="magic-overlay"
            onClick={() => setIsGridOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setIsGridOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close grid"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image selection grid"
            className="magic-dialog-wrapper"
          >
            <div className="magic-dialog magic-dialog--grid">
              <div className="magic-dialog__header">
                <h3 className="magic-dialog__title">
                  {savedImages.size > 0
                    ? `${savedImages.size} saved`
                    : "Select images to save"}
                  {selectedForSave.size > 0 &&
                    ` (${selectedForSave.size} selected)`}
                </h3>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setIsGridOpen(false)}
                  aria-label="Close"
                >
                  <svg
                    className="magic-icon--lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
              <div className="magic-dialog__body magic-dialog__body--scroll">
                <div className="magic-grid">
                  {generatedImages.map((imgUrl, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={cn(
                        "magic-grid__item",
                        savedImages.has(idx) && "magic-grid__item--saved",
                        selectedForSave.has(idx) &&
                          "magic-grid__item--selected",
                      )}
                      onClick={() =>
                        !savedImages.has(idx) && toggleImageSelection(idx)
                      }
                    >
                      <img src={imgUrl} alt={`Generated ${idx + 1}`} />
                      {savedImages.has(idx) ? (
                        <div className="magic-grid__badge magic-badge magic-badge--success">
                          <svg
                            className="magic-badge__icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Saved
                        </div>
                      ) : (
                        selectedForSave.has(idx) && (
                          <div className="magic-grid__badge magic-grid__check">
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )
                      )}
                      <div className="magic-grid__number">{idx + 1}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="magic-dialog__footer">
                <Button variant="ghost" onClick={() => setIsGridOpen(false)}>
                  Close
                </Button>
                {selectedForSave.size > 0 && (
                  <Button variant="ghost" onClick={handleSave}>
                    Save Selected ({selectedForSave.size})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {isPromptEditorOpen && (
        <>
          <div
            className="magic-overlay"
            onClick={() => setIsPromptEditorOpen(false)}
            onKeyDown={(e) =>
              e.key === "Escape" && setIsPromptEditorOpen(false)
            }
            role="button"
            tabIndex={-1}
            aria-label="Close prompt editor"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit generation prompt"
            className="magic-dialog-wrapper"
          >
            <div className="magic-dialog magic-dialog--prompt">
              <div className="magic-dialog__header">
                <h3 className="magic-dialog__title">Edit Prompt</h3>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setIsPromptEditorOpen(false)}
                  aria-label="Close"
                >
                  <svg
                    className="magic-icon--lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
              <div className="magic-dialog__body magic-dialog__body--spaced">
                <div>
                  <label htmlFor="magic-image-prompt" className="magic-label">
                    Prompt
                  </label>
                  <textarea
                    id="magic-image-prompt"
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="magic-textarea"
                    placeholder="Enter image generation prompt..."
                  />
                </div>
                <div>
                  <span className="magic-label">
                    Reference Image (optional)
                  </span>
                  {referenceImage ? (
                    <div className="magic-ref-preview">
                      <img src={referenceImage} alt="Reference" />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setReferenceImage(null)}
                        className="magic-ref-preview__remove"
                        aria-label="Remove reference image"
                      >
                        <svg
                          className="magic-icon--sm"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        document
                          .getElementById("magic-image-reference")
                          ?.click()
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          document
                            .getElementById("magic-image-reference")
                            ?.click();
                        }
                      }}
                      className="magic-upload"
                    >
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Upload reference image</span>
                      <input
                        id="magic-image-reference"
                        type="file"
                        accept="image/*"
                        onChange={handleReferenceImageChange}
                        className="magic-upload__input"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="magic-dialog__footer">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditedPrompt(prompt || "");
                    setReferenceImage(null);
                    setIsPromptEditorOpen(false);
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsPromptEditorOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
