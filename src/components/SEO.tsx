import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords }) => {
  useEffect(() => {
    // Update Title
    const baseTitle = 'Mega Pak Zimbabwe';
    const newTitle = title ? `${title} | ${baseTitle}` : 'Mega Pak Zimbabwe | Job Card Management System';
    document.title = newTitle;

    // Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'Mega Pak Zimbabwe Job Card Management System - Streamlining maintenance and job tracking.');
    }

    // Update Meta Keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords || 'Mega Pak Zimbabwe, Job Card, Maintenance');
    }

    // Update Open Graph Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', newTitle);
    }

    // Update Twitter Title
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', newTitle);
    }
    
  }, [title, description, keywords]);

  return null;
};

export default SEO;
