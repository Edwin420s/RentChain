import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title = 'RentChain - Transparent Rental Management',
  description = 'RentChain brings transparency and security to rental housing through blockchain technology. Find verified properties, secure deposits with smart contracts, and rent with confidence.',
  keywords = 'rental, blockchain, smart contracts, housing, real estate, web3, deposits, escrow',
  image = '/og-image.jpg',
  url = 'https://rentchain.xyz',
  type = 'website',
  children 
}) => {
  const fullTitle = title.includes('RentChain') ? title : `${title} | RentChain`
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="RentChain" />
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1E3A8A" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "RentChain",
          "description": description,
          "url": url,
          "logo": `${url}/logo.png`,
          "sameAs": [
            "https://twitter.com/rentchain",
            "https://github.com/rentchain"
          ]
        })}
      </script>
      
      {children}
    </Helmet>
  )
}

export default SEO