import { useEffect } from "react";

export default function AppForm() {
  // Wait for DOM to load before adding the script
  useEffect(() => {
    // Create the anchor tag
    const formAnchor = document.createElement("a");
    formAnchor.name = "form1478937420";
    formAnchor.id = "formAnchor1478937420";
    
    // Create and add the script
    const script1 = document.createElement("script");
    script1.src = "https://fs16.formsite.com/include/form/embedManager.js?1478937420";
    
    // Create the second script
    const script2 = document.createElement("script");
    script2.textContent = `
      EmbedManager.embed({
        key: "https://fs16.formsite.com/res/showFormEmbed?EParam=B6fiTn-RcO5cd5iNJW5BbKCHUUU5i45xFzpUCZwnDno&1478937420",
        width: "100%"
      });
    `;
    
    // Get the container and append everything
    const container = document.getElementById("formContainer");
    if (container) {
      container.appendChild(formAnchor);
      container.appendChild(script1);
      
      // Wait for the first script to load before adding the second
      script1.onload = () => {
        container.appendChild(script2);
      };
    }
    
    // Cleanup function
    return () => {
      if (container) {
        if (container.contains(formAnchor)) container.removeChild(formAnchor);
        if (container.contains(script1)) container.removeChild(script1);
        if (container.contains(script2)) container.removeChild(script2);
      }
    };
  }, []);
  
  return (
    <div className="w-full min-h-screen bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Appointment Form</h1>
        
        <div 
          id="formContainer" 
          className="bg-[hsl(var(--background))] rounded-lg shadow-md p-4 min-h-[600px]"
        >
          {/* The form will be embedded here by the scripts */}
          {/* No loading spinner - it will appear when the form loads */}
        </div>
      </div>
    </div>
  );
}