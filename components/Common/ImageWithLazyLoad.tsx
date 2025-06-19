import React, { useState, useEffect, useRef } from 'react';

interface ImageWithLazyLoadProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string; 
  aspectRatio?: string; // e.g., 'aspect-video', 'aspect-square', or custom like 'aspect-[16/9]'
}

// Simple gray placeholder
const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3C/svg%3E";


const ImageWithLazyLoad: React.FC<ImageWithLazyLoadProps> = ({ 
  src, 
  alt, 
  className = '',
  placeholderSrc = DEFAULT_PLACEHOLDER,
  aspectRatio = ''
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    let didCancel = false;

    if (imgRef.current && imageSrc === placeholderSrc && !hasError) { 
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!didCancel && entry.isIntersecting) {
              const img = new Image();
              img.src = src;
              img.onload = () => {
                if (!didCancel) {
                  setImageSrc(src);
                  setImageLoaded(true);
                }
              };
              img.onerror = () => {
                if (!didCancel) {
                  setHasError(true);
                  // Optionally set a specific broken image placeholder
                  // setImageSrc(BROKEN_IMAGE_PLACEHOLDER); 
                }
              };
              observer.unobserve(entry.target); 
            }
          });
        },
        { rootMargin: "0px 0px 200px 0px" } 
      );
      observer.observe(imgRef.current);
    }
    return () => {
      didCancel = true;
      if (observer && imgRef.current && observer.unobserve) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(imgRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, placeholderSrc, imageSrc, hasError]); // Rerun if these change

  const combinedClassName = `
    ${aspectRatio} 
    ${className} 
    transition-opacity duration-500 ease-in-out
    ${imageLoaded && !hasError ? 'opacity-100' : 'opacity-60'}
    ${hasError ? 'bg-gray-200' : ''} // Style for error state
  `;
  
  if (hasError) {
    return (
        <div className={`${combinedClassName} flex items-center justify-center bg-gray-100 text-gray-400`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    );
  }


  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={combinedClassName}
      // onLoad is handled by the Image object in useEffect for more control
    />
  );
};

export default ImageWithLazyLoad;
