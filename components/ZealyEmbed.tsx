import { useEffect } from "react";

const ZealyEmbed = () => {
  useEffect(() => {
    // Dynamically load the Zealy embed script
    const script = document.createElement("script");
    script.src = "https://zealy.io/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script if necessary
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      data-zealy-community="kryptonpadcommunity"
      data-variant="inline"
      data-theme="dark"
      data-color="#a71873"
      data-quest-id="600e3900-c6e4-4061-a6b1-158e04d7b970"
    />
  );
};

export default ZealyEmbed;
