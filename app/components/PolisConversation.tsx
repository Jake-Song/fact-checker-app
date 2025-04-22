'use client'; 

import { useEffect } from 'react';

export default function PolisConversation() {
  useEffect(() => {
    // Load Polis script
    const script = document.createElement('script');
    script.src = 'https://pol.is/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="polis"
      data-page_id="PAGE_ID"
      data-conversation_id="6ejuak4rhw"
      data-site_id="polis_site_id_FMLB6nKczzKiPhv6Nf"
      style={{
        minHeight: '300px',
        width: '100%'
      }}
    />
  );
}