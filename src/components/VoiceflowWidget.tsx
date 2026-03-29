import { useEffect } from 'react';

declare global {
  interface Window {
    voiceflow: any;
  }
}

export const VoiceflowWidget = () => {
  useEffect(() => {
    const scriptId = 'voiceflow-chat-script';
    
    // Check if the script already exists to avoid redundant injection
    if (!document.getElementById(scriptId)) {
      const v = document.createElement('script');
      v.id = scriptId;
      v.type = 'text/javascript';
      v.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
      
      v.onload = () => {
        window.voiceflow.chat.load({
          verify: { projectID: '69c980282c0d3a70b365b095' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          }
        });
      };
      
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(v, firstScript);
      } else {
        document.body.appendChild(v);
      }
    } else if (window.voiceflow?.chat) {
      // If the script is already loaded but component re-mounted, ensure widget is shown
      window.voiceflow.chat.show();
    }

    return () => {
      // Cleanup: hide the chat widget when the user logs out (component unmounts)
      if (window.voiceflow?.chat?.hide) {
        window.voiceflow.chat.hide();
      }
    };
  }, []);

  return null; // This component handles side effects only
};
